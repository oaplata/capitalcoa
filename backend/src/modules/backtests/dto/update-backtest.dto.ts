import { PartialType } from '@nestjs/swagger';
import { CreateBacktestDto } from './create-backtest.dto';

export class UpdateBacktestDto extends PartialType(CreateBacktestDto) {}
