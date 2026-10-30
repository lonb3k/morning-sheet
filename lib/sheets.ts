import "server-only";
import { promises as fs } from "fs";
import path from "path";
import { PROJECTS, REVALIDATE_SECONDS, projectFor, rawUrl, type Slug } from "./projects";
import type { Sheet } from "./types";

/**
 * Load one sheet. In production this reads the JSON committed to GitHub, cached by Next.js for
 * REVALIDATE_SECONDS. Set SHEET_LOCAL_ROOT to the folder holding the project checkouts to
 * read the files straight from disk during development.
 */
export async function loadSheet(slug: string): Promise<Sheet | null> {
  const project = projectFor(slug);
  if (!project) return null;
  const localRoot = process.env.SHEET_LOCAL_ROOT;
  if (localRoot) {
    const file = path.join(localRoot, project.dir, "sheet", "latest.json");
    return JSON.parse(await fs.readFile(file, "utf-8")) as Sheet;
  }
  const res = await fetch(rawUrl(project.repo), { next: { revalidate: REVALIDATE_SECONDS } });
  if (!res.ok) return null;
  return (await res.json()) as Sheet;
}

export async function loadAll(): Promise<{ slug: Slug; sheet: Sheet | null }[]> {
  return Promise.all(PROJECTS.map(async (p) => ({ slug: p.slug, sheet: await loadSheet(p.slug).catch(() => null) })));
}
