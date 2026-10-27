import { fmtNum, splitEmphasis } from "@/lib/format";
import type { Section } from "@/lib/types";

function Cell({ v, i }: { v: string | number | null; i: number }) {
  if (v === null || v === undefined) return <td>–</td>;
  if (typeof v === "number") {
    const digits = Number.isInteger(v) ? 0 : Math.abs(v) < 10 ? 2 : 1;
    return <td>{fmtNum(v, digits)}</td>;
  }
  return <td className={i === 0 ? "" : "txt"}>{v}</td>;
}

export default function SectionBlock({ s }: { s: Section }) {
  return (
    <section className="section">
      <h3>{s.title}</h3>
      {s.paragraphs.map((p, i) => (
        <p key={i}>
          {splitEmphasis(p).map((part, j) => (part.em ? <em key={j}>{part.text}</em> : <span key={j}>{part.text}</span>))}
        </p>
      ))}
      {s.table && (
        <div className="tbl-wrap">
          <table>
            <thead>
              <tr>
                {s.table.columns.map((c, i) => (
                  <th key={i} className={i === 0 ? "txt" : undefined}>{c}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {s.table.rows.map((r, i) => (
                <tr key={i}>
                  {r.map((v, j) => (
                    <Cell key={j} v={v} i={j} />
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
