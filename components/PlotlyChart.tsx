"use client";

import { useEffect, useRef, useState } from "react";
import type { Chart } from "@/lib/types";

/* The Python side draws on a light surface with the validated light palette. The same hues have
   dark-surface steps (see the dataviz palette); swap them here so the figures keep their identity. */
const COLOR_MAP: Record<string, string> = {
  "#2a78d6": "#3987e5", "#eb6834": "#d95926", "#1baf7a": "#199e70", "#eda100": "#c98500",
  "#e87ba4": "#d55181", "#008300": "#2ea043", "#6250d6": "#9085e9", "#e34948": "#e66767",
  // sequential blues: invert so the outer (lightest) band recedes into the dark surface
  "#cde2fb": "#163f75", "#9ec5f4": "#1c5cab", "#6da7ec": "#2a78d6", "#3987e5": "#3987e5",
  "#256abf": "#5598e7", "#184f95": "#86b6ef", "#0d366b": "#b7d3f6",
  // ink and grid
  "#0b0b0b": "#e6e9ef", "#52514e": "#8b94a7", "#e6e5e1": "#232b3a",
  "rgba(27,175,122,0.35)": "rgba(25,158,112,0.35)", "rgba(227,73,72,0.35)": "rgba(230,103,103,0.35)",
};

function recolor<T>(obj: T): T {
  if (typeof obj === "string") {
    const k = obj.toLowerCase();
    return (COLOR_MAP[k] ?? obj) as T;
  }
  if (Array.isArray(obj)) return obj.map(recolor) as T;
  if (obj && typeof obj === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(obj as Record<string, unknown>)) out[k] = recolor(v);
    return out as T;
  }
  return obj;
}

type PlotlyLib = {
  newPlot: (el: HTMLElement, data: unknown, layout?: unknown, config?: unknown) => Promise<unknown>;
  purge: (el: HTMLElement) => void;
};

const FONT = 'var(--font-plex-sans), "IBM Plex Sans", -apple-system, Helvetica, Arial, sans-serif';

function darkLayout(layout: Record<string, unknown>, width: number): Record<string, unknown> {
  const l = recolor(layout) as Record<string, unknown>;
  const axis = (a: unknown) => {
    const src = typeof a === "object" && a ? (a as Record<string, unknown>) : {};
    const t = src.title;
    const title = typeof t === "string" ? { text: t } : typeof t === "object" && t ? (t as Record<string, unknown>) : {};
    return {
      gridcolor: "#1c2433", linecolor: "#2d3848", zerolinecolor: "#3a4556", tickcolor: "#2d3848",
      ...src,
      tickfont: { color: "#8b94a7", size: 11 },
      title: { ...title, font: { color: "#8b94a7", size: 11 }, standoff: 8 },
    };
  };
  const height = typeof l.height === "number" ? Math.min(l.height, width < 640 ? 300 : 420) : 360;
  const title = (l.title && typeof l.title === "object" ? (l.title as Record<string, unknown>) : {}) as Record<string, unknown>;
  // Plotly does not wrap titles: break long ones in two near the middle, at a space
  const maxChars = Math.max(40, Math.floor(width / 8));
  let text = typeof title.text === "string" ? title.text : "";
  let lines = 1;
  if (text.length > maxChars) {
    const cut = text.lastIndexOf(" ", Math.floor(text.length / 2) + 12);
    if (cut > 10) { text = text.slice(0, cut) + "<br>" + text.slice(cut + 1); lines = 2; }
  }
  const margin = (l.margin && typeof l.margin === "object" ? (l.margin as Record<string, number>) : {}) as Record<string, number>;
  return {
    ...l,
    autosize: true, width: undefined, height,
    paper_bgcolor: "rgba(0,0,0,0)", plot_bgcolor: "rgba(0,0,0,0)",
    font: { family: FONT, size: 12, color: "#aab2c2" },
    title: { ...title, text, font: { size: 13, color: "#e6e9ef" }, x: 0.01, xanchor: "left", yref: "container", y: 1, yanchor: "top", pad: { t: 10 } },
    legend: { ...((l.legend as Record<string, unknown>) ?? {}), font: { color: "#8b94a7", size: 11 }, bgcolor: "rgba(0,0,0,0)" },
    xaxis: { ...axis(l.xaxis), automargin: true }, yaxis: { ...axis(l.yaxis), automargin: true },
    margin: { l: Math.max(margin.l ?? 0, 44), r: Math.max(margin.r ?? 0, 16), t: 84 + (lines - 1) * 18, b: Math.max(margin.b ?? 0, 40) },
    hoverlabel: { bgcolor: "#161c27", bordercolor: "#2d3848", font: { color: "#e6e9ef", family: FONT, size: 12 } },
    colorway: ["#3987e5", "#d95926", "#199e70", "#c98500", "#d55181", "#2ea043", "#9085e9", "#e66767"],
  };
}

export default function PlotlyChart({ chart }: { chart: Chart }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) {
        setVisible(true);
        io.disconnect();
      }
    }, { rootMargin: "300px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!visible || !ref.current) return;
    const el = ref.current;
    let cancelled = false;
    let plotly: PlotlyLib | null = null;
    const draw = async () => {
      try {
        const mod = (await import("plotly.js-dist-min")) as unknown as { default?: PlotlyLib } & PlotlyLib;
        plotly = mod.default ?? mod;
        if (cancelled) return;
        const data = recolor(chart.figure.data) as Record<string, unknown>[];
        const layout = darkLayout(chart.figure.layout, el.clientWidth);
        await plotly.newPlot(el, data as never, layout as never, { responsive: true, displayModeBar: false, displaylogo: false });
      } catch (e) {
        console.error(chart.id, e);
        setFailed(true);
      }
    };
    draw();
    return () => {
      cancelled = true;
      if (plotly) plotly.purge(el);
    };
  }, [visible, chart]);

  return (
    <div className="chart">
      <div ref={ref} className="plot">
        {!visible && !failed && <div className="placeholder">{chart.title}</div>}
        {failed && <div className="placeholder">Chart unavailable: {chart.title}</div>}
      </div>
    </div>
  );
}
