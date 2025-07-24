import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsOptional, IsNumber, IsEnum, Min } from 'class-validator';
import { SignalType } from '@prisma/client';
import { CreateSignalDto } from './create-signal.dto';

export class UpdateSignalDto extends PartialType(CreateSignalDto) {
  @ApiPropertyOptional({ description: 'Nuevo precio de entrada' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  entry?: number;

  @ApiPropertyOptional({ description: 'Nuevo stop loss' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  stop_loss?: number;

  @ApiPropertyOptional({ description: 'Nuevo objetivo de ganancia' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  target?: number;

  @ApiPropertyOptional({ description: 'Nuevo tipo de señal', enum: SignalType })
  @IsOptional()
  @IsEnum(SignalType)
  signal_type?: SignalType;
}
