import { FormEvent, useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { api } from "../api";
import { useAuth } from "../store";

export default function Login() {
  const user = useAuth((s) => s.user);
  const setUser = useAuth((s) => s.setUser);
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from ?? "/";

  const [mode, setMode] = useState<"login" | "signup">("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (user) return <Navigate to={from} replace />;

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const u =
        mode === "login" ? await api.login(username.trim(), password) : await api.signup(username.trim(), password);
      setUser(u);
      navigate(from, { replace: true });
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="auth-wrap">
      <form className="card auth" onSubmit={submit}>
        <h2>{mode === "login" ? "Login" : "Create account"}</h2>
        <label className="field">
          <span>Username</span>
          <input value={username} onChange={(e) => setUsername(e.target.value)} autoComplete="username" required />
        </label>
        <label className="field">
          <span>Password</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete={mode === "login" ? "current-password" : "new-password"}
            required
          />
        </label>
        {error && <p className="msg-err">{error}</p>}
        <button className="btn btn-primary" disabled={busy || !username.trim() || !password}>
          {busy ? "Please wait…" : mode === "login" ? "Login" : "Sign up"}
        </button>
        <p className="hint">
          {mode === "login" ? "New here? " : "Already have an account? "}
          <button type="button" className="link" onClick={() => setMode(mode === "login" ? "signup" : "login")}>
            {mode === "login" ? "Create an account" : "Login"}
          </button>
        </p>
        {busy && <p className="hint">The server may take up to a minute to wake up on the first request.</p>}
      </form>
    </div>
  );
}
