export interface ExplorerTrace {
  id: string;
  content: string;
  context: string | null;
  type: "decision" | "fact" | "convention" | "state";
  status: "active" | "superseded" | "deprecated";
  tags: string[];
  confidence: "high" | "medium" | "low";
  caused_by: string[];
  date_start: string;
  year_numeric: number;
}

export interface Dataset {
  id: string;
  name: string;
  description: string;
  icon: string;
  trace_count: number;
  tags: Record<string, string[]>;
  categories: { slug: string; name: string; trace_count: number }[];
}

export interface DatasetMeta {
  id: string;
  name: string;
  description: string;
  icon: string;
  tag_taxonomy: Record<string, { label: string; values: string[] }>;
  categories: { slug: string; name: string; path: string; trace_count: number }[];
}
