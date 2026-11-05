import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { money } from "../format";
import { useAuth, useMarket } from "../store";
import { useMarketData } from "../ws/useMarketData";
import { TickerStrip } from "./TickerStrip";

export function Layout() {
  useMarketData();
  const user = useAuth((s) => s.user);
  const logout = useAuth((s) => s.logout);
  const status = useMarket((s) => s.status);
  const navigate = useNavigate();

  const statusLabel = { open: "Live", connecting: "Connecting", closed: "Reconnecting" }[status];

  return (
    <>
      <header className="topbar">
        <div className="topbar-inner">
          <Link to="/" className="brand">
            <span className="brand-mark">CX</span>
            <span className="brand-name">
              CHAOS <em>EXCHANGE</em>
            </span>
          </Link>
          <nav className="nav">
            <NavLink to="/" end>
              Market Watch
            </NavLink>
            <NavLink to="/portfolio">Portfolio</NavLink>
            <NavLink to="/leaderboard">Leaderboard</NavLink>
          </nav>
          <div className="topbar-right">
            <span className={`status status-${status}`} title="WebSocket connection">
              <i /> {statusLabel}
            </span>
            {user ? (
              <>
                <span className="who">
                  {user.username} · <b>{money(user.cash_balance)}</b>
                </span>
                <button
                  className="btn btn-ghost"
                  onClick={() => {
                    logout();
                    navigate("/");
                  }}
                >
                  Logout
                </button>
              </>
            ) : (
              <Link to="/login" className="btn btn-light">
                Login / Sign up
              </Link>
            )}
          </div>
        </div>
      </header>
      <TickerStrip />
      <main className="container">
        <Outlet />
      </main>
      <footer className="footer">
        Chaos Exchange is a simulated market for learning. No real money, no real securities, not investment advice.
      </footer>
    </>
  );
}
