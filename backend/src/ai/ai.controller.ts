import {
  Body,
  Controller,
  ForbiddenException,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { GetUser } from '../common/decorators/get-user.decorator';
import type { AuthUser } from '../common/decorators/get-user.decorator';
import { AiService } from './ai.service';
import type { SuggestionResult } from './ai.service';
import { SuggestTicketDto } from './dto/suggest-ticket.dto';

/**
 * @Controller('tickets') kullanıyoruz çünkü iki endpoint'in path'i farklı:
 *   - POST /tickets/ai/suggest       (statik segment)
 *   - POST /tickets/:id/ai-summary   (dinamik :id segmenti)
 *
 * Ortak prefix 'tickets/ai' olsaydı ikinci endpoint için prefix kaldırıp
 * tam path yazmak gerekecekti. 'tickets' prefix'i en temiz ortak payda.
 * NestJS statik route'ları (:id gibi dinamik olanlardan önce değerlendirir,
 * dolayısıyla 'ai/suggest' ile ':id/ai-summary' arasında çakışma olmaz.
 */
@Controller('tickets')
@UseGuards(JwtAuthGuard)
export class AiController {
  constructor(
    private readonly aiService: AiService,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * POST /tickets/ai/suggest
   * Kullanıcı ticket'ı kaydetmeden önce AI'dan kategori + öncelik önerisi alır.
   * JWT ile korumalı, tüm roller erişebilir.
   */
  @Post('ai/suggest')
  @HttpCode(HttpStatus.OK)
  suggest(@Body() dto: SuggestTicketDto): Promise<SuggestionResult> {
    return this.aiService.suggestCategoryAndPriority(dto.title, dto.description);
  }

  /**
   * POST /tickets/:id/ai-summary
   * Belirtilen ticket için AI özetini üretir ve kaydeder.
   * Sadece ADMIN rolü erişebilir.
   * Özet zaten mevcutsa OpenAI çağrısı yapılmaz, önbellek gibi davranır.
   */
  @Post(':id/ai-summary')
  @HttpCode(HttpStatus.OK)
  async summarize(
    @Param('id', ParseIntPipe) id: number,
    @GetUser() user: AuthUser,
  ) {
    if (user.role !== Role.ADMIN) {
      throw new ForbiddenException('Bu işlem yalnızca adminler tarafından yapılabilir');
    }

    const ticket = await this.prisma.ticket.findUnique({ where: { id } });
    if (!ticket) {
      throw new NotFoundException(`Ticket #${id} bulunamadı`);
    }

    // Özet zaten varsa OpenAI'ye istek atma
    if (ticket.aiSummary) {
      return ticket;
    }

    const aiSummary = await this.aiService.summarizeTicket(
      ticket.title,
      ticket.description,
    );

    return this.prisma.ticket.update({
      where: { id },
      data: { aiSummary },
    });
  }
}
