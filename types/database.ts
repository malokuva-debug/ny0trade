// Supabase Database Type Definitions
// Auto-generate this from your Supabase dashboard via: supabase gen types typescript

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      tradeups: {
        Row: {
          id: string;
          name: string;
          cost: number;
          expected_value: number;
          profit: number;
          profit_percentage: number;
          avg_input_float: number;
          inputs: Json;
          outputs: Json;
          created_at: string;
        };
        Insert: {
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
        };
        Update: Partial<Database['public']['Tables']['tradeups']['Insert']>;
      };
      votes: {
        Row: {
          id: string;
          tradeup_id: string;
          user_id: string;
          vote_type: 'good' | 'bad';
          created_at: string;
        };
        Insert: {
          id?: string;
          tradeup_id: string;
          user_id: string;
          vote_type: 'good' | 'bad';
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['votes']['Insert']>;
      };
      price_history: {
        Row: {
          id: string;
          skin_name: string;
          market_hash_name: string;
          price: number;
          float_value: number | null;
          timestamp: string;
          source: string;
        };
        Insert: {
          id?: string;
          skin_name: string;
          market_hash_name: string;
          price: number;
          float_value?: number | null;
          timestamp?: string;
          source: string;
        };
        Update: Partial<Database['public']['Tables']['price_history']['Insert']>;
      };
      sniper_alerts: {
        Row: {
          id: string;
          skin_data: Json;
          market_price: number;
          listing_price: number;
          discount_percentage: number;
          float_value: number;
          detected_at: string;
          is_active: boolean;
        };
        Insert: {
          id?: string;
          skin_data: Json;
          market_price: number;
          listing_price: number;
          discount_percentage: number;
          float_value: number;
          detected_at?: string;
          is_active?: boolean;
        };
        Update: Partial<Database['public']['Tables']['sniper_alerts']['Insert']>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      vote_type: 'good' | 'bad';
    };
  };
}
