// Core Types for CS2 Trade-Up Application

export type Rarity = 'Consumer' | 'Industrial' | 'Mil-Spec' | 'Restricted' | 'Classified' | 'Covert';
export type Exterior = 'Factory New' | 'Minimal Wear' | 'Field-Tested' | 'Well-Worn' | 'Battle-Scarred';
export type VoteType = 'good' | 'bad';

export interface Skin {
  name: string;
  weapon: string;
  collection: string;
  rarity: Rarity;
  exterior: Exterior;
  float: number;
  price: number;
  market_hash_name: string;
  image_url?: string;
}

export interface TradeUpInput extends Skin {
  quantity: number;
}

export interface TradeUpOutput extends Skin {
  probability: number;
  expected_value: number;
}

export interface TradeUpContract {
  id: string;
  name: string;
  inputs: TradeUpInput[];
  outputs: TradeUpOutput[];
  total_cost: number;
  expected_value: number;
  profit: number;
  profit_percentage: number;
  avg_input_float: number;
  output_float_range: { min: number; max: number };
  created_at: string;
  votes?: { good: number; bad: number };
}

export interface SniperAlert {
  id: string;
  skin: Skin;
  market_price: number;
  listing_price: number;
  discount_percentage: number;
  float_value: number;
  detected_at: string;
  is_active: boolean;
}

export interface PriceHistory {
  id: string;
  skin_name: string;
  market_hash_name: string;
  price: number;
  float?: number;
  timestamp: string;
  source: 'csfloat' | 'steam' | 'buff163';
}

export interface Vote {
  id: string;
  tradeup_id: string;
  user_id: string;
  vote_type: VoteType;
  created_at: string;
}

export interface TradeUpFilters {
  min_budget?: number;
  max_budget?: number;
  min_ev?: number;
  min_profit_percentage?: number;
  max_float?: number;
  rarity?: Rarity;
  collection?: string;
}

export interface CSFloatListing {
  id: string;
  price: number;
  item: {
    market_hash_name: string;
    float_value: number;
    paint_wear: number;
    rarity: string;
    item_name: string;
  };
}

export interface CSFloatPriceData {
  market_hash_name: string;
  avg_price: number;
  min_price: number;
  max_price: number;
  listings_count: number;
  updated_at: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface TradeUpsApiResponse extends ApiResponse<TradeUpContract[]> {
  total_count: number;
  filtered_count: number;
}

export interface SniperAlertsApiResponse extends ApiResponse<SniperAlert[]> {
  active_count: number;
}

export interface VoteApiResponse extends ApiResponse<Vote> {
  new_vote_count: { good: number; bad: number };
}

export interface DbTradeUp {
  id: string;
  name: string;
  cost: number;
  expected_value: number;
  profit: number;
  profit_percentage: number;
  inputs: TradeUpInput[];
  outputs: TradeUpOutput[];
  avg_input_float: number;
  created_at: string;
}

export interface DbVote {
  id: string;
  tradeup_id: string;
  user_id: string;
  vote_type: VoteType;
  created_at: string;
}

export interface DbPriceHistory {
  id: string;
  skin_name: string;
  market_hash_name: string;
  price: number;
  float_value?: number;
  timestamp: string;
  source: string;
}

export interface DbSniperAlert {
  id: string;
  skin_data: Skin;
  market_price: number;
  listing_price: number;
  discount_percentage: number;
  float_value: number;
  detected_at: string;
  is_active: boolean;
}
