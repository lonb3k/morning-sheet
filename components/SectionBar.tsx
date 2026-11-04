"use client";

import { useEffect, useState } from "react";
import Icon from "./Icon";

/** Sticky jump bar over the sections of a sheet ([data-section] elements), with scrollspy and a share button. */
export default function SectionBar({ title }: { title: string }) {
  const [sections, setSections] = useState<{ id: string; label: string }[]>([]);
  const [active, setActive] = useState<string>("");
  const [toast, setToast] = useState("");

  useEffect(() => {
    const els = Array.from(document.querySelectorAll<HTMLElement>("[data-section]"));
    setSections(els.map((el) => ({ id: el.id, label: el.dataset.section ?? el.id })));
    const io = new IntersectionObserver(
      (entries) => {
        const vis = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (vis[0]) setActive(vis[0].target.id);
      },
      { rootMargin: "-120px 0px -55% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    document.querySelector(`.secbar a[data-id="${active}"]`)?.scrollIntoView({ block: "nearest", inline: "center", behavior: "smooth" });
  }, [active]);

  const share = async () => {
    const url = window.location.href.split("#")[0];
    try {
      if (navigator.share && window.matchMedia("(pointer: coarse)").matches) {
        await navigator.share({ title, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setToast("Link copied");
    } catch {
      setToast("Copy the address bar to share");
    }
    window.setTimeout(() => setToast(""), 1800);
  };

  return (
    <div className="secbar">
      <div className="secbar-links">
        {sections.map((s) => (
          <a key={s.id} href={`#${s.id}`} data-id={s.id} aria-current={active === s.id ? "true" : undefined}
            onClick={(e) => { e.preventDefault(); document.getElementById(s.id)?.scrollIntoView({ behavior: "smooth", block: "start" }); history.replaceState(null, "", `#${s.id}`); }}>
            {s.label}
          </a>
        ))}
      </div>
      <button type="button" className="ghost-btn" onClick={share} aria-label="Share this sheet">
        <Icon name="share" size={15} />
        <span>Share</span>
      </button>
      {toast && <div className="toast" role="status"><Icon name="check" size={14} />{toast}</div>}
    </div>
  );
}
