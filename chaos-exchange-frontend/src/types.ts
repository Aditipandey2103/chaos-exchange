// Mirrors the backend's OpenAPI schemas.
export interface Company {
  id: string;
  name: string;
  ticker: string;
  description: string | null;
  current_price: number;
}

export interface User {
  id: string;
  username: string;
  cash_balance: number;
}

export interface Holding {
  company_id: string;
  company_name: string;
  ticker: string;
  shares_owned: number;
  avg_buy_price: number;
  current_price: number;
  current_value: number;
  gain_loss: number;
  gain_loss_percent: number;
}

export interface Portfolio {
  user_id: string;
  cash_balance: number;
  holdings: Holding[];
  total_holdings_value: number;
  net_worth: number;
}

export interface LeaderboardEntry {
  user_id: string;
  username: string;
  net_worth: number;
}

export interface TradeRequest {
  user_id: string;
  company_id: string;
  quantity: number;
}
