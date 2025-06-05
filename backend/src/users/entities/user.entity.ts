// import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
// import { ApiProperty } from '@nestjs/swagger';

// export enum UserRole {
//   USER = 'user',
//   ADMIN = 'admin',
//   PREMIUM = 'premium'
// }

// @Entity('users')
// export class User {
//   @PrimaryGeneratedColumn('uuid')
//   @ApiProperty({ description: 'ID único del usuario' })
//   id: string;

//   @Column({ unique: true })
//   @ApiProperty({ description: 'Email del usuario', example: 'juan@example.com' })
//   email: string;

//   @Column()
//   @ApiProperty({ description: 'Nombre completo', example: 'Juan Pérez' })
//   fullName: string;

//   @Column({ select: false }) // No incluir en consultas por defecto
//   password: string;

//   @Column({
//     type: 'enum',
//     enum: UserRole,
//     default: UserRole.USER
//   })
//   @ApiProperty({ 
//     description: 'Rol del usuario',
//     enum: UserRole,
//     example: UserRole.USER 
//   })
//   role: UserRole;

//   @Column({ default: true })
//   @ApiProperty({ description: 'Usuario activo', example: true })
//   isActive: boolean;

//   @Column({ nullable: true })
//   @ApiProperty({ description: 'Último token de refresh', required: false })
//   refreshToken?: string;

//   @Column({ nullable: true })
//   @ApiProperty({ description: 'Último login', required: false })
//   lastLogin?: Date;

//   @Column({ default: 0 })
//   @ApiProperty({ description: 'Número de consultas de clima realizadas', example: 45 })
//   weatherRequestsCount: number;

//   @CreateDateColumn()
//   @ApiProperty({ description: 'Fecha de creación' })
//   createdAt: Date;
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

// Enum como constante para SQLite
export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
  MODERATOR = 'moderator'
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty({ description: 'ID único del usuario' })
  id: string;

  @Column({ unique: true })
  @ApiProperty({ description: 'Email del usuario', example: 'juan@example.com' })
  email: string;

  @Column()
  @ApiProperty({ description: 'Contraseña del usuario' })
  password: string;

  @Column()
  @ApiProperty({ description: 'Nombre completo', example: 'Juan Pérez' })
  fullName: string;

  // Mantener estos campos por compatibilidad con código existente
  @Column({ nullable: true })
  firstName: string;

  @Column({ nullable: true })
  lastName: string;

  // 🔧 CAMBIO PRINCIPAL: usar 'text' en lugar de 'enum' para SQLite
  @Column({
    type: 'text', // SQLite compatible
    default: UserRole.USER
  })
  @ApiProperty({ 
    description: 'Rol del usuario',
    enum: UserRole,
    example: UserRole.USER 
  })
  role: UserRole;

  @Column({ default: true })
  @ApiProperty({ description: 'Usuario activo', example: true })
  isActive: boolean;

  @Column({ nullable: true })
  @ApiProperty({ description: 'Último token de refresh', required: false })
  refreshToken?: string;

  @Column({ nullable: true })
  @ApiProperty({ description: 'Último login', required: false })
  lastLogin?: Date;

  @Column({ default: 0 })
  @ApiProperty({ description: 'Número de consultas de clima realizadas', example: 45 })
  weatherRequestsCount: number;

  @CreateDateColumn()
  @ApiProperty({ description: 'Fecha de creación' })
  createdAt: Date;

  @UpdateDateColumn()
  @ApiProperty({ description: 'Fecha de última actualización' })
  updatedAt: Date;
}