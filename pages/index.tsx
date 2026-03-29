'use client';
import { useState, useEffect, useCallback } from 'react';
import type { TradeUpContract, SniperAlert, TradeUpFilters } from '@/types';
import { RARITY_COLORS } from '@/lib/sampleData';

// ─── Helper components ────────────────────────────────────────────────────────

function StatBadge({ label, value, positive }: { label: string; value: string; positive?: boolean | null }) {
  const color =
    positive === true  ? 'text-green-400' :
    positive === false ? 'text-red-400'   : 'text-slate-200';
  return (
    <div className="flex flex-col items-center bg-slate-800/60 rounded-lg px-3 py-2 min-w-[80px]">
      <span className="text-xs text-slate-400 uppercase tracking-wider">{label}</span>
      <span className={`text-sm font-bold mt-0.5 ${color}`}>{value}</span>
    </div>
  );
}

function RarityPip({ rarity }: { rarity: string }) {
  const color = (RARITY_COLORS as any)[rarity] || '#94a3b8';
  return <span className="w-2 h-2 rounded-full inline-block mr-1.5" style={{ background: color }} />;
}

// ─── Trade-Up Card ────────────────────────────────────────────────────────────

function TradeUpCard({ trade, onVote }: { trade: TradeUpContract; onVote: (id: string, type: 'good' | 'bad') => void }) {
  const isProfit = trade.profit >= 0;
  const votes = trade.votes ?? { good: 0, bad: 0 };
  const totalVotes = votes.good + votes.bad;
  const goodPct = totalVotes ? Math.round((votes.good / totalVotes) * 100) : 50;

  return (
    <div className="glass card-hover rounded-2xl p-5 flex flex-col gap-4 border border-slate-700/50">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="font-semibold text-white text-base leading-tight">{trade.name}</h3>
          <p className="text-xs text-slate-400 mt-0.5">
            <RarityPip rarity={trade.inputs[0]?.rarity} />
            {trade.inputs[0]?.rarity} → {trade.outputs[0]?.rarity}
          </p>
        </div>
        <span className={`badge text-xs ${isProfit ? 'badge-success' : 'badge-danger'}`}>
          {isProfit ? '▲' : '▼'} {trade.profit_percentage.toFixed(1)}%
        </span>
      </div>

      {/* Stats row */}
      <div className="flex flex-wrap gap-2">
        <StatBadge label="Cost"   value={`$${trade.total_cost.toFixed(2)}`} />
        <StatBadge label="EV"     value={`$${trade.expected_value.toFixed(2)}`} />
        <StatBadge label="Profit" value={`${isProfit ? '+' : ''}$${trade.profit.toFixed(2)}`} positive={isProfit ? true : false} />
        <StatBadge label="Float"  value={trade.avg_input_float.toFixed(4)} />
      </div>

      {/* Inputs summary */}
      <div>
        <p className="text-xs text-slate-500 uppercase mb-1 tracking-wider">Inputs (10 skins)</p>
        <div className="flex flex-wrap gap-1">
          {Array.from(new Set(trade.inputs.map(i => i.market_hash_name))).slice(0, 4).map(name => (
            <span key={name} className="text-xs bg-slate-700/70 text-slate-300 rounded px-2 py-0.5 truncate max-w-[160px]">{name}</span>
          ))}
          {trade.inputs.length > 4 && <span className="text-xs text-slate-500">+{trade.inputs.length - 4} more</span>}
        </div>
      </div>

      {/* Outputs */}
      <div>
        <p className="text-xs text-slate-500 uppercase mb-1 tracking-wider">Possible Outputs</p>
        <div className="flex flex-col gap-1">
          {trade.outputs.map(out => (
            <div key={out.market_hash_name} className="flex items-center justify-between text-xs">
              <span className="text-slate-300 truncate max-w-[180px]">{out.market_hash_name}</span>
              <div className="flex gap-2 shrink-0 ml-2">
                <span className="text-slate-400">{(out.probability * 100).toFixed(0)}%</span>
                <span className="text-green-400">${out.price.toFixed(2)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Community vote */}
      <div className="flex items-center gap-3 pt-1 border-t border-slate-700/50">
        <button
          onClick={() => onVote(trade.id, 'good')}
          className="flex-1 btn btn-success text-sm py-1.5 flex items-center justify-center gap-1"
        >
          👍 Good <span className="text-green-200 text-xs">({votes.good})</span>
        </button>
        <button
          onClick={() => onVote(trade.id, 'bad')}
          className="flex-1 btn btn-danger text-sm py-1.5 flex items-center justify-center gap-1"
        >
          👎 Bad <span className="text-red-200 text-xs">({votes.bad})</span>
        </button>
      </div>

      {/* Vote bar */}
      {totalVotes > 0 && (
        <div className="h-1.5 w-full bg-red-500/40 rounded-full overflow-hidden -mt-2">
          <div className="h-full bg-green-500/80 rounded-full transition-all duration-500" style={{ width: `${goodPct}%` }} />
        </div>
      )}
    </div>
  );
}

// ─── Sniper Alert Card ────────────────────────────────────────────────────────

function SniperCard({ alert }: { alert: SniperAlert }) {
  return (
    <div className="glass rounded-xl p-4 flex items-center gap-4 border border-yellow-500/20 glow-danger">
      <div className="w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center text-xl shrink-0">🎯</div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-white truncate">{alert.skin.market_hash_name}</p>
        <p className="text-xs text-slate-400">Float {alert.float_value.toFixed(4)} · Market ${alert.market_price.toFixed(2)}</p>
      </div>
      <div className="text-right shrink-0">
        <p className="text-green-400 font-bold text-sm">${alert.listing_price.toFixed(2)}</p>
        <p className="text-xs text-yellow-400">-{alert.discount_percentage.toFixed(1)}%</p>
      </div>
    </div>
  );
}

// ─── Filters Panel ────────────────────────────────────────────────────────────

function FiltersPanel({ filters, onChange }: { filters: TradeUpFilters; onChange: (f: TradeUpFilters) => void }) {
  const set = (key: keyof TradeUpFilters, val: string) =>
    onChange({ ...filters, [key]: val === '' ? undefined : parseFloat(val) });

  return (
    <div className="glass rounded-2xl p-5 flex flex-wrap gap-4">
      {[
        { label: 'Min Budget ($)', key: 'min_budget' },
        { label: 'Max Budget ($)', key: 'max_budget' },
        { label: 'Min EV ($)',     key: 'min_ev' },
        { label: 'Min Profit %',  key: 'min_profit_percentage' },
        { label: 'Max Float',     key: 'max_float' },
      ].map(({ label, key }) => (
        <div key={key} className="flex flex-col gap-1 min-w-[140px]">
          <label className="text-xs text-slate-400 uppercase tracking-wider">{label}</label>
          <input
            type="number"
            placeholder="Any"
            className="bg-slate-800 text-white text-sm rounded-lg px-3 py-2 border border-slate-700 focus:border-blue-500 focus:outline-none w-full"
            value={(filters as any)[key] ?? ''}
            onChange={e => set(key as keyof TradeUpFilters, e.target.value)}
          />
        </div>
      ))}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function HomePage() {
  const [trades, setTrades] = useState<TradeUpContract[]>([]);
  const [alerts, setAlerts] = useState<SniperAlert[]>([]);
  const [filters, setFilters] = useState<TradeUpFilters>({});
  const [loading, setLoading] = useState(true);
  const [alertsLoading, setAlertsLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'trades' | 'sniper'>('trades');

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const fetchTrades = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([k, v]) => { if (v !== undefined) params.set(k, String(v)); });
      const res = await fetch(`/api/trades?${params}`);
      const json = await res.json();
      if (json.success) setTrades(json.data ?? []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const fetchAlerts = useCallback(async () => {
    setAlertsLoading(true);
    try {
      const res = await fetch('/api/sniper');
      const json = await res.json();
      if (json.success) setAlerts(json.data ?? []);
    } catch (e) {
      console.error(e);
    } finally {
      setAlertsLoading(false);
    }
  }, []);

  useEffect(() => { fetchTrades(); }, [fetchTrades]);
  useEffect(() => { fetchAlerts(); }, [fetchAlerts]);

  const handleVote = async (id: string, type: 'good' | 'bad') => {
    try {
      const res = await fetch('/api/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tradeup_id: id, vote_type: type }),
      });
      const json = await res.json();
      if (json.success) {
        setTrades(prev => prev.map(t => t.id === id ? { ...t, votes: json.new_vote_count } : t));
        showToast('Vote recorded!');
      } else {
        showToast(json.error ?? 'Vote failed');
      }
    } catch (e) {
      showToast('Vote failed — try again');
    }
  };

  const handleScan = async () => {
    setScanning(true);
    try {
      const res = await fetch('/api/sniper?scan=true');
      const json = await res.json();
      if (json.success) { setAlerts(json.data ?? []); showToast(`Scan complete! Found ${json.active_count} deals.`); }
    } catch (e) {
      showToast('Scan failed');
    } finally {
      setScanning(false);
    }
  };

  // Summary stats
  const profitable = trades.filter(t => t.profit > 0).length;
  const bestProfit = trades.reduce((m, t) => Math.max(m, t.profit_percentage), 0);

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Toast */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 glass rounded-xl px-5 py-3 text-sm font-medium text-white shadow-lg border border-slate-600 animate-pulse-slow">
          {toast}
        </div>
      )}

      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🎯</span>
            <div>
              <h1 className="text-xl font-bold text-white leading-none">CS2 TradeUp AI</h1>
              <p className="text-xs text-slate-400">Live prices · Sniper alerts · Community voting</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={fetchTrades} className="btn btn-secondary text-sm">↻ Refresh</button>
            <button onClick={handleScan} disabled={scanning} className="btn btn-primary text-sm">
              {scanning ? 'Scanning…' : '🔍 Scan Deals'}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 flex flex-col gap-8">

        {/* Summary stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Trade-Ups Found',  value: trades.length,         color: 'text-blue-400' },
            { label: 'Profitable',       value: profitable,            color: 'text-green-400' },
            { label: 'Best ROI',         value: `${bestProfit.toFixed(1)}%`, color: 'text-yellow-400' },
            { label: 'Sniper Alerts',    value: alerts.length,         color: 'text-red-400' },
          ].map(s => (
            <div key={s.label} className="glass rounded-2xl p-4 flex flex-col gap-1">
              <span className="text-xs text-slate-400 uppercase tracking-wider">{s.label}</span>
              <span className={`text-2xl font-bold ${s.color}`}>{s.value}</span>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-slate-800 pb-0">
          {(['trades', 'sniper'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2.5 text-sm font-medium rounded-t-lg transition-colors ${
                activeTab === tab
                  ? 'bg-slate-800 text-white border border-b-0 border-slate-700'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {tab === 'trades' ? `📊 Trade-Ups (${trades.length})` : `🎯 Sniper Alerts (${alerts.length})`}
            </button>
          ))}
        </div>

        {activeTab === 'trades' && (
          <>
            <FiltersPanel filters={filters} onChange={setFilters} />

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {Array(6).fill(0).map((_, i) => (
                  <div key={i} className="skeleton rounded-2xl h-64" />
                ))}
              </div>
            ) : trades.length === 0 ? (
              <div className="text-center py-20 text-slate-400">
                <p className="text-4xl mb-3">🔍</p>
                <p className="text-lg font-medium">No trade-ups match your filters</p>
                <p className="text-sm mt-1">Try relaxing the budget or profit constraints</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {trades.map(trade => (
                  <TradeUpCard key={trade.id} trade={trade} onVote={handleVote} />
                ))}
              </div>
            )}
          </>
        )}

        {activeTab === 'sniper' && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <p className="text-slate-400 text-sm">{alerts.length} active deal{alerts.length !== 1 ? 's' : ''} detected</p>
              <button onClick={handleScan} disabled={scanning} className="btn btn-primary text-sm">
                {scanning ? '⏳ Scanning…' : '🔍 Run New Scan'}
              </button>
            </div>

            {alertsLoading ? (
              <div className="flex flex-col gap-3">
                {Array(4).fill(0).map((_, i) => <div key={i} className="skeleton rounded-xl h-20" />)}
              </div>
            ) : alerts.length === 0 ? (
              <div className="text-center py-20 text-slate-400">
                <p className="text-4xl mb-3">🎯</p>
                <p className="text-lg font-medium">No active sniper alerts</p>
                <p className="text-sm mt-1">Click "Run New Scan" to check live listings</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {alerts.map(alert => <SniperCard key={alert.id} alert={alert} />)}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 mt-16 py-6 text-center text-xs text-slate-600">
        CS2 TradeUp AI · Prices from CSFloat · Not affiliated with Valve or Steam
      </footer>
    </div>
  );
}
