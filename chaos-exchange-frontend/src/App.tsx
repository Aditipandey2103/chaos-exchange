import { Route, Routes } from "react-router-dom";
import { Layout } from "./components/Layout";
import Leaderboard from "./pages/Leaderboard";
import Login from "./pages/Login";
import Market from "./pages/Market";
import Portfolio from "./pages/Portfolio";
import Stock from "./pages/Stock";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Market />} />
        <Route path="stock/:id" element={<Stock />} />
        <Route path="portfolio" element={<Portfolio />} />
        <Route path="leaderboard" element={<Leaderboard />} />
        <Route path="login" element={<Login />} />
        <Route path="*" element={<div className="panel"><p className="empty">Page not found.</p></div>} />
      </Route>
    </Routes>
  );
}
