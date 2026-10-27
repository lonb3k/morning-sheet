import Link from "next/link";
import Tile from "@/components/Tile";
import { fmtDate } from "@/lib/format";
import { PROJECTS } from "@/lib/projects";
import { loadAll } from "@/lib/sheets";

export const revalidate = 1800;

export default async function Home() {
  const sheets = await loadAll();
  const asOf = sheets.find((s) => s.sheet)?.sheet?.as_of;
  return (
    <>
      <section className="hero">
        <div className="kicker">{asOf ? fmtDate(asOf) : "Daily"} · three desk notes, generated from free data</div>
        <h1>The market, read for you before the open.</h1>
        <p>
          Each sheet runs the research code of one project on the latest close and writes what a desk would say: where
          volatility, correlation and risk sit against their history, and which trades the numbers argue for, with their
          conditional expectation and their historical worst case.
        </p>
      </section>
      <section className="cards">
        {PROJECTS.map((p) => {
          const sheet = sheets.find((s) => s.slug === p.slug)?.sheet ?? null;
          return (
            <Link key={p.slug} href={`/${p.slug}`} className="card">
              <div>
                <div className="kicker">{p.slug}</div>
                <h2>{p.name}</h2>
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
                  <span className="cta">Open the sheet →</span>
                </>
              ) : (
                <p className="err">Sheet unavailable right now. It is regenerated every weekday after the US close.</p>
              )}
            </Link>
          );
        })}
      </section>
    </>
  );
}
