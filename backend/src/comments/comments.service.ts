import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AuthUser } from '../common/decorators/get-user.decorator';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';

// Yanıtlarda author'dan sadece güvenli alanlar
const authorSelect = { id: true, name: true, email: true, role: true };

// Silinmiş yorum için yer tutucu metin
const DELETED_CONTENT = 'Bu yorum silindi';

@Injectable()
export class CommentsService {
  constructor(private readonly prisma: PrismaService) {}

  // ── Ortak yardımcılar ────────────────────────────────────────────────────

  /**
   * Ticket'ı getirir; bulunamazsa 404 fırlatır.
   * Yetki kontrolü için userId de döner.
   */
  private async findTicketOrFail(ticketId: number) {
    const ticket = await this.prisma.ticket.findUnique({
      where: { id: ticketId },
      select: { id: true, userId: true },
    });
    if (!ticket) {
      throw new NotFoundException(`Ticket #${ticketId} bulunamadı`);
    }
    return ticket;
  }

  /**
   * Kullanıcının ticket'a erişim/yazma yetkisi var mı kontrol eder.
   * ADMIN her ticket'a erişebilir; USER yalnızca kendi ticket'ına.
   */
  private assertTicketAccess(
    ticketUserId: number,
    currentUser: AuthUser,
  ): void {
    if (
      currentUser.role !== Role.ADMIN &&
      ticketUserId !== currentUser.id
    ) {
      throw new ForbiddenException('Bu ticketa erişim yetkiniz yok');
    }
  }

  // ── GET /tickets/:id/comments ─────────────────────────────────────────────

  async findAllForTicket(ticketId: number, currentUser: AuthUser) {
    const ticket = await this.findTicketOrFail(ticketId);
    this.assertTicketAccess(ticket.userId, currentUser);

    const comments = await this.prisma.comment.findMany({
      where: { ticketId },
      orderBy: { createdAt: 'asc' },
      include: { author: { select: authorSelect } },
    });

    // Silinmiş yorumların içeriğini maskele
    return comments.map((comment) => ({
      ...comment,
      content: comment.isDeleted ? DELETED_CONTENT : comment.content,
    }));
  }

  // ── POST /tickets/:id/comments ────────────────────────────────────────────

  async create(
    ticketId: number,
    dto: CreateCommentDto,
    currentUser: AuthUser,
  ) {
    const ticket = await this.findTicketOrFail(ticketId);
    this.assertTicketAccess(ticket.userId, currentUser);

    return this.prisma.comment.create({
      data: {
        content: dto.content,
        ticketId,
        authorId: currentUser.id,
      },
      include: { author: { select: authorSelect } },
    });
  }

  // ── PATCH /comments/:commentId ────────────────────────────────────────────

  async update(
    commentId: number,
    dto: UpdateCommentDto,
    currentUser: AuthUser,
  ) {
    const comment = await this.prisma.comment.findUnique({
      where: { id: commentId },
    });

    if (!comment) {
      throw new NotFoundException(`Yorum #${commentId} bulunamadı`);
    }

    if (comment.isDeleted) {
      throw new BadRequestException('Silinmiş yorum düzenlenemez');
    }

    if (comment.authorId !== currentUser.id) {
      throw new ForbiddenException('Yalnızca yorum yazarı düzenleme yapabilir');
    }

    return this.prisma.comment.update({
      where: { id: commentId },
      data: { content: dto.content },
      include: { author: { select: authorSelect } },
    });
  }

  // ── DELETE /comments/:commentId ───────────────────────────────────────────

  async softDelete(commentId: number, currentUser: AuthUser) {
    const comment = await this.prisma.comment.findUnique({
      where: { id: commentId },
    });

    if (!comment) {
      throw new NotFoundException(`Yorum #${commentId} bulunamadı`);
    }

    if (comment.isDeleted) {
      throw new BadRequestException('Bu yorum zaten silinmiş');
    }

    if (comment.authorId !== currentUser.id) {
      throw new ForbiddenException('Yalnızca yorum yazarı silebilir');
    }

    return this.prisma.comment.update({
      where: { id: commentId },
      data: { isDeleted: true },
      include: { author: { select: authorSelect } },
    });
  }
}
