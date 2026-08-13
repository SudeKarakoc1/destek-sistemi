import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);
  private readonly isProduction = process.env.NODE_ENV === 'production';

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    // ── Status kodu ve mesajı çöz ─────────────────────────────────────────────
    let statusCode: number;
    let message: string | string[];

    if (exception instanceof HttpException) {
      statusCode = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      // class-validator gibi yerler object döndürebilir: { message: [...] }
      if (
        typeof exceptionResponse === 'object' &&
        exceptionResponse !== null &&
        'message' in exceptionResponse
      ) {
        message = (exceptionResponse as { message: string | string[] }).message;
      } else {
        message = exception.message;
      }
    } else {
      // Beklenmeyen / işlenmemiş hata (DB bağlantısı, null ref, vb.)
      statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
      message = this.isProduction
        ? 'Sunucu hatası. Lütfen daha sonra tekrar deneyin.'
        : (exception instanceof Error ? exception.message : 'Internal server error');
    }

    // ── Production'da stack trace gizle, dev'de logla ────────────────────────
    if (!this.isProduction) {
      this.logger.error(
        `[${request.method}] ${request.url} → ${statusCode}`,
        exception instanceof Error ? exception.stack : String(exception),
      );
    } else {
      // Production'da sadece durum kodu ve path loglanır
      this.logger.error(
        `[${request.method}] ${request.url} → ${statusCode}`,
      );
    }

    // ── Tutarlı JSON yanıt ────────────────────────────────────────────────────
    const body: Record<string, unknown> = {
      statusCode,
      message,
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    // Development'ta stack trace'i yanıta ekle (debug kolaylığı)
    if (!this.isProduction && exception instanceof Error && exception.stack) {
      body.stack = exception.stack;
    }

    response.status(statusCode).json(body);
  }
}
