import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User, UserRole } from './entities/user.entity';
import { RegisterDto } from '../auth/dto/auth.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  // Crear nuevo usuario
  async createUser(registerDto: RegisterDto): Promise<User> {
    const { email, fullName, password } = registerDto;

    // Verificar si el usuario ya existe
    const existingUser = await this.usersRepository.findOne({
      where: { email }
    });

    if (existingUser) {
      throw new ConflictException('El email ya está registrado');
    }

    // Hashear contraseña
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Crear usuario
    const user = this.usersRepository.create({
      email,
      fullName,
      password: hashedPassword,
      role: UserRole.USER,
      isActive: true,
      weatherRequestsCount: 0,
      lastLogin: new Date()
    });

    return await this.usersRepository.save(user);
  }

  // Buscar usuario por email (incluye password para login)
  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { email },
      select: ['id', 'email', 'fullName', 'password', 'role', 'isActive', 'weatherRequestsCount', 'lastLogin'] as (keyof User)[]
    });
  }

  // Buscar usuario por ID
  async findById(id: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { id: id }
    });
  }

  // Validar contraseña
  async validatePassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  // Actualizar refresh token
  async updateRefreshToken(userId: string, refreshToken: string | undefined): Promise<void> {
    await this.usersRepository.update(userId, {
      refreshToken,
      lastLogin: new Date()
    });
  }

  // Incrementar contador de consultas de clima
  async incrementWeatherRequests(userId: string): Promise<void> {
    await this.usersRepository.increment(
      { id: userId },
      'weatherRequestsCount',
      1
    );
  }

  // Obtener estadísticas del usuario
  async getUserStats(userId: string): Promise<{
    totalRequests: number;
    memberSince: Date;
    lastLogin: Date | undefined;
    role: UserRole;
  }> {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
      select: ['weatherRequestsCount', 'createdAt', 'lastLogin', 'role'] as (keyof User)[]
    });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    return {
      totalRequests: user.weatherRequestsCount,
      memberSince: user.createdAt,
      lastLogin: user.lastLogin,
      role: user.role
    };
  }

  // Obtener todos los usuarios (solo admin)
  async findAll(): Promise<User[]> {
    return this.usersRepository.find({
      select: ['id', 'email', 'fullName', 'role', 'isActive', 'weatherRequestsCount', 'createdAt', 'lastLogin'] as (keyof User)[]
    });
  }

  // Cambiar rol de usuario (solo admin)
  async updateUserRole(userId: string, newRole: UserRole): Promise<User> {
    const user = await this.findById(userId);
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    await this.usersRepository.update(userId, { role: newRole });
    const updatedUser = await this.findById(userId);
    if (!updatedUser) {
      throw new NotFoundException('Usuario no encontrado después de actualizar');
    }
    return updatedUser;
  }

  // Desactivar usuario
  async deactivateUser(userId: string): Promise<void> {
    await this.usersRepository.update(userId, {
      isActive: false,
      refreshToken: undefined
    });
  }
}