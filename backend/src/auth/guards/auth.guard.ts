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
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
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

    // Definimos una interfaz para tipar el request
    interface RequestWithUser {
      user?: { role?: UserRole };
    }

    const request = context.switchToHttp().getRequest<RequestWithUser>();

    // Verificamos que request exista
    if (!request) {
      throw new UnauthorizedException('Contexto de solicitud inválido');
    }

    const user = request.user;

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
    // Definimos una interfaz para tipar el request
    interface RequestWithUser {
      user?: User;
    }

    const request = ctx.switchToHttp().getRequest<RequestWithUser>();

    // Verificamos que request y request.user existan
    if (!request) {
      throw new UnauthorizedException('Contexto de solicitud inválido');
    }

    if (!request.user) {
      throw new UnauthorizedException('Usuario no autenticado');
    }

    // Validamos que el usuario tenga la estructura esperada
    const user = request.user;
    if (typeof user !== 'object') {
      throw new UnauthorizedException('Usuario inválido');
    }

    return user;
  },
);

// Decorator para marcar endpoints como públicos (sin autenticación)
export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
