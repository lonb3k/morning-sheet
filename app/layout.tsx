import type { Metadata, Viewport } from "next";
import "./globals.css";
import Nav from "@/components/Nav";
import { PROJECTS } from "@/lib/projects";

export const metadata: Metadata = {
  title: { default: "Morning sheets", template: "%s · Morning sheets" },
  description: "Three desk notes generated every weekday from free market data: volatility, dispersion, basket.",
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
        <footer className="site wrap">
          <span>Data: Yahoo Finance, CBOE. Regenerated weekdays after the US close by GitHub Actions.</span>
          {PROJECTS.map((p) => (
            <a key={p.slug} href={`https://github.com/${p.repo}`} target="_blank" rel="noreferrer">
              github.com/{p.repo}
            </a>
          ))}
          <span>Not investment advice. A student research project.</span>
        </footer>
      </body>
    </html>
  );
}
