import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsNumber, IsEnum, Min } from 'class-validator';
import { SignalType } from '@prisma/client';

export class WebhookSignalDto {
  @ApiProperty({ description: 'Ticker del activo' })
  @IsString()
  @IsNotEmpty()
  ticker: string;

  @ApiProperty({ description: 'Tipo de señal', enum: SignalType })
  @IsEnum(SignalType)
  signal_type: SignalType;

  @ApiProperty({ description: 'Precio de entrada' })
  @IsNumber()
  @Min(0)
  entry: number;

  @ApiProperty({ description: 'Stop loss' })
  @IsNumber()
  @Min(0)
  stop_loss: number;

  @ApiProperty({ description: 'Objetivo de ganancia' })
  @IsNumber()
  @Min(0)
  target: number;

  @ApiProperty({ description: 'Timestamp de la señal' })
  @IsString()
  @IsNotEmpty()
  timestamp?: string;

  @ApiProperty({ description: 'Mensaje adicional de TradingView' })
  @IsString()
  @IsNotEmpty()
  message?: string;
}
