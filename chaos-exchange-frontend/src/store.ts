import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Company, User } from "./types";
import type { MarketEvent } from "./ws/parse";

export interface NewsItem {
  id: number;
  text: string;
  ticker?: string;
  at: number;
}

export type WsStatus = "connecting" | "open" | "closed";

interface MarketState {
  companies: Record<string, Company>;
  order: string[];
  /** First price seen this session; used as the baseline for change / %change. */
  open: Record<string, number>;
  history: Record<string, number[]>;
  news: NewsItem[];
  status: WsStatus;
  loaded: boolean;
  setCompanies: (list: Company[]) => void;
  applyEvents: (events: MarketEvent[]) => void;
  setStatus: (s: WsStatus) => void;
}

const HISTORY_CAP = 300;
let newsId = 0;

export const useMarket = create<MarketState>((set) => ({
  companies: {},
  order: [],
  open: {},
  history: {},
  news: [],
  status: "connecting",
  loaded: false,

  setCompanies: (list) =>
    set((state) => {
      const companies: Record<string, Company> = {};
      const open = { ...state.open };
      const history = { ...state.history };
      for (const c of list) {
        companies[c.id] = c;
        if (open[c.id] === undefined) open[c.id] = c.current_price;
        const h = history[c.id] ?? [];
        if (h.length === 0 || h[h.length - 1] !== c.current_price) {
          history[c.id] = [...h.slice(-(HISTORY_CAP - 1)), c.current_price];
        }
      }
      return { companies, order: list.map((c) => c.id), open, history, loaded: true };
    }),

  applyEvents: (events) =>
    set((state) => {
      if (events.length === 0) return state;
      const companies = { ...state.companies };
      const history = { ...state.history };
      let news = state.news;

      for (const ev of events) {
        if (ev.kind === "price") {
          let id = ev.companyId && companies[ev.companyId] ? ev.companyId : undefined;
          if (!id && ev.ticker) {
            const t = ev.ticker.toUpperCase();
            id = state.order.find((i) => companies[i]?.ticker.toUpperCase() === t);
          }
          if (!id) continue;
          companies[id] = { ...companies[id], current_price: ev.price };
          history[id] = [...(history[id] ?? []).slice(-(HISTORY_CAP - 1)), ev.price];
        } else {
          news = [{ id: ++newsId, text: ev.text, ticker: ev.ticker, at: Date.now() }, ...news].slice(0, 30);
        }
      }
      return { companies, history, news };
    }),

  setStatus: (status) => set({ status }),
}));

interface AuthState {
  user: User | null;
  setUser: (u: User | null) => void;
  setCash: (cash: number) => void;
  logout: () => void;
}

export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      setUser: (user) => set({ user }),
      setCash: (cash) => set((s) => (s.user ? { user: { ...s.user, cash_balance: cash } } : s)),
      logout: () => set({ user: null }),
    }),
    { name: "chaos.auth" },
  ),
);
