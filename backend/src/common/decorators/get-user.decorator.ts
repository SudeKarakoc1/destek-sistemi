import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Role } from '@prisma/client';

export interface AuthUser {
  id: number;
  email: string;
  name: string;
  role: Role;
}

/**
 * JWT Guard'dan gelen req.user'ı direkt inject eder.
 *
 * Kullanım:
 *   @Get('me')
 *   @UseGuards(JwtAuthGuard)
 *   getMe(@GetUser() user: AuthUser) { ... }
 */
export const GetUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): AuthUser => {
    const request = ctx.switchToHttp().getRequest<{ user: AuthUser }>();
    return request.user;
  },
);
