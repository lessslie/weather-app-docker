import {
    Controller,
    Post,
    Body,
    HttpCode,
    HttpStatus,
    Get,
    UseGuards,
    Req,
  } from '@nestjs/common';
  import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiBody,
    ApiBearerAuth,
    ApiUnauthorizedResponse,
  } from '@nestjs/swagger';
  import { AuthService } from './auth.service';
  import { RegisterDto, LoginDto, RefreshTokenDto, AuthResponseDto, UserProfileDto } from './dto/auth.dto';
  import { JwtAuthGuard, CurrentUser, Public } from './guards/auth.guard';
  import { User } from '../users/entities/user.entity';
  
  @ApiTags('auth')
  @Controller('auth')
  export class AuthController {
    constructor(private readonly authService: AuthService) {}
  
    @Public()
    @Post('register')
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({
      summary: 'Registrar nuevo usuario',
      description: 'Crea una nueva cuenta de usuario en el sistema',
    })
    @ApiBody({ type: RegisterDto })
    @ApiResponse({
      status: 201,
      description: 'Usuario registrado exitosamente',
      type: AuthResponseDto,
    })
    @ApiResponse({
      status: 409,
      description: 'El email ya está registrado',
    })
    async register(@Body() registerDto: RegisterDto): Promise<AuthResponseDto> {
      return this.authService.register(registerDto);
    }
  
    @Public()
    @Post('login')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
      summary: 'Iniciar sesión',
      description: 'Autentica al usuario y devuelve tokens de acceso',
    })
    @ApiBody({ type: LoginDto })
    @ApiResponse({
      status: 200,
      description: 'Login exitoso',
      type: AuthResponseDto,
    })
    @ApiUnauthorizedResponse({
      description: 'Credenciales incorrectas',
    })
    async login(@Body() loginDto: LoginDto): Promise<AuthResponseDto> {
      return this.authService.login(loginDto);
    }
  
    @Public()
    @Post('refresh')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
      summary: 'Renovar tokens',
      description: 'Obtiene nuevos tokens usando el refresh token',
    })
    @ApiBody({ type: RefreshTokenDto })
    @ApiResponse({
      status: 200,
      description: 'Tokens renovados exitosamente',
      type: AuthResponseDto,
    })
    @ApiUnauthorizedResponse({
      description: 'Refresh token inválido o expirado',
    })
    async refreshTokens(@Body() refreshTokenDto: RefreshTokenDto): Promise<AuthResponseDto> {
      return this.authService.refreshTokens(refreshTokenDto.refreshToken);
    }
  
    @UseGuards(JwtAuthGuard)
    @Post('logout')
    @HttpCode(HttpStatus.OK)
    @ApiBearerAuth()
    @ApiOperation({
      summary: 'Cerrar sesión',
      description: 'Invalida el refresh token del usuario',
    })
    @ApiResponse({
      status: 200,
      description: 'Sesión cerrada exitosamente',
      schema: {
        type: 'object',
        properties: {
          message: { type: 'string', example: 'Sesión cerrada correctamente' }
        }
      }
    })
    @ApiUnauthorizedResponse({
      description: 'Token de acceso requerido',
    })
    async logout(@CurrentUser() user: User): Promise<{ message: string }> {
      return this.authService.logout(user.id);
    }
  
    @UseGuards(JwtAuthGuard)
    @Get('profile')
    @ApiBearerAuth()
    @ApiOperation({
      summary: 'Obtener perfil del usuario',
      description: 'Devuelve la información del perfil del usuario autenticado',
    })
    @ApiResponse({
      status: 200,
      description: 'Perfil del usuario',
      type: UserProfileDto,
    })
    @ApiUnauthorizedResponse({
      description: 'Token de acceso requerido',
    })
    async getProfile(@CurrentUser() user: User): Promise<UserProfileDto> {
      return this.authService.getProfile(user.id);
    }
  
    @UseGuards(JwtAuthGuard)
    @Get('me')
    @ApiBearerAuth()
    @ApiOperation({
      summary: 'Información básica del usuario actual',
      description: 'Endpoint rápido para verificar autenticación y obtener datos básicos',
    })
    @ApiResponse({
      status: 200,
      description: 'Información del usuario actual',
      schema: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          email: { type: 'string' },
          fullName: { type: 'string' },
          role: { type: 'string' },
          isAuthenticated: { type: 'boolean', example: true }
        }
      }
    })
    async getCurrentUser(@CurrentUser() user: User) {
      return {
        id: user.id,
        email: user.email,
        fullName: user.fullName || `${user.firstName || ''} ${user.lastName || ''}`.trim(),
        role: user.role,
        isAuthenticated: true,
      };
    }
  
    @Public()
    @Get('check')
    @ApiOperation({
      summary: 'Verificar estado del sistema de autenticación',
      description: 'Endpoint público para verificar que el sistema de auth funciona',
    })
    @ApiResponse({
      status: 200,
      description: 'Sistema de autenticación funcionando',
    })
    checkAuth() {
      return {
        message: '🔐 Sistema de autenticación funcionando correctamente',
        timestamp: new Date().toISOString(),
        endpoints: {
          register: 'POST /auth/register',
          login: 'POST /auth/login',
          refresh: 'POST /auth/refresh',
          logout: 'POST /auth/logout (requiere token)',
          profile: 'GET /auth/profile (requiere token)',
          me: 'GET /auth/me (requiere token)',
        }
      };
    }
  }
