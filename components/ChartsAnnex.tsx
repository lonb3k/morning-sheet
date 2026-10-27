import PlotlyChart from "./PlotlyChart";
import type { Chart } from "@/lib/types";

export default function ChartsAnnex({ charts }: { charts: Chart[] }) {
  if (!charts.length) return null;
  return (
    <section id="charts">
      <div className="col-title">
        <h2>Annex: charts</h2>
        <span className="rule" />
        <span className="muted" style={{ fontSize: 12 }}>{charts.length} figures from the Streamlit app, interactive</span>
      </div>
      <div className="charts">
        {charts.map((c) => (
          <PlotlyChart key={c.id} chart={c} />
        ))}
      </div>
    </section>
  );
}
