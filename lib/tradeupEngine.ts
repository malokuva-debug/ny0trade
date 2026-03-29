import type { Skin, TradeUpInput, TradeUpOutput, TradeUpContract, Rarity } from '@/types';
import { getFloatRange } from './csfloat';

const RARITY_PROGRESSION: Record<Rarity, Rarity | null> = {
  Consumer:   'Industrial',
  Industrial: 'Mil-Spec',
  'Mil-Spec': 'Restricted',
  Restricted: 'Classified',
  Classified: 'Covert',
  Covert:     null,
};

function generateTradeUpId(): string {
  return `tu_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function calculateExpectedValue(outputs: TradeUpOutput[]): number {
  return outputs.reduce((total, output) => total + output.price * output.probability, 0);
}

export function calculateProfit(totalCost: number, expectedValue: number) {
  const profit = expectedValue - totalCost;
  return { profit, profitPercentage: (profit / totalCost) * 100 };
}

export function getPossibleOutputs(inputs: TradeUpInput[]): { collection: string; rarity: Rarity }[] {
  if (inputs.length === 0) return [];
  const outputRarity = RARITY_PROGRESSION[inputs[0].rarity];
  if (!outputRarity) throw new Error('Cannot trade up from Covert rarity');
  return [...new Set(inputs.map(i => i.collection))].map(collection => ({ collection, rarity: outputRarity }));
}

export function calculateOutputProbabilities(inputs: TradeUpInput[], outputs: Skin[]): TradeUpOutput[] {
  const collectionCounts = new Map<string, number>();
  inputs.forEach(input => collectionCounts.set(input.collection, (collectionCounts.get(input.collection) || 0) + 1));
  const totalInputs = inputs.length;

  return outputs.map(output => {
    const probability = (collectionCounts.get(output.collection) || 0) / totalInputs;
    return { ...output, probability, expected_value: output.price * probability };
  });
}

export async function createTradeUpContract(inputs: TradeUpInput[], outputs: Skin[], name?: string): Promise<TradeUpContract> {
  if (inputs.length !== 10) throw new Error('Trade-up requires exactly 10 input skins');

  const totalCost = inputs.reduce((sum, i) => sum + i.price, 0);
  const avgInputFloat = inputs.reduce((sum, i) => sum + i.float, 0) / inputs.length;
  const outputsWithProb = calculateOutputProbabilities(inputs, outputs);
  const expectedValue = calculateExpectedValue(outputsWithProb);
  const { profit, profitPercentage } = calculateProfit(totalCost, expectedValue);
  const floatRange = outputs[0]?.rarity ? getFloatRange(outputs[0].rarity) : { min: 0.06, max: 0.80 };

  return {
    id: generateTradeUpId(),
    name: name || `Trade-Up ${inputs[0].collection}`,
    inputs,
    outputs: outputsWithProb,
    total_cost: totalCost,
    expected_value: expectedValue,
    profit,
    profit_percentage: profitPercentage,
    avg_input_float: avgInputFloat,
    output_float_range: floatRange,
    created_at: new Date().toISOString(),
  };
}

export async function generateTradeUpContracts(skinPool: Skin[], maxContracts = 20): Promise<TradeUpContract[]> {
  const contracts: TradeUpContract[] = [];
  const skinsByRarity = new Map<Rarity, Skin[]>();
  skinPool.forEach(skin => {
    const skins = skinsByRarity.get(skin.rarity) || [];
    skins.push(skin);
    skinsByRarity.set(skin.rarity, skins);
  });

  for (const [rarity, skins] of skinsByRarity.entries()) {
    if (rarity === 'Covert') continue;
    const skinsByCollection = new Map<string, Skin[]>();
    skins.forEach(skin => {
      const cs = skinsByCollection.get(skin.collection) || [];
      cs.push(skin);
      skinsByCollection.set(skin.collection, cs);
    });

    for (const [collection, collectionSkins] of skinsByCollection.entries()) {
      if (collectionSkins.length < 10) continue;
      const sorted = [...collectionSkins].sort((a, b) => a.price - b.price);
      const inputs: TradeUpInput[] = sorted.slice(0, 10).map(skin => ({ ...skin, quantity: 1 }));
      const outputRarity = RARITY_PROGRESSION[rarity];
      if (!outputRarity) continue;

      try {
        const mockOutputs: Skin[] = [
          { name: 'Output Skin 1', weapon: 'AK-47', collection, rarity: outputRarity, exterior: 'Factory New', float: 0.01, price: inputs[0].price * 15, market_hash_name: `AK-47 | Mock Skin (${collection})` },
          { name: 'Output Skin 2', weapon: 'M4A4',  collection, rarity: outputRarity, exterior: 'Factory New', float: 0.01, price: inputs[0].price * 8,  market_hash_name: `M4A4 | Mock Skin (${collection})` },
        ];
        const contract = await createTradeUpContract(inputs, mockOutputs, `${collection} Trade-Up`);
        if (contract.profit > 0) contracts.push(contract);
        if (contracts.length >= maxContracts) break;
      } catch (error) {
        console.error(`Error creating contract for ${collection}:`, error);
      }
    }
    if (contracts.length >= maxContracts) break;
  }

  return contracts.sort((a, b) => b.profit_percentage - a.profit_percentage);
}

export function validateTradeUpContract(contract: TradeUpContract): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  if (contract.inputs.length !== 10) errors.push('Trade-up must have exactly 10 input skins');
  const rarities = [...new Set(contract.inputs.map(i => i.rarity))];
  if (rarities.length > 1) errors.push('All input skins must be the same rarity');
  const expectedOutputRarity = contract.inputs[0]?.rarity ? RARITY_PROGRESSION[contract.inputs[0].rarity] : null;
  if (!expectedOutputRarity) {
    errors.push('Cannot trade up from this rarity level');
  } else if (contract.outputs.some(o => o.rarity !== expectedOutputRarity)) {
    errors.push('Output rarities do not match expected trade-up result');
  }
  const totalProb = contract.outputs.reduce((s, o) => s + o.probability, 0);
  if (Math.abs(totalProb - 1) > 0.01) errors.push(`Output probabilities must sum to 1 (currently ${totalProb})`);
  return { valid: errors.length === 0, errors };
}

export function simulateTradeUpOutcome(contract: TradeUpContract): TradeUpOutput {
  const random = Math.random();
  let cumulative = 0;
  for (const output of contract.outputs) {
    cumulative += output.probability;
    if (random <= cumulative) return output;
  }
  return contract.outputs[contract.outputs.length - 1];
}

export function getTradeUpStatistics(contracts: TradeUpContract[]) {
  if (contracts.length === 0) return { total_contracts: 0, avg_profit: 0, avg_profit_percentage: 0, best_contract: null, worst_contract: null, total_potential_profit: 0 };
  const totalProfit = contracts.reduce((s, c) => s + c.profit, 0);
  const sorted = [...contracts].sort((a, b) => b.profit - a.profit);
  return {
    total_contracts: contracts.length,
    avg_profit: totalProfit / contracts.length,
    avg_profit_percentage: contracts.reduce((s, c) => s + c.profit_percentage, 0) / contracts.length,
    best_contract: sorted[0],
    worst_contract: sorted[sorted.length - 1],
    total_potential_profit: totalProfit,
  };
}
