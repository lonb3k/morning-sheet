"use client";

import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Icon from "./Icon";
import { PROJECTS } from "@/lib/projects";

interface Item {
  id: string;
  group: string;
  label: string;
  hint?: string;
  icon: string;
  run: () => void;
}

/** ⌘K / Ctrl-K / "/" palette: every sheet, the sections of this page, the hedge markets, the code and apps. */
export default function CommandPalette() {
  const router = useRouter();
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [sel, setSel] = useState(0);
  const [sections, setSections] = useState<{ id: string; label: string }[]>([]);
  const [markets, setMarkets] = useState<string[]>([]);
  const input = useRef<HTMLInputElement>(null);
  const list = useRef<HTMLDivElement>(null);

  const close = useCallback(() => { setOpen(false); setQ(""); setSel(0); }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const typing = e.target instanceof HTMLElement && /INPUT|TEXTAREA|SELECT/.test(e.target.tagName);
      if ((e.key === "k" && (e.metaKey || e.ctrlKey)) || (e.key === "/" && !typing && !open)) {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    const onOpen = () => setOpen(true);
    window.addEventListener("keydown", onKey);
    window.addEventListener("palette:open", onOpen);
    return () => { window.removeEventListener("keydown", onKey); window.removeEventListener("palette:open", onOpen); };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    setSections(Array.from(document.querySelectorAll<HTMLElement>("[data-section]")).map((el) => ({ id: el.id, label: el.dataset.section ?? el.id })));
    setMarkets(Array.from(document.querySelectorAll<HTMLOptionElement>("#calc-market option")).map((o) => o.textContent ?? ""));
    requestAnimationFrame(() => input.current?.focus());
  }, [open, path]);

  const items: Item[] = useMemo(() => {
    const go = (href: string) => () => { close(); router.push(href); };
    const ext = (href: string) => () => { close(); window.open(href, "_blank", "noopener"); };
    const out: Item[] = [
      { id: "home", group: "Sheets", label: "Home", hint: "All five sheets", icon: "home", run: go("/") },
      ...PROJECTS.map((p) => ({ id: p.slug, group: "Sheets", label: p.name, hint: p.tagline, icon: p.slug, run: go(`/${p.slug}`) })),
      ...sections.map((s) => ({
        id: `sec-${s.id}`, group: "On this page", label: s.label, icon: "section",
        run: () => { close(); document.getElementById(s.id)?.scrollIntoView({ behavior: "smooth", block: "start" }); },
      })),
      ...markets.map((m) => ({
        id: `mkt-${m}`, group: "Price a hedge", label: `Price a ${m} hedge`, icon: "calc",
        run: () => { close(); window.dispatchEvent(new CustomEvent("hedge:select", { detail: m })); },
      })),
    ];
    if (!path.startsWith("/hedging")) {
      out.push({ id: "calc", group: "Price a hedge", label: "Open the hedge calculator", hint: "Forward, option, zero-cost collar", icon: "calc", run: go("/hedging#calculator") });
    }
    const repos = Array.from(new Set(PROJECTS.map((p) => p.repo)));
    repos.forEach((r) => out.push({ id: `gh-${r}`, group: "Code and apps", label: `github.com/${r}`, icon: "github", run: ext(`https://github.com/${r}`) }));
    PROJECTS.filter((p) => p.app && p.slug !== "hedging").forEach((p) =>
      out.push({ id: `app-${p.slug}`, group: "Code and apps", label: `${p.name} dashboard`, hint: "Interactive Streamlit app", icon: "app", run: ext(p.app) }));
    return out;
  }, [sections, markets, path, router, close]);

  const shown = useMemo(() => {
    const words = q.toLowerCase().split(/\s+/).filter(Boolean);
    return words.length ? items.filter((i) => words.every((w) => `${i.label} ${i.hint ?? ""} ${i.group}`.toLowerCase().includes(w))) : items;
  }, [items, q]);

  useEffect(() => setSel(0), [q]);
  useEffect(() => {
    list.current?.querySelector<HTMLElement>(`[data-i="${sel}"]`)?.scrollIntoView({ block: "nearest" });
  }, [sel]);

  if (!open) return null;

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") close();
    else if (e.key === "ArrowDown") { e.preventDefault(); setSel((s) => Math.min(s + 1, shown.length - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setSel((s) => Math.max(s - 1, 0)); }
    else if (e.key === "Enter") { e.preventDefault(); shown[sel]?.run(); }
  };

  let last = "";
  return (
    <div className="pal-backdrop" onMouseDown={close}>
      <div className="pal" role="dialog" aria-modal="true" aria-label="Jump to" onMouseDown={(e) => e.stopPropagation()} onKeyDown={onKey}>
        <div className="pal-input">
          <Icon name="search" size={17} />
          <input ref={input} value={q} onChange={(e) => setQ(e.target.value)} placeholder="Jump to a sheet, a section, a market…"
            aria-label="Search" aria-controls="pal-list" aria-activedescendant={shown[sel] ? `pal-${shown[sel].id}` : undefined} />
          <kbd onClick={close}>esc</kbd>
        </div>
        <div className="pal-list" id="pal-list" role="listbox" ref={list}>
          {shown.length === 0 && <div className="pal-empty">Nothing matches “{q}”.</div>}
          {shown.map((it, i) => {
            const head = it.group !== last ? <div className="pal-group" key={`g-${it.group}`}>{it.group}</div> : null;
            last = it.group;
            return (
              <div key={it.id}>
                {head}
                <div id={`pal-${it.id}`} data-i={i} role="option" aria-selected={i === sel} className="pal-item"
                  onMouseMove={() => setSel(i)} onClick={() => it.run()}>
                  <Icon name={it.icon} size={16} />
                  <span className="pal-label">{it.label}</span>
                  {it.hint && <span className="pal-hint">{it.hint}</span>}
                  <Icon name="arrow" size={14} className="pal-go" />
                </div>
              </div>
            );
          })}
        </div>
        <div className="pal-foot"><span><kbd>↑</kbd><kbd>↓</kbd> move</span><span><kbd>↵</kbd> open</span><span><kbd>esc</kbd> close</span></div>
      </div>
    </div>
  );
}
