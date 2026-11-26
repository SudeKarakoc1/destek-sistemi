import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../prisma/prisma.service';

export interface JwtPayload {
  sub: number;   // user id
  email: string;
  role: string;
  iat?: number;  // JWT otomatik ekler (saniye cinsinden Unix timestamp)
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly prisma: PrismaService,
    configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>('JWT_SECRET'),
    });
  }

  async validate(payload: JwtPayload) {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      select: { id: true, email: true, name: true, role: true, passwordChangedAt: true },
    });

    if (!user) {
      throw new UnauthorizedException('Kullanıcı bulunamadı');
    }

    // Şifre değiştirildikten sonra üretilmiş eski token'ları geçersiz kıl
    if (user.passwordChangedAt && payload.iat) {
      const tokenIssuedAt = new Date(payload.iat * 1000);
      if (tokenIssuedAt < user.passwordChangedAt) {
        throw new UnauthorizedException('Oturum süresi doldu, lütfen tekrar giriş yapın');
      }
    }

    // passwordChangedAt client'a gitmesin
    const { passwordChangedAt: _omit, ...safeUser } = user;
    return safeUser; // req.user olarak inject edilir
  }
}
