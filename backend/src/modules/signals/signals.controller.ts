import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { SignalsService } from './signals.service';
import { CreateSignalDto } from './dto/create-signal.dto';
import { UpdateSignalDto } from './dto/update-signal.dto';
import { QuerySignalDto } from './dto/query-signal.dto';
import { WebhookSignalDto } from './dto/webhook-signal.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { AuditInterceptor } from '../../common/interceptors/audit.interceptor';

@ApiTags('signals')
@Controller('api/signals')
export class SignalsController {
  constructor(private readonly signalsService: SignalsService) {}

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(AuditInterceptor)
  @ApiOperation({ summary: 'Create a new signal' })
  @ApiResponse({ status: 201, description: 'Signal created successfully' })
  @ApiResponse({ status: 404, description: 'Asset not found' })
  create(@Body() createSignalDto: CreateSignalDto) {
    return this.signalsService.create(createSignalDto);
  }

  @Post('webhook')
  @ApiOperation({ summary: 'Process TradingView webhook' })
  @ApiResponse({ status: 201, description: 'Webhook processed successfully' })
  @ApiResponse({ status: 404, description: 'Asset not found' })
  processWebhook(@Body() webhookData: WebhookSignalDto) {
    return this.signalsService.processWebhook(webhookData);
  }

  @Get()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get all signals with pagination and filters' })
  @ApiResponse({ status: 200, description: 'Signals retrieved successfully' })
  findAll(@Query() query: QuerySignalDto) {
    return this.signalsService.findAll(query);
  }

  @Get('stats')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get signal statistics' })
  @ApiResponse({
    status: 200,
    description: 'Signal stats retrieved successfully',
  })
  getStats(@Query('asset_ticker') assetTicker?: string) {
    return this.signalsService.getSignalStats(assetTicker);
  }

  @Get(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get a signal by ID' })
  @ApiResponse({ status: 200, description: 'Signal retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Signal not found' })
  findOne(@Param('id') id: string) {
    return this.signalsService.findOne(+id);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(AuditInterceptor)
  @ApiOperation({ summary: 'Update a signal' })
  @ApiResponse({ status: 200, description: 'Signal updated successfully' })
  @ApiResponse({ status: 404, description: 'Signal not found' })
  update(@Param('id') id: string, @Body() updateSignalDto: UpdateSignalDto) {
    return this.signalsService.update(+id, updateSignalDto);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(AuditInterceptor)
  @ApiOperation({ summary: 'Delete a signal' })
  @ApiResponse({ status: 200, description: 'Signal deleted successfully' })
  @ApiResponse({ status: 404, description: 'Signal not found' })
  @ApiResponse({
    status: 409,
    description: 'Cannot delete signal with associated trades',
  })
  remove(@Param('id') id: string) {
    return this.signalsService.remove(+id);
  }
}
