import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private jwtService: JwtService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);

    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromRequest(request);
    const decodedToken = this.jwtService.decode(token);

    if (!decodedToken || !decodedToken.role) {
      throw new UnauthorizedException('Unauthorized');
    }
    if (
      decodedToken.role === requiredRoles[0] ||
      decodedToken.role === 'admin'
    ) {
      return true;
    } else {
      throw new UnauthorizedException('this route is only for admin role');
    }
  }

  private extractTokenFromRequest(request: any): string {
    const authHeader = request.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Unauthorized');
    }
    return authHeader.split(' ')[1];
  }
}
