import { useEffect } from "react";
import { api, WS_URL } from "../api";
import { useMarket } from "../store";
import { parseMessage, type MarketEvent } from "./parse";

/**
 * Keeps the market store fresh:
 *  - REST poll of /companies (also the fallback if WS messages aren't recognised)
 *  - WebSocket with exponential-backoff reconnect, keepalive pings, and batched
 *    updates (flushed every 300ms so a fast tick stream doesn't re-render everything)
 */
export function useMarketData() {
  useEffect(() => {
    let cancelled = false;

    const load = () =>
      api
        .companies()
        .then((list) => {
          if (!cancelled) useMarket.getState().setCompanies(list);
        })
        .catch(() => {
          /* the Market page shows its own error/loading state */
        });
    load();
    const poll = window.setInterval(load, 15000);

    let ws: WebSocket | null = null;
    let retry = 0;
    let reconnectTimer: number | undefined;
    let pingTimer: number | undefined;
    let buffer: MarketEvent[] = [];

    const flush = window.setInterval(() => {
      if (buffer.length === 0) return;
      const batch = buffer;
      buffer = [];
      useMarket.getState().applyEvents(batch);
    }, 300);

    const connect = () => {
      useMarket.getState().setStatus("connecting");
      ws = new WebSocket(WS_URL);
      ws.onopen = () => {
        retry = 0;
        useMarket.getState().setStatus("open");
        // The server only reads from the socket to detect disconnects; any text works as a ping.
        pingTimer = window.setInterval(() => ws?.readyState === WebSocket.OPEN && ws.send("ping"), 25000);
      };
      ws.onmessage = (e) => {
        if (typeof e.data === "string") buffer.push(...parseMessage(e.data));
      };
      ws.onclose = () => {
        window.clearInterval(pingTimer);
        useMarket.getState().setStatus("closed");
        if (cancelled) return;
        reconnectTimer = window.setTimeout(connect, Math.min(15000, 1000 * 2 ** retry++));
      };
      ws.onerror = () => ws?.close();
    };
    connect();

    return () => {
      cancelled = true;
      window.clearInterval(poll);
      window.clearInterval(flush);
      window.clearInterval(pingTimer);
      window.clearTimeout(reconnectTimer);
      ws?.close();
    };
  }, []);
}
