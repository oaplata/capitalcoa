import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BullModule } from '@nestjs/bull';
import { PrismaService } from './common/services/prisma.service';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { AssetsModule } from './modules/assets/assets.module';
import { SignalsModule } from './modules/signals/signals.module';
import { TradesModule } from './modules/trades/trades.module';
import { BacktestsModule } from './modules/backtests/backtests.module';
import configuration from './config/configuration';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        redis: configService.get('redis.url'),
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    UsersModule,
    AssetsModule,
    SignalsModule,
    TradesModule,
    BacktestsModule,
  ],
  providers: [PrismaService],
  exports: [PrismaService],
})
export class AppModule {}
