import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
import {
  RegisterDto,
  LoginDto,
  AuthResponseDto,
  UserProfileDto,
} from './dto/auth.dto';
import { User } from '../users/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  // Registro de usuario
  async register(registerDto: RegisterDto): Promise<AuthResponseDto> {
    const user = await this.usersService.createUser(registerDto);
    return this.generateTokenResponse(user);
  }

  // Login de usuario
  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    const { email, password } = loginDto;

    // Buscar usuario por email
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Credenciales incorrectas');
    }

    // Verificar si está activo
    if (!user.isActive) {
      throw new UnauthorizedException('Cuenta desactivada');
    }

    // Validar contraseña
    const isPasswordValid = await this.usersService.validatePassword(
      password,
      user.password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales incorrectas');
    }

    return this.generateTokenResponse(user);
  }

  // Renovar tokens usando refresh token
  async refreshTokens(refreshToken: string): Promise<AuthResponseDto> {
    try {
      // Verificar refresh token
      interface JwtPayload {
        sub: string;
        [key: string]: unknown;
      }

      let payload: JwtPayload;
      try {
        payload = this.jwtService.verify(refreshToken, {
          secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
        });
      } catch (error) {
        throw new UnauthorizedException('Token inválido o expirado');
      }

      if (!payload || typeof payload.sub !== 'string') {
        throw new UnauthorizedException('Token inválido');
      }

      const user = await this.usersService.findById(payload.sub);
      if (!user || !user.isActive) {
        throw new UnauthorizedException('Usuario no válido');
      }

      // Verificar que el refresh token coincida con el almacenado
      if (user.refreshToken !== refreshToken) {
        throw new UnauthorizedException('Token de refresh no válido');
      }

      return this.generateTokenResponse(user);
    } catch {
      throw new UnauthorizedException('Token de refresh inválido o expirado');
    }
  }

  // Cerrar sesión
  async logout(userId: string): Promise<{ message: string }> {
    await this.usersService.updateRefreshToken(userId, undefined);
    return { message: 'Sesión cerrada correctamente' };
  }

  // Obtener perfil del usuario
  async getProfile(userId: string): Promise<UserProfileDto> {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new UnauthorizedException('Usuario no encontrado');
    }

    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      weatherRequestsCount: user.weatherRequestsCount,
      createdAt: user.createdAt,
      lastLogin: user.lastLogin,
    };
  }

  // Generar respuesta con tokens
  private async generateTokenResponse(user: User): Promise<AuthResponseDto> {
    // Definimos interfaces específicas para los payloads
    interface AccessTokenPayload {
      sub: string;
      email: string;
      role: string;
      iat: number;
    }

    interface RefreshTokenPayload {
      sub: string;
    }

    // Creamos el payload con tipos específicos
    const accessPayload: AccessTokenPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      iat: Math.floor(Date.now() / 1000),
    };

    // Generar access token con tipo específico
    const accessToken = this.jwtService.sign(accessPayload, {
      secret: this.configService.get<string>('JWT_SECRET'),
      expiresIn: this.configService.get<string>('JWT_EXPIRES_IN'),
    });

    // Generar refresh token con tipo específico
    const refreshPayload: RefreshTokenPayload = { sub: user.id };
    const refreshToken = this.jwtService.sign(refreshPayload, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRES_IN'),
    });

    // Guardar refresh token en la base de datos
    await this.usersService.updateRefreshToken(user.id, refreshToken);

    return {
      accessToken,
      refreshToken,
      tokenType: 'Bearer',
      expiresIn: this.parseTimeToSeconds(
        this.configService.get<string>('JWT_EXPIRES_IN') || '',
      ),
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        weatherRequestsCount: user.weatherRequestsCount,
      },
    };
  }

  // Convertir tiempo string a segundos
  private parseTimeToSeconds(timeString: string): number {
    const unit = timeString.slice(-1);
    const value = parseInt(timeString.slice(0, -1));

    switch (unit) {
      case 's':
        return value;
      case 'm':
        return value * 60;
      case 'h':
        return value * 3600;
      case 'd':
        return value * 86400;
      default:
        return 3600; // default 1 hour
    }
  }

  // Validar usuario desde JWT payload (usado por JWT Strategy)
  async validateUser(payload: { sub: string }): Promise<User> {
    const user = await this.usersService.findById(payload.sub);
    if (!user || !user.isActive) {
      throw new UnauthorizedException('Usuario no válido');
    }
    return user;
  }
}
