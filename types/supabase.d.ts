// types/supabase.d.ts
export interface TradeUp {
  id?: string;          // optional if auto-generated
  item_name: string;
  price: number;
  created_at?: string;  // optional, auto-generated timestamp
}

export interface Database {
  tradeups: TradeUp;
}