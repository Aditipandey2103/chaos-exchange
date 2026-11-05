import { useEffect, useState } from "react";
import { api } from "../api";
import { money } from "../format";
import { useAuth } from "../store";
import type { LeaderboardEntry } from "../types";

export default function Leaderboard() {
  const me = useAuth((s) => s.user?.id);
  const [rows, setRows] = useState<LeaderboardEntry[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = () =>
      api
        .leaderboard()
        .then((r) => {
          if (cancelled) return;
          setRows(r);
          setError(null);
        })
        .catch((e: Error) => !cancelled && setError(e.message));
    load();
    const t = window.setInterval(load, 15000);
    return () => {
      cancelled = true;
      window.clearInterval(t);
    };
  }, []);

  return (
    <section className="panel">
      <div className="panel-head">
        <h2>Leaderboard</h2>
      </div>
      {error && <p className="msg-err pad">{error}</p>}
      {!rows ? (
        !error && <p className="empty">Loading…</p>
      ) : rows.length === 0 ? (
        <p className="empty">No traders yet.</p>
      ) : (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th style={{ width: 70 }}>Rank</th>
                <th>Trader</th>
                <th className="r">Net worth</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={r.user_id} className={r.user_id === me ? "me" : ""}>
                  <td>{i + 1}</td>
                  <td>
                    {r.username} {r.user_id === me && <span className="pill">You</span>}
                  </td>
                  <td className="r">{money(r.net_worth)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
