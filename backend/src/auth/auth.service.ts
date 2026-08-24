import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { UpdateMeDto } from './dto/update-me.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { JwtPayload } from './jwt.strategy';

const SALT_ROUNDS = 10;

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  // ── Register ────────────────────────────────────────────────────────────────

  async register(dto: RegisterDto) {
    // E-posta daha önce kullanılmış mı?
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existing) {
      throw new ConflictException('Bu e-posta adresi zaten kullanılıyor');
    }

    // Şifreyi hashle
    const passwordHash = await bcrypt.hash(dto.password, SALT_ROUNDS);

    // Kullanıcıyı oluştur
    const user = await this.prisma.user.create({
      data: {
        name: dto.name,
        email: dto.email,
        passwordHash,
      },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    });

    // Token üret ve döndür
    const token = this.signToken(user.id, user.email, user.role);
    return { user, access_token: token };
  }

  // ── Login ────────────────────────────────────────────────────────────────────

  async login(dto: LoginDto) {
    // Kullanıcıyı bul
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (!user) {
      throw new UnauthorizedException('E-posta veya şifre hatalı');
    }

    // Şifreyi doğrula
    const isMatch = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedException('E-posta veya şifre hatalı');
    }

    // Token üret
    const token = this.signToken(user.id, user.email, user.role);
    return {
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
      access_token: token,
    };
  }

  // ── Update Me ────────────────────────────────────────────────────────────────

  async updateMe(userId: number, dto: UpdateMeDto) {
    // En az bir alan gönderilmeli
    if (dto.name === undefined && dto.email === undefined) {
      throw new BadRequestException('Güncellenecek en az bir alan gönderilmeli');
    }

    // E-posta başka bir kullanıcı tarafından kullanılıyor mu?
    if (dto.email !== undefined) {
      const emailInUse = await this.prisma.user.findFirst({
        where: { email: dto.email, NOT: { id: userId } },
      });
      if (emailInUse) {
        throw new ConflictException('Bu e-posta adresi zaten kullanılıyor');
      }
    }

    // Sadece gönderilen alanları güncelle
    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.email !== undefined && { email: dto.email }),
      },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    });

    return updated;
  }

  // ── Change Password ──────────────────────────────────────────────────────────

  async changePassword(userId: number, dto: ChangePasswordDto) {
    // Kullanıcıyı bul (passwordHash dahil)
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) {
      throw new UnauthorizedException('Kullanıcı bulunamadı');
    }

    // Mevcut şifreyi doğrula
    const isMatch = await bcrypt.compare(dto.currentPassword, user.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedException('Mevcut şifre hatalı');
    }

    // Yeni şifreyi hashle ve kaydet
    const passwordHash = await bcrypt.hash(dto.newPassword, SALT_ROUNDS);
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        passwordHash,
        passwordChangedAt: new Date(),
      },
    });

    return { message: 'Şifre başarıyla güncellendi' };
  }

  // ── Private Helpers ──────────────────────────────────────────────────────────

  private signToken(userId: number, email: string, role: string): string {
    const payload: JwtPayload = { sub: userId, email, role };
    return this.jwtService.sign(payload);
  }
}
