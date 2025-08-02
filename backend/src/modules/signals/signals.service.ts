/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../common/services/prisma.service';
import { CreateSignalDto } from './dto/create-signal.dto';
import { UpdateSignalDto } from './dto/update-signal.dto';
import { QuerySignalDto } from './dto/query-signal.dto';
import { WebhookSignalDto } from './dto/webhook-signal.dto';

@Injectable()
export class SignalsService {
  constructor(private prisma: PrismaService) {}

  async create(createSignalDto: CreateSignalDto) {
    // Verificar si el asset existe
    const asset = await this.prisma.asset.findUnique({
      where: { ticker: createSignalDto.asset_ticker },
    });

    if (!asset) {
      throw new NotFoundException(
        `Asset with ticker ${createSignalDto.asset_ticker} not found`,
      );
    }

    // Validar precios según el tipo de señal
    this.validateSignalPrices(createSignalDto);

    // Crear la señal
    const signal = await this.prisma.signal.create({
      data: createSignalDto,
      include: {
        asset: {
          select: {
            ticker: true,
            name: true,
            type: true,
            logo_url: true,
          },
        },
      },
    });

    return signal;
  }

  async findAll(query: QuerySignalDto) {
    const { page = 1, limit = 10, asset_ticker, signal_type } = query;
    const skip = (page - 1) * limit;

    // Construir filtros
    const where: any = {};
    if (asset_ticker) {
      where.asset_ticker = asset_ticker;
    }
    if (signal_type) {
      where.signal_type = signal_type;
    }

    // Obtener señales con paginación
    const [signals, total] = await Promise.all([
      this.prisma.signal.findMany({
        where,
        skip,
        take: limit,
        include: {
          asset: {
            select: {
              ticker: true,
              name: true,
              type: true,
              logo_url: true,
            },
          },
          trades: {
            select: {
              id: true,
              status: true,
              actual_entry: true,
              entry_timestamp: true,
            },
          },
        },
        orderBy: { created_at: 'desc' },
      }),
      this.prisma.signal.count({ where }),
    ]);

    return {
      data: signals,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: number) {
    const signal = await this.prisma.signal.findUnique({
      where: { id },
      include: {
        asset: {
          select: {
            ticker: true,
            name: true,
            type: true,
            logo_url: true,
          },
        },
        trades: {
          select: {
            id: true,
            status: true,
            actual_entry: true,
            entry_timestamp: true,
            actual_exit: true,
            exit_timestamp: true,
            realized_pnl: true,
          },
        },
      },
    });

    if (!signal) {
      throw new NotFoundException('Signal not found');
    }

    return signal;
  }

  async update(id: number, updateSignalDto: UpdateSignalDto) {
    // Verificar si la señal existe
    const existingSignal = await this.prisma.signal.findUnique({
      where: { id },
    });

    if (!existingSignal) {
      throw new NotFoundException('Signal not found');
    }

    // Verificar si el asset existe (si se está actualizando)
    if (updateSignalDto.asset_ticker) {
      const asset = await this.prisma.asset.findUnique({
        where: { ticker: updateSignalDto.asset_ticker },
      });

      if (!asset) {
        throw new NotFoundException(
          `Asset with ticker ${updateSignalDto.asset_ticker} not found`,
        );
      }
    }

    // Combinar datos existentes con los nuevos para validación
    const signalToValidate = {
      signal_type: updateSignalDto.signal_type || existingSignal.signal_type,
      entry: updateSignalDto.entry || existingSignal.entry,
      target: updateSignalDto.target || existingSignal.target,
      stop_loss: updateSignalDto.stop_loss || existingSignal.stop_loss,
    };

    // Validar precios según el tipo de señal
    this.validateSignalPrices(signalToValidate);

    // Actualizar señal
    const signal = await this.prisma.signal.update({
      where: { id },
      data: updateSignalDto,
      include: {
        asset: {
          select: {
            ticker: true,
            name: true,
            type: true,
          },
        },
      },
    });

    return signal;
  }

  async remove(id: number) {
    // Verificar si la señal existe
    const existingSignal = await this.prisma.signal.findUnique({
      where: { id },
    });

    if (!existingSignal) {
      throw new NotFoundException('Signal not found');
    }

    // Verificar si hay trades asociados
    const tradesCount = await this.prisma.trade.count({
      where: { signal_id: id },
    });

    if (tradesCount > 0) {
      throw new ConflictException(
        `Cannot delete signal. It has ${tradesCount} trades associated.`,
      );
    }

    // Eliminar señal
    await this.prisma.signal.delete({
      where: { id },
    });

    return { message: 'Signal deleted successfully' };
  }

  // Método para procesar webhooks de TradingView
  async processWebhook(webhookData: WebhookSignalDto) {
    // Verificar si el asset existe
    const asset = await this.prisma.asset.findUnique({
      where: { ticker: webhookData.ticker },
    });

    if (!asset) {
      throw new NotFoundException(
        `Asset with ticker ${webhookData.ticker} not found`,
      );
    }

    // Verificar si ya existe un trade abierto para este asset
    const openTrade = await this.prisma.trade.findFirst({
      where: {
        asset_ticker: webhookData.ticker,
        status: 'OPEN',
      },
    });

    if (openTrade) {
      // Si hay un trade abierto, no crear nueva señal (deduplicación)
      return {
        message: 'Signal ignored - open trade exists for this asset',
        signal_id: null,
        trade_id: openTrade.id,
      };
    }

    // Crear la señal
    const signal = await this.prisma.signal.create({
      data: {
        asset_ticker: webhookData.ticker,
        signal_type: webhookData.signal_type,
        entry: webhookData.entry,
        stop_loss: webhookData.stop_loss,
        target: webhookData.target,
      },
      include: {
        asset: {
          select: {
            ticker: true,
            name: true,
            type: true,
          },
        },
      },
    });

    return {
      message: 'Signal created successfully',
      signal_id: signal.id,
      trade_id: null,
    };
  }

  // Método para obtener estadísticas de señales
  async getSignalStats(assetTicker?: string) {
    const where: any = {};
    if (assetTicker) {
      where.asset_ticker = assetTicker;
    }

    const [totalSignals, longSignals, shortSignals] = await Promise.all([
      this.prisma.signal.count({ where }),
      this.prisma.signal.count({ where: { ...where, signal_type: 'LONG' } }),
      this.prisma.signal.count({ where: { ...where, signal_type: 'SHORT' } }),
    ]);

    return {
      total: totalSignals,
      long: longSignals,
      short: shortSignals,
      longPercentage: totalSignals > 0 ? (longSignals / totalSignals) * 100 : 0,
      shortPercentage:
        totalSignals > 0 ? (shortSignals / totalSignals) * 100 : 0,
    };
  }

  private validateSignalPrices(signalDto: CreateSignalDto | UpdateSignalDto) {
    const { signal_type, entry, target, stop_loss } = signalDto;

    // Solo validar si tenemos todos los valores necesarios
    if (
      !signal_type ||
      entry === undefined ||
      target === undefined ||
      stop_loss === undefined
    ) {
      return;
    }

    if (signal_type === 'LONG') {
      if (entry >= target) {
        throw new ConflictException(
          'Entry price must be less than target price for LONG signals.',
        );
      }
      if (entry >= stop_loss) {
        throw new ConflictException(
          'Entry price must be less than stop loss for LONG signals.',
        );
      }
    } else if (signal_type === 'SHORT') {
      if (entry <= target) {
        throw new ConflictException(
          'Entry price must be greater than target price for SHORT signals.',
        );
      }
      if (entry <= stop_loss) {
        throw new ConflictException(
          'Entry price must be greater than stop loss for SHORT signals.',
        );
      }
    }
  }
}
