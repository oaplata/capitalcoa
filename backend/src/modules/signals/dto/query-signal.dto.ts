import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  IsEnum,
  IsNumber,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';
import { SignalType } from '@prisma/client';

export class QuerySignalDto {
  @ApiPropertyOptional({ description: 'Filtrar por ticker del activo' })
  @IsOptional()
  @IsString()
  asset_ticker?: string;

  @ApiPropertyOptional({
    description: 'Filtrar por tipo de señal',
    enum: SignalType,
  })
  @IsOptional()
  @IsEnum(SignalType)
  signal_type?: SignalType;

  @ApiPropertyOptional({ description: 'Página', minimum: 1, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Elementos por página',
    minimum: 1,
    maximum: 100,
    default: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 10;
}
