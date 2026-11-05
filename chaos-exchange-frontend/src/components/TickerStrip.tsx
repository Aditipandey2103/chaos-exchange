import { Link } from "react-router-dom";
import { dir, num, pct, pctChange } from "../format";
import { useMarket } from "../store";

/** Scrolling strip of live prices under the header. */
export function TickerStrip() {
  const order = useMarket((s) => s.order);
  const companies = useMarket((s) => s.companies);
  const open = useMarket((s) => s.open);

  if (order.length === 0) return <div className="ticker ticker-empty">Connecting to market…</div>;

  const renderItems = (prefix: string) =>
    order.map((id) => {
      const c = companies[id];
      const change = pctChange(c.current_price, open[id]);
      return (
        <Link key={prefix + id} to={`/stock/${id}`} className="ticker-item">
          <strong>{c.ticker}</strong>
          <span>{num(c.current_price)}</span>
          <span className={dir(change)}>{pct(change)}</span>
        </Link>
      );
    });

  // Rendered twice so the CSS marquee loops seamlessly.
  return (
    <div className="ticker">
      <div className="ticker-track" style={{ animationDuration: `${Math.max(20, order.length * 5)}s` }}>
        {renderItems("a-")}
        {renderItems("b-")}
      </div>
    </div>
  );
}
