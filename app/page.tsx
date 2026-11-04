import Link from "next/link";
import Icon from "@/components/Icon";
import { PaletteButton } from "@/components/Nav";
import Tile from "@/components/Tile";
import { fmtDate } from "@/lib/format";
import { PROJECTS } from "@/lib/projects";
import { loadAll } from "@/lib/sheets";

export const revalidate = 1800;

const STEPS = [
  { k: "1", t: "The close", d: "Yahoo Finance and CBOE closes: futures curves, vol indices, 50 option chains, prices since 2005." },
  { k: "2", t: "The research code", d: "Each project's Python reruns its backtests and models on the new data, tested on every push." },
  { k: "3", t: "The desk note", d: "Rules turn the numbers into sentences: where vol, correlation and risk sit, and what a client could do about it." },
];

export default async function Home() {
  const sheets = await loadAll();
  const asOf = sheets.map((s) => s.sheet?.as_of ?? "").sort().at(-1) || undefined;
  const charts = sheets.reduce((n, s) => n + (s.sheet?.charts.length ?? 0), 0);
  const ideas = sheets.reduce((n, s) => n + (s.sheet?.ideas.length ?? 0), 0);
  return (
    <>
      <section className="hero">
        <div className="kicker"><span className="live" aria-hidden />{asOf ? `Updated ${fmtDate(asOf)}` : "Updated every weekday"}</div>
        <h1>Five desk sheets, rebuilt from every close.</h1>
        <p>
          Volatility, correlation, baskets, a simulated exotics book and corporate commodity hedging. Each sheet runs a
          research project on the latest data and writes what a desk would say, with the numbers behind every sentence.
        </p>
        <div className="hero-actions">
          <Link href="/hedging#calculator" className="btn primary"><Icon name="calc" size={16} />Price a hedge</Link>
          <PaletteButton />
        </div>
        <div className="hero-stats">
          <div><b>{PROJECTS.length}</b><span>sheets</span></div>
          <div><b>{ideas}</b><span>ranked ideas today</span></div>
          <div><b>{charts}</b><span>interactive charts</span></div>
          <div><b>22:15</b><span>UTC rebuild, weekdays</span></div>
        </div>
      </section>

      <div className="col-title" id="sheets"><h2>The sheets</h2><span className="rule" /></div>
      <section className="cards">
        {PROJECTS.map((p) => {
          const sheet = sheets.find((s) => s.slug === p.slug)?.sheet ?? null;
          return (
            <Link key={p.slug} href={`/${p.slug}`} className="card" style={{ "--c": p.accent } as React.CSSProperties}>
              <div className="card-head">
                <span className="card-icon"><Icon name={p.slug} size={20} /></span>
                <div>
                  <h2>{p.name}</h2>
                  <div className="card-tag">{p.tagline}</div>
                </div>
                <Icon name="arrow" size={18} className="card-go" />
              </div>
              <p className="short">{p.short}</p>
              {sheet ? (
                <>
                  <div className="mini">
                    {sheet.tiles.slice(0, 3).map((t, i) => (
                      <Tile key={i} t={t} compact />
                    ))}
                  </div>
                  <p className="headline">{sheet.headline}</p>
                </>
              ) : (
                <p className="err">Sheet unavailable right now. It is regenerated every weekday after the US close.</p>
              )}
            </Link>
          );
        })}
      </section>

      <div className="col-title"><h2>How a sheet is made</h2><span className="rule" /></div>
      <section className="steps">
        {STEPS.map((s) => (
          <div key={s.k} className="step">
            <span className="step-k">{s.k}</span>
            <h3>{s.t}</h3>
            <p>{s.d}</p>
          </div>
        ))}
      </section>
    </>
  );
}
