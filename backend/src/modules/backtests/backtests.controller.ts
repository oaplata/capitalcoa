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
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { BacktestsService } from './backtests.service';
import { CreateBacktestDto } from './dto/create-backtest.dto';
import { UpdateBacktestDto } from './dto/update-backtest.dto';
import { QueryBacktestDto } from './dto/query-backtest.dto';
import { Backtest } from '@prisma/client';

@ApiTags('backtests')
@Controller('backtests')
export class BacktestsController {
  constructor(private readonly backtestsService: BacktestsService) {}

  @Post()
  @ApiOperation({ summary: 'Crear un nuevo backtest' })
  @ApiResponse({ status: 201, description: 'Backtest creado exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  create(@Body() createBacktestDto: CreateBacktestDto): Promise<Backtest> {
    return this.backtestsService.create(createBacktestDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Obtener lista de backtests con filtros opcionales',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de backtests obtenida exitosamente',
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
    name: 'sma_period_min',
    required: false,
    description: 'Período SMA mínimo',
  })
  @ApiQuery({
    name: 'sma_period_max',
    required: false,
    description: 'Período SMA máximo',
  })
  @ApiQuery({
    name: 'stoploss_factor_min',
    required: false,
    description: 'Factor stop loss mínimo',
  })
  @ApiQuery({
    name: 'stoploss_factor_max',
    required: false,
    description: 'Factor stop loss máximo',
  })
  @ApiQuery({
    name: 'profit_factor_min',
    required: false,
    description: 'Factor profit mínimo',
  })
  @ApiQuery({
    name: 'profit_factor_max',
    required: false,
    description: 'Factor profit máximo',
  })
  findAll(@Query() query: QueryBacktestDto) {
    return this.backtestsService.findAll(query);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Obtener estadísticas de backtests' })
  @ApiResponse({
    status: 200,
    description: 'Estadísticas obtenidas exitosamente',
  })
  getStats() {
    return this.backtestsService.getBacktestStats();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un backtest por ID' })
  @ApiResponse({ status: 200, description: 'Backtest encontrado' })
  @ApiResponse({ status: 404, description: 'Backtest no encontrado' })
  @ApiParam({ name: 'id', description: 'ID del backtest' })
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Backtest> {
    return this.backtestsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un backtest' })
  @ApiResponse({
    status: 200,
    description: 'Backtest actualizado exitosamente',
  })
  @ApiResponse({ status: 404, description: 'Backtest no encontrado' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiParam({ name: 'id', description: 'ID del backtest' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateBacktestDto: UpdateBacktestDto,
  ): Promise<Backtest> {
    return this.backtestsService.update(id, updateBacktestDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un backtest' })
  @ApiResponse({ status: 200, description: 'Backtest eliminado exitosamente' })
  @ApiResponse({ status: 404, description: 'Backtest no encontrado' })
  @ApiParam({ name: 'id', description: 'ID del backtest' })
  remove(@Param('id', ParseIntPipe) id: number): Promise<Backtest> {
    return this.backtestsService.remove(id);
  }

  @Post(':id/run')
  @ApiOperation({ summary: 'Ejecutar un backtest' })
  @ApiResponse({ status: 200, description: 'Backtest ejecutado exitosamente' })
  @ApiResponse({ status: 404, description: 'Backtest no encontrado' })
  @ApiParam({ name: 'id', description: 'ID del backtest' })
  runBacktest(@Param('id', ParseIntPipe) id: number): Promise<Backtest> {
    return this.backtestsService.runBacktest(id);
  }

  @Post('compare')
  @ApiOperation({ summary: 'Comparar múltiples backtests' })
  @ApiResponse({
    status: 200,
    description: 'Comparación realizada exitosamente',
  })
  @ApiResponse({
    status: 400,
    description: 'Debe comparar entre 2 y 5 backtests',
  })
  compareBacktests(@Body('ids') ids: number[]) {
    return this.backtestsService.compareBacktests(ids);
  }
}
