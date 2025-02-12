import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { Reflector } from '@nestjs/core';
import { Roles } from 'src/utils/roles.decorator';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: Request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);
    if (!token) throw new UnauthorizedException('No token provided');

    try {
      // Verify JWT and extract payload (including role)
      const payload = await this.jwtService.verifyAsync<{
        userId: string;
        role: string;
      }>(token, { secret: process.env.JWT_SECRET });
      request['user'] = payload;
      let requiredRoles = this.reflector.get<string[]>(
        Roles,
        context.getHandler(),
      );
      if (requiredRoles === undefined) {
        requiredRoles = ['SUPERUSER'];
      }
      if (requiredRoles.length === 0) return true;

      if (!requiredRoles.includes(payload.role)) {
        throw new ForbiddenException('Insufficient permissions');
      }

      return true;
    } catch (error) {
      if (error instanceof ForbiddenException) throw error;
      throw new UnauthorizedException('Invalid token');
    }
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
