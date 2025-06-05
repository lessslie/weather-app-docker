import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
  CanActivate,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { UserRole } from '../../users/entities/user.entity';

// Guard básico JWT
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  handleRequest<T = unknown>(err: Error | null, user: T, info: unknown): T {
    if (err || !user) {
      throw err || new UnauthorizedException('Token de acceso requerido');
    }
    return user;
  }
}

// Guard para roles
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      'roles',
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles) {
      return true; // No hay roles requeridos
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user as { role?: UserRole } | undefined;

    if (!user) {
      throw new UnauthorizedException('Usuario no autenticado');
    }

    if (
      typeof user !== 'object' ||
      !('role' in user) ||
      typeof user.role !== 'string'
    ) {
      throw new UnauthorizedException('Usuario inválido');
    }

    const hasRole = requiredRoles.some((role) => user.role === role);
    if (!hasRole) {
      throw new UnauthorizedException(
        `Se requiere rol: ${requiredRoles.join(' o ')}`,
      );
    }

    return true;
  }
}

// Decorator para requerir roles
import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);

// Decorator para obtener usuario actual
import { createParamDecorator } from '@nestjs/common';
import { User } from '../../users/entities/user.entity';

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): User => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user as User;

    if (!user || typeof user !== 'object') {
      throw new UnauthorizedException('Usuario no autenticado');
    }

    return user;
  },
);

// Decorator para marcar endpoints como públicos (sin autenticación)
export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
