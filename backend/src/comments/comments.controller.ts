import {
  Body,
  Controller,
  Delete,
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
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';

@Controller()
@UseGuards(JwtAuthGuard) // Tüm endpoint'ler JWT ile korumalı
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  /**
   * GET /tickets/:id/comments
   * Ticket sahibi veya admin, bu ticket'a ait tüm yorumları görür.
   * Silinmiş yorumlarda content "Bu yorum silindi" olarak maskelenir.
   */
  @Get('tickets/:id/comments')
  findAll(
    @Param('id', ParseIntPipe) ticketId: number,
    @GetUser() user: AuthUser,
  ) {
    return this.commentsService.findAllForTicket(ticketId, user);
  }

  /**
   * POST /tickets/:id/comments
   * Ticket sahibi veya admin yeni yorum ekler.
   * authorId, body'den değil JWT'den alınır.
   */
  @Post('tickets/:id/comments')
  @HttpCode(HttpStatus.CREATED)
  create(
    @Param('id', ParseIntPipe) ticketId: number,
    @Body() dto: CreateCommentDto,
    @GetUser() user: AuthUser,
  ) {
    return this.commentsService.create(ticketId, dto, user);
  }

  /**
   * PATCH /comments/:commentId
   * Yalnızca yorumun yazarı düzenleme yapabilir.
   * Silinmiş yorum düzenlenemez (400).
   */
  @Patch('comments/:commentId')
  @HttpCode(HttpStatus.OK)
  update(
    @Param('commentId', ParseIntPipe) commentId: number,
    @Body() dto: UpdateCommentDto,
    @GetUser() user: AuthUser,
  ) {
    return this.commentsService.update(commentId, dto, user);
  }

  /**
   * DELETE /comments/:commentId
   * Soft delete — isDeleted = true yapılır, gerçek silme yapılmaz.
   * Yalnızca yorumun yazarı silebilir.
   * Zaten silinmişse 400 Bad Request.
   */
  @Delete('comments/:commentId')
  @HttpCode(HttpStatus.OK)
  softDelete(
    @Param('commentId', ParseIntPipe) commentId: number,
    @GetUser() user: AuthUser,
  ) {
    return this.commentsService.softDelete(commentId, user);
  }
}
