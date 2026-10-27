import type { Metadata, Viewport } from "next";
import { IBM_Plex_Mono, IBM_Plex_Sans } from "next/font/google";
import "./globals.css";
import Nav from "@/components/Nav";
import { PROJECTS } from "@/lib/projects";

const sans = IBM_Plex_Sans({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-plex-sans", display: "swap" });
const mono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-plex-mono", display: "swap" });

export const metadata: Metadata = {
  title: { default: "Morning sheets", template: "%s · Morning sheets" },
  description: "Three desk notes generated every weekday from free market data: volatility, dispersion, basket.",
};

export const viewport: Viewport = { themeColor: "#0b0e13", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${sans.variable} ${mono.variable}`}>
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
