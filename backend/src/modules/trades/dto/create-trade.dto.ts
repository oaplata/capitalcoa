import {
  IsString,
  IsNumber,
  IsOptional,
  IsDateString,
  IsEnum,
  Min,
  IsPositive,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TradeStatus } from '@prisma/client';

export class CreateTradeDto {
  @ApiPropertyOptional({ description: 'ID del signal asociado al trade' })
  @IsOptional()
  @IsNumber()
  signal_id?: number;

  @ApiProperty({ description: 'Ticker del activo' })
  @IsString()
  asset_ticker: string;

  @ApiProperty({ description: 'Precio de entrada real' })
  @IsNumber()
  @IsPositive()
  actual_entry: number;

  @ApiProperty({ description: 'Timestamp de entrada' })
  @IsDateString()
  entry_timestamp: string;

  @ApiPropertyOptional({ description: 'Precio de salida real' })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  actual_exit?: number;

  @ApiPropertyOptional({ description: 'Timestamp de salida' })
  @IsOptional()
  @IsDateString()
  exit_timestamp?: string;

  @ApiProperty({ description: 'Estado del trade', enum: TradeStatus })
  @IsEnum(TradeStatus)
  status: TradeStatus;

  @ApiPropertyOptional({ description: 'Precio actual del activo' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  current_price?: number;

  @ApiPropertyOptional({ description: 'P&L flotante' })
  @IsOptional()
  @IsNumber()
  floating_pnl?: number;

  @ApiPropertyOptional({ description: 'P&L realizado' })
  @IsOptional()
  @IsNumber()
  realized_pnl?: number;
}
