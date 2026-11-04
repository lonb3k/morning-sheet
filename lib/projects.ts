/** The three research projects, the simulated book built on them, and the vol dashboard's corporate-hedging note.
 * Each one commits its JSON under `sheet/` every weekday after the US close. */
export const PROJECTS = [
  {
    slug: "vol",
    accent: "var(--blue)",
    tagline: "Equity and commodity vol",
    app: "https://lonb3k-vol-dashboard.streamlit.app",
    name: "Volatility",
    short: "Realized vs implied, term structure, skew, the VIX rebuilt, HAR forecasts, straddle P&L",
    repo: "lonb3k/vol-dashboard",
    dir: "vol_dashboard",
    port: 8501,
    file: "latest.json",
  },
  {
    slug: "dispersion",
    accent: "var(--orange)",
    tagline: "Implied vs realized correlation",
    app: "https://lonb3k-dispersion.streamlit.app",
    name: "Dispersion",
    short: "Implied vs realized correlation on the S&P 500 top-50, the book priced from 50 chains",
    repo: "lonb3k/dispersion",
    dir: "dispersion",
    port: 8502,
    file: "latest.json",
  },
  {
    slug: "basket",
    accent: "var(--aqua)",
    tagline: "Risk-based baskets",
    app: "https://lonb3k-basket-optimizer.streamlit.app",
    name: "Basket",
    short: "Six risk-based weighting schemes walk-forward, vol targeting, Mag 7 cap",
    repo: "lonb3k/basket-optimizer",
    dir: "basket_optimizer",
    port: 8503,
    file: "latest.json",
  },
  {
    slug: "book",
    accent: "var(--violet)",
    tagline: "Simulated exotics book",
    app: "",
    name: "Book",
    short: "Simulated derivatives book on the three projects' marks: daily P&L explain, risk against limits, axes",
    repo: "lonb3k/trading-book",
    dir: "trading_book",
    port: 8504,
    file: "latest.json",
  },
  {
    slug: "hedging",
    accent: "var(--yellow)",
    tagline: "Corporate commodity hedging",
    app: "https://lonb3k-vol-dashboard.streamlit.app",
    name: "Hedging",
    short: "Weekly corporate-hedging note: what a forward locks in and what optionality costs, energy, metals and grains",
    repo: "lonb3k/vol-dashboard",
    dir: "vol_dashboard",
    port: 8501,
    file: "hedging.json",
  },
] as const;

export type Slug = (typeof PROJECTS)[number]["slug"];

/** Seconds between re-reads of the JSON on the server (ISR). Must stay a literal where pages export it. */
export const REVALIDATE_SECONDS = 1800;

export function projectFor(slug: string) {
  return PROJECTS.find((p) => p.slug === slug);
}

export function rawUrl(repo: string, file: string = "latest.json") {
  return `https://raw.githubusercontent.com/${repo}/main/sheet/${file}`;
}
