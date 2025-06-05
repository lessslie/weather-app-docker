import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength, MaxLength } from 'class-validator';
import { UserRole } from '../../users/entities/user.entity';

export class RegisterDto {
  @ApiProperty({
    description: 'Email del usuario',
    example: 'juan@example.com',
  })
  @IsEmail({}, { message: 'El email debe ser válido' })
  email: string;

  @ApiProperty({
    description: 'Nombre completo del usuario',
    example: 'Juan Pérez',
  })
  @IsString()
  @MinLength(2, { message: 'El nombre debe tener al menos 2 caracteres' })
  @MaxLength(50, { message: 'El nombre no puede exceder 50 caracteres' })
  fullName: string;

  @ApiProperty({
    description: 'Contraseña (mínimo 6 caracteres)',
    example: 'miPassword123',
    minLength: 6,
  })
  @IsString()
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  password: string;
}

export class LoginDto {
  @ApiProperty({
    description: 'Email del usuario',
    example: 'juan@example.com',
  })
  @IsEmail({}, { message: 'El email debe ser válido' })
  email: string;

  @ApiProperty({
    description: 'Contraseña del usuario',
    example: 'miPassword123',
  })
  @IsString()
  password: string;
}

export class RefreshTokenDto {
  @ApiProperty({
    description: 'Token de refresh para obtener nuevo access token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  @IsString()
  refreshToken: string;
}

// DTO para respuestas de autenticación
export class AuthResponseDto {
  @ApiProperty({ description: 'Token de acceso JWT' })
  accessToken: string;

  @ApiProperty({ description: 'Token de refresh para renovar acceso' })
  refreshToken: string;

  @ApiProperty({ description: 'Tipo de token', example: 'Bearer' })
  tokenType: string;

  @ApiProperty({
    description: 'Tiempo de expiración en segundos',
    example: 86400,
  })
  expiresIn: number;

  @ApiProperty({ description: 'Información del usuario' })
  user: {
    id: string;
    email: string;
    fullName: string;
    role: UserRole;
    weatherRequestsCount: number;
  };
}

// DTO para el perfil de usuario
export class UserProfileDto {
  @ApiProperty({ description: 'ID del usuario' })
  id: string;

  @ApiProperty({ description: 'Email del usuario' })
  email: string;

  @ApiProperty({ description: 'Nombre completo' })
  fullName: string;

  @ApiProperty({ description: 'Rol del usuario', enum: UserRole })
  role: UserRole;

  @ApiProperty({ description: 'Número de consultas realizadas' })
  weatherRequestsCount: number;

  @ApiProperty({ description: 'Fecha de registro' })
  createdAt: Date;

  @ApiProperty({ description: 'Último login' })
  lastLogin?: Date;
}
