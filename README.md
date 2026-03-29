# CS2 TradeUp AI 🎯

A full-stack CS2 Trade-Up calculator with **live CSFloat prices**, **sniper alerts**, and **community voting** — built with Next.js, TailwindCSS, and Supabase.

---

## Features

- 📊 **Trade-Up Dashboard** — cards showing cost, EV, profit %, avg float, input/output skins
- 👍👎 **Community Voting** — good/bad votes with live counts and a visual bar
- 🎯 **Sniper Alerts** — scan live CSFloat listings for underpriced skins
- 🔍 **Filters** — filter by budget, EV, float, and profit %
- 🗄️ **Supabase** — persistent votes, price history, and sniper alerts
- 📦 **Sample Data** — works out-of-the-box without any API keys (falls back gracefully)

---

## Quick Start

```bash
# 1. Clone / unzip the project
cd tradeup-ai

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env.local
# Edit .env.local with your keys (see below)

# 4. Run locally
npm run dev
# → http://localhost:3000
```

---

## Environment Variables

| Variable | Description | Required |
|---|---|---|
| `SUPABASE_URL` | Your Supabase project URL | Optional* |
| `SUPABASE_KEY` | Supabase service role key | Optional* |
| `CSFLOAT_API_KEY` | CSFloat API key for live prices | Optional* |

\* The app falls back to sample data if these are not set, so it works immediately without any accounts.

---

## Supabase Setup

Run these SQL statements in your Supabase SQL editor:

```sql
-- Trade-Up contracts
create table tradeups (
  id text primary key,
  name text not null,
  cost numeric not null,
  expected_value numeric not null,
  profit numeric not null,
  profit_percentage numeric not null,
  avg_input_float numeric not null,
  inputs jsonb not null,
  outputs jsonb not null,
  created_at timestamptz default now()
);

-- Community votes
create table votes (
  id uuid primary key default gen_random_uuid(),
  tradeup_id text references tradeups(id),
  user_id text not null,
  vote_type text check (vote_type in ('good','bad')),
  created_at timestamptz default now(),
  unique (tradeup_id, user_id)
);

-- Price history cache
create table price_history (
  id uuid primary key default gen_random_uuid(),
  skin_name text not null,
  market_hash_name text not null,
  price numeric not null,
  float_value numeric,
  timestamp timestamptz default now(),
  source text not null
);

-- Sniper alerts
create table sniper_alerts (
  id text primary key,
  skin_data jsonb not null,
  market_price numeric not null,
  listing_price numeric not null,
  discount_percentage numeric not null,
  float_value numeric not null,
  detected_at timestamptz default now(),
  is_active boolean default true
);
```

---

## API Routes

| Route | Method | Description |
|---|---|---|
| `/api/trades` | GET | Returns trade-up list. Params: `min_budget`, `max_budget`, `min_ev`, `min_profit_percentage`, `max_float`, `limit` |
| `/api/vote` | POST | Records a vote. Body: `{ tradeup_id, vote_type: 'good'\|'bad' }` |
| `/api/sniper` | GET | Returns sniper alerts. Params: `scan=true` to trigger a live scan, `discount`, `max_float`, `min_price`, `max_price` |
| `/api/prices` | GET | Fetches CSFloat prices. Params: `skin` (single) or `skins` (comma-separated batch) |

---

## Deployment to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard:
# Project → Settings → Environment Variables
# Add: SUPABASE_URL, SUPABASE_KEY, CSFLOAT_API_KEY
```

Or connect your GitHub repo to Vercel for auto-deploys.

---

## Example Trade-Up Workflow

1. **Dashboard loads** → calls `/api/trades` → returns sample or DB trade-ups
2. **User applies filters** → e.g. `max_budget=50&min_profit_percentage=10`
3. **User votes** → POST `/api/vote` → vote stored in Supabase, counts update live
4. **Sniper tab** → calls `/api/sniper` → returns cached alerts from DB
5. **"Run Scan" clicked** → calls `/api/sniper?scan=true` → live CSFloat scan, new alerts saved

---

## Project Structure

```
tradeup-ai/
├── pages/
│   ├── index.tsx          # Main dashboard UI
│   ├── _app.tsx           # App wrapper + global styles
│   └── api/
│       ├── trades.ts      # Trade-up API route
│       ├── vote.ts        # Voting API route
│       ├── sniper.ts      # Sniper alerts API route
│       └── prices.ts      # Price fetch API route
├── lib/
│   ├── tradeupEngine.ts   # EV/profit calculation logic
│   ├── sniper.ts          # Sniper scan logic
│   ├── csfloat.ts         # CSFloat API client
│   ├── supabaseClient.ts  # Supabase client + helpers
│   └── sampleData.ts      # Demo skins & trade-ups
├── types/
│   ├── index.ts           # Core TypeScript types
│   └── database.ts        # Supabase table types
└── styles/
    └── globals.css        # Tailwind + custom styles
```
