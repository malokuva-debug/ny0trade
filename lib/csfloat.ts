import type { CSFloatListing, CSFloatPriceData } from '@/types';

const CSFLOAT_API_BASE = 'https://csfloat.com/api/v1';
const API_KEY = process.env.CSFLOAT_API_KEY || '';

// In-memory cache (5 min TTL)
const priceCache = new Map<string, { data: CSFloatPriceData; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000;

function getHeaders(): HeadersInit {
  return {
    'Content-Type': 'application/json',
    ...(API_KEY && { Authorization: API_KEY }),
  };
}

export async function fetchCSFloatListings(marketHashName: string, limit = 20): Promise<CSFloatListing[]> {
  try {
    const params = new URLSearchParams({
      market_hash_name: marketHashName,
      limit: limit.toString(),
      sort_by: 'price',
      order: 'asc',
    });
    const response = await fetch(`${CSFLOAT_API_BASE}/listings?${params}`, { headers: getHeaders() });
    if (!response.ok) throw new Error(`CSFloat API error: ${response.status}`);
    const data = await response.json();
    return data.listings || [];
  } catch (error) {
    console.error('Error fetching CSFloat listings:', error);
    return [];
  }
}

export async function getCSFloatPriceData(marketHashName: string): Promise<CSFloatPriceData | null> {
  const cached = priceCache.get(marketHashName);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) return cached.data;

  try {
    const listings = await fetchCSFloatListings(marketHashName, 50);
    if (listings.length === 0) return null;

    const prices = listings.map(l => l.price);
    const priceData: CSFloatPriceData = {
      market_hash_name: marketHashName,
      avg_price: prices.reduce((a, b) => a + b, 0) / prices.length,
      min_price: Math.min(...prices),
      max_price: Math.max(...prices),
      listings_count: listings.length,
      updated_at: new Date().toISOString(),
    };

    priceCache.set(marketHashName, { data: priceData, timestamp: Date.now() });
    return priceData;
  } catch (error) {
    console.error(`Error getting price data for ${marketHashName}:`, error);
    return null;
  }
}

export async function getCurrentPrice(marketHashName: string): Promise<number> {
  const priceData = await getCSFloatPriceData(marketHashName);
  return priceData?.avg_price || 0;
}

export async function batchGetPrices(marketHashNames: string[]): Promise<Map<string, number>> {
  const priceMap = new Map<string, number>();
  const chunkSize = 5;

  for (let i = 0; i < marketHashNames.length; i += chunkSize) {
    const chunk = marketHashNames.slice(i, i + chunkSize);
    const results = await Promise.all(chunk.map(async name => ({ name, price: await getCurrentPrice(name) })));
    results.forEach(({ name, price }) => priceMap.set(name, price));
    if (i + chunkSize < marketHashNames.length) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  return priceMap;
}

export async function findUnderpricedListings(marketHashName: string, discountThreshold = 0.15): Promise<CSFloatListing[]> {
  try {
    const priceData = await getCSFloatPriceData(marketHashName);
    if (!priceData) return [];
    const listings = await fetchCSFloatListings(marketHashName, 100);
    const targetPrice = priceData.avg_price * (1 - discountThreshold);
    return listings.filter(listing => listing.price <= targetPrice);
  } catch (error) {
    console.error('Error finding underpriced listings:', error);
    return [];
  }
}

export function getFloatRange(rarity: string): { min: number; max: number } {
  const floatRanges: Record<string, { min: number; max: number }> = {
    Consumer:   { min: 0.06, max: 0.80 },
    Industrial: { min: 0.06, max: 0.80 },
    'Mil-Spec': { min: 0.06, max: 0.80 },
    Restricted: { min: 0.06, max: 0.80 },
    Classified: { min: 0.00, max: 1.00 },
    Covert:     { min: 0.00, max: 1.00 },
  };
  return floatRanges[rarity] || { min: 0.06, max: 0.80 };
}

export function calculateOutputFloat(inputFloats: number[], outputMinFloat: number, outputMaxFloat: number): number {
  const avgInputFloat = inputFloats.reduce((a, b) => a + b, 0) / inputFloats.length;
  return outputMinFloat + (outputMaxFloat - outputMinFloat) * avgInputFloat;
}

export function clearPriceCache(): void {
  priceCache.clear();
}

export function getCacheStats(): { size: number; entries: string[] } {
  return { size: priceCache.size, entries: Array.from(priceCache.keys()) };
}
