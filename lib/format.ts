export function fmtNum(v: number | null | undefined, digits = 1): string {
  if (v === null || v === undefined || Number.isNaN(v)) return "–";
  if (Math.abs(v) >= 10000) return v.toLocaleString("en-US", { maximumFractionDigits: 0 });
  return v.toLocaleString("en-US", { minimumFractionDigits: digits, maximumFractionDigits: digits });
}

export function fmtSigned(v: number | null | undefined, digits = 1): string {
  if (v === null || v === undefined || Number.isNaN(v)) return "–";
  const s = fmtNum(Math.abs(v), digits);
  return v > 0 ? `+${s}` : v < 0 ? `−${s}` : s;
}

/** Digits for a tile value: integers for prices, otherwise one decimal (two for small ratios). */
export function tileDigits(v: number | null, unit: string): number {
  if (v === null) return 1;
  if (unit.startsWith("k$") || unit === "trades") return 0;   // the book: thousands of dollars, counts
  if (unit === "m$") return 2;
  if (unit === "" && Math.abs(v) >= 100) return 0;
  if (unit === "" && Math.abs(v) < 10) return 2;
  if (unit === "x") return 2;
  return 1;
}

export function fmtDate(iso: string): string {
  const d = new Date(iso + (iso.length === 10 ? "T00:00:00Z" : ""));
  return d.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
}

export function fmtDateTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", timeZone: "UTC" }) + " UTC";
}

/** Tiny inline emphasis: *text* becomes <em>. Nothing else is interpreted. */
export function splitEmphasis(text: string): { text: string; em: boolean }[] {
  return text.split(/\*([^*]+)\*/g).map((part, i) => ({ text: part, em: i % 2 === 1 })).filter((p) => p.text.length > 0);
}
