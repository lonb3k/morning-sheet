import { fmtNum, fmtSigned } from "@/lib/format";
import type { Idea } from "@/lib/types";

function toneOf(v: number | null): "pos" | "neg" | "neutral" {
  if (v === null) return "neutral";
  return v > 0 ? "pos" : v < 0 ? "neg" : "neutral";
}

export default function IdeaCard({ idea }: { idea: Idea }) {
  const s = idea.stats;
  return (
    <article className={`idea ${idea.rank === 1 ? "top" : ""}`}>
      <div className="idea-head">
        <span className="rank">{idea.rank}</span>
        <div style={{ minWidth: 0 }}>
          <h3>{idea.title}</h3>
          <div className="instrument">{idea.instrument}</div>
        </div>
        <span className="pill">{idea.direction}</span>
      </div>
      <div className="cond">
        <b>if</b> {idea.condition}
      </div>
      <p className="thesis">{idea.thesis}</p>
      <div className="stats">
        <div className={`stat ${toneOf(s.expected)}`}>
          <div className="k">Expected</div>
          <div className="v">{fmtSigned(s.expected, 2)}</div>
          <div className="u">{s.expected_unit}</div>
        </div>
        <div className="stat">
          <div className="k">Hit ratio</div>
          <div className="v">{s.hit === null || s.hit === undefined ? "–" : `${fmtNum(s.hit, 0)}%`}</div>
          <div className="u">share of winners</div>
        </div>
        <div className={`stat ${toneOf(s.worst)}`}>
          <div className="k">Worst case</div>
          <div className="v">{fmtSigned(s.worst, 1)}</div>
          <div className="u">
            {s.worst_unit ?? ""}
            {s.worst_date ? ` · ${s.worst_date}` : ""}
          </div>
        </div>
        <div className="stat">
          <div className="k">Sample</div>
          <div className="v">{s.n.toLocaleString("en-US")}</div>
          <div className="u">{s.sample ?? "observations"}</div>
        </div>
      </div>
      {s.unconditional && <div className="footnote">Unconditional: {s.unconditional}</div>}
    </article>
  );
}
