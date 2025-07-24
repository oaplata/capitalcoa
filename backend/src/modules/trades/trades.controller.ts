import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseIntPipe,
  ParseFloatPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { TradesService } from './trades.service';
import { CreateTradeDto } from './dto/create-trade.dto';
import { UpdateTradeDto } from './dto/update-trade.dto';
import { QueryTradeDto } from './dto/query-trade.dto';
import { Trade } from '@prisma/client';

@ApiTags('trades')
@Controller('trades')
export class TradesController {
  constructor(private readonly tradesService: TradesService) {}

  @Post()
  @ApiOperation({ summary: 'Crear un nuevo trade' })
  @ApiResponse({ status: 201, description: 'Trade creado exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  create(@Body() createTradeDto: CreateTradeDto): Promise<Trade> {
    return this.tradesService.create(createTradeDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener lista de trades con filtros opcionales' })
  @ApiResponse({
    status: 200,
    description: 'Lista de trades obtenida exitosamente',
  })
  @ApiQuery({ name: 'page', required: false, description: 'Número de página' })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Límite de resultados por página',
  })
  @ApiQuery({
    name: 'asset_ticker',
    required: false,
    description: 'Filtrar por ticker del activo',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    description: 'Filtrar por estado del trade',
  })
  @ApiQuery({
    name: 'signal_id',
    required: false,
    description: 'Filtrar por ID del signal',
  })
  findAll(@Query() query: QueryTradeDto) {
    return this.tradesService.findAll(query);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Obtener estadísticas de trades' })
  @ApiResponse({
    status: 200,
    description: 'Estadísticas obtenidas exitosamente',
  })
  getStats() {
    return this.tradesService.getTradeStats();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un trade por ID' })
  @ApiResponse({ status: 200, description: 'Trade encontrado' })
  @ApiResponse({ status: 404, description: 'Trade no encontrado' })
  @ApiParam({ name: 'id', description: 'ID del trade' })
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Trade> {
    return this.tradesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un trade' })
  @ApiResponse({ status: 200, description: 'Trade actualizado exitosamente' })
  @ApiResponse({ status: 404, description: 'Trade no encontrado' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiParam({ name: 'id', description: 'ID del trade' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTradeDto: UpdateTradeDto,
  ): Promise<Trade> {
    return this.tradesService.update(id, updateTradeDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un trade' })
  @ApiResponse({ status: 200, description: 'Trade eliminado exitosamente' })
  @ApiResponse({ status: 404, description: 'Trade no encontrado' })
  @ApiParam({ name: 'id', description: 'ID del trade' })
  remove(@Param('id', ParseIntPipe) id: number): Promise<Trade> {
    return this.tradesService.remove(id);
  }

  @Post(':id/close')
  @ApiOperation({ summary: 'Cerrar un trade abierto' })
  @ApiResponse({ status: 200, description: 'Trade cerrado exitosamente' })
  @ApiResponse({ status: 404, description: 'Trade no encontrado' })
  @ApiResponse({
    status: 400,
    description: 'Trade ya cerrado o datos inválidos',
  })
  @ApiParam({ name: 'id', description: 'ID del trade' })
  closeTrade(
    @Param('id', ParseIntPipe) id: number,
    @Body('exitPrice', ParseFloatPipe) exitPrice: number,
    @Body('exitTimestamp') exitTimestamp?: string,
  ): Promise<Trade> {
    const exitTime = exitTimestamp ? new Date(exitTimestamp) : undefined;
    return this.tradesService.closeTrade(id, exitPrice, exitTime);
  }

  @Patch(':id/price')
  @ApiOperation({ summary: 'Actualizar precio actual de un trade abierto' })
  @ApiResponse({ status: 200, description: 'Precio actualizado exitosamente' })
  @ApiResponse({ status: 404, description: 'Trade no encontrado' })
  @ApiResponse({ status: 400, description: 'Trade cerrado o datos inválidos' })
  @ApiParam({ name: 'id', description: 'ID del trade' })
  updateCurrentPrice(
    @Param('id', ParseIntPipe) id: number,
    @Body('currentPrice', ParseFloatPipe) currentPrice: number,
  ): Promise<Trade> {
    return this.tradesService.updateCurrentPrice(id, currentPrice);
  }
}
