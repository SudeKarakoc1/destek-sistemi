import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AuthUser } from '../common/decorators/get-user.decorator';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';

// Ticket yanıtlarında kullanıcı bilgilerinden sadece güvenli alanlar
const userSelect = { id: true, name: true, email: true, role: true };

@Injectable()
export class TicketsService {
  constructor(private readonly prisma: PrismaService) {}

  // ── POST /tickets ─────────────────────────────────────────────────────────

  async create(dto: CreateTicketDto, currentUser: AuthUser) {
    const ticket = await this.prisma.ticket.create({
      data: {
        ...dto,
        userId: currentUser.id,
      },
      include: { user: { select: userSelect } },
    });
    return ticket;
  }

  // ── GET /tickets ──────────────────────────────────────────────────────────
  // Admin → tüm ticketlar | User → sadece kendi ticketları

  async findAll(currentUser: AuthUser) {
    const where =
      currentUser.role === Role.ADMIN ? {} : { userId: currentUser.id };

    return this.prisma.ticket.findMany({
      where,
      include: { user: { select: userSelect } },
      orderBy: { createdAt: 'desc' },
    });
  }

  // ── GET /tickets/:id ──────────────────────────────────────────────────────
  // Sadece sahibi veya admin görebilir

  async findOne(id: number, currentUser: AuthUser) {
    const ticket = await this.prisma.ticket.findUnique({
      where: { id },
      include: { user: { select: userSelect } },
    });

    if (!ticket) {
      throw new NotFoundException(`Ticket #${id} bulunamadı`);
    }

    const isOwner = ticket.userId === currentUser.id;
    const isAdmin = currentUser.role === Role.ADMIN;

    if (!isOwner && !isAdmin) {
      throw new ForbiddenException('Bu ticketa erişim yetkiniz yok');
    }

    return ticket;
  }

  // ── PATCH /tickets/:id ────────────────────────────────────────────────────
  // Sadece admin durumu güncelleyebilir

  async updateStatus(
    id: number,
    dto: UpdateTicketDto,
    currentUser: AuthUser,
  ) {
    if (currentUser.role !== Role.ADMIN) {
      throw new ForbiddenException('Sadece adminler ticket durumunu güncelleyebilir');
    }

    // Ticket var mı kontrol et
    const exists = await this.prisma.ticket.findUnique({ where: { id } });
    if (!exists) {
      throw new NotFoundException(`Ticket #${id} bulunamadı`);
    }

    return this.prisma.ticket.update({
      where: { id },
      data: { status: dto.status },
      include: { user: { select: userSelect } },
    });
  }
}
