/**
 * Sniper System Library
 * Scans CSFloat listings for underpriced skins and generates alerts
 */

import type { SniperAlert, Skin } from '@/types';
import { fetchCSFloatListings, getCSFloatPriceData } from './csfloat';
import { supabaseHelpers } from './supabaseClient';
import { SAMPLE_SNIPER_ALERTS } from './sampleData';

// ─── Config ──────────────────────────────────────────────────────────────────

export interface SniperConfig {
  /** Minimum discount vs average price to flag as underpriced (0–1). Default 0.15 = 15% */
  discountThreshold: number;
  /** Only flag listings at or below this float value. Default 0.15 */
  maxFloat: number;
  /** Minimum listing price in USD to consider. Default 1 */
  minPrice: number;
  /** Maximum listing price in USD to consider. Default 1000 */
  maxPrice: number;
}

export const DEFAULT_CONFIG: SniperConfig = {
  discountThreshold: 0.15,
  maxFloat: 0.15,
  minPrice: 1,
  maxPrice: 1000,
};

// ─── Popular skins to scan ───────────────────────────────────────────────────

/** Market hash names of commonly traded CS2 skins used for the sniper scan */
const POPULAR_SKINS_TO_SCAN = [
  'AK-47 | Redline (Field-Tested)',
  'AK-47 | Asiimov (Field-Tested)',
  'AWP | Asiimov (Field-Tested)',
  'AWP | Neo-Noir (Field-Tested)',
  'M4A4 | Desolate Space (Field-Tested)',
  'M4A1-S | Hyper Beast (Factory New)',
  'M4A1-S | Hyper Beast (Field-Tested)',
  'USP-S | Kill Confirmed (Field-Tested)',
  'USP-S | Antique (Factory New)',
  'Glock-18 | Water Elemental (Field-Tested)',
  'Glock-18 | Dragon Tattoo (Factory New)',
  'AK-47 | Fuel Injector (Field-Tested)',
  'AK-47 | Neon Rider (Field-Tested)',
  'Desert Eagle | Blaze (Factory New)',
  'Desert Eagle | Code Red (Field-Tested)',
];

// ─── Core functions ──────────────────────────────────────────────────────────

/**
 * Scan a single skin for underpriced listings.
 * Returns SniperAlert objects for any listings below the configured threshold.
 */
export async function scanSkinForDeals(
  marketHashName: string,
  config: SniperConfig = DEFAULT_CONFIG
): Promise<SniperAlert[]> {
  const alerts: SniperAlert[] = [];

  try {
    // Get average price reference
    const priceData = await getCSFloatPriceData(marketHashName);
    if (!priceData || priceData.avg_price < config.minPrice) return alerts;

    // Fetch current listings (cheapest first)
    const listings = await fetchCSFloatListings(marketHashName, 50);
    const thresholdPrice = priceData.avg_price * (1 - config.discountThreshold);

    for (const listing of listings) {
      const listingPrice = listing.price;
      const floatValue = listing.item?.float_value ?? listing.item?.paint_wear ?? 1;

      // Apply all filters
      if (listingPrice > thresholdPrice) continue;
      if (listingPrice < config.minPrice) continue;
      if (listingPrice > config.maxPrice) continue;
      if (floatValue > config.maxFloat) continue;

      const discountPct = ((priceData.avg_price - listingPrice) / priceData.avg_price) * 100;

      const skin: Skin = {
        name: listing.item.item_name || marketHashName.split(' | ')[1] || marketHashName,
        weapon: marketHashName.split(' | ')[0] || 'Unknown',
        collection: 'Unknown',
        rarity: (listing.item.rarity as any) || 'Mil-Spec',
        exterior: 'Field-Tested',
        float: floatValue,
        price: priceData.avg_price,
        market_hash_name: marketHashName,
      };

      alerts.push({
        id: `sniper_${listing.id}`,
        skin,
        market_price: priceData.avg_price,
        listing_price: listingPrice,
        discount_percentage: parseFloat(discountPct.toFixed(2)),
        float_value: floatValue,
        detected_at: new Date().toISOString(),
        is_active: true,
      });
    }
  } catch (err) {
    console.error(`scanSkinForDeals failed for "${marketHashName}":`, err);
  }

  return alerts;
}

/**
 * Scan all popular skins and return combined underpriced alerts.
 * Falls back to sample data when the CSFloat API key is missing.
 */
export async function scanPopularSkinsForDeals(config: SniperConfig = DEFAULT_CONFIG): Promise<SniperAlert[]> {
  // If no API key, return demo data so the UI is still useful
  if (!process.env.CSFLOAT_API_KEY) {
    console.warn('CSFLOAT_API_KEY not set — returning sample sniper alerts');
    return SAMPLE_SNIPER_ALERTS as SniperAlert[];
  }

  const allAlerts: SniperAlert[] = [];

  // Scan each skin sequentially (rate-limit friendly)
  for (const marketHashName of POPULAR_SKINS_TO_SCAN) {
    const alerts = await scanSkinForDeals(marketHashName, config);
    allAlerts.push(...alerts);

    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  // Sort by discount — best deals first
  return allAlerts.sort((a, b) => b.discount_percentage - a.discount_percentage);
}

/**
 * Retrieve currently active sniper alerts from Supabase.
 * Falls back to sample data if the DB is unavailable.
 */
export async function getActiveSniperAlerts(): Promise<SniperAlert[]> {
  try {
    const rows = await supabaseHelpers.getSniperAlerts(true);

    return rows.map((row: any) => ({
      id: row.id,
      skin: row.skin_data as Skin,
      market_price: row.market_price,
      listing_price: row.listing_price,
      discount_percentage: row.discount_percentage,
      float_value: row.float_value,
      detected_at: row.detected_at,
      is_active: row.is_active,
    }));
  } catch (err) {
    console.warn('getActiveSniperAlerts DB error, returning sample data:', err);
    return SAMPLE_SNIPER_ALERTS as SniperAlert[];
  }
}

/**
 * Persist a sniper alert to Supabase.
 */
export async function saveSniperAlert(alert: SniperAlert): Promise<void> {
  await supabaseHelpers.createSniperAlert({
    id: alert.id,
    skin_data: alert.skin,
    market_price: alert.market_price,
    listing_price: alert.listing_price,
    discount_percentage: alert.discount_percentage,
    float_value: alert.float_value,
    detected_at: alert.detected_at,
    is_active: alert.is_active,
  });
}

/**
 * Deactivate a sniper alert (e.g. after a user purchases the listing).
 */
export async function deactivateSniperAlert(alertId: string): Promise<void> {
  await supabaseHelpers.deactivateSniperAlert(alertId);
}

/**
 * Calculate sniper score — a simple 0-100 quality rating for an alert.
 * Combines discount depth and float quality.
 */
export function calculateSniperScore(alert: SniperAlert): number {
  // Discount score: 15% = 50 pts, 30% = 100 pts (capped)
  const discountScore = Math.min((alert.discount_percentage / 30) * 100, 100);
  // Float score: lower float = better score
  const floatScore = Math.max(0, (1 - alert.float_value / 0.15) * 100);
  return parseFloat(((discountScore * 0.7 + floatScore * 0.3)).toFixed(1));
}
