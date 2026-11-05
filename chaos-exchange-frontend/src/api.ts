import type {
  Company,
  LeaderboardEntry,
  Portfolio,
  TradeRequest,
  User,
} from "./types";

export const API_URL: string =
  (import.meta.env.VITE_API_URL as string | undefined) ??
  "https://chaos-exchange-api.onrender.com";

export const WS_URL = API_URL.replace(/^http/, "ws") + "/ws/market";

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

// FastAPI errors are either {detail: "text"} or {detail: [{msg, loc, ...}]}.
function errorMessage(body: unknown, fallback: string): string {
  if (body && typeof body === "object" && "detail" in body) {
    const detail = (body as { detail: unknown }).detail;
    if (typeof detail === "string") return detail;
    if (Array.isArray(detail)) {
      return detail
        .map((d) => (d && typeof d === "object" && "msg" in d ? String((d as { msg: unknown }).msg) : ""))
        .filter(Boolean)
        .join("; ") || fallback;
    }
  }
  return fallback;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(API_URL + path, {
      ...init,
      headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
    });
  } catch {
    throw new ApiError("Cannot reach the server. It may be waking up, try again in a moment.", 0);
  }
  let body: unknown = null;
  try {
    body = await res.json();
  } catch {
    /* empty or non-JSON body */
  }
  if (!res.ok) throw new ApiError(errorMessage(body, `Request failed (${res.status})`), res.status);
  return body as T;
}

const post = (payload: unknown): RequestInit => ({
  method: "POST",
  body: JSON.stringify(payload),
});

export const api = {
  companies: () => request<Company[]>("/companies"),
  company: (id: string) => request<Company>(`/companies/${id}`),
  login: (username: string, password: string) =>
    request<User>("/auth/login", post({ username, password })),
  signup: (username: string, password: string) =>
    request<User>("/auth/signup", post({ username, password })),
  portfolio: (userId: string) => request<Portfolio>(`/portfolio/${userId}`),
  leaderboard: () => request<LeaderboardEntry[]>("/leaderboard"),
  buy: (req: TradeRequest) => request<unknown>("/trade/buy", post(req)),
  sell: (req: TradeRequest) => request<unknown>("/trade/sell", post(req)),
};
