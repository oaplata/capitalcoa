import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsUrl } from 'class-validator';

export class CreateAssetDto {
  @ApiProperty({ description: 'Símbolo único del activo (ticker)' })
  @IsString()
  @IsNotEmpty()
  ticker: string;

  @ApiProperty({ description: 'Nombre completo del activo' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'Tipo de activo (stock, crypto, ETF, etc.)' })
  @IsString()
  @IsNotEmpty()
  type: string;

  @ApiPropertyOptional({ description: 'URL para más información del activo' })
  @IsOptional()
  @IsUrl()
  info_url?: string;

  @ApiPropertyOptional({
    description: 'Mercado donde se negocia (NASDAQ, BINANCE, etc.)',
  })
  @IsOptional()
  @IsString()
  market?: string;

  @ApiPropertyOptional({ description: 'URL del logo del activo' })
  @IsOptional()
  @IsUrl()
  logo_url?: string;
}
