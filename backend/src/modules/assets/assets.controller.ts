import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Query,
  UseGuards,
  Put,
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

@ApiTags('assets')
@ApiBearerAuth()
@Controller('api/assets')
@UseGuards(JwtAuthGuard)
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

  @Put(':ticker')
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
    console.log('Update asset request:', { ticker, updateAssetDto });
    try {
      return this.assetsService.update(ticker, updateAssetDto);
    } catch (error) {
      console.error('Controller error:', error);
      throw error;
    }
  }

  @Post(':ticker/test-update')
  @ApiOperation({ summary: 'Test update endpoint (temporary)' })
  testUpdate(
    @Param('ticker') ticker: string,
    @Body() updateAssetDto: UpdateAssetDto,
  ) {
    console.log('Test update request:', { ticker, updateAssetDto });
    return {
      message: 'Test successful',
      ticker,
      data: updateAssetDto,
      timestamp: new Date().toISOString(),
    };
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
