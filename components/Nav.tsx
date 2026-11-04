"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Icon from "./Icon";
import { PROJECTS } from "@/lib/projects";

export function openPalette() {
  window.dispatchEvent(new Event("palette:open"));
}

export default function Nav() {
  const path = usePathname();
  const [mac, setMac] = useState(true);
  useEffect(() => setMac(/Mac|iPhone|iPad/.test(navigator.platform)), []);
  return (
    <>
      <nav className="nav">
        <div className="wrap">
          <Link href="/" className="brand" aria-label="Morning sheets, home">
            <span className="dot" aria-hidden />
            <span className="label">Morning sheets</span>
          </Link>
          <div className="nav-links">
            {PROJECTS.map((p) => (
              <Link key={p.slug} href={`/${p.slug}`} aria-current={path === `/${p.slug}` ? "page" : undefined}
                style={{ "--c": p.accent } as React.CSSProperties}>
                <Icon name={p.slug} size={15} />
                {p.name}
              </Link>
            ))}
          </div>
          <button type="button" className="kbar" onClick={openPalette} aria-label="Search pages and sections">
            <Icon name="search" size={15} />
            <span className="kbar-text">Jump to…</span>
            <kbd>{mac ? "⌘" : "Ctrl"} K</kbd>
          </button>
        </div>
      </nav>
      <nav className="tabbar" aria-label="Sheets">
        {PROJECTS.map((p) => (
          <Link key={p.slug} href={`/${p.slug}`} aria-current={path === `/${p.slug}` ? "page" : undefined}
            style={{ "--c": p.accent } as React.CSSProperties}>
            <Icon name={p.slug} size={20} />
            <span>{p.name}</span>
          </Link>
        ))}
      </nav>
    </>
  );
}

export function PaletteButton() {
  return (
    <button type="button" className="btn" onClick={openPalette}>
      <Icon name="search" size={16} />
      Jump to any sheet
      <kbd>⌘K</kbd>
    </button>
  );
}
