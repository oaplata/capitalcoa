import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsEmail,
  MinLength,
  IsEnum,
} from 'class-validator';
import { UserRole } from '@prisma/client';

export class CreateUserDto {
  @ApiProperty({ description: 'Username/email del usuario' })
  @IsString()
  @IsNotEmpty()
  @IsEmail()
  username: string;

  @ApiProperty({ description: 'Contraseña del usuario', minLength: 8 })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  password: string;

  @ApiProperty({ description: 'Rol del usuario', enum: UserRole })
  @IsEnum(UserRole)
  role: UserRole = UserRole.USER;
}
