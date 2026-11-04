import { splitEmphasis } from "@/lib/format";
import type { Section } from "@/lib/types";
import SortableTable from "./SortableTable";

export default function SectionBlock({ s }: { s: Section }) {
  return (
    <section className="section">
      <h3>{s.title}</h3>
      {s.paragraphs.map((p, i) => (
        <p key={i}>
          {splitEmphasis(p).map((part, j) => (part.em ? <em key={j}>{part.text}</em> : <span key={j}>{part.text}</span>))}
        </p>
      ))}
      {s.table && <SortableTable table={s.table} />}
    </section>
  );
}
