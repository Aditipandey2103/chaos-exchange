import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { api } from "../api";
import { money } from "../format";
import { useAuth } from "../store";
import type { Company } from "../types";

function extractMessage(res: unknown): string | undefined {
  if (res && typeof res === "object" && "message" in res) {
    const m = (res as { message: unknown }).message;
    if (typeof m === "string" && m) return m;
  }
  return undefined;
}

export function TradePanel({ company }: { company: Company }) {
  const user = useAuth((s) => s.user);
  const setCash = useAuth((s) => s.setCash);
  const location = useLocation();
  const [qty, setQty] = useState("1");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  if (!user) {
    return (
      <div className="card">
        <h3 className="card-title">Place order</h3>
        <p className="muted">You need an account to trade.</p>
        <Link to="/login" state={{ from: location.pathname }} className="btn btn-primary">
          Login / Sign up
        </Link>
      </div>
    );
  }

  const n = Math.floor(Number(qty));
  const valid = Number.isFinite(n) && n > 0;
  const estimate = valid ? n * company.current_price : 0;

  async function submit(side: "buy" | "sell") {
    if (!user || !valid) return;
    setBusy(true);
    setMsg(null);
    try {
      const req = { user_id: user.id, company_id: company.id, quantity: n };
      const res = side === "buy" ? await api.buy(req) : await api.sell(req);
      const p = await api.portfolio(user.id);
      setCash(p.cash_balance);
      setMsg({
        ok: true,
        text: extractMessage(res) ?? `${side === "buy" ? "Bought" : "Sold"} ${n} × ${company.ticker}`,
      });
    } catch (e) {
      setMsg({ ok: false, text: (e as Error).message });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="card">
      <h3 className="card-title">Place order</h3>
      <label className="field">
        <span>Quantity (shares)</span>
        <input
          type="number"
          min={1}
          step={1}
          value={qty}
          onChange={(e) => setQty(e.target.value)}
          inputMode="numeric"
        />
      </label>
      <dl className="kv">
        <dt>Price</dt>
        <dd>{money(company.current_price)}</dd>
        <dt>Estimated value</dt>
        <dd>{valid ? money(estimate) : "-"}</dd>
        <dt>Cash available</dt>
        <dd>{money(user.cash_balance)}</dd>
      </dl>
      {valid && estimate > user.cash_balance && (
        <p className="hint">This is more than your cash balance. A buy will likely be rejected.</p>
      )}
      <div className="btn-row">
        <button className="btn btn-buy" disabled={busy || !valid} onClick={() => submit("buy")}>
          Buy
        </button>
        <button className="btn btn-sell" disabled={busy || !valid} onClick={() => submit("sell")}>
          Sell
        </button>
      </div>
      {msg && <p className={msg.ok ? "msg-ok" : "msg-err"}>{msg.text}</p>}
      <p className="hint">Orders execute at the live simulated price. The server may price slightly differently from what you see.</p>
    </div>
  );
}
