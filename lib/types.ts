export type Tone = "pos" | "neg" | "neutral";

export interface Tile {
  label: string;
  value: number | null;
  unit: string;
  sub: string;
  tone: Tone;
  spark: number[];
}

export interface Table {
  columns: string[];
  rows: (string | number | null)[][];
}

export interface Section {
  title: string;
  paragraphs: string[];
  table?: Table;
}

export interface IdeaStats {
  expected: number | null;
  expected_unit: string;
  hit: number | null;
  worst: number | null;
  worst_unit?: string;
  worst_date?: string | null;
  n: number;
  sample?: string;
  unconditional?: string;
  /** Optional overrides of the four stat labels (the book's axes are not backtested ideas). */
  labels?: { expected?: string; hit?: string; hit_unit?: string; worst?: string; sample?: string };
}

export interface Idea {
  rank: number;
  title: string;
  direction: string;
  instrument: string;
  condition: string;
  thesis: string;
  stats: IdeaStats;
  score: number | null;
}

export interface Chart {
  id: string;
  title: string;
  // Plotly figure JSON: { data: Trace[], layout: Layout }
  figure: { data: Record<string, unknown>[]; layout: Record<string, unknown> };
}

export interface Sheet {
  project: string;
  slug: string;
  title: string;
  subtitle: string;
  as_of: string;
  generated_at: string;
  headline: string;
  tiles: Tile[];
  sections: Section[];
  ideas: Idea[];
  /** Title of the ideas column; defaults to "Trade ideas, ranked". */
  ideas_title?: string;
  charts: Chart[];
  method: string;
  caveats: string[];
  warnings: string[];
  links: { repo: string; streamlit: string };
}
