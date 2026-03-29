// types/database.ts
// Combined Supabase-generated + custom simplified types

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface TradeUp {
  id?: string;
  name: string;
  cost: number;
  expected_value: number;
  profit: number;
  profit_percentage: number;
  avg_input_float: number;
  inputs: Json;
  outputs: Json;
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
  market_hash_name?: string;
  price: number;
  float_value?: number | null;
  timestamp?: string;
  source?: string;
}

export interface SniperAlert {
  id?: string;
  skin_data?: Json;
  skin_name?: string;
  market_price?: number;
  listing_price?: number;
  discount_percentage: number;
  float_value?: number;
  detected_at?: string;
  is_active: boolean;
  created_at?: string;
}

// Supabase Database type
export interface Database {
  public: {
    Tables: {
      tradeups: {
        Row: TradeUp;
        Insert: Omit<TradeUp, 'id' | 'created_at'> & { id?: string; created_at?: string };
        Update: Partial<TradeUp>;
      };
      votes: {
        Row: Vote;
        Insert: Omit<Vote, 'id' | 'created_at'> & { id?: string; created_at?: string };
        Update: Partial<Vote>;
      };
      price_history: {
        Row: PriceHistory;
        Insert: Omit<PriceHistory, 'id' | 'timestamp'> & { id?: string; timestamp?: string };
        Update: Partial<PriceHistory>;
      };
      sniper_alerts: {
        Row: SniperAlert;
        Insert: Omit<SniperAlert, 'id' | 'created_at'> & { id?: string; created_at?: string };
        Update: Partial<SniperAlert>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      vote_type: 'good' | 'bad';
    };
  };
}