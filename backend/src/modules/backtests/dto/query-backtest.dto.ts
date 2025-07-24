/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { IsOptional, IsString, IsNumber, IsDateString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class QueryBacktestDto {
  @ApiPropertyOptional({ description: 'ID del backtest' })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  id?: number;

  @ApiPropertyOptional({ description: 'Ticker del activo' })
  @IsOptional()
  @IsString()
  asset_ticker?: string;

  @ApiPropertyOptional({ description: 'Período de SMA mínimo' })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  sma_period_min?: number;

  @ApiPropertyOptional({ description: 'Período de SMA máximo' })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  sma_period_max?: number;

  @ApiPropertyOptional({ description: 'Factor de stop loss mínimo' })
  @IsOptional()
  @Transform(({ value }) => parseFloat(value))
  @IsNumber()
  stoploss_factor_min?: number;

  @ApiPropertyOptional({ description: 'Factor de stop loss máximo' })
  @IsOptional()
  @Transform(({ value }) => parseFloat(value))
  @IsNumber()
  stoploss_factor_max?: number;

  @ApiPropertyOptional({ description: 'Factor de profit mínimo' })
  @IsOptional()
  @Transform(({ value }) => parseFloat(value))
  @IsNumber()
  profit_factor_min?: number;

  @ApiPropertyOptional({ description: 'Factor de profit máximo' })
  @IsOptional()
  @Transform(({ value }) => parseFloat(value))
  @IsNumber()
  profit_factor_max?: number;

  @ApiPropertyOptional({ description: 'Fecha de creación desde' })
  @IsOptional()
  @IsDateString()
  created_from?: string;

  @ApiPropertyOptional({ description: 'Fecha de creación hasta' })
  @IsOptional()
  @IsDateString()
  created_to?: string;

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
