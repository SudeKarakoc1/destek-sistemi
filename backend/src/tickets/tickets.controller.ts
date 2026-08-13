import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { GetUser } from '../common/decorators/get-user.decorator';
import type { AuthUser } from '../common/decorators/get-user.decorator';
import { TicketsService } from './tickets.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';

@Controller('tickets')
@UseGuards(JwtAuthGuard) // Tüm endpoint'ler JWT ile korumalı
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  /**
   * POST /tickets
   * Giriş yapmış kullanıcı kendi adına yeni talep oluşturur.
   */
  @Post()
  create(@Body() dto: CreateTicketDto, @GetUser() user: AuthUser) {
    return this.ticketsService.create(dto, user);
  }

  /**
   * GET /tickets
   * Admin → tüm ticketlar | User → sadece kendi ticketları
   */
  @Get()
  findAll(@GetUser() user: AuthUser) {
    return this.ticketsService.findAll(user);
  }

  /**
   * GET /tickets/:id
   * Sadece ticket sahibi veya admin erişebilir.
   */
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number, @GetUser() user: AuthUser) {
    return this.ticketsService.findOne(id, user);
  }

  /**
   * PATCH /tickets/:id
   * Sadece admin ticket durumunu güncelleyebilir.
   */
  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateTicketDto,
    @GetUser() user: AuthUser,
  ) {
    return this.ticketsService.updateStatus(id, dto, user);
  }
}
