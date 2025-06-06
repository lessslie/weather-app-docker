import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';
import * as ExtractJwt from 'passport-jwt/lib/extract_jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth.service';
import { User } from '../../users/entities/user.entity';
import { JwtPayload } from '../interfaces/jwt-payload.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
    private readonly authService: AuthService,
  ) {
    // Obtenemos el secreto JWT y aseguramos que no sea undefined
    const jwtSecret = configService.get<string>('JWT_SECRET');

    if (!jwtSecret) {
      throw new Error(
        'JWT_SECRET no está definido en las variables de entorno',
      );
    }

    // Configuración básica de la estrategia JWT
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtSecret,
    });
  }

  async validate(payload: JwtPayload): Promise<Partial<User>> {
    try {
      const user = await this.authService.validateUser(payload.sub);
      return {
        id: user.id,
        email: user.email,
        isAdmin: user.isAdmin,
      };
    } catch {
      // No necesitamos usar la variable error, simplemente lanzamos una excepción
      throw new UnauthorizedException('Token inválido o expirado');
    }
  }
}
