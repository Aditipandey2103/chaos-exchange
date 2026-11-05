// The backend's /ws/market payload format isn't documented in the OpenAPI schema,
// so this parser is deliberately tolerant. Once you've seen real messages
// (browser devtools -> Network -> WS), tighten it to the exact shape.

export type MarketEvent =
  | { kind: "price"; companyId?: string; ticker?: string; price: number }
  | { kind: "news"; text: string; ticker?: string };

type Obj = Record<string, unknown>;

const isObj = (v: unknown): v is Obj => typeof v === "object" && v !== null && !Array.isArray(v);

function firstNumber(o: Obj, keys: string[]): number | undefined {
  for (const k of keys) {
    const v = o[k];
    const n = typeof v === "string" ? Number(v) : v;
    if (typeof n === "number" && Number.isFinite(n)) return n;
  }
  return undefined;
}

function firstString(o: Obj, keys: string[]): string | undefined {
  for (const k of keys) {
    const v = o[k];
    if (typeof v === "string" && v.trim()) return v;
  }
  return undefined;
}

function fromObject(o: Obj): MarketEvent[] {
  // Envelope forms: {type, data: {...}} / {event, payload: [...]} / {companies: [...]}
  for (const key of ["data", "payload", "companies", "prices", "updates"]) {
    const inner = o[key];
    if (Array.isArray(inner)) return inner.flatMap(fromAny);
    if (isObj(inner)) {
      const events = fromObject(inner);
      if (events.length) return events;
    }
  }

  const price = firstNumber(o, ["current_price", "new_price", "price", "last_price", "ltp"]);
  const companyId = firstString(o, ["company_id", "id"]);
  const ticker = firstString(o, ["ticker", "symbol"]);
  if (price !== undefined && (companyId || ticker)) {
    return [{ kind: "price", companyId, ticker, price }];
  }

  const text = firstString(o, ["headline", "news", "title", "event", "description", "message", "text"]);
  const type = String(o["type"] ?? o["event_type"] ?? "").toLowerCase();
  if (text && (type.includes("news") || type.includes("event") || type.includes("chaos") || "headline" in o)) {
    return [{ kind: "news", text, ticker }];
  }
  return [];
}

function fromAny(v: unknown): MarketEvent[] {
  if (Array.isArray(v)) return v.flatMap(fromAny);
  if (isObj(v)) return fromObject(v);
  return [];
}

export function parseMessage(raw: string): MarketEvent[] {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return [];
  }
  const events = fromAny(parsed);
  if (events.length === 0 && import.meta.env.DEV) {
    console.debug("[ws] unrecognised message shape:", raw);
  }
  return events;
}
