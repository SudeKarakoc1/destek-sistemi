import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
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

  // ── Private Helpers ──────────────────────────────────────────────────────────

  private signToken(userId: number, email: string, role: string): string {
    const payload: JwtPayload = { sub: userId, email, role };
    return this.jwtService.sign(payload);
  }
}
