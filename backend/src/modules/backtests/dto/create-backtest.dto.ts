import {
  IsString,
  IsNumber,
  IsOptional,
  IsPositive,
  Min,
  Max,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateBacktestDto {
  @ApiProperty({ description: 'Ticker del activo' })
  @IsString()
  asset_ticker: string;

  @ApiProperty({
    description: 'Período de la media móvil simple (SMA)',
    minimum: 1,
    maximum: 200,
  })
  @IsNumber()
  @IsPositive()
  @Min(1)
  @Max(200)
  sma_period: number;

  @ApiProperty({
    description: 'Períodos para determinar la tendencia',
    minimum: 1,
    maximum: 100,
  })
  @IsNumber()
  @IsPositive()
  @Min(1)
  @Max(100)
  trend_periods: number;

  @ApiProperty({
    description: 'Período del Average True Range (ATR)',
    minimum: 1,
    maximum: 50,
  })
  @IsNumber()
  @IsPositive()
  @Min(1)
  @Max(50)
  atr_period: number;

  @ApiProperty({
    description: 'Factor de stop loss (multiplicador del ATR)',
    minimum: 0.1,
    maximum: 10,
  })
  @IsNumber()
  @IsPositive()
  @Min(0.1)
  @Max(10)
  stoploss_factor: number;

  @ApiProperty({
    description: 'Factor de profit target (multiplicador del ATR)',
    minimum: 0.1,
    maximum: 20,
  })
  @IsNumber()
  @IsPositive()
  @Min(0.1)
  @Max(20)
  profit_factor: number;

  @ApiPropertyOptional({
    description: 'Métricas adicionales del backtest en formato JSON',
  })
  @IsOptional()
  metrics?: Record<string, any>;
}
