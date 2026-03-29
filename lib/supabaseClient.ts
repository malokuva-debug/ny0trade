import { createClient } from '@supabase/supabase-js';

// Environment variables
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.warn('Supabase credentials not found. Database features will be disabled.');
}

// Create Supabase client with service role key for backend operations
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

export const supabaseHelpers = {
  async getTradeUps(limit = 50, filters?: any) {
    let query = supabase
      .from('tradeups')
      .select('*')
      .order('profit_percentage', { ascending: false })
      .limit(limit);

    if (filters?.min_budget) query = query.gte('cost', filters.min_budget);
    if (filters?.max_budget) query = query.lte('cost', filters.max_budget);
    if (filters?.min_profit_percentage) query = query.gte('profit_percentage', filters.min_profit_percentage);

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  async createTradeUp(tradeup: any) {
    const { data, error } = await supabase.from('tradeups').insert([tradeup]).select().single();
    if (error) throw error;
    return data;
  },

  async getTradeUpById(id: string) {
    const { data, error } = await supabase.from('tradeups').select('*').eq('id', id).single();
    if (error) throw error;
    return data;
  },

  async getVotesByTradeUpId(tradeupId: string) {
    const { data, error } = await supabase.from('votes').select('*').eq('tradeup_id', tradeupId);
    if (error) throw error;
    return data;
  },

  async createVote(vote: { tradeup_id: string; user_id: string; vote_type: 'good' | 'bad' }) {
    const { data, error } = await supabase.from('votes').insert([vote]).select().single();
    if (error) throw error;
    return data;
  },

  async getVoteCounts(tradeupId: string) {
    const votes = await this.getVotesByTradeUpId(tradeupId);
    return {
      good: votes.filter((v: any) => v.vote_type === 'good').length,
      bad: votes.filter((v: any) => v.vote_type === 'bad').length,
    };
  },

  async savePriceHistory(priceData: any) {
    const { data, error } = await supabase.from('price_history').insert([priceData]).select().single();
    if (error) throw error;
    return data;
  },

  async getRecentPrices(skinName: string, hours = 24) {
    const cutoffTime = new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();
    const { data, error } = await supabase
      .from('price_history')
      .select('*')
      .eq('skin_name', skinName)
      .gte('timestamp', cutoffTime)
      .order('timestamp', { ascending: false });
    if (error) throw error;
    return data;
  },

  async getSniperAlerts(onlyActive = true) {
    let query = supabase.from('sniper_alerts').select('*').order('discount_percentage', { ascending: false });
    if (onlyActive) query = query.eq('is_active', true);
    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  async createSniperAlert(alert: any) {
    const { data, error } = await supabase.from('sniper_alerts').insert([alert]).select().single();
    if (error) throw error;
    return data;
  },

  async deactivateSniperAlert(id: string) {
    const { data, error } = await supabase
      .from('sniper_alerts').update({ is_active: false }).eq('id', id).select().single();
    if (error) throw error;
    return data;
  },

  async cleanupOldPriceHistory(daysToKeep = 30) {
    const cutoffDate = new Date(Date.now() - daysToKeep * 24 * 60 * 60 * 1000).toISOString();
    const { error } = await supabase.from('price_history').delete().lt('timestamp', cutoffDate);
    if (error) throw error;
  },
};

export default supabase;
