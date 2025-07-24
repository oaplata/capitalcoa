import { Module } from '@nestjs/common';
import { BacktestsService } from './backtests.service';
import { BacktestsController } from './backtests.controller';
import { PrismaService } from 'src/common/services/prisma.service';

@Module({
  controllers: [BacktestsController],
  providers: [BacktestsService, PrismaService],
  exports: [BacktestsService],
})
export class BacktestsModule {}
