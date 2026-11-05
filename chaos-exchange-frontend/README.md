# Chaos Exchange: Frontend

React + TypeScript + Vite frontend for the Chaos Exchange simulated stock market.

## Run

```bash
npm install
npm run dev        # http://localhost:3000
```

The dev server is pinned to **port 3000** because the backend's CORS allowlist only includes
`http://localhost:3000`. To use a local backend, copy `.env.example` to `.env` and set `VITE_API_URL`.

## Deploying

Add your deployed frontend origin to `allow_origins` in the backend's `main.py`
(`allow_credentials=True` means `"*"` is not allowed), then redeploy the API.

## Structure

- `src/api.ts`: typed REST client (mirrors the backend's OpenAPI schema)
- `src/store.ts`: zustand stores (market data, auth)
- `src/ws/`: WebSocket hook (auto-reconnect, batched updates) and tolerant message parser
- `src/pages/`: Market Watch, Stock detail + trading, Portfolio, Leaderboard, Login
- `src/styles.css`: all styling (no CSS framework)

Simulated market for learning. Not investment advice.
