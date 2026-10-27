import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ChartsAnnex from "@/components/ChartsAnnex";
import IdeaCard from "@/components/IdeaCard";
import SectionBlock from "@/components/SectionBlock";
import Tile from "@/components/Tile";
import { fmtDate, fmtDateTime } from "@/lib/format";
import { PROJECTS, projectFor } from "@/lib/projects";
import { loadSheet } from "@/lib/sheets";

export const revalidate = 1800;
export const dynamicParams = false;

export function generateStaticParams() {
  return PROJECTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const p = projectFor(slug);
  return { title: p ? `${p.name} morning sheet` : "Morning sheet", description: p?.short };
}

export default async function SheetPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = projectFor(slug);
  if (!project) notFound();
  const sheet = await loadSheet(slug).catch(() => null);
  if (!sheet) {
    return (
      <div className="page-head">
        <div className="kicker">{project.name}</div>
        <h1>Sheet unavailable</h1>
        <p className="sub">
          The JSON at github.com/{project.repo}/sheet/latest.json could not be read. It is regenerated every weekday after the US close.
        </p>
      </div>
    );
  }
  return (
    <>
      <header className="page-head">
        <div className="kicker">
          {fmtDate(sheet.as_of)} · generated {fmtDateTime(sheet.generated_at)}
        </div>
        <h1>{sheet.title} morning sheet</h1>
        <p className="sub">{sheet.subtitle}</p>
      </header>
      <p className="lede">{sheet.headline}</p>

      <section className="tiles" aria-label="Headline numbers">
        {sheet.tiles.map((t, i) => (
          <Tile key={i} t={t} />
        ))}
      </section>

      <div className="grid">
        <div>
          <div className="col-title">
            <h2>Trade ideas, ranked</h2>
            <span className="rule" />
          </div>
          <div className="ideas">
            {sheet.ideas.map((idea) => (
              <IdeaCard key={idea.rank} idea={idea} />
            ))}
          </div>
          <p className="footnote" style={{ marginTop: 10 }}>{sheet.method}</p>
        </div>
        <div>
          <div className="col-title">
            <h2>The read</h2>
            <span className="rule" />
          </div>
          {sheet.sections.map((s, i) => (
            <SectionBlock key={i} s={s} />
          ))}
        </div>
      </div>

      <div style={{ height: 28 }} />
      <ChartsAnnex charts={sheet.charts} />

      <div className="notes">
        <div>
          <h4>Caveats</h4>
          <ul>
            {sheet.caveats.map((c, i) => (
              <li key={i}>{c}</li>
            ))}
          </ul>
        </div>
        <div>
          <h4>Source</h4>
          <ul>
            <li>
              Code and data: <a href={sheet.links.repo} target="_blank" rel="noreferrer">{sheet.links.repo.replace("https://", "")}</a>
            </li>
            <li>Full interactive app: <span className="mono">{sheet.links.streamlit}</span></li>
            <li>This page reads <span className="mono">sheet/latest.json</span>, rebuilt by GitHub Actions on weekdays after the close.</li>
            {sheet.warnings.length > 0 && <li>Build warnings: {sheet.warnings.join("; ")}</li>}
          </ul>
        </div>
      </div>
    </>
  );
}
