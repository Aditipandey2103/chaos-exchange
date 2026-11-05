import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Price } from "../components/Price";
import { dir, pct, pctChange, signed } from "../format";
import { useMarket } from "../store";

type SortKey = "ticker" | "price" | "pct";

export default function Market() {
  const order = useMarket((s) => s.order);
  const companies = useMarket((s) => s.companies);
  const open = useMarket((s) => s.open);
  const news = useMarket((s) => s.news);
  const loaded = useMarket((s) => s.loaded);

  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<{ key: SortKey; asc: boolean }>({ key: "ticker", asc: true });

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = order
      .map((id) => companies[id])
      .filter((c) => !q || c.ticker.toLowerCase().includes(q) || c.name.toLowerCase().includes(q))
      .map((c) => ({ c, change: c.current_price - (open[c.id] ?? c.current_price), pc: pctChange(c.current_price, open[c.id]) }));
    const m = sort.asc ? 1 : -1;
    list.sort((a, b) =>
      sort.key === "ticker"
        ? a.c.ticker.localeCompare(b.c.ticker) * m
        : sort.key === "price"
          ? (a.c.current_price - b.c.current_price) * m
          : (a.pc - b.pc) * m,
    );
    return list;
  }, [order, companies, open, query, sort]);

  const movers = useMemo(() => {
    const all = order.map((id) => ({ c: companies[id], pc: pctChange(companies[id].current_price, open[id]) }));
    const sorted = [...all].sort((a, b) => b.pc - a.pc);
    return { gainers: sorted.slice(0, 3), losers: sorted.slice(-3).reverse() };
  }, [order, companies, open]);

  const th = (key: SortKey, label: string, right = false) => (
    <th className={right ? "r sortable" : "sortable"} onClick={() => setSort((s) => ({ key, asc: s.key === key ? !s.asc : key === "ticker" }))}>
      {label}
      {sort.key === key ? (sort.asc ? " ▲" : " ▼") : ""}
    </th>
  );

  return (
    <div className="grid-2">
      <section className="panel">
        <div className="panel-head">
          <h2>Market Watch</h2>
          <input
            className="search"
            placeholder="Search symbol or company"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        {!loaded ? (
          <p className="empty">Loading market data… the server can take up to a minute to wake up.</p>
        ) : rows.length === 0 ? (
          <p className="empty">No companies match “{query}”.</p>
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  {th("ticker", "Symbol")}
                  <th>Company</th>
                  {th("price", "LTP", true)}
                  <th className="r">Chg</th>
                  {th("pct", "% Chg", true)}
                  <th className="r">Trade</th>
                </tr>
              </thead>
              <tbody>
                {rows.map(({ c, change, pc }) => (
                  <tr key={c.id}>
                    <td>
                      <Link to={`/stock/${c.id}`} className="sym">
                        {c.ticker}
                      </Link>
                    </td>
                    <td className="muted">{c.name}</td>
                    <td className="r">
                      <Price value={c.current_price} />
                    </td>
                    <td className={`r ${dir(change)}`}>{signed(change)}</td>
                    <td className={`r ${dir(pc)}`}>{pct(pc)}</td>
                    <td className="r">
                      <Link to={`/stock/${c.id}`} className="pill">
                        Trade
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <p className="hint pad">Change is measured from the first price you saw this session.</p>
      </section>

      <aside className="side">
        <section className="panel">
          <div className="panel-head">
            <h2>Top Movers</h2>
          </div>
          {order.length === 0 ? (
            <p className="empty">No data yet.</p>
          ) : (
            <div className="movers">
              <div>
                <h4>Gainers</h4>
                {movers.gainers.map(({ c, pc }) => (
                  <Link key={c.id} to={`/stock/${c.id}`} className="mover">
                    <b>{c.ticker}</b>
                    <span className={dir(pc)}>{pct(pc)}</span>
                  </Link>
                ))}
              </div>
              <div>
                <h4>Losers</h4>
                {movers.losers.map(({ c, pc }) => (
                  <Link key={c.id} to={`/stock/${c.id}`} className="mover">
                    <b>{c.ticker}</b>
                    <span className={dir(pc)}>{pct(pc)}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </section>

        <section className="panel">
          <div className="panel-head">
            <h2>Market Events</h2>
          </div>
          {news.length === 0 ? (
            <p className="empty">No events yet. New ones can arrive every couple of minutes.</p>
          ) : (
            <ul className="news">
              {news.map((n) => (
                <li key={n.id}>
                  <time>{new Date(n.at).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}</time>
                  {n.ticker && <b>{n.ticker}</b>} {n.text}
                </li>
              ))}
            </ul>
          )}
        </section>
      </aside>
    </div>
  );
}
