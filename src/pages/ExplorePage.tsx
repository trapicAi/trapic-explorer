import { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { loadAllTraces, getAllTags, getTagCounts, filterByTags, filterByType, searchTraces, getDatasetMeta } from '@/lib/data';
import type { ExplorerTrace, DatasetMeta } from '@/types/trace';
import { Timeline } from '@/components/Timeline';
import { TagTree } from '@/components/TagTree';
import { TraceCard } from '@/components/TraceCard';
import { TraceDetail } from '@/components/TraceDetail';
import { Filter } from 'lucide-react';

export function ExplorePage() {
  const { dataset } = useParams<{ dataset: string }>();
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('q') || '';

  const [allTraces, setAllTraces] = useState<ExplorerTrace[]>([]);
  const [meta, setMeta] = useState<DatasetMeta | null>(null);
  const [activeTags, setActiveTags] = useState<string[]>([]);
  const [activeTypes, setActiveTypes] = useState<string[]>([]);
  const [selectedTraceId, setSelectedTraceId] = useState<string | null>(null);
  const [expandedTraceId, setExpandedTraceId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    if (!dataset) return;
    setLoading(true);
    Promise.all([
      loadAllTraces(dataset),
      getDatasetMeta(dataset),
    ]).then(([traces, m]) => {
      setAllTraces(traces);
      setMeta(m);
    }).catch(err => {
      console.error('Failed to load traces:', err);
    }).finally(() => {
      setLoading(false);
    });
  }, [dataset]);

  const tagGroups = useMemo(() => getAllTags(allTraces), [allTraces]);
  const tagCounts = useMemo(() => getTagCounts(allTraces), [allTraces]);

  const filteredTraces = useMemo(() => {
    let result = allTraces;
    result = filterByTags(result, activeTags);
    result = filterByType(result, activeTypes);
    if (searchQuery) {
      result = searchTraces(result, searchQuery);
    }
    return result;
  }, [allTraces, activeTags, activeTypes, searchQuery]);

  const handleToggleTag = useCallback((tag: string) => {
    setActiveTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  }, []);

  const handleToggleType = useCallback((type: string) => {
    setActiveTypes(prev =>
      prev.includes(type)
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  }, []);

  const handleTimelineClick = useCallback((traceId: string) => {
    setSelectedTraceId(traceId);
    const el = document.getElementById(`trace-${traceId}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    setExpandedTraceId(traceId);
  }, []);

  const selectedTrace = useMemo(() => {
    if (!selectedTraceId) return null;
    return allTraces.find(t => t.id === selectedTraceId) || null;
  }, [selectedTraceId, allTraces]);

  if (loading) {
    return (
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--text-muted)',
      }}>
        Loading traces...
      </div>
    );
  }

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      {/* Dataset header */}
      <div style={{
        padding: '12px 24px',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 16,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 24 }}>{meta?.icon}</span>
          <div>
            <h1 style={{
              fontSize: 18,
              fontWeight: 600,
              color: 'var(--text-primary)',
              lineHeight: 1.2,
            }}>
              {meta?.name}
            </h1>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              {filteredTraces.length} of {allTraces.length} traces
              {searchQuery && ` matching "${searchQuery}"`}
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {/* Type filters */}
          {(['decision', 'fact', 'convention', 'state'] as const).map(type => {
            const isActive = activeTypes.includes(type);
            const color = type === 'decision' ? 'var(--decision)'
              : type === 'fact' ? 'var(--fact)'
              : type === 'convention' ? 'var(--convention)'
              : 'var(--state)';
            return (
              <button
                key={type}
                onClick={() => handleToggleType(type)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  padding: '4px 10px',
                  borderRadius: 'var(--radius)',
                  fontSize: 11,
                  fontWeight: 500,
                  textTransform: 'capitalize',
                  color: isActive ? color : 'var(--text-muted)',
                  background: isActive ? `color-mix(in srgb, ${color} 12%, transparent)` : 'transparent',
                  border: `1px solid ${isActive ? color : 'var(--border)'}`,
                  transition: 'all var(--transition)',
                }}
              >
                <span style={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  background: color,
                  opacity: isActive ? 1 : 0.4,
                }} />
                {type}
              </button>
            );
          })}

          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              padding: '4px 10px',
              borderRadius: 'var(--radius)',
              fontSize: 11,
              color: sidebarOpen ? 'var(--accent)' : 'var(--text-muted)',
              background: sidebarOpen ? 'var(--accent-dim)' : 'transparent',
              border: `1px solid ${sidebarOpen ? 'var(--accent)' : 'var(--border)'}`,
            }}
          >
            <Filter size={12} />
            Tags
          </button>
        </div>
      </div>

      {/* Timeline */}
      <Timeline
        traces={filteredTraces}
        onTraceClick={handleTimelineClick}
        activeTraceId={expandedTraceId || undefined}
      />

      {/* Main content */}
      <div style={{
        flex: 1,
        display: 'flex',
        overflow: 'hidden',
      }}>
        {/* Sidebar */}
        {sidebarOpen && (
          <TagTree
            tagGroups={tagGroups}
            tagCounts={tagCounts}
            activeTags={activeTags}
            onToggleTag={handleToggleTag}
          />
        )}

        {/* Trace grid */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: 20,
        }}>
          {filteredTraces.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '60px 20px',
              color: 'var(--text-muted)',
            }}>
              <p style={{ fontSize: 15, marginBottom: 8 }}>No traces match your filters</p>
              <button
                onClick={() => { setActiveTags([]); setActiveTypes([]); }}
                style={{
                  fontSize: 13,
                  color: 'var(--accent)',
                  textDecoration: 'underline',
                }}
              >
                Clear all filters
              </button>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))',
              gap: 12,
              alignItems: 'start',
            }}>
              {filteredTraces.map(trace => (
                <TraceCard
                  key={trace.id}
                  trace={trace}
                  datasetId={dataset || 'wars'}
                  isExpanded={expandedTraceId === trace.id}
                  onExpand={() => setExpandedTraceId(
                    expandedTraceId === trace.id ? null : trace.id
                  )}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Detail panel */}
      {selectedTrace && (
        <TraceDetail
          trace={selectedTrace}
          datasetId={dataset || 'wars'}
          onClose={() => setSelectedTraceId(null)}
        />
      )}
    </div>
  );
}
