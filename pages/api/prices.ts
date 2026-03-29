import type { NextApiRequest, NextApiResponse } from 'next';
import type { ApiResponse, CSFloatPriceData } from '@/types';
import { getCSFloatPriceData, batchGetPrices } from '@/lib/csfloat';
import { supabaseHelpers } from '@/lib/supabaseClient';

interface PricesApiResponse extends ApiResponse<CSFloatPriceData | Record<string, number>> {
  cached?: boolean;
  updated_at?: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<PricesApiResponse>) {
  if (req.method !== 'GET') return res.status(405).json({ success: false, error: 'Method not allowed' });

  try {
    const { skin, skins, cache = 'true' } = req.query;
    const shouldCache = cache === 'true';

    if (skin && typeof skin === 'string') {
      const priceData = await getCSFloatPriceData(skin);
      if (!priceData) return res.status(404).json({ success: false, error: 'Price data not found', message: `No listings for: ${skin}` });

      if (shouldCache) {
        try { await supabaseHelpers.savePriceHistory({ skin_name: skin.split(' | ')[1] || skin, market_hash_name: skin, price: priceData.avg_price, timestamp: new Date().toISOString(), source: 'csfloat' }); }
        catch (e) { console.error('Error caching price:', e); }
      }

      return res.status(200).json({ success: true, data: priceData, cached: shouldCache, updated_at: priceData.updated_at });
    }

    if (skins && typeof skins === 'string') {
      const skinList = skins.split(',').map(s => s.trim()).filter(Boolean);
      if (!skinList.length) return res.status(400).json({ success: false, error: 'Invalid skins parameter' });

      const priceMap = await batchGetPrices(skinList);

      if (shouldCache) {
        const ts = new Date().toISOString();
        for (const [name, price] of priceMap.entries()) {
          try { await supabaseHelpers.savePriceHistory({ skin_name: name.split(' | ')[1] || name, market_hash_name: name, price, timestamp: ts, source: 'csfloat' }); }
          catch (e) { console.error(`Error caching ${name}:`, e); }
        }
      }

      return res.status(200).json({ success: true, data: Object.fromEntries(priceMap), cached: shouldCache, updated_at: new Date().toISOString(), message: `Retrieved prices for ${priceMap.size} skins` });
    }

    return res.status(400).json({ success: false, error: 'Provide "skin" or "skins" query param' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Internal server error', message: error instanceof Error ? error.message : 'Unknown error' });
  }
}
