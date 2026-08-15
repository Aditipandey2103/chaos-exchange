"use client";

import { useEffect, useState } from "react";
import { getCompanies } from "../lib/api";
import {
  Activity,
  BarChart3,
  BriefcaseBusiness,
  ChevronRight,
  Circle,
  Newspaper,
  Trophy,
  Wallet,
} from "lucide-react";

const companies = [
  {
    name: "Dragon Airlines",
    ticker: "DRGN",
    price: 142.35,
    change: 4.82,
    positive: true,
    chart: [35, 42, 38, 52, 47, 61, 56, 72, 68, 81, 75, 92],
  },
  {
    name: "Moon Pizza",
    ticker: "MOON",
    price: 87.42,
    change: -2.14,
    positive: false,
    chart: [90, 82, 85, 72, 76, 64, 69, 55, 61, 47, 52, 39],
  },
  {
    name: "CoffeeOS",
    ticker: "CFOS",
    price: 231.9,
    change: 8.31,
    positive: true,
    chart: [30, 35, 33, 45, 42, 57, 53, 65, 61, 76, 72, 94],
  },
];

const news = [
  {
    ticker: "DRGN",
    headline: "Dragon Airlines discovers fireproof dragons",
    sentiment: "POSITIVE",
  },
  {
    ticker: "MOON",
    headline: "Moon Pizza CEO accidentally eats company profits",
    sentiment: "NEGATIVE",
  },
  {
    ticker: "CFOS",
    headline: "CoffeeOS launches caffeine-powered servers",
    sentiment: "POSITIVE",
  },
];

export default function Home() {
  const [activeNav, setActiveNav] = useState("Markets");

  const [backendCompanies, setBackendCompanies] = useState([]);

  useEffect(() => {
    async function loadCompanies() {
      try {
        const data = await getCompanies();

        console.log("BACKEND COMPANIES:", data);

        setBackendCompanies(data);
      } catch (error) {
        console.error("BACKEND ERROR:", error);
      }
    }

    loadCompanies();
  }, []);

  return (
    <main className="min-h-screen bg-[#0b0e11] text-[#e6e8eb]">

      {/* NAVBAR */}
      <nav className="border-b border-white/[0.08] bg-[#0b0e11]">
        <div className="mx-auto flex h-16 max-w-[1400px] items-center justify-between px-5">

          {/* BRAND */}
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center border border-white/[0.08] bg-[#12161b]">
              <Activity size={17} strokeWidth={1.8} />
            </div>

            <div>
              <div className="text-sm font-semibold tracking-tight">
                CHAOS EXCHANGE
              </div>

              <div className="text-[9px] tracking-[0.2em] text-[#5f6672]">
                SIMULATED MARKETS
              </div>
            </div>
          </div>

          {/* NAVIGATION */}
          <div className="hidden h-full items-center md:flex">
            {[
              {
                name: "Markets",
                icon: <BarChart3 size={15} />,
              },
              {
                name: "Portfolio",
                icon: <BriefcaseBusiness size={15} />,
              },
              {
                name: "Leaderboard",
                icon: <Trophy size={15} />,
              },
            ].map((item) => (
              <button
                key={item.name}
                onClick={() => setActiveNav(item.name)}
                className={`flex h-full items-center gap-2 border-b-2 px-5 text-xs transition ${
                  activeNav === item.name
                    ? "border-[#3b82f6] text-[#e6e8eb]"
                    : "border-transparent text-[#8b92a0] hover:text-[#e6e8eb]"
                }`}
              >
                {item.icon}
                {item.name}
              </button>
            ))}
          </div>

          {/* ACCOUNT */}
          <div className="flex items-center gap-5">

            <div className="hidden text-right sm:block">
              <div className="text-[9px] tracking-wider text-[#5f6672]">
                AVAILABLE CASH
              </div>

              <div className="mono mt-0.5 text-sm text-[#e6e8eb]">
                ₹100,000.00
              </div>
            </div>

            <div className="flex h-8 w-8 items-center justify-center border border-white/[0.08] bg-[#12161b] text-xs">
              AS
            </div>
          </div>
        </div>
      </nav>

      {/* CONTENT */}
      <div className="mx-auto max-w-[1400px] px-5 py-7">

        {/* MARKET HEADER */}
        <div className="mb-7 flex items-end justify-between">

          <div>
            <div className="mb-2 flex items-center gap-2">
              <Circle
                size={7}
                fill="#3b82f6"
                color="#3b82f6"
              />

              <span className="text-[10px] font-medium tracking-[0.18em] text-[#8b92a0]">
                MARKET OPEN
              </span>
            </div>

            <h1 className="text-2xl font-semibold tracking-tight">
              Markets
            </h1>

            <p className="mt-1 text-xs text-[#5f6672]">
              Fictional assets. Real-time price movement.
            </p>
          </div>

          <div className="hidden items-center gap-2 text-[10px] text-[#5f6672] sm:flex">
            <span className="h-1.5 w-1.5 rounded-full bg-[#3b82f6]" />
            LIVE MARKET DATA
          </div>
        </div>

        {/* SUMMARY */}
        <section className="mb-8 grid grid-cols-1 border border-white/[0.08] bg-[#12161b] sm:grid-cols-3">

          <Metric
            icon={<Wallet size={15} />}
            label="AVAILABLE CASH"
            value="₹100,000.00"
          />

          <Metric
            icon={<BriefcaseBusiness size={15} />}
            label="PORTFOLIO VALUE"
            value="₹100,000.00"
          />

          <Metric
            icon={<Activity size={15} />}
            label="TODAY'S P&L"
            value="₹0.00"
            subvalue="0.00%"
            positive
          />

        </section>

        {/* MARKET TABLE */}
        <section className="border border-white/[0.08] bg-[#12161b]">

          {/* TABLE HEADER */}
          <div className="flex items-center justify-between border-b border-white/[0.08] px-4 py-3">

            <div>
              <h2 className="text-sm font-medium">
                Market Watch
              </h2>

              <p className="mt-0.5 text-[10px] text-[#5f6672]">
                Live fictional equities
              </p>
            </div>

            <div className="flex items-center gap-2 text-[9px] tracking-wider text-[#5f6672]">
              <Circle
                size={6}
                fill="#3b82f6"
                color="#3b82f6"
              />
              STREAMING
            </div>
          </div>

          {/* COLUMN HEADER */}
          <div className="hidden grid-cols-[2fr_1fr_1fr_120px_100px] border-b border-white/[0.06] px-4 py-2 text-[9px] tracking-wider text-[#5f6672] md:grid">
            <span>COMPANY</span>
            <span>PRICE</span>
            <span>CHANGE</span>
            <span>CHART</span>
            <span />
          </div>

          {/* COMPANIES */}
          {companies.map((company) => (
            <CompanyRow
              key={company.ticker}
              company={company}
            />
          ))}
        </section>

        {/* NEWS */}
        <section className="mt-7 border border-white/[0.08] bg-[#12161b]">

          <div className="flex items-center justify-between border-b border-white/[0.08] px-4 py-3">

            <div className="flex items-center gap-2">
              <Newspaper size={15} />

              <div>
                <h2 className="text-sm font-medium">
                  Market News
                </h2>

                <p className="text-[10px] text-[#5f6672]">
                  AI-generated events affecting prices
                </p>
              </div>
            </div>

            <span className="text-[9px] tracking-wider text-[#5f6672]">
              LIVE FEED
            </span>
          </div>

          {news.map((item, index) => (
            <div
              key={index}
              className="flex flex-col gap-2 border-b border-white/[0.05] px-4 py-3 last:border-b-0 sm:flex-row sm:items-center"
            >

              <span className="mono w-14 text-xs text-[#8b92a0]">
                {item.ticker}
              </span>

              <span className="flex-1 text-xs text-[#c4c8ce]">
                {item.headline}
              </span>

              <span
                className={`text-[9px] font-semibold ${
                  item.sentiment === "POSITIVE"
                    ? "text-[#16c784]"
                    : "text-[#ea3943]"
                }`}
              >
                {item.sentiment}
              </span>
            </div>
          ))}
        </section>

        {/* FOOTER */}
        <div className="mt-6 flex justify-between text-[9px] text-[#454b55]">
          <span>CHAOS EXCHANGE v0.1</span>
          <span>MARKET DATA SIMULATED</span>
        </div>
      </div>
    </main>
  );
}


/* =========================
   METRIC
========================= */

function Metric({
  icon,
  label,
  value,
  subvalue,
  positive,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  subvalue?: string;
  positive?: boolean;
}) {
  return (
    <div className="border-b border-white/[0.08] p-4 last:border-b-0 sm:border-b-0 sm:border-r sm:last:border-r-0">

      <div className="mb-3 flex items-center gap-2 text-[#5f6672]">
        {icon}

        <span className="text-[9px] tracking-wider">
          {label}
        </span>
      </div>

      <div className="mono text-lg tracking-tight text-[#e6e8eb]">
        {value}
      </div>

      {subvalue && (
        <div
          className={`mono mt-1 text-[10px] ${
            positive
              ? "text-[#16c784]"
              : "text-[#ea3943]"
          }`}
        >
          {subvalue}
        </div>
      )}
    </div>
  );
}


/* =========================
   COMPANY ROW
========================= */

function CompanyRow({
  company,
}: {
  company: {
    name: string;
    ticker: string;
    price: number;
    change: number;
    positive: boolean;
    chart: number[];
  };
}) {
  return (
    <div className="grid gap-4 border-b border-white/[0.05] px-4 py-4 transition hover:bg-[#171c22] md:grid-cols-[2fr_1fr_1fr_120px_100px] md:items-center">

      {/* COMPANY */}
      <div className="flex items-center gap-3">

        <div className="flex h-8 w-8 items-center justify-center border border-white/[0.08] bg-[#0b0e11] mono text-[10px] text-[#8b92a0]">
          {company.ticker.slice(0, 2)}
        </div>

        <div>
          <div className="text-xs font-medium">
            {company.name}
          </div>

          <div className="mono mt-0.5 text-[9px] text-[#5f6672]">
            {company.ticker}
          </div>
        </div>
      </div>

      {/* PRICE */}
      <div>
        <div className="mono text-sm tabular-nums">
          ₹{company.price.toFixed(2)}
        </div>

        <div className="text-[9px] text-[#5f6672]">
          INR
        </div>
      </div>

      {/* CHANGE */}
      <div
        className={`mono text-xs ${
          company.positive
            ? "text-[#16c784]"
            : "text-[#ea3943]"
        }`}
      >
        {company.positive ? "+" : ""}
        {company.change.toFixed(2)}%
      </div>

      {/* CHART */}
      <Sparkline
        values={company.chart}
        positive={company.positive}
      />

      {/* ACTION */}
      <button className="flex items-center justify-center gap-1 border border-white/[0.08] px-3 py-2 text-[10px] text-[#8b92a0] transition hover:border-white/[0.16] hover:bg-[#0b0e11] hover:text-white">
        View
        <ChevronRight size={12} />
      </button>

    </div>
  );
}


/* =========================
   SPARKLINE
========================= */

function Sparkline({
  values,
  positive,
}: {
  values: number[];
  positive: boolean;
}) {
  const width = 120;
  const height = 42;

  const min = Math.min(...values);
  const max = Math.max(...values);

  const points = values
    .map((value, index) => {
      const x =
        (index / (values.length - 1)) * width;

      const y =
        height -
        ((value - min) / (max - min || 1)) *
          (height - 4) -
        2;

      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className="hidden md:block"
    >
      <polyline
        points={points}
        fill="none"
        stroke={positive ? "#16c784" : "#ea3943"}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}