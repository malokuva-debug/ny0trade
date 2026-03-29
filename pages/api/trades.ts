import type { NextApiRequest, NextApiResponse } from 'next';
import type { TradeUpsApiResponse, TradeUpFilters } from '@/types';
import { generateSampleTradeUps } from '@/lib/sampleData';
import { supabaseHelpers } from '@/lib/supabaseClient';

export default async function handler(req: NextApiRequest, res: NextApiResponse<TradeUpsApiResponse>) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed', total_count: 0, filtered_count: 0 });
  }

  try {
    const { min_budget, max_budget, min_ev, min_profit_percentage, max_float, limit = '20' } = req.query;

    const filters: TradeUpFilters = {
      min_budget: min_budget ? parseFloat(min_budget as string) : undefined,
      max_budget: max_budget ? parseFloat(max_budget as string) : undefined,
      min_ev: min_ev ? parseFloat(min_ev as string) : undefined,
      min_profit_percentage: min_profit_percentage ? parseFloat(min_profit_percentage as string) : undefined,
      max_float: max_float ? parseFloat(max_float as string) : undefined,
    };

    const maxResults = parseInt(limit as string, 10);

    let tradeUps: any[];
    try {
      tradeUps = await supabaseHelpers.getTradeUps(maxResults, filters) ?? [];
      if (tradeUps.length === 0) tradeUps = generateSampleTradeUps();
    } catch {
      tradeUps = generateSampleTradeUps();
    }

    let filtered = tradeUps;
    if (filters.max_float) filtered = filtered.filter(t => t.avg_input_float <= filters.max_float!);
    if (filters.min_ev)    filtered = filtered.filter(t => t.expected_value >= filters.min_ev!);

    const withVotes = await Promise.all(
      filtered.map(async trade => {
        try { return { ...trade, votes: await supabaseHelpers.getVoteCounts(trade.id) }; }
        catch { return { ...trade, votes: { good: 0, bad: 0 } }; }
      })
    );

    res.status(200).json({ success: true, data: withVotes.slice(0, maxResults), total_count: tradeUps.length, filtered_count: withVotes.length });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Internal server error', message: error instanceof Error ? error.message : 'Unknown error', total_count: 0, filtered_count: 0 });
  }
}
