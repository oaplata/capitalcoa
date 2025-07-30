import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsOptional, IsString, IsUrl } from 'class-validator';
import { CreateAssetDto } from './create-asset.dto';

export class UpdateAssetDto extends PartialType(CreateAssetDto) {
  @ApiPropertyOptional({ description: 'Nuevo nombre del activo' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: 'Nuevo tipo de activo' })
  @IsOptional()
  @IsString()
  type?: string;

  @ApiPropertyOptional({ description: 'Nueva URL de información' })
  @IsOptional()
  @IsUrl({ require_protocol: false })
  info_url?: string;

  @ApiPropertyOptional({ description: 'Nuevo mercado' })
  @IsOptional()
  @IsString()
  market?: string;

  @ApiPropertyOptional({ description: 'Nueva URL del logo' })
  @IsOptional()
  @IsUrl({ require_protocol: false })
  logo_url?: string;
}
