/** The three research projects and the simulated book built on them. Each one commits `sheet/latest.json` every weekday after the US close. */
export const PROJECTS = [
  {
    slug: "vol",
    name: "Volatility",
    short: "Realized vs implied, term structure, skew, the VIX rebuilt, HAR forecasts, straddle P&L",
    repo: "lonb3k/vol-dashboard",
    dir: "vol_dashboard",
    port: 8501,
  },
  {
    slug: "dispersion",
    name: "Dispersion",
    short: "Implied vs realized correlation on the S&P 500 top-50, the book priced from 50 chains",
    repo: "lonb3k/dispersion",
    dir: "dispersion",
    port: 8502,
  },
  {
    slug: "basket",
    name: "Basket",
    short: "Six risk-based weighting schemes walk-forward, vol targeting, Mag 7 cap",
    repo: "lonb3k/basket-optimizer",
    dir: "basket_optimizer",
    port: 8503,
  },
  {
    slug: "book",
    name: "Book",
    short: "Simulated derivatives book on the three projects' marks: daily P&L explain, risk against limits, axes",
    repo: "lonb3k/trading-book",
    dir: "trading_book",
    port: 8504,
  },
] as const;

export type Slug = (typeof PROJECTS)[number]["slug"];

/** Seconds between re-reads of the JSON on the server (ISR). Must stay a literal where pages export it. */
export const REVALIDATE_SECONDS = 1800;

export function projectFor(slug: string) {
  return PROJECTS.find((p) => p.slug === slug);
}

export function rawUrl(repo: string) {
  return `https://raw.githubusercontent.com/${repo}/main/sheet/latest.json`;
}
