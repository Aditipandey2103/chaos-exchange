// Change CURRENCY here if your simulation isn't in rupees.
const CURRENCY = "INR";

const moneyFmt = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: CURRENCY,
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export const money = (n: number) => moneyFmt.format(n);

export const num = (n: number, digits = 2) =>
  n.toLocaleString("en-IN", { minimumFractionDigits: digits, maximumFractionDigits: digits });

export const signed = (n: number) => (n > 0 ? "+" : "") + num(n);

export const pct = (n: number) => (n > 0 ? "+" : "") + n.toFixed(2) + "%";

export const dir = (n: number): "up" | "down" | "flat" => (n > 0 ? "up" : n < 0 ? "down" : "flat");

export const pctChange = (price: number, open: number | undefined) =>
  open && open !== 0 ? ((price - open) / open) * 100 : 0;
