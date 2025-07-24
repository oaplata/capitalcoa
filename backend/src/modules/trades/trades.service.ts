/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { CreateTradeDto } from './dto/create-trade.dto';
import { UpdateTradeDto } from './dto/update-trade.dto';
import { QueryTradeDto } from './dto/query-trade.dto';
import { Trade, TradeStatus } from '@prisma/client';
import { PrismaService } from 'src/common/services/prisma.service';

@Injectable()
export class TradesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createTradeDto: CreateTradeDto): Promise<Trade> {
    // Validar que el activo existe
    const asset = await this.prisma.asset.findUnique({
      where: { ticker: createTradeDto.asset_ticker },
    });

    if (!asset) {
      throw new BadRequestException(
        `El activo ${createTradeDto.asset_ticker} no existe`,
      );
    }

    // Si se proporciona signal_id, validar que existe
    if (createTradeDto.signal_id) {
      const signal = await this.prisma.signal.findUnique({
        where: { id: createTradeDto.signal_id },
      });

      if (!signal) {
        throw new BadRequestException(
          `El signal con ID ${createTradeDto.signal_id} no existe`,
        );
      }
    }

    // Validar lógica de negocio
    this.validateTradeLogic(createTradeDto);

    return this.prisma.trade.create({
      data: {
        ...createTradeDto,
        entry_timestamp: new Date(createTradeDto.entry_timestamp),
        exit_timestamp: createTradeDto.exit_timestamp
          ? new Date(createTradeDto.exit_timestamp)
          : null,
      },
      include: {
        asset: true,
        signal: true,
      },
    });
  }

  async findAll(
    query: QueryTradeDto,
  ): Promise<{ trades: Trade[]; total: number; page: number; limit: number }> {
    const { page = 1, limit = 10, ...filters } = query;
    const skip = (page - 1) * limit;

    // Construir filtros de Prisma
    const where: any = {};

    if (filters.id) where.id = filters.id;
    if (filters.signal_id) where.signal_id = filters.signal_id;
    if (filters.asset_ticker) where.asset_ticker = filters.asset_ticker;
    if (filters.status) where.status = filters.status;

    // Filtros de fecha
    if (filters.entry_from || filters.entry_to) {
      where.entry_timestamp = {};
      if (filters.entry_from)
        where.entry_timestamp.gte = new Date(filters.entry_from);
      if (filters.entry_to)
        where.entry_timestamp.lte = new Date(filters.entry_to);
    }

    if (filters.exit_from || filters.exit_to) {
      where.exit_timestamp = {};
      if (filters.exit_from)
        where.exit_timestamp.gte = new Date(filters.exit_from);
      if (filters.exit_to) where.exit_timestamp.lte = new Date(filters.exit_to);
    }

    const [trades, total] = await Promise.all([
      this.prisma.trade.findMany({
        where,
        include: {
          asset: true,
          signal: true,
        },
        orderBy: { created_at: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.trade.count({ where }),
    ]);

    return {
      trades,
      total,
      page,
      limit,
    };
  }

  async findOne(id: number): Promise<Trade> {
    const trade = await this.prisma.trade.findUnique({
      where: { id },
      include: {
        asset: true,
        signal: true,
      },
    });

    if (!trade) {
      throw new NotFoundException(`Trade con ID ${id} no encontrado`);
    }

    return trade;
  }

  async update(id: number, updateTradeDto: UpdateTradeDto): Promise<Trade> {
    // Verificar que el trade existe
    const existingTrade = await this.findOne(id);

    // Validar que el activo existe si se está actualizando
    if (updateTradeDto.asset_ticker) {
      const asset = await this.prisma.asset.findUnique({
        where: { ticker: updateTradeDto.asset_ticker },
      });

      if (!asset) {
        throw new BadRequestException(
          `El activo ${updateTradeDto.asset_ticker} no existe`,
        );
      }
    }

    // Si se proporciona signal_id, validar que existe
    if (updateTradeDto.signal_id) {
      const signal = await this.prisma.signal.findUnique({
        where: { id: updateTradeDto.signal_id },
      });

      if (!signal) {
        throw new BadRequestException(
          `El signal con ID ${updateTradeDto.signal_id} no existe`,
        );
      }
    }

    // Validar lógica de negocio para la actualización
    this.validateTradeUpdateLogic(existingTrade, updateTradeDto);

    const updateData: any = { ...updateTradeDto };

    // Convertir fechas si se proporcionan
    if (updateTradeDto.entry_timestamp) {
      updateData.entry_timestamp = new Date(updateTradeDto.entry_timestamp);
    }
    if (updateTradeDto.exit_timestamp) {
      updateData.exit_timestamp = new Date(updateTradeDto.exit_timestamp);
    }

    return this.prisma.trade.update({
      where: { id },
      data: updateData,
      include: {
        asset: true,
        signal: true,
      },
    });
  }

  async remove(id: number): Promise<Trade> {
    // Verificar que el trade existe
    await this.findOne(id);

    return this.prisma.trade.delete({
      where: { id },
      include: {
        asset: true,
        signal: true,
      },
    });
  }

  async closeTrade(
    id: number,
    exitPrice: number,
    exitTimestamp?: Date,
  ): Promise<Trade> {
    const trade = await this.findOne(id);

    if (trade.status !== TradeStatus.OPEN) {
      throw new BadRequestException(
        'Solo se pueden cerrar trades que estén abiertos',
      );
    }

    const exitTime = exitTimestamp || new Date();
    const realizedPnl = this.calculatePnl(trade.actual_entry, exitPrice);

    return this.prisma.trade.update({
      where: { id },
      data: {
        actual_exit: exitPrice,
        exit_timestamp: exitTime,
        status: TradeStatus.CLOSED,
        realized_pnl: realizedPnl,
        floating_pnl: null,
        current_price: exitPrice,
      },
      include: {
        asset: true,
        signal: true,
      },
    });
  }

  async updateCurrentPrice(id: number, currentPrice: number): Promise<Trade> {
    const trade = await this.findOne(id);

    if (trade.status !== TradeStatus.OPEN) {
      throw new BadRequestException(
        'Solo se puede actualizar el precio de trades abiertos',
      );
    }

    const floatingPnl = this.calculatePnl(trade.actual_entry, currentPrice);

    return this.prisma.trade.update({
      where: { id },
      data: {
        current_price: currentPrice,
        floating_pnl: floatingPnl,
      },
      include: {
        asset: true,
        signal: true,
      },
    });
  }

  async getTradeStats(): Promise<{
    totalTrades: number;
    openTrades: number;
    closedTrades: number;
    totalRealizedPnl: number;
    totalFloatingPnl: number;
    winRate: number;
  }> {
    const [
      totalTrades,
      openTrades,
      closedTrades,
      totalRealizedPnl,
      totalFloatingPnl,
      winningTrades,
    ] = await Promise.all([
      this.prisma.trade.count(),
      this.prisma.trade.count({ where: { status: TradeStatus.OPEN } }),
      this.prisma.trade.count({ where: { status: TradeStatus.CLOSED } }),
      this.prisma.trade.aggregate({
        where: { status: TradeStatus.CLOSED },
        _sum: { realized_pnl: true },
      }),
      this.prisma.trade.aggregate({
        where: { status: TradeStatus.OPEN },
        _sum: { floating_pnl: true },
      }),
      this.prisma.trade.count({
        where: {
          status: TradeStatus.CLOSED,
          realized_pnl: { gt: 0 },
        },
      }),
    ]);

    const winRate = closedTrades > 0 ? (winningTrades / closedTrades) * 100 : 0;

    return {
      totalTrades,
      openTrades,
      closedTrades,
      totalRealizedPnl: totalRealizedPnl._sum.realized_pnl || 0,
      totalFloatingPnl: totalFloatingPnl._sum.floating_pnl || 0,
      winRate: Math.round(winRate * 100) / 100,
    };
  }

  private validateTradeLogic(tradeData: CreateTradeDto): void {
    // Validar que si el trade está cerrado, debe tener precio de salida
    if (tradeData.status === TradeStatus.CLOSED && !tradeData.actual_exit) {
      throw new BadRequestException(
        'Un trade cerrado debe tener un precio de salida',
      );
    }

    // Validar que si hay precio de salida, debe haber timestamp de salida
    if (tradeData.actual_exit && !tradeData.exit_timestamp) {
      throw new BadRequestException(
        'Si se proporciona precio de salida, debe incluirse el timestamp de salida',
      );
    }

    // Validar que el timestamp de entrada no sea futuro
    if (new Date(tradeData.entry_timestamp) > new Date()) {
      throw new BadRequestException(
        'El timestamp de entrada no puede ser en el futuro',
      );
    }

    // Validar que el timestamp de salida no sea anterior al de entrada
    if (
      tradeData.exit_timestamp &&
      new Date(tradeData.exit_timestamp) < new Date(tradeData.entry_timestamp)
    ) {
      throw new BadRequestException(
        'El timestamp de salida no puede ser anterior al de entrada',
      );
    }
  }

  private validateTradeUpdateLogic(
    existingTrade: Trade,
    updateData: UpdateTradeDto,
  ): void {
    // Validar que no se puede cambiar el estado de un trade cerrado a abierto
    if (
      existingTrade.status === TradeStatus.CLOSED &&
      updateData.status === TradeStatus.OPEN
    ) {
      throw new BadRequestException('No se puede reabrir un trade cerrado');
    }

    // Validar que si se está cerrando el trade, debe tener precio de salida
    if (
      updateData.status === TradeStatus.CLOSED &&
      !updateData.actual_exit &&
      !existingTrade.actual_exit
    ) {
      throw new BadRequestException(
        'Para cerrar un trade debe proporcionarse un precio de salida',
      );
    }
  }

  private calculatePnl(entryPrice: number, currentPrice: number): number {
    return ((currentPrice - entryPrice) / entryPrice) * 100;
  }
}
