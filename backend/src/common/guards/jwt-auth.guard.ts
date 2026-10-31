import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    // Support token from HttpOnly cookie or Authorization Bearer header
    const token =
      request.cookies?.['drp_auth_token'] ||
      (request.headers.authorization?.startsWith('Bearer ')
        ? request.headers.authorization.split(' ')[1]
        : null);

    if (!token) {
      // In dev mode with open endpoints or when auth cookie is absent, fallback to demo admin user if configured
      if (process.env.NODE_ENV === 'development' && request.headers['x-dev-user']) {
        request.user = { id: 'usr-admin', email: 'admin@drp.com', name: 'Amar Singh', role: 'ADMIN' };
        return true;
      }
      throw new UnauthorizedException('Authentication required. Missing JWT token or session cookie.');
    }

    try {
      const payload = this.jwtService.verify(token, {
        secret: process.env.JWT_SECRET || 'drp-super-secret-jwt-key-2026-production-ready-security',
      });
      request.user = payload;
      return true;
    } catch (err) {
      throw new UnauthorizedException('Invalid or expired authentication session.');
    }
  }
}
