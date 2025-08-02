export interface Signal {
  id: number;
  asset_ticker: string;
  signal_type: SignalType;
  entry: number;
  stop_loss: number;
  target: number;
  created_at: string;
  updated_at: string;
  asset?: {
    ticker: string;
    name: string;
    type: string;
    logo_url?: string;
  };
  trades?: Trade[];
}

export interface CreateSignalDto {
  asset_ticker: string;
  signal_type: SignalType;
  entry: number;
  stop_loss: number;
  target: number;
}

export interface UpdateSignalDto {
  signal_type?: SignalType;
  entry?: number;
  stop_loss?: number;
  target?: number;
}

export interface QuerySignalDto {
  page?: number;
  limit?: number;
  asset_ticker?: string;
  signal_type?: SignalType;
}

export interface WebhookSignalDto {
  ticker: string;
  signal_type: SignalType;
  entry: number;
  stop_loss: number;
  target: number;
  timestamp?: string;
  message?: string;
}

export enum SignalType {
  LONG = 'LONG',
  SHORT = 'SHORT'
}

export interface Trade {
  id: number;
  status: TradeStatus;
  actual_entry: number;
  entry_timestamp: string;
}

export enum TradeStatus {
  OPEN = 'OPEN',
  CLOSED = 'CLOSED',
  CANCELLED = 'CANCELLED'
}

export interface SignalStats {
  total_signals: number;
  long_signals: number;
  short_signals: number;
  win_rate: number;
  avg_profit: number;
  total_volume: number;
  last_signal: string;
}

export interface SignalTypeOption {
  value: SignalType;
  label: string;
  icon: string;
  color: string;
} 