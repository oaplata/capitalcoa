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
import { AssetsService } from './assets.service';
import { CreateAssetDto } from './dto/create-asset.dto';
import { UpdateAssetDto } from './dto/update-asset.dto';
import { QueryAssetDto } from './dto/query-asset.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { AuditInterceptor } from '../../common/interceptors/audit.interceptor';

@ApiTags('assets')
@ApiBearerAuth()
@Controller('api/assets')
@UseGuards(JwtAuthGuard)
@UseInterceptors(AuditInterceptor)
export class AssetsController {
  constructor(private readonly assetsService: AssetsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new asset' })
  @ApiResponse({ status: 201, description: 'Asset created successfully' })
  @ApiResponse({
    status: 409,
    description: 'Asset with this ticker already exists',
  })
  create(@Body() createAssetDto: CreateAssetDto) {
    return this.assetsService.create(createAssetDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all assets with pagination and filters' })
  @ApiResponse({ status: 200, description: 'Assets retrieved successfully' })
  findAll(@Query() query: QueryAssetDto) {
    return this.assetsService.findAll(query);
  }

  @Get(':ticker')
  @ApiOperation({ summary: 'Get an asset by ticker' })
  @ApiResponse({ status: 200, description: 'Asset retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Asset not found' })
  findOne(@Param('ticker') ticker: string) {
    return this.assetsService.findOne(ticker);
  }

  @Get(':ticker/stats')
  @ApiOperation({ summary: 'Get asset statistics' })
  @ApiResponse({
    status: 200,
    description: 'Asset stats retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'Asset not found' })
  getStats(@Param('ticker') ticker: string) {
    return this.assetsService.getAssetStats(ticker);
  }

  @Patch(':ticker')
  @ApiOperation({ summary: 'Update an asset' })
  @ApiResponse({ status: 200, description: 'Asset updated successfully' })
  @ApiResponse({ status: 404, description: 'Asset not found' })
  @ApiResponse({
    status: 409,
    description: 'Asset with this ticker already exists',
  })
  update(
    @Param('ticker') ticker: string,
    @Body() updateAssetDto: UpdateAssetDto,
  ) {
    return this.assetsService.update(ticker, updateAssetDto);
  }

  @Delete(':ticker')
  @ApiOperation({ summary: 'Delete an asset' })
  @ApiResponse({ status: 200, description: 'Asset deleted successfully' })
  @ApiResponse({ status: 404, description: 'Asset not found' })
  @ApiResponse({
    status: 409,
    description: 'Cannot delete asset with associated data',
  })
  remove(@Param('ticker') ticker: string) {
    return this.assetsService.remove(ticker);
  }
}
