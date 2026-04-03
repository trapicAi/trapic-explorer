import type { ExplorerTrace, DatasetMeta } from '@/types/trace';

interface DatasetIndex {
  id: string;
  name: string;
  description: string;
  icon: string;
  trace_count: number;
}

const BASE = import.meta.env.BASE_URL;

const cache = new Map<string, unknown>();

async function fetchJSON<T>(path: string): Promise<T> {
  const key = path;
  if (cache.has(key)) return cache.get(key) as T;
  const res = await fetch(`${BASE}data/${path}`);
  if (!res.ok) throw new Error(`Failed to load ${path}: ${res.status}`);
  const data = await res.json() as T;
  cache.set(key, data);
  return data;
}

// All loaded traces keyed by id
const traceIndex = new Map<string, ExplorerTrace>();

export async function getDatasets(): Promise<DatasetIndex[]> {
  return fetchJSON<DatasetIndex[]>('datasets.json');
}

export async function getDatasetMeta(datasetId: string): Promise<DatasetMeta> {
  return fetchJSON<DatasetMeta>(`${datasetId}/meta.json`);
}

export async function loadCategoryTraces(datasetId: string, categoryPath: string): Promise<ExplorerTrace[]> {
  const traces = await fetchJSON<ExplorerTrace[]>(`${datasetId}/${categoryPath}`);
  for (const t of traces) {
    traceIndex.set(t.id, t);
  }
  return traces;
}

export async function loadAllTraces(datasetId: string): Promise<ExplorerTrace[]> {
  const meta = await getDatasetMeta(datasetId);
  const all: ExplorerTrace[] = [];
  for (const cat of meta.categories) {
    const traces = await loadCategoryTraces(datasetId, cat.path);
    all.push(...traces);
  }
  // Sort by year
  all.sort((a, b) => a.year_numeric - b.year_numeric);
  return all;
}

export function getTraceById(id: string): ExplorerTrace | undefined {
  return traceIndex.get(id);
}

export function getChainForTrace(traceId: string): ExplorerTrace[] {
  const chain: ExplorerTrace[] = [];
  const visited = new Set<string>();

  // Walk backward through caused_by
  function walkBack(id: string) {
    if (visited.has(id)) return;
    visited.add(id);
    const trace = traceIndex.get(id);
    if (!trace) return;
    for (const parentId of trace.caused_by) {
      walkBack(parentId);
    }
    chain.push(trace);
  }

  // Walk forward to find effects
  function getEffects(id: string): ExplorerTrace[] {
    const effects: ExplorerTrace[] = [];
    for (const [, trace] of traceIndex) {
      if (trace.caused_by.includes(id)) {
        effects.push(trace);
      }
    }
    return effects.sort((a, b) => a.year_numeric - b.year_numeric);
  }

  // Build backward chain
  walkBack(traceId);

  // Add forward effects
  const forwardVisited = new Set<string>(visited);
  function walkForward(id: string) {
    const effects = getEffects(id);
    for (const effect of effects) {
      if (!forwardVisited.has(effect.id)) {
        forwardVisited.add(effect.id);
        chain.push(effect);
        walkForward(effect.id);
      }
    }
  }
  walkForward(traceId);

  // Deduplicate and sort
  const seen = new Set<string>();
  return chain.filter(t => {
    if (seen.has(t.id)) return false;
    seen.add(t.id);
    return true;
  }).sort((a, b) => a.year_numeric - b.year_numeric);
}

export function getCausesCount(traceId: string): number {
  const trace = traceIndex.get(traceId);
  if (!trace) return 0;
  return trace.caused_by.filter(id => traceIndex.has(id)).length;
}

export function getEffectsCount(traceId: string): number {
  let count = 0;
  for (const [, trace] of traceIndex) {
    if (trace.caused_by.includes(traceId)) count++;
  }
  return count;
}

export function filterByTags(traces: ExplorerTrace[], activeTags: string[]): ExplorerTrace[] {
  if (activeTags.length === 0) return traces;
  return traces.filter(trace =>
    activeTags.every(tag => trace.tags.includes(tag))
  );
}

export function filterByType(traces: ExplorerTrace[], types: string[]): ExplorerTrace[] {
  if (types.length === 0) return traces;
  return traces.filter(trace => types.includes(trace.type));
}

export function searchTraces(traces: ExplorerTrace[], query: string): ExplorerTrace[] {
  if (!query.trim()) return traces;
  const q = query.toLowerCase();
  return traces.filter(trace =>
    trace.content.toLowerCase().includes(q) ||
    (trace.context && trace.context.toLowerCase().includes(q)) ||
    trace.tags.some(tag => tag.toLowerCase().includes(q))
  );
}

export function getAllTags(traces: ExplorerTrace[]): Record<string, string[]> {
  const tagMap: Record<string, Set<string>> = {};
  for (const trace of traces) {
    for (const tag of trace.tags) {
      const [prefix, ...rest] = tag.split(':');
      const value = rest.join(':');
      if (value) {
        if (!tagMap[prefix]) tagMap[prefix] = new Set();
        tagMap[prefix].add(value);
      }
    }
  }
  const result: Record<string, string[]> = {};
  for (const [prefix, values] of Object.entries(tagMap)) {
    result[prefix] = [...values].sort();
  }
  return result;
}

export function getTagCounts(traces: ExplorerTrace[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const trace of traces) {
    for (const tag of trace.tags) {
      counts[tag] = (counts[tag] || 0) + 1;
    }
  }
  return counts;
}

export function getTypeColor(type: string): string {
  switch (type) {
    case 'decision': return 'var(--decision)';
    case 'fact': return 'var(--fact)';
    case 'convention': return 'var(--convention)';
    case 'state': return 'var(--state)';
    default: return 'var(--text-muted)';
  }
}

export function getTypeDimColor(type: string): string {
  switch (type) {
    case 'decision': return 'var(--decision-dim)';
    case 'fact': return 'var(--fact-dim)';
    case 'convention': return 'var(--convention-dim)';
    case 'state': return 'var(--state-dim)';
    default: return 'transparent';
  }
}
