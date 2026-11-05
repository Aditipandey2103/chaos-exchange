import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { api } from "../api";
import { dir, money, num, pct, signed } from "../format";
import { useAuth } from "../store";
import type { Portfolio as PortfolioT } from "../types";

export default function Portfolio() {
  const user = useAuth((s) => s.user);
  const setCash = useAuth((s) => s.setCash);
  const [data, setData] = useState<PortfolioT | null>(null);
  const [error, setError] = useState<string | null>(null);

  const userId = user?.id;
  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    const load = () =>
      api
        .portfolio(userId)
        .then((p) => {
          if (cancelled) return;
          setData(p);
          setError(null);
          setCash(p.cash_balance);
        })
        .catch((e: Error) => !cancelled && setError(e.message));
    load();
    const t = window.setInterval(load, 10000);
    return () => {
      cancelled = true;
      window.clearInterval(t);
    };
  }, [userId, setCash]);

  if (!user) return <Navigate to="/login" state={{ from: "/portfolio" }} replace />;

  return (
    <section className="panel">
      <div className="panel-head">
        <h2>Portfolio</h2>
      </div>
      {error && <p className="msg-err pad">{error}</p>}
      {!data ? (
        !error && <p className="empty">Loading portfolio…</p>
      ) : (
        <>
          <div className="summary">
            <div>
              <span>Cash</span>
              <b>{money(data.cash_balance)}</b>
            </div>
            <div>
              <span>Holdings value</span>
              <b>{money(data.total_holdings_value)}</b>
            </div>
            <div>
              <span>Net worth</span>
              <b>{money(data.net_worth)}</b>
            </div>
          </div>

          {data.holdings.length === 0 ? (
            <p className="empty">
              You don't own any shares yet. <Link to="/">Go to Market Watch</Link> to place your first trade.
            </p>
          ) : (
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>Symbol</th>
                    <th>Company</th>
                    <th className="r">Shares</th>
                    <th className="r">Avg buy</th>
                    <th className="r">LTP</th>
                    <th className="r">Value</th>
                    <th className="r">P&amp;L</th>
                    <th className="r">P&amp;L %</th>
                  </tr>
                </thead>
                <tbody>
                  {data.holdings.map((h) => (
                    <tr key={h.company_id}>
                      <td>
                        <Link to={`/stock/${h.company_id}`} className="sym">
                          {h.ticker}
                        </Link>
                      </td>
                      <td className="muted">{h.company_name}</td>
                      <td className="r">{h.shares_owned}</td>
                      <td className="r">{num(h.avg_buy_price)}</td>
                      <td className="r">{num(h.current_price)}</td>
                      <td className="r">{num(h.current_value)}</td>
                      <td className={`r ${dir(h.gain_loss)}`}>{signed(h.gain_loss)}</td>
                      <td className={`r ${dir(h.gain_loss_percent)}`}>{pct(h.gain_loss_percent)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </section>
  );
}
