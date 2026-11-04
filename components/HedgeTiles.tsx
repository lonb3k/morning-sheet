"use client";

import Tile from "./Tile";
import type { Tile as TileT } from "@/lib/types";

/** Hedging tiles double as shortcuts: a tap loads that market into the calculator below. */
export default function HedgeTiles({ tiles }: { tiles: TileT[] }) {
  return (
    <section className="tiles" aria-label="Headline numbers">
      {tiles.map((t, i) => {
        const market = t.label.split(",")[0];
        return (
          <button key={i} type="button" className="tile-btn" title={`Price a ${market} hedge`}
            onClick={() => window.dispatchEvent(new CustomEvent("hedge:select", { detail: market }))}>
            <Tile t={t} />
            <span className="tile-cta">Price a hedge →</span>
          </button>
        );
      })}
    </section>
  );
}
