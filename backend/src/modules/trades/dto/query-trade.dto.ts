/* eslint-disable @typescript-eslint/no-unsafe-argument */
import {
  IsOptional,
  IsString,
  IsEnum,
  IsNumber,
  IsDateString,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { TradeStatus } from '@prisma/client';
import { Transform } from 'class-transformer';

export class QueryTradeDto {
  @ApiPropertyOptional({ description: 'ID del trade' })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  id?: number;

  @ApiPropertyOptional({ description: 'ID del signal asociado' })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  signal_id?: number;

  @ApiPropertyOptional({ description: 'Ticker del activo' })
  @IsOptional()
  @IsString()
  asset_ticker?: string;

  @ApiPropertyOptional({ description: 'Estado del trade', enum: TradeStatus })
  @IsOptional()
  @IsEnum(TradeStatus)
  status?: TradeStatus;

  @ApiPropertyOptional({ description: 'Fecha de entrada desde' })
  @IsOptional()
  @IsDateString()
  entry_from?: string;

  @ApiPropertyOptional({ description: 'Fecha de entrada hasta' })
  @IsOptional()
  @IsDateString()
  entry_to?: string;

  @ApiPropertyOptional({ description: 'Fecha de salida desde' })
  @IsOptional()
  @IsDateString()
  exit_from?: string;

  @ApiPropertyOptional({ description: 'Fecha de salida hasta' })
  @IsOptional()
  @IsDateString()
  exit_to?: string;

  @ApiPropertyOptional({ description: 'Página para paginación' })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Límite de resultados por página' })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  limit?: number = 10;
}
