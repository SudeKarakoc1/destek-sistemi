import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * JWT koruması — sadece geçerli Bearer token içeren isteklere izin verir.
 *
 * Kullanım:
 *   @UseGuards(JwtAuthGuard)
 *   @Get('profile')
 *   getProfile(@Request() req) { return req.user; }
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
