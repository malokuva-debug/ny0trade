import type { NextApiRequest, NextApiResponse } from 'next';
import type { SniperAlertsApiResponse, SniperAlert } from '@/types';
import { scanPopularSkinsForDeals, getActiveSniperAlerts, saveSniperAlert, type SniperConfig } from '@/lib/sniper';

export default async function handler(req: NextApiRequest, res: NextApiResponse<SniperAlertsApiResponse>) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed', active_count: 0 });
  }

  try {
    const { scan = 'false', discount = '15', max_float = '0.15', min_price = '1', max_price = '1000' } = req.query;
    const shouldScan = scan === 'true';

    const config: SniperConfig = {
      discountThreshold: parseFloat(discount as string) / 100,
      maxFloat: parseFloat(max_float as string),
      minPrice: parseFloat(min_price as string),
      maxPrice: parseFloat(max_price as string),
    };

    let alerts: SniperAlert[] = [];

    if (shouldScan) {
      alerts = await scanPopularSkinsForDeals(config);
      for (const alert of alerts) {
        try { await saveSniperAlert(alert); } catch (e) { console.error('Error saving alert:', e); }
      }
    } else {
      alerts = await getActiveSniperAlerts();
      alerts = alerts.filter(a =>
        a.discount_percentage >= parseFloat(discount as string) &&
        a.float_value <= parseFloat(max_float as string) &&
        a.listing_price >= parseFloat(min_price as string) &&
        a.listing_price <= parseFloat(max_price as string)
      );
    }

    res.status(200).json({ success: true, data: alerts, active_count: alerts.length, message: shouldScan ? `Scan complete. Found ${alerts.length} underpriced items.` : `Retrieved ${alerts.length} active alerts.` });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Internal server error', message: error instanceof Error ? error.message : 'Unknown error', active_count: 0 });
  }
}
