"use client";

import { useMemo, useState } from "react";
import { fmtNum } from "@/lib/format";
import type { Table } from "@/lib/types";

function Cell({ v, i }: { v: string | number | null; i: number }) {
  if (v === null || v === undefined) return <td>–</td>;
  if (typeof v === "number") {
    const digits = Number.isInteger(v) ? 0 : Math.abs(v) < 10 ? 2 : 1;
    return <td>{fmtNum(v, digits)}</td>;
  }
  return <td className={i === 0 ? "" : "txt"}>{v}</td>;
}

/** Click a header to sort by that column; click again to flip; a third click restores the sheet's order. */
export default function SortableTable({ table }: { table: Table }) {
  const [sort, setSort] = useState<{ col: number; dir: 1 | -1 } | null>(null);
  const rows = useMemo(() => {
    if (!sort) return table.rows;
    const key = (v: string | number | null) => (v === null ? Number.NEGATIVE_INFINITY : v);
    return [...table.rows].sort((a, b) => {
      const x = key(a[sort.col]), y = key(b[sort.col]);
      if (typeof x === "number" && typeof y === "number") return (x - y) * sort.dir;
      return String(x).localeCompare(String(y)) * sort.dir;
    });
  }, [table.rows, sort]);
  const click = (i: number) =>
    setSort((s) => (!s || s.col !== i ? { col: i, dir: -1 } : s.dir === -1 ? { col: i, dir: 1 } : null));

  return (
    <div className="tbl-wrap">
      <table>
        <thead>
          <tr>
            {table.columns.map((c, i) => (
              <th key={i} className={i === 0 ? "txt" : undefined}
                aria-sort={sort?.col === i ? (sort.dir === 1 ? "ascending" : "descending") : "none"}>
                <button type="button" onClick={() => click(i)} title="Sort">
                  {c}
                  <span className="sort-ind" aria-hidden>{sort?.col === i ? (sort.dir === 1 ? "▲" : "▼") : "↕"}</span>
                </button>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i}>
              {r.map((v, j) => (
                <Cell key={j} v={v} i={j} />
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
