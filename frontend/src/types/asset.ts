export interface Asset {
  id: number;
  ticker: string;
  name: string;
  type: string;
  info_url?: string;
  market?: string;
  logo_url?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateAssetDto {
  ticker: string;
  name: string;
  type: string;
  info_url?: string;
  market?: string;
  logo_url?: string;
}

export interface UpdateAssetDto {
  name?: string;
  type?: string;
  info_url?: string;
  market?: string;
  logo_url?: string;
}

export interface QueryAssetDto {
  page?: number;
  limit?: number;
  ticker?: string;
  type?: string;
  market?: string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

export interface AssetStats {
  ticker: string;
  total_trades: number;
  total_signals: number;
  win_rate: number;
  avg_profit: number;
  total_volume: number;
  last_activity: string;
}

export interface AssetType {
  value: string;
  label: string;
  icon: string;
  color: string;
}

export interface Market {
  value: string;
  label: string;
  icon: string;
} 