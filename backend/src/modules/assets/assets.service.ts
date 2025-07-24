/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../common/services/prisma.service';
import { CreateAssetDto } from './dto/create-asset.dto';
import { UpdateAssetDto } from './dto/update-asset.dto';
import { QueryAssetDto } from './dto/query-asset.dto';

@Injectable()
export class AssetsService {
  constructor(private prisma: PrismaService) {}

  async create(createAssetDto: CreateAssetDto) {
    // Verificar si el asset ya existe
    const existingAsset = await this.prisma.asset.findUnique({
      where: { ticker: createAssetDto.ticker },
    });

    if (existingAsset) {
      throw new ConflictException('Asset with this ticker already exists');
    }

    // Crear el asset
    const asset = await this.prisma.asset.create({
      data: createAssetDto,
    });

    return asset;
  }

  async findAll(query: QueryAssetDto) {
    const { page = 1, limit = 10, ticker, name, type, market } = query;
    const skip = (page - 1) * limit;

    // Construir filtros
    const where: any = {};
    if (ticker) {
      where.ticker = { contains: ticker, mode: 'insensitive' };
    }
    if (name) {
      where.name = { contains: name, mode: 'insensitive' };
    }
    if (type) {
      where.type = { contains: type, mode: 'insensitive' };
    }
    if (market) {
      where.market = { contains: market, mode: 'insensitive' };
    }

    // Obtener assets con paginación
    const [assets, total] = await Promise.all([
      this.prisma.asset.findMany({
        where,
        skip,
        take: limit,
        orderBy: { created_at: 'desc' },
      }),
      this.prisma.asset.count({ where }),
    ]);

    return {
      data: assets,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(ticker: string) {
    const asset = await this.prisma.asset.findUnique({
      where: { ticker },
    });

    if (!asset) {
      throw new NotFoundException('Asset not found');
    }

    return asset;
  }

  async update(ticker: string, updateAssetDto: UpdateAssetDto) {
    // Verificar si el asset existe
    const existingAsset = await this.prisma.asset.findUnique({
      where: { ticker },
    });

    if (!existingAsset) {
      throw new NotFoundException('Asset not found');
    }

    // Verificar si el nuevo ticker ya existe (si se está actualizando)
    if (updateAssetDto.ticker && updateAssetDto.ticker !== ticker) {
      const assetWithSameTicker = await this.prisma.asset.findUnique({
        where: { ticker: updateAssetDto.ticker },
      });

      if (assetWithSameTicker) {
        throw new ConflictException('Asset with this ticker already exists');
      }
    }

    // Actualizar asset
    const asset = await this.prisma.asset.update({
      where: { ticker },
      data: updateAssetDto,
    });

    return asset;
  }

  async remove(ticker: string) {
    // Verificar si el asset existe
    const existingAsset = await this.prisma.asset.findUnique({
      where: { ticker },
    });

    if (!existingAsset) {
      throw new NotFoundException('Asset not found');
    }

    // Verificar si hay signals, trades o backtests asociados
    const [signalsCount, tradesCount, backtestsCount] = await Promise.all([
      this.prisma.signal.count({ where: { asset_ticker: ticker } }),
      this.prisma.trade.count({ where: { asset_ticker: ticker } }),
      this.prisma.backtest.count({ where: { asset_ticker: ticker } }),
    ]);

    if (signalsCount > 0 || tradesCount > 0 || backtestsCount > 0) {
      throw new ConflictException(
        `Cannot delete asset. It has ${signalsCount} signals, ${tradesCount} trades, and ${backtestsCount} backtests associated.`,
      );
    }

    // Eliminar asset
    await this.prisma.asset.delete({
      where: { ticker },
    });

    return { message: 'Asset deleted successfully' };
  }

  async findByTicker(ticker: string) {
    return this.prisma.asset.findUnique({
      where: { ticker },
    });
  }

  async getAssetStats(ticker: string) {
    const asset = await this.prisma.asset.findUnique({
      where: { ticker },
      include: {
        _count: {
          select: {
            signals: true,
            trades: true,
            backtests: true,
          },
        },
      },
    });

    if (!asset) {
      throw new NotFoundException('Asset not found');
    }

    return {
      ticker: asset.ticker,
      name: asset.name,
      type: asset.type,
      market: asset.market,
      stats: {
        signalsCount: asset._count.signals,
        tradesCount: asset._count.trades,
        backtestsCount: asset._count.backtests,
      },
    };
  }
}
