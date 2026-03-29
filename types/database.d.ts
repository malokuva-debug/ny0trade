// types/database.d.ts
export interface TradeUp {
  id?: string;
  item_name: string;
  cost: number;
  profit_percentage: number;
  created_at?: string;
}

export interface Vote {
  id?: string;
  tradeup_id: string;
  user_id: string;
  vote_type: 'good' | 'bad';
  created_at?: string;
}

export interface PriceHistory {
  id?: string;
  skin_name: string;
  price: number;
  timestamp?: string;
}

export interface SniperAlert {
  id?: string;
  skin_name: string;
  discount_percentage: number;
  is_active: boolean;
  created_at?: string;
}

export interface Database {
  tradeups: TradeUp;
  votes: Vote;
  price_history: PriceHistory;
  sniper_alerts: SniperAlert;
}