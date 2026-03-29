import type { Skin, TradeUpContract } from '@/types';

export const SAMPLE_SKINS: Skin[] = [
  { name: 'Redline',        weapon: 'AK-47',   collection: 'Phoenix', rarity: 'Mil-Spec',  exterior: 'Field-Tested', float: 0.25, price: 8.50,   market_hash_name: 'AK-47 | Redline (Field-Tested)' },
  { name: 'Water Elemental',weapon: 'Glock-18', collection: 'Phoenix', rarity: 'Mil-Spec',  exterior: 'Field-Tested', float: 0.22, price: 4.20,   market_hash_name: 'Glock-18 | Water Elemental (Field-Tested)' },
  { name: 'Bullet Rain',    weapon: 'M4A1-S',  collection: 'Phoenix', rarity: 'Mil-Spec',  exterior: 'Field-Tested', float: 0.28, price: 6.75,   market_hash_name: 'M4A1-S | Bullet Rain (Field-Tested)' },
  { name: 'Antique',        weapon: 'USP-S',   collection: 'Chroma',  rarity: 'Mil-Spec',  exterior: 'Factory New',  float: 0.03, price: 3.50,   market_hash_name: 'USP-S | Antique (Factory New)' },
  { name: 'Dragon Tattoo',  weapon: 'Glock-18', collection: 'Chroma', rarity: 'Mil-Spec',  exterior: 'Factory New',  float: 0.01, price: 2.80,   market_hash_name: 'Glock-18 | Dragon Tattoo (Factory New)' },
  { name: 'Asiimov',        weapon: 'AWP',      collection: 'Phoenix', rarity: 'Restricted',exterior: 'Field-Tested', float: 0.30, price: 75.00,  market_hash_name: 'AWP | Asiimov (Field-Tested)' },
  { name: 'Desolate Space', weapon: 'M4A4',     collection: 'Phoenix', rarity: 'Restricted',exterior: 'Field-Tested', float: 0.24, price: 45.00,  market_hash_name: 'M4A4 | Desolate Space (Field-Tested)' },
  { name: 'Fuel Injector',  weapon: 'AK-47',   collection: 'Gamma',   rarity: 'Restricted',exterior: 'Field-Tested', float: 0.26, price: 52.00,  market_hash_name: 'AK-47 | Fuel Injector (Field-Tested)' },
  { name: 'Neo-Noir',       weapon: 'AWP',      collection: 'Gamma',   rarity: 'Restricted',exterior: 'Field-Tested', float: 0.23, price: 68.00,  market_hash_name: 'AWP | Neo-Noir (Field-Tested)' },
  { name: 'Kill Confirmed', weapon: 'USP-S',   collection: 'Gamma',   rarity: 'Classified',exterior: 'Field-Tested', float: 0.22, price: 125.00, market_hash_name: 'USP-S | Kill Confirmed (Field-Tested)' },
  { name: 'Hyper Beast',    weapon: 'M4A1-S',  collection: 'Chroma',  rarity: 'Classified',exterior: 'Factory New',  float: 0.04, price: 180.00, market_hash_name: 'M4A1-S | Hyper Beast (Factory New)' },
  { name: 'Neon Rider',     weapon: 'AK-47',   collection: 'Chroma',  rarity: 'Classified',exterior: 'Field-Tested', float: 0.27, price: 95.00,  market_hash_name: 'AK-47 | Neon Rider (Field-Tested)' },
  { name: 'Fire Serpent',   weapon: 'AK-47',   collection: 'Phoenix', rarity: 'Covert',    exterior: 'Field-Tested', float: 0.25, price: 850.00, market_hash_name: 'AK-47 | Fire Serpent (Field-Tested)' },
  { name: 'Dragon Lore',    weapon: 'AWP',      collection: 'Chroma',  rarity: 'Covert',    exterior: 'Field-Tested', float: 0.28, price: 4500.00,market_hash_name: 'AWP | Dragon Lore (Field-Tested)' },
  { name: 'Howl',           weapon: 'M4A4',     collection: 'Phoenix', rarity: 'Covert',    exterior: 'Field-Tested', float: 0.24, price: 3200.00,market_hash_name: 'M4A4 | Howl (Field-Tested)' },
];

export function generateSampleTradeUps(): TradeUpContract[] {
  return [
    {
      id: 'tu_sample_1',
      name: 'Phoenix Collection Low-Risk',
      inputs: Array(10).fill(null).map((_, i) => ({ ...SAMPLE_SKINS[0], quantity: 1, float: 0.25 + i * 0.01, price: 8.50 + Math.random() * 0.50 })),
      outputs: [
        { ...SAMPLE_SKINS[5], probability: 0.70, expected_value: 75.00 * 0.70 },
        { ...SAMPLE_SKINS[6], probability: 0.30, expected_value: 45.00 * 0.30 },
      ],
      total_cost: 85.00, expected_value: 66.00, profit: -19.00, profit_percentage: -22.35,
      avg_input_float: 0.295, output_float_range: { min: 0.06, max: 0.80 },
      created_at: new Date().toISOString(), votes: { good: 12, bad: 5 },
    },
    {
      id: 'tu_sample_2',
      name: 'Chroma Collection High Profit',
      inputs: Array(10).fill(null).map((_, i) => ({ ...SAMPLE_SKINS[3], quantity: 1, float: 0.02 + i * 0.005, price: 3.50 + Math.random() * 0.30 })),
      outputs: [
        { ...SAMPLE_SKINS[10], probability: 0.60, expected_value: 180.00 * 0.60 },
        { ...SAMPLE_SKINS[11], probability: 0.40, expected_value: 95.00 * 0.40 },
      ],
      total_cost: 36.00, expected_value: 146.00, profit: 110.00, profit_percentage: 305.56,
      avg_input_float: 0.0425, output_float_range: { min: 0.00, max: 1.00 },
      created_at: new Date().toISOString(), votes: { good: 45, bad: 2 },
    },
    {
      id: 'tu_sample_3',
      name: 'Gamma Collection Medium Risk',
      inputs: [
        ...Array(5).fill(null).map(() => ({ ...SAMPLE_SKINS[7], quantity: 1 })),
        ...Array(5).fill(null).map(() => ({ ...SAMPLE_SKINS[8], quantity: 1 })),
      ],
      outputs: [
        { ...SAMPLE_SKINS[9], probability: 0.50, expected_value: 125.00 * 0.50 },
        { weapon: 'Desert Eagle', name: 'Code Red', collection: 'Gamma', rarity: 'Classified', exterior: 'Field-Tested', float: 0.24, price: 85.00, market_hash_name: 'Desert Eagle | Code Red (Field-Tested)', probability: 0.50, expected_value: 42.50 },
      ],
      total_cost: 600.00, expected_value: 105.00, profit: -495.00, profit_percentage: -82.50,
      avg_input_float: 0.245, output_float_range: { min: 0.00, max: 1.00 },
      created_at: new Date().toISOString(), votes: { good: 3, bad: 28 },
    },
  ];
}

export const CS2_COLLECTIONS = ['Phoenix','Chroma','Gamma','Spectrum','Clutch','Horizon','Danger Zone','Prisma','Shattered Web','Fracture','Operation Riptide','Recoil','Revolution'];

export const RARITY_COLORS: Record<string, string> = {
  Consumer:   '#B0C3D9',
  Industrial: '#5E98D9',
  'Mil-Spec': '#4B69FF',
  Restricted: '#8847FF',
  Classified: '#D32CE6',
  Covert:     '#EB4B4B',
};

export function getRandomSkin(): Skin { return SAMPLE_SKINS[Math.floor(Math.random() * SAMPLE_SKINS.length)]; }
export function getSkinsByRarity(rarity: string): Skin[] { return SAMPLE_SKINS.filter(s => s.rarity === rarity); }
export function getSkinsByCollection(collection: string): Skin[] { return SAMPLE_SKINS.filter(s => s.collection === collection); }

// Sample sniper alerts for testing
export const SAMPLE_SNIPER_ALERTS = [
  {
    id: 'sniper_1',
    skin: SAMPLE_SKINS[10], // M4A1-S Hyper Beast
    market_price: 180.00,
    listing_price: 142.00,
    discount_percentage: 21.1,
    float_value: 0.04,
    detected_at: new Date().toISOString(),
    is_active: true,
  },
  {
    id: 'sniper_2',
    skin: SAMPLE_SKINS[5], // AWP Asiimov
    market_price: 75.00,
    listing_price: 58.50,
    discount_percentage: 22.0,
    float_value: 0.30,
    detected_at: new Date().toISOString(),
    is_active: true,
  },
  {
    id: 'sniper_3',
    skin: SAMPLE_SKINS[9], // USP-S Kill Confirmed
    market_price: 125.00,
    listing_price: 99.99,
    discount_percentage: 20.0,
    float_value: 0.22,
    detected_at: new Date().toISOString(),
    is_active: true,
  },
];
