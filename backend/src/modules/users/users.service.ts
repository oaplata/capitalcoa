/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../common/services/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { QueryUserDto } from './dto/query-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    // Verificar si el usuario ya existe
    const existingUser = await this.prisma.user.findUnique({
      where: { username: createUserDto.username },
    });

    if (existingUser) {
      throw new ConflictException('User already exists');
    }

    // Hashear la contraseña
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    // Crear el usuario
    const user = await this.prisma.user.create({
      data: {
        username: createUserDto.username,
        password: hashedPassword,
        role: createUserDto.role,
      },
      select: {
        id: true,
        username: true,
        role: true,
        created_at: true,
        updated_at: true,
      },
    });

    return user;
  }

  async findAll(query: QueryUserDto) {
    const { page = 1, limit = 10, username, role } = query;
    const skip = (page - 1) * limit;

    // Construir filtros
    const where: any = {};
    if (username) {
      where.username = { contains: username, mode: 'insensitive' };
    }
    if (role) {
      where.role = role;
    }

    // Obtener usuarios con paginación
    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        select: {
          id: true,
          username: true,
          role: true,
          created_at: true,
          updated_at: true,
        },
        orderBy: { created_at: 'desc' },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      data: users,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        username: true,
        role: true,
        created_at: true,
        updated_at: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    // Verificar si el usuario existe
    const existingUser = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      throw new NotFoundException('User not found');
    }

    // Verificar si el username ya existe (si se está actualizando)
    if (
      updateUserDto.username &&
      updateUserDto.username !== existingUser.username
    ) {
      const userWithSameUsername = await this.prisma.user.findUnique({
        where: { username: updateUserDto.username },
      });

      if (userWithSameUsername) {
        throw new ConflictException('Username already exists');
      }
    }

    // Preparar datos para actualización
    const updateData: any = {};
    if (updateUserDto.username) updateData.username = updateUserDto.username;
    if (updateUserDto.role) updateData.role = updateUserDto.role;
    if (updateUserDto.password) {
      updateData.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    // Actualizar usuario
    const user = await this.prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        username: true,
        role: true,
        created_at: true,
        updated_at: true,
      },
    });

    return user;
  }

  async remove(id: number) {
    // Verificar si el usuario existe
    const existingUser = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      throw new NotFoundException('User not found');
    }

    // Eliminar usuario
    await this.prisma.user.delete({
      where: { id },
    });

    return { message: 'User deleted successfully' };
  }

  async findByUsername(username: string) {
    return this.prisma.user.findUnique({
      where: { username },
    });
  }
}
