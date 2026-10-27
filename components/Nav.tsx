"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { PROJECTS } from "@/lib/projects";

export default function Nav() {
  const path = usePathname();
  return (
    <nav className="nav">
      <div className="wrap">
        <Link href="/" className="brand">
          <span className="dot" aria-hidden />
          <span className="label">Morning sheets</span>
        </Link>
        <div className="nav-links">
          {PROJECTS.map((p) => (
            <Link key={p.slug} href={`/${p.slug}`} aria-current={path === `/${p.slug}` ? "page" : undefined}>
              {p.name}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
