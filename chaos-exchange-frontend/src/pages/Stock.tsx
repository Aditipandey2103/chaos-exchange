import { Link, useParams } from "react-router-dom";
import { LineChart } from "../components/LineChart";
import { Price } from "../components/Price";
import { TradePanel } from "../components/TradePanel";
import { dir, money, pct, pctChange, signed } from "../format";
import { useMarket } from "../store";

export default function Stock() {
  const { id = "" } = useParams();
  const company = useMarket((s) => s.companies[id]);
  const history = useMarket((s) => s.history[id]);
  const open = useMarket((s) => s.open[id]);
  const loaded = useMarket((s) => s.loaded);

  if (!company) {
    return (
      <div className="panel">
        <p className="empty">
          {loaded ? "Company not found." : "Loading…"} <Link to="/">Back to Market Watch</Link>
        </p>
      </div>
    );
  }

  const change = company.current_price - (open ?? company.current_price);
  const pc = pctChange(company.current_price, open);
  const series = history ?? [];
  const hi = series.length ? Math.max(...series) : company.current_price;
  const lo = series.length ? Math.min(...series) : company.current_price;

  return (
    <div className="grid-2">
      <section className="panel">
        <div className="stock-head">
          <div>
            <p className="crumb">
              <Link to="/">Market Watch</Link> / {company.ticker}
            </p>
            <h2>
              {company.name} <span className="muted">({company.ticker})</span>
            </h2>
          </div>
          <div className="stock-price">
            <div className="big">
              <Price value={company.current_price} />
            </div>
            <div className={dir(change)}>
              {signed(change)} ({pct(pc)})
            </div>
          </div>
        </div>

        <LineChart values={series} />
        <p className="hint pad">Session chart: built from live ticks since you opened the app.</p>

        <dl className="stats">
          <div>
            <dt>Session high</dt>
            <dd>{money(hi)}</dd>
          </div>
          <div>
            <dt>Session low</dt>
            <dd>{money(lo)}</dd>
          </div>
          <div>
            <dt>Session open</dt>
            <dd>{money(open ?? company.current_price)}</dd>
          </div>
        </dl>

        {company.description && (
          <div className="about">
            <h4>About</h4>
            <p>{company.description}</p>
          </div>
        )}
      </section>

      <aside className="side">
        <TradePanel company={company} />
      </aside>
    </div>
  );
}
