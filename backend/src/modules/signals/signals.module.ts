import { Module } from '@nestjs/common';
import { SignalsService } from './signals.service';
import { SignalsController } from './signals.controller';
import { PrismaService } from '../../common/services/prisma.service';

@Module({
  controllers: [SignalsController],
  providers: [SignalsService, PrismaService],
  exports: [SignalsService],
})
export class SignalsModule {}
