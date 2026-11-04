/** Small stroke icons, 24-unit grid, drawn in currentColor. */
const PATHS: Record<string, string> = {
  vol: "M3 17l4-6 4 3 4-8 6 9",
  dispersion: "M5 6.5a1.5 1.5 0 1 0 0 .01M12 4a1.5 1.5 0 1 0 0 .01M19 8a1.5 1.5 0 1 0 0 .01M8 17a1.5 1.5 0 1 0 0 .01M16 19a1.5 1.5 0 1 0 0 .01M4 20h16",
  basket: "M4 9h16l-1.5 10h-13zM8 9l4-5 4 5M9 13v3M15 13v3",
  book: "M5 4h10a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3zM5 17a3 3 0 0 1 3-3h10",
  hedging: "M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6zM9 12l2 2 4-4",
  home: "M4 11l8-7 8 7M6 10v10h12V10",
  search: "M11 5a6 6 0 1 0 0 12a6 6 0 1 0 0-12M20 20l-4.2-4.2",
  share: "M12 4v11M8 8l4-4 4 4M5 13v6h14v-6",
  link: "M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1",
  github: "M9 19c-4 1.5-4-2-6-2.5M15 21v-3.5c0-1 .1-1.4-.5-2 2.8-.3 5.5-1.4 5.5-6a4.6 4.6 0 0 0-1.3-3.2 4.2 4.2 0 0 0-.1-3.2s-1.1-.3-3.5 1.3a12 12 0 0 0-6.2 0C6.5 2.8 5.4 3.1 5.4 3.1a4.2 4.2 0 0 0-.1 3.2A4.6 4.6 0 0 0 4 9.5c0 4.6 2.7 5.7 5.5 6-.6.6-.6 1.2-.5 2V21",
  app: "M4 5h16v11H4zM8 20h8M12 16v4",
  arrow: "M5 12h14M13 6l6 6-6 6",
  section: "M5 7h14M5 12h14M5 17h9",
  calc: "M6 3h12v18H6zM9 7h6M9 11h.01M12 11h.01M15 11h.01M9 14h.01M12 14h.01M15 14h.01M9 17h.01M12 17h.01M15 17h.01",
  check: "M5 12l5 5 9-10",
};

export default function Icon({ name, size = 16, className }: { name: string; size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
      strokeLinecap="round" strokeLinejoin="round" aria-hidden className={className}>
      <path d={PATHS[name] ?? PATHS.section} />
    </svg>
  );
}
