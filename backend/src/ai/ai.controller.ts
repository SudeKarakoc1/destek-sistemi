import { Body, Controller, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AiService } from './ai.service';
import type { SuggestionResult } from './ai.service';
import { SuggestTicketDto } from './dto/suggest-ticket.dto';

@Controller('tickets/ai')
@UseGuards(JwtAuthGuard)
export class AiController {
  constructor(private readonly aiService: AiService) {}

  /**
   * POST /tickets/ai/suggest
   * Kullanıcı ticket'ı kaydetmeden önce AI'dan kategori + öncelik önerisi alır.
   * JWT ile korumalı — kimlik doğrulaması zorunlu.
   */
  @Post('suggest')
  @HttpCode(HttpStatus.OK)
  suggest(@Body() dto: SuggestTicketDto): Promise<SuggestionResult> {
    return this.aiService.suggestCategoryAndPriority(dto.title, dto.description);
  }
}
