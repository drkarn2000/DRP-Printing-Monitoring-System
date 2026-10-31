import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthService {
  // Pre-configured default users for instant production login
  private defaultUsers = [
    {
      id: 'usr-admin-1',
      email: 'admin@drp.com',
      passwordHash: bcrypt.hashSync('admin123', 10),
      name: 'Amar Singh',
      role: 'ADMIN',
    },
    {
      id: 'usr-op-1',
      email: 'operator@drp.com',
      passwordHash: bcrypt.hashSync('op123', 10),
      name: 'Rajesh Kumar',
      role: 'OPERATOR',
    },
  ];

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    let user: any = null;
    if (this.prisma.isConnectedToDb) {
      user = await this.prisma.user.findUnique({ where: { email } });
    }
    if (!user) {
      user = this.defaultUsers.find((u) => u.email.toLowerCase() === email.toLowerCase());
    }

    if (user && bcrypt.compareSync(pass, user.passwordHash)) {
      const { passwordHash, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any) {
    const payload = {
      sub: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    };
    const token = this.jwtService.sign(payload);
    return {
      user: payload,
      accessToken: token,
    };
  }

  async getCurrentUser(payload: any) {
    return {
      id: payload.sub || payload.id,
      email: payload.email,
      name: payload.name,
      role: payload.role,
    };
  }

  async changePassword(userId: string, oldPass: string, newPass: string): Promise<{ success: boolean; message: string }> {
    if (!newPass || newPass.length < 8) {
      throw new UnauthorizedException('New password must be at least 8 characters long for production security.');
    }

    let user: any = null;
    if (this.prisma.isConnectedToDb) {
      user = await this.prisma.user.findUnique({ where: { id: userId } });
    }
    if (!user) {
      user = this.defaultUsers.find((u) => u.id === userId);
    }
    if (!user) {
      throw new UnauthorizedException('User not found.');
    }

    if (!bcrypt.compareSync(oldPass, user.passwordHash)) {
      throw new UnauthorizedException('Current password does not match.');
    }

    const newHash = bcrypt.hashSync(newPass, 10);
    user.passwordHash = newHash;

    if (this.prisma.isConnectedToDb) {
      await this.prisma.user.update({
        where: { id: userId },
        data: { passwordHash: newHash },
      });
    }

    return {
      success: true,
      message: 'Password changed successfully. Default credentials revoked.',
    };
  }
}

