# Morning sheets

One site, four desk notes, regenerated every weekday from free market data:

| Sheet | Source project | What it reads |
|---|---|---|
| `/vol` | [lonb3k/vol-dashboard](https://github.com/lonb3k/vol-dashboard) | VIX vs realized, term structure, the VIX minus HAR+IV gap, crude curve regime, FOMC pricing, delta-hedged straddle P&L |
| `/dispersion` | [lonb3k/dispersion](https://github.com/lonb3k/dispersion) | COR1M vs our implied correlation from 50 chains, realized correlation, the vega-weighted book at trailing vols, the correlation swap |
| `/basket` | [lonb3k/basket-optimizer](https://github.com/lonb3k/basket-optimizer) | Today's risk-parity weights, the vol-target leverage, the regime, which basket to hold this month |
| `/book` | [lonb3k/trading-book](https://github.com/lonb3k/trading-book) | A simulated derivatives book marked on the three projects' data: daily P&L explain, risk against limits, the desk's axes |

Each page is a note: headline tiles with sparklines, sentences with the numbers filled in, two to
four trade ideas ranked by **historical conditional expectation against historical worst case**
(on `/book`, the desk's axes ranked by limit usage),
and the project's own Plotly figures as an annex.

## How it works

```
project repo            GitHub Actions (weekdays, after the US close)         this site (Vercel)
src/<pkg>/sheet.py  ->  python scripts/build_sheet.py  ->  sheet/latest.json  ->  fetched with ISR (30 min)
```

- Every number comes from a function that already exists in the project's `src/`. `sheet.py` only
  calls them and writes sentences.
- The site is Next.js 15 (App Router). Pages read `https://raw.githubusercontent.com/<repo>/main/sheet/latest.json`
  on the server and revalidate every 30 minutes, so a new commit of the JSON shows up without a redeploy.
- Charts are the projects' Plotly figures, serialized to JSON on the Python side (template stripped,
  dates shortened, series thinned to 500 points) and rendered client-side with the same hues
  stepped for a dark surface (the validated palette: blue `#3987e5`, orange `#d95926`, aqua
  `#199e70`, red `#e66767`).

## The JSON contract

```jsonc
{
  "project": "vol_dashboard", "slug": "vol", "title": "Volatility", "subtitle": "...",
  "as_of": "2026-10-27", "generated_at": "2026-10-27T22:20:11Z",
  "headline": "one paragraph",
  "tiles":    [{ "label", "value", "unit", "sub", "tone": "pos|neg|neutral", "spark": [..60 numbers] }],
  "sections": [{ "title", "paragraphs": ["..."], "table": { "columns": [], "rows": [[]] } }],
  "ideas":    [{ "rank", "title", "direction", "instrument", "condition", "thesis",
                 "stats": { "expected", "expected_unit", "hit", "worst", "worst_unit", "worst_date", "n", "sample", "unconditional" },
                 "score" }],
  "charts":   [{ "id", "title", "figure": { "data": [...], "layout": {...} } }],
  "method": "...", "caveats": ["..."], "warnings": ["..."], "links": { "repo", "streamlit" }
}
```

## Run locally

```bash
npm install
SHEET_LOCAL_ROOT=/path/to/trd npm run dev      # reads ../<project>/sheet/latest.json from disk
npm run dev                                     # reads the JSON committed on GitHub
```

The Streamlit apps stay the full interactive version of each project, hosted on Streamlit Community
Cloud ([vol](https://lonb3k-vol-dashboard.streamlit.app), [dispersion](https://lonb3k-dispersion.streamlit.app),
[basket](https://lonb3k-basket-optimizer.streamlit.app)); each sheet links to its app.

## Deploy

The Vercel project `morning-sheet` (account ramzan-7284) is not linked to GitHub: the Vercel GitHub app
is not installed on that account. Deployments are created through the Vercel API with the source files
inline (`create_deployment` with `files`; unchanged files can be referenced by SHA1 and size). The
production alias is https://morning-sheet-olive.vercel.app. Because the pages revalidate the
JSON every 30 minutes, the daily data refresh needs no redeploy; only code changes do.

`scripts/record_gif.py <url> <out.gif>` records the 30-second scrolling tour used at the top of each
project README (Playwright + Pillow).
