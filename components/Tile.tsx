import Sparkline from "./Sparkline";
import { fmtNum, tileDigits } from "@/lib/format";
import type { Tile as TileT } from "@/lib/types";

export default function Tile({ t, compact = false }: { t: TileT; compact?: boolean }) {
  const digits = tileDigits(t.value, t.unit);
  return (
    <div className={`tile ${t.tone}`}>
      <div className="label">{t.label}</div>
      <div className="value">
        {fmtNum(t.value, digits)}
        {t.unit && <small>{t.unit.trim()}</small>}
      </div>
      {!compact && <div className="sub">{t.sub}</div>}
      <Sparkline values={t.spark} tone={t.tone} />
    </div>
  );
}
