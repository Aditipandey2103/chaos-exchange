-- Chaos Exchange: full setup for a fresh Neon database.
-- Paste this whole file into Neon's SQL Editor and run it once.
-- Part 1 is your schema.sql unchanged. Part 2 is starter data.

-- ========== PART 1: SCHEMA ==========

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR(50) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  cash_balance NUMERIC(14, 2) NOT NULL DEFAULT 100000.00,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  ticker VARCHAR(10) UNIQUE NOT NULL,
  description TEXT,
  current_price NUMERIC(12, 2) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE holdings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  shares_owned INTEGER NOT NULL DEFAULT 0 CHECK (shares_owned >= 0),
  avg_buy_price NUMERIC(12, 2) NOT NULL DEFAULT 0,
  UNIQUE (user_id, company_id)
);

CREATE TABLE trades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  company_id UUID NOT NULL REFERENCES companies(id),
  trade_type VARCHAR(4) NOT NULL CHECK (trade_type IN ('buy', 'sell')),
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  price_at_trade NUMERIC(12, 2) NOT NULL,
  total_value NUMERIC(14, 2) NOT NULL,
  executed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_trades_company_time ON trades (company_id, executed_at);
CREATE INDEX idx_trades_user_time ON trades (user_id, executed_at);

-- ========== PART 2: STARTER COMPANIES ==========
-- All fictional. Edit names, tickers, descriptions and prices freely.
-- If your old companies had specific names/tickers, replace these rows.

INSERT INTO companies (name, ticker, description, current_price) VALUES
  ('Quantum Spice Foods',     'QSPC',  'Packaged masalas and ready meals sold across India. Steady, defensive business with slow growth.',               842.50),
  ('Rocket Chai Ltd',         'RCHAI', 'Tea chain expanding to 500 outlets. Fast growth, thin margins, sensitive to milk and sugar prices.',            215.75),
  ('Neon Grid Power',         'NGRID', 'Utility company running solar and wind farms. Stable income, hurt by regulation and weather.',                   468.20),
  ('Paper Tiger Bank',        'PTBNK', 'Mid-sized private bank. Profits swing with interest rates and loan defaults.',                                  1325.00),
  ('Orbit Logistics',         'ORBIT', 'Warehousing and last-mile delivery. Busy at festivals, squeezed by fuel costs.',                                  389.90),
  ('Mango Motors',            'MNGO',  'Maker of affordable electric scooters. High growth, high risk, costs depend on battery supply.',                  156.40),
  ('Lotus Pharma',            'LOTUS', 'Generic medicines exporter. Safe demand, but a single failed inspection can move the price sharply.',            976.30),
  ('Byte Bazaar',             'BYTE',  'Online marketplace for small sellers. Valued on growth, very reactive to news and sentiment.',                    642.85),
  ('Monsoon Agro',            'MNSN',  'Seeds and fertiliser supplier. Earnings rise and fall with the rains and crop prices.',                           273.10),
  ('Iron Fort Steel',         'IFORT', 'Steel producer with heavy debt. Does well in construction booms, badly when demand or prices fall.',              118.65);
