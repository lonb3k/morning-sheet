"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { fmtNum, fmtSigned } from "@/lib/format";
import type { CalcMarket, Calculator } from "@/lib/types";

/* ---------- Black-76 on the future, flat vol ---------- */

function ncdf(x: number): number {
  // Abramowitz-Stegun 7.1.26, |error| < 1.5e-7
  const z = Math.abs(x) / Math.SQRT2;
  const t = 1 / (1 + 0.3275911 * z);
  const erf = 1 - ((((1.061405429 * t - 1.453152027) * t + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-z * z);
  return x >= 0 ? 0.5 * (1 + erf) : 0.5 * (1 - erf);
}

function black76(f: number, k: number, t: number, vol: number, call: boolean, r: number): number {
  const df = Math.exp(-r * t);
  const sd = vol * Math.sqrt(t);
  const d1 = (Math.log(f / k) + 0.5 * sd * sd) / sd;
  const d2 = d1 - sd;
  return call ? df * (f * ncdf(d1) - k * ncdf(d2)) : df * (k * ncdf(-d2) - f * ncdf(-d1));
}

/** Strike of the option sold so that it pays for the one bought (zero-cost collar). */
function zeroCostStrike(f: number, bought: number, boughtCall: boolean, t: number, vol: number, r: number): number | null {
  const target = black76(f, bought, t, vol, boughtCall, r);
  const sold = (k: number) => black76(f, k, t, vol, !boughtCall, r) - target;
  // sold call: price falls as the strike rises; sold put: price rises with the strike
  let lo = boughtCall ? 0.01 * f : f;
  let hi = boughtCall ? f : 6 * f;
  if (sold(lo) * sold(hi) > 0) return null;
  for (let i = 0; i < 80; i++) {
    const mid = (lo + hi) / 2;
    if (sold(mid) * sold(lo) > 0) lo = mid;
    else hi = mid;
  }
  return (lo + hi) / 2;
}

/* ---------- formatting ---------- */

function priceDigits(p: number): number {
  return p >= 1000 ? 0 : p >= 100 ? 1 : p >= 10 ? 2 : 3;
}

// A sensible default size per unit, so totals read in dollars a corporate recognises.
const VOLUME: Record<string, { qty: number; label: string }> = {
  bbl: { qty: 100_000, label: "bbl" },
  MMBtu: { qty: 1_000_000, label: "MMBtu" },
  lb: { qty: 1_000_000, label: "lb" },
  t: { qty: 1_000, label: "t" },
  oz: { qty: 10_000, label: "oz" },
  bu: { qty: 1_000_000, label: "bu" },
};

function volumeOf(unit: string) {
  const per = unit.split("/")[1] ?? "";
  return VOLUME[per] ?? { qty: 1_000, label: per || "units" };
}

function dollars(v: number): string {
  const a = Math.abs(v);
  if (a >= 1e6) return `$${fmtNum(v / 1e6, 2)}m`;
  if (a >= 1e3) return `$${fmtNum(v / 1e3, 0)}k`;
  return `$${fmtNum(v, 0)}`;
}

function defaultContract(m: CalcMarket): number {
  // about three months out: the tenor most corporate hedges start with
  let best = 0;
  m.contracts.forEach((c, i) => {
    if (Math.abs(c.days - 90) < Math.abs(m.contracts[best].days - 90)) best = i;
  });
  return best;
}

type Side = "producer" | "consumer";

/** Round tick values (1, 2 or 5 times a power of ten) inside [lo, hi]. */
function niceTicks(lo: number, hi: number, n = 5): number[] {
  const raw = (hi - lo) / n;
  const p = 10 ** Math.floor(Math.log10(raw));
  const step = [1, 2, 5, 10].map((m) => m * p).find((s) => s >= raw) ?? 10 * p;
  const out: number[] = [];
  for (let v = Math.ceil(lo / step) * step; v <= hi + 1e-9; v += step) out.push(v);
  return out;
}

function tickDigits(ticks: number[]): number {
  const step = ticks.length > 1 ? ticks[1] - ticks[0] : 1;
  return step >= 1 ? 0 : Math.min(3, Math.ceil(-Math.log10(step)));
}

/* ---------- payoff chart ---------- */

interface Series {
  key: string;
  label: string;
  color: string;
  dash?: string;
  f: (s: number) => number;
}

function useWidth<T extends HTMLElement>(): [React.RefObject<T | null>, number] {
  const ref = useRef<T>(null);
  const [w, setW] = useState(640);
  useEffect(() => {
    if (!ref.current) return;
    const ro = new ResizeObserver(([e]) => setW(Math.max(280, Math.round(e.contentRect.width))));
    ro.observe(ref.current);
    return () => ro.disconnect();
  }, []);
  return [ref, w];
}

function PayoffChart({ fwd, series, unit, side }: { fwd: number; series: Series[]; unit: string; side: Side }) {
  const [ref, width] = useWidth<HTMLDivElement>();
  const [hover, setHover] = useState<number | null>(null);
  const h = 240;
  const m = { l: 52, r: 18, t: 10, b: 28 };
  const x0 = 0.6 * fwd, x1 = 1.4 * fwd;
  const xs = Array.from({ length: 121 }, (_, i) => x0 + ((x1 - x0) * i) / 120);
  const ys = series.flatMap((s) => xs.map(s.f));
  const y0 = Math.min(...ys), y1 = Math.max(...ys);
  const pad = (y1 - y0) * 0.06;
  const ylo = y0 - pad, yhi = y1 + pad;
  const X = (s: number) => m.l + ((s - x0) / (x1 - x0)) * (width - m.l - m.r);
  const Y = (v: number) => m.t + (1 - (v - ylo) / (yhi - ylo)) * (h - m.t - m.b);
  const d = (s: Series) => xs.map((x, i) => `${i ? "L" : "M"}${X(x).toFixed(1)},${Y(s.f(x)).toFixed(1)}`).join("");
  const dg = priceDigits(fwd);
  const ticks = niceTicks(x0, x1, width < 480 ? 4 : 6);
  const yt = niceTicks(ylo, yhi, 5);
  const xd = tickDigits(ticks), yd = tickDigits(yt);

  const onMove = (e: React.PointerEvent<SVGRectElement>) => {
    const box = (e.currentTarget as SVGRectElement).getBoundingClientRect();
    const frac = Math.min(1, Math.max(0, (e.clientX - box.left) / box.width));
    setHover(x0 + frac * (x1 - x0));
  };

  return (
    <div className="calc-chart" ref={ref}>
      <div className="calc-caption">
        Price {side === "producer" ? "received" : "paid"} under each hedge, against the market price at expiry ({unit})
      </div>
      <div className="calc-legend" aria-hidden>
        {series.map((s) => (
          <span key={s.key}>
            <svg width="18" height="8"><line x1="0" y1="4" x2="18" y2="4" stroke={s.color} strokeWidth="2" strokeDasharray={s.dash} /></svg>
            {s.label}
          </span>
        ))}
      </div>
      <svg width={width} height={h} role="img"
        aria-label={`Effective price ${side === "producer" ? "received" : "paid"} against the price at expiry, for each hedge`}>
        {yt.map((v, i) => (
          <g key={i}>
            <line x1={m.l} x2={width - m.r} y1={Y(v)} y2={Y(v)} stroke="var(--border)" />
            <text x={m.l - 8} y={Y(v) + 4} textAnchor="end" className="calc-tick">{fmtNum(v, yd)}</text>
          </g>
        ))}
        {ticks.map((v, i) => (
          <text key={i} x={X(v)} y={h - m.b + 18} textAnchor="middle" className="calc-tick">{fmtNum(v, xd)}</text>
        ))}
        {series.map((s) => (
          <path key={s.key} d={d(s)} fill="none" stroke={s.color} strokeWidth="2" strokeDasharray={s.dash}
            strokeLinejoin="round" strokeLinecap="round" />
        ))}
        {hover !== null && (
          <g>
            <line x1={X(hover)} x2={X(hover)} y1={m.t} y2={h - m.b} stroke="var(--border-strong)" />
            {series.map((s) => (
              <circle key={s.key} cx={X(hover)} cy={Y(s.f(hover))} r="4" fill={s.color} stroke="var(--surface-1)" strokeWidth="2" />
            ))}
          </g>
        )}
        <rect x={m.l} y={m.t} width={Math.max(0, width - m.l - m.r)} height={h - m.t - m.b} fill="transparent"
          onPointerMove={onMove} onPointerDown={onMove} onPointerLeave={() => setHover(null)} style={{ touchAction: "pan-y" }} />
      </svg>
      {hover !== null && (
        <div className="calc-tip" style={{ left: Math.min(Math.max(X(hover) - 90, 0), width - 190) }}>
          <div className="muted">At {fmtNum(hover, dg)} {unit} on expiry, {side === "producer" ? "you receive" : "you pay"}</div>
          {series.map((s) => (
            <div key={s.key} className="row">
              <span><i style={{ background: s.color }} />{s.label}</span>
              <b>{fmtNum(s.f(hover), dg)}</b>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------- the calculator ---------- */

export default function HedgeCalculator({ calc }: { calc: Calculator }) {
  const markets = calc.markets.filter((m) => m.contracts.length > 0);
  const [mi, setMi] = useState(0);
  const mk = markets[mi];
  const [ci, setCi] = useState(() => defaultContract(markets[0]));
  const [side, setSide] = useState<Side>("producer");
  const [level, setLevel] = useState(90);
  const [volIn, setVolIn] = useState<number | null>(null);
  const [useBench, setUseBench] = useState(false);
  const [qty, setQty] = useState<number>(volumeOf(markets[0].unit).qty);

  const pickMarket = (i: number) => {
    setMi(i);
    setCi(defaultContract(markets[i]));
    setVolIn(null);
    setUseBench(false);
    setQty(volumeOf(markets[i].unit).qty);
  };
  const pickSide = (s: Side) => {
    setSide(s);
    setLevel(s === "producer" ? 90 : 110);
  };

  const c = mk.contracts[Math.min(ci, mk.contracts.length - 1)];
  const front = mk.contracts[0];
  const baseVol = mk.benchmark && useBench ? mk.vol / mk.benchmark.vol_ratio : mk.vol;
  const vol = (volIn ?? baseVol) / 100;
  const t = c.days / 365;
  const f = c.price;
  const r = calc.rate;
  const k = (level / 100) * f;
  const isCall = side === "consumer";
  const dg = priceDigits(f);
  const cents = mk.unit.startsWith("c/");
  const vu = volumeOf(mk.unit);
  const toDollars = (perUnit: number) => (perUnit * qty) / (cents ? 100 : 1);

  const res = useMemo(() => {
    const prem = black76(f, k, t, vol, isCall, r);
    const other = zeroCostStrike(f, k, isCall, t, vol, r);
    const atm = black76(f, f, t, vol, isCall, r);
    return { prem, other, atm };
  }, [f, k, t, vol, isCall, r]);

  const grow = Math.exp(r * t); // premium paid today, carried to expiry
  const series: Series[] = side === "producer"
    ? [
        { key: "none", label: "Unhedged", color: "var(--text-muted)", dash: "4 4", f: (s) => s },
        { key: "fwd", label: "Forward", color: "var(--blue)", f: () => f },
        { key: "opt", label: `Put ${level}%`, color: "var(--orange)", f: (s) => Math.max(s, k) - res.prem * grow },
        ...(res.other ? [{ key: "col", label: "Zero-cost collar", color: "var(--aqua)", f: (s: number) => Math.min(Math.max(s, k), res.other as number) }] : []),
      ]
    : [
        { key: "none", label: "Unhedged", color: "var(--text-muted)", dash: "4 4", f: (s) => s },
        { key: "fwd", label: "Forward", color: "var(--blue)", f: () => f },
        { key: "opt", label: `Call ${level}%`, color: "var(--orange)", f: (s) => Math.min(s, k) + res.prem * grow },
        ...(res.other ? [{ key: "col", label: "Zero-cost collar", color: "var(--aqua)", f: (s: number) => Math.max(Math.min(s, k), res.other as number) }] : []),
      ];

  const fwdVsFront = (f / front.price - 1) * 100;
  const verb = side === "producer" ? "sell" : "buy";

  return (
    <section className="calc" aria-label="Hedge calculator">
      <div className="col-title">
        <h2>Price a hedge</h2>
        <span className="rule" />
      </div>
      <div className="calc-grid">
        <div className="calc-controls">
          <label>
            <span>Market</span>
            <select value={mi} onChange={(e) => pickMarket(Number(e.target.value))}>
              {markets.map((m, i) => (
                <option key={m.name} value={i}>{m.name}</option>
              ))}
            </select>
          </label>
          <div className="calc-field">
            <span>The client</span>
            <div className="seg" role="group">
              <button type="button" aria-pressed={side === "producer"} onClick={() => pickSide("producer")}>Producer, sells</button>
              <button type="button" aria-pressed={side === "consumer"} onClick={() => pickSide("consumer")}>Consumer, buys</button>
            </div>
          </div>
          <label>
            <span>Hedge the delivery month</span>
            <select value={Math.min(ci, mk.contracts.length - 1)} onChange={(e) => setCi(Number(e.target.value))}>
              {mk.contracts.map((x, i) => (
                <option key={x.contract} value={i}>
                  {x.delivery} · {x.contract} · {fmtNum(x.price, priceDigits(x.price))}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span>
              {side === "producer" ? "Floor" : "Cap"} at <b className="mono">{level}%</b> of the forward ·{" "}
              <span className="mono">{fmtNum(k, dg)} {mk.unit}</span>
            </span>
            <input type="range" min={side === "producer" ? 75 : 100} max={side === "producer" ? 100 : 125} step={1}
              value={level} onChange={(e) => setLevel(Number(e.target.value))} />
          </label>
          <label>
            <span>Vol <b className="mono">{fmtNum(vol * 100, 1)}%</b></span>
            <input type="range" min={5} max={120} step={0.5} value={Math.round(vol * 200) / 2}
              onChange={(e) => setVolIn(Number(e.target.value))} />
            <small className="muted">
              {volIn === null ? (
                mk.benchmark && useBench
                  ? `${mk.vol_source}, ${fmtNum(mk.vol, 1)}%, divided by ${fmtNum(mk.benchmark.vol_ratio, 2)} for ${mk.benchmark.name}.`
                  : `${mk.vol_source}.`
              ) : (
                <>Your input. <button type="button" className="linkish" onClick={() => setVolIn(null)}>Reset to {fmtNum(baseVol, 1)}%</button></>
              )}
            </small>
          </label>
          {mk.benchmark && (
            <label className="calc-check">
              <input type="checkbox" checked={useBench} onChange={(e) => { setUseBench(e.target.checked); setVolIn(null); }} />
              <span>
                Price for a {mk.benchmark.name} hedge: this contract runs {fmtNum(mk.benchmark.vol_ratio, 2)}x its vol
                (weekly returns since 2021, calibrated on Bloomberg)
              </span>
            </label>
          )}
          <label>
            <span>Volume, {vu.label}</span>
            <input type="number" inputMode="numeric" min={0} step={vu.qty / 10} value={qty}
              onChange={(e) => setQty(Math.max(0, Number(e.target.value) || 0))} />
          </label>
        </div>

        <div className="calc-out">
          <div className="calc-cards">
            <div className="calc-card">
              <div className="k">Forward</div>
              <div className="v">{fmtNum(f, dg)}<small>{mk.unit}</small></div>
              <div className="u">
                {verb} {c.delivery} at {fmtSigned(fwdVsFront, 1)}% vs the front. No premium, no upside.
              </div>
            </div>
            <div className="calc-card">
              <div className="k">{side === "producer" ? "Put" : "Call"} at {level}%</div>
              <div className="v">{fmtNum(res.prem, dg)}<small>{mk.unit}</small></div>
              <div className="u">
                {fmtNum((res.prem / f) * 100, 2)}% of the forward, {dollars(toDollars(res.prem))} on {fmtNum(qty, 0)} {vu.label}.{" "}
                {side === "producer" ? "Worst price received" : "Worst price paid"}: {fmtNum(side === "producer" ? k - res.prem * grow : k + res.prem * grow, dg)}.
              </div>
            </div>
            <div className="calc-card">
              <div className="k">Zero-cost collar</div>
              <div className="v">
                {res.other ? fmtNum(res.other, dg) : "–"}<small>{side === "producer" ? "cap" : "floor"}</small>
              </div>
              <div className="u">
                {res.other
                  ? side === "producer"
                    ? `Floor ${fmtNum(k, dg)}, cap ${fmtNum(res.other, dg)} (${fmtNum((res.other / f) * 100, 0)}% of the forward): the call sold pays for the put.`
                    : `Cap ${fmtNum(k, dg)}, floor ${fmtNum(res.other, dg)} (${fmtNum((res.other / f) * 100, 0)}% of the forward): the put sold pays for the call.`
                  : "No strike finances it at this vol."}
              </div>
            </div>
          </div>
          <PayoffChart fwd={f} series={series} unit={mk.unit} side={side} />
          <p className="footnote">
            {mk.name}: {c.contract}, option expiry in about {c.days} days. At-the-money {isCall ? "call" : "put"}{" "}
            {fmtNum((res.atm / f) * 100, 2)}% of the forward. {calc.note}
          </p>
        </div>
      </div>
    </section>
  );
}
