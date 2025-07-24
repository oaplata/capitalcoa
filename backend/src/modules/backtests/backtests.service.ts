/* eslint-disable @typescript-eslint/require-await */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { CreateBacktestDto } from './dto/create-backtest.dto';
import { UpdateBacktestDto } from './dto/update-backtest.dto';
import { QueryBacktestDto } from './dto/query-backtest.dto';
import { Backtest } from '@prisma/client';
import { PrismaService } from 'src/common/services/prisma.service';

@Injectable()
export class BacktestsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createBacktestDto: CreateBacktestDto): Promise<Backtest> {
    // Validar que el activo existe
    const asset = await this.prisma.asset.findUnique({
      where: { ticker: createBacktestDto.asset_ticker },
    });

    if (!asset) {
      throw new BadRequestException(
        `El activo ${createBacktestDto.asset_ticker} no existe`,
      );
    }

    // Validar lógica de negocio
    this.validateBacktestLogic(createBacktestDto);

    // Calcular métricas básicas si no se proporcionan
    const metrics =
      createBacktestDto.metrics ||
      this.calculateBasicMetrics(createBacktestDto);

    return this.prisma.backtest.create({
      data: {
        ...createBacktestDto,
        metrics,
      },
      include: {
        asset: true,
      },
    });
  }

  async findAll(query: QueryBacktestDto): Promise<{
    backtests: Backtest[];
    total: number;
    page: number;
    limit: number;
  }> {
    const { page = 1, limit = 10, ...filters } = query;
    const skip = (page - 1) * limit;

    // Construir filtros de Prisma
    const where: any = {};

    if (filters.id) where.id = filters.id;
    if (filters.asset_ticker) where.asset_ticker = filters.asset_ticker;

    // Filtros de rangos numéricos
    if (filters.sma_period_min || filters.sma_period_max) {
      where.sma_period = {};
      if (filters.sma_period_min) where.sma_period.gte = filters.sma_period_min;
      if (filters.sma_period_max) where.sma_period.lte = filters.sma_period_max;
    }

    if (filters.stoploss_factor_min || filters.stoploss_factor_max) {
      where.stoploss_factor = {};
      if (filters.stoploss_factor_min)
        where.stoploss_factor.gte = filters.stoploss_factor_min;
      if (filters.stoploss_factor_max)
        where.stoploss_factor.lte = filters.stoploss_factor_max;
    }

    if (filters.profit_factor_min || filters.profit_factor_max) {
      where.profit_factor = {};
      if (filters.profit_factor_min)
        where.profit_factor.gte = filters.profit_factor_min;
      if (filters.profit_factor_max)
        where.profit_factor.lte = filters.profit_factor_max;
    }

    // Filtros de fecha
    if (filters.created_from || filters.created_to) {
      where.created_at = {};
      if (filters.created_from)
        where.created_at.gte = new Date(filters.created_from);
      if (filters.created_to)
        where.created_at.lte = new Date(filters.created_to);
    }

    const [backtests, total] = await Promise.all([
      this.prisma.backtest.findMany({
        where,
        include: {
          asset: true,
        },
        orderBy: { created_at: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.backtest.count({ where }),
    ]);

    return {
      backtests,
      total,
      page,
      limit,
    };
  }

  async findOne(id: number): Promise<Backtest> {
    const backtest = await this.prisma.backtest.findUnique({
      where: { id },
      include: {
        asset: true,
      },
    });

    if (!backtest) {
      throw new NotFoundException(`Backtest con ID ${id} no encontrado`);
    }

    return backtest;
  }

  async update(
    id: number,
    updateBacktestDto: UpdateBacktestDto,
  ): Promise<Backtest> {
    // Verificar que el backtest existe
    const existingBacktest = await this.findOne(id);

    // Validar que el activo existe si se está actualizando
    if (updateBacktestDto.asset_ticker) {
      const asset = await this.prisma.asset.findUnique({
        where: { ticker: updateBacktestDto.asset_ticker },
      });

      if (!asset) {
        throw new BadRequestException(
          `El activo ${updateBacktestDto.asset_ticker} no existe`,
        );
      }
    }

    // Validar lógica de negocio para la actualización
    this.validateBacktestUpdateLogic(existingBacktest, updateBacktestDto);

    // Recalcular métricas si se actualizan parámetros
    let metrics = updateBacktestDto.metrics;
    if (
      updateBacktestDto.sma_period ||
      updateBacktestDto.trend_periods ||
      updateBacktestDto.atr_period ||
      updateBacktestDto.stoploss_factor ||
      updateBacktestDto.profit_factor
    ) {
      const updatedParams = {
        ...existingBacktest,
        ...updateBacktestDto,
      };
      metrics = this.calculateBasicMetrics(updatedParams);
    }

    return this.prisma.backtest.update({
      where: { id },
      data: {
        ...updateBacktestDto,
        metrics,
      },
      include: {
        asset: true,
      },
    });
  }

  async remove(id: number): Promise<Backtest> {
    // Verificar que el backtest existe
    await this.findOne(id);

    return this.prisma.backtest.delete({
      where: { id },
      include: {
        asset: true,
      },
    });
  }

  async runBacktest(id: number): Promise<Backtest> {
    const backtest = await this.findOne(id);

    // Simular ejecución de backtest y actualizar métricas
    const updatedMetrics = await this.executeBacktest(backtest);

    return this.prisma.backtest.update({
      where: { id },
      data: {
        metrics: updatedMetrics,
      },
      include: {
        asset: true,
      },
    });
  }

  async getBacktestStats(): Promise<{
    totalBacktests: number;
    averageSmaPeriod: number;
    averageStoplossFactor: number;
    averageProfitFactor: number;
    bestPerformingAsset: string;
    mostTestedAsset: string;
  }> {
    const [
      totalBacktests,
      averageSmaPeriod,
      averageStoplossFactor,
      averageProfitFactor,
      assetStats,
    ] = await Promise.all([
      this.prisma.backtest.count(),
      this.prisma.backtest.aggregate({
        _avg: { sma_period: true },
      }),
      this.prisma.backtest.aggregate({
        _avg: { stoploss_factor: true },
      }),
      this.prisma.backtest.aggregate({
        _avg: { profit_factor: true },
      }),
      this.prisma.backtest.groupBy({
        by: ['asset_ticker'],
        _count: { asset_ticker: true },
        _avg: { profit_factor: true },
      }),
    ]);

    // Encontrar el activo más probado
    const mostTestedAsset =
      assetStats.reduce((prev, current) =>
        prev._count.asset_ticker > current._count.asset_ticker ? prev : current,
      )?.asset_ticker || 'N/A';

    // Encontrar el activo con mejor rendimiento promedio
    const bestPerformingAsset =
      assetStats.reduce((prev, current) =>
        (prev._avg.profit_factor || 0) > (current._avg.profit_factor || 0)
          ? prev
          : current,
      )?.asset_ticker || 'N/A';

    return {
      totalBacktests,
      averageSmaPeriod:
        Math.round((averageSmaPeriod._avg.sma_period || 0) * 100) / 100,
      averageStoplossFactor:
        Math.round((averageStoplossFactor._avg.stoploss_factor || 0) * 100) /
        100,
      averageProfitFactor:
        Math.round((averageProfitFactor._avg.profit_factor || 0) * 100) / 100,
      bestPerformingAsset,
      mostTestedAsset,
    };
  }

  async compareBacktests(ids: number[]): Promise<{
    backtests: Backtest[];
    comparison: Record<string, any>;
  }> {
    if (ids.length < 2 || ids.length > 5) {
      throw new BadRequestException('Debe comparar entre 2 y 5 backtests');
    }

    const backtests = await Promise.all(ids.map((id) => this.findOne(id)));

    const comparison = this.generateComparison(backtests);

    return {
      backtests,
      comparison,
    };
  }

  private validateBacktestLogic(backtestData: CreateBacktestDto): void {
    // Validar que el profit_factor sea mayor que el stoploss_factor
    if (backtestData.profit_factor <= backtestData.stoploss_factor) {
      throw new BadRequestException(
        'El factor de profit debe ser mayor que el factor de stop loss',
      );
    }

    // Validar que los períodos sean razonables
    if (backtestData.sma_period < backtestData.trend_periods) {
      throw new BadRequestException(
        'El período SMA debe ser mayor o igual al período de tendencia',
      );
    }

    if (backtestData.atr_period > backtestData.sma_period) {
      throw new BadRequestException(
        'El período ATR no debe ser mayor que el período SMA',
      );
    }
  }

  private validateBacktestUpdateLogic(
    existingBacktest: Backtest,
    updateData: UpdateBacktestDto,
  ): void {
    // Validar que el profit_factor sea mayor que el stoploss_factor si ambos se actualizan
    if (
      updateData.profit_factor !== undefined &&
      updateData.stoploss_factor !== undefined
    ) {
      if (updateData.profit_factor <= updateData.stoploss_factor) {
        throw new BadRequestException(
          'El factor de profit debe ser mayor que el factor de stop loss',
        );
      }
    } else if (updateData.profit_factor !== undefined) {
      if (updateData.profit_factor <= existingBacktest.stoploss_factor) {
        throw new BadRequestException(
          'El factor de profit debe ser mayor que el factor de stop loss actual',
        );
      }
    } else if (updateData.stoploss_factor !== undefined) {
      if (existingBacktest.profit_factor <= updateData.stoploss_factor) {
        throw new BadRequestException(
          'El factor de profit actual debe ser mayor que el nuevo factor de stop loss',
        );
      }
    }
  }

  private calculateBasicMetrics(backtestData: any): Record<string, any> {
    // Calcular métricas básicas basadas en los parámetros
    const riskRewardRatio =
      backtestData.profit_factor / backtestData.stoploss_factor;
    const volatilityScore = this.calculateVolatilityScore(backtestData);

    return {
      risk_reward_ratio: Math.round(riskRewardRatio * 100) / 100,
      volatility_score: Math.round(volatilityScore * 100) / 100,
      strategy_complexity: this.calculateStrategyComplexity(backtestData),
      estimated_win_rate: this.estimateWinRate(backtestData),
      last_updated: new Date().toISOString(),
    };
  }

  private calculateVolatilityScore(backtestData: any): number {
    // Algoritmo simple para calcular score de volatilidad
    const atrWeight = 0.4;
    const smaWeight = 0.3;
    const trendWeight = 0.3;

    const atrScore = Math.min(backtestData.atr_period / 20, 1);
    const smaScore = Math.min(backtestData.sma_period / 100, 1);
    const trendScore = Math.min(backtestData.trend_periods / 50, 1);

    return (
      atrScore * atrWeight + smaScore * smaWeight + trendScore * trendWeight
    );
  }

  private calculateStrategyComplexity(backtestData: any): string {
    const totalParams =
      backtestData.sma_period +
      backtestData.trend_periods +
      backtestData.atr_period;

    if (totalParams < 50) return 'LOW';
    if (totalParams < 100) return 'MEDIUM';
    return 'HIGH';
  }

  private estimateWinRate(backtestData: any): number {
    // Estimación simple basada en el ratio riesgo/recompensa
    const riskRewardRatio =
      backtestData.profit_factor / backtestData.stoploss_factor;
    const baseWinRate = 0.5; // 50% base

    // Ajustar basado en el ratio riesgo/recompensa
    const adjustment = (riskRewardRatio - 1) * 0.1;
    const estimatedWinRate = baseWinRate + adjustment;

    return Math.max(
      0.1,
      Math.min(0.9, Math.round(estimatedWinRate * 100) / 100),
    );
  }

  private async executeBacktest(
    backtest: Backtest,
  ): Promise<Record<string, any>> {
    // Simulación de ejecución de backtest
    // En una implementación real, aquí se ejecutaría el algoritmo de backtesting

    const baseMetrics = this.calculateBasicMetrics(backtest);

    // Simular resultados de backtest
    const simulatedResults = {
      ...baseMetrics,
      total_trades: Math.floor(Math.random() * 100) + 10,
      winning_trades: Math.floor(Math.random() * 80) + 5,
      losing_trades: Math.floor(Math.random() * 40) + 2,
      total_return: (Math.random() * 50 - 10).toFixed(2),
      max_drawdown: (Math.random() * 20).toFixed(2),
      sharpe_ratio: (Math.random() * 2 - 0.5).toFixed(2),
      execution_time: new Date().toISOString(),
      win_rate: 0,
    };

    // Calcular win rate real
    const totalTrades = simulatedResults.total_trades;
    const winningTrades = simulatedResults.winning_trades;
    simulatedResults.win_rate =
      Math.round((winningTrades / totalTrades) * 100) / 100;

    return simulatedResults;
  }

  private generateComparison(backtests: Backtest[]): Record<string, any> {
    const comparison: Record<string, any> = {
      summary: {
        total_backtests: backtests.length,
        assets_tested: [...new Set(backtests.map((b) => b.asset_ticker))],
        date_range: {
          earliest: new Date(
            Math.min(...backtests.map((b) => b.created_at.getTime())),
          ).toISOString(),
          latest: new Date(
            Math.max(...backtests.map((b) => b.created_at.getTime())),
          ).toISOString(),
        },
      },
      parameters: {
        sma_periods: backtests.map((b) => ({ id: b.id, value: b.sma_period })),
        stoploss_factors: backtests.map((b) => ({
          id: b.id,
          value: b.stoploss_factor,
        })),
        profit_factors: backtests.map((b) => ({
          id: b.id,
          value: b.profit_factor,
        })),
      },
      metrics: backtests.map((b) => ({
        id: b.id,
        asset_ticker: b.asset_ticker,
        metrics: b.metrics,
      })),
    };

    return comparison;
  }
}
