import type { Metadata, Viewport } from "next";
import "./globals.css";
import "./ui.css";
import CommandPalette from "@/components/CommandPalette";
import Nav from "@/components/Nav";
import { PROJECTS } from "@/lib/projects";

export const metadata: Metadata = {
  title: { default: "Morning sheets", template: "%s · Morning sheets" },
  description: "Desk notes generated every weekday from free market data: volatility, dispersion, basket, the book built on them, and a corporate-hedging note on commodities.",
  icons: { icon: "/icon.svg" },
};

export const viewport: Viewport = { themeColor: "#0b0e13", width: "device-width", initialScale: 1 };

const FONTS = "https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&family=IBM+Plex+Sans:wght@400;500;600&display=swap";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="stylesheet" href={FONTS} />
      </head>
      <body>
        <Nav />
        <main className="wrap">{children}</main>
        <CommandPalette />
        <footer className="site wrap">
          <span className="foot-by">Built by Ramzan Makhmaev, ESCP Financial Markets.</span>
          <span>Data: Yahoo Finance, CBOE, calibrated on Bloomberg history. Regenerated weekdays after the US close.</span>
          {Array.from(new Set(PROJECTS.map((p) => p.repo))).map((r) => (
            <a key={r} href={`https://github.com/${r}`} target="_blank" rel="noreferrer">
              github.com/{r}
            </a>
          ))}
          <span>Not investment advice. A student research project.</span>
        </footer>
      </body>
    </html>
  );
}
