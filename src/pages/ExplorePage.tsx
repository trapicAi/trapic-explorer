import { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { loadAllTraces, getAllTags, getTagCounts, filterByTags, filterByType, searchTraces, getDatasetMeta, getChainForTrace } from '@/lib/data';
import type { ExplorerTrace, DatasetMeta } from '@/types/trace';
import { Timeline } from '@/components/Timeline';
import { TagTree } from '@/components/TagTree';
import { TraceCard, CausalArrow } from '@/components/TraceCard';
import { TraceDetail } from '@/components/TraceDetail';
import { Filter, X, GitBranch, LayoutGrid } from 'lucide-react';
import { useIsMobile } from '@/hooks/useIsMobile';

type ViewMode = 'grid' | 'trace-path';

// Derive a relationship label between two traces
function getRelationshipLabel(from: ExplorerTrace, to: ExplorerTrace): string {
  const fromType = from.type;
  const toType = to.type;
  if (fromType === 'decision' && toType === 'fact') return 'Triggers';
  if (fromType === 'decision' && toType === 'state') return 'Triggers';
  if (fromType === 'fact' && toType === 'decision') return 'Leads to';
  if (fromType === 'state' && toType === 'decision') return 'Escalates to';
  if (fromType === 'state' && toType === 'state') return 'Escalates to';
  if (fromType === 'convention' && toType === 'fact') return 'Mitigates to';
  if (fromType === 'decision' && toType === 'convention') return 'Establishes';
  if (toType === 'state') return 'Results in';
  if (toType === 'decision') return 'Leads to';
  return 'Causes';
}

export function ExplorePage() {
  const { dataset } = useParams<{ dataset: string }>();
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('q') || '';
  const isMobile = useIsMobile();

  const [allTraces, setAllTraces] = useState<ExplorerTrace[]>([]);
  const [meta, setMeta] = useState<DatasetMeta | null>(null);
  const [activeTags, setActiveTags] = useState<string[]>([]);
  const [activeTypes, setActiveTypes] = useState<string[]>([]);
  const [selectedTraceId, setSelectedTraceId] = useState<string | null>(null);
  const [expandedTraceId, setExpandedTraceId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

  // Close sidebar when switching to mobile
  useEffect(() => {
    if (isMobile) setSidebarOpen(false);
    else setSidebarOpen(true);
  }, [isMobile]);

  useEffect(() => {
    if (!dataset) return;
    setLoading(true);
    setError(null);
    Promise.all([
      loadAllTraces(dataset),
      getDatasetMeta(dataset),
    ]).then(([traces, m]) => {
      setAllTraces(traces);
      setMeta(m);
    }).catch(() => {
      setError('Failed to load traces. Please try refreshing the page.');
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

  // For trace path mode: build a chain from the first filtered trace
  const tracePathChain = useMemo(() => {
    if (viewMode !== 'trace-path' || filteredTraces.length === 0) return [];
    // Use the first trace that has causal connections
    const seedTrace = filteredTraces.find(t => t.caused_by.length > 0) || filteredTraces[0];
    return getChainForTrace(seedTrace.id);
  }, [viewMode, filteredTraces]);

  // Set of trace IDs in the path chain for highlighting
  const pathTraceIds = useMemo(() => new Set(tracePathChain.map(t => t.id)), [tracePathChain]);

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

  if (error) {
    return (
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        color: 'var(--text-muted)',
        padding: 40,
      }}>
        <p style={{ fontSize: 15 }}>{error}</p>
        <button
          onClick={() => window.location.reload()}
          style={{
            fontSize: 13,
            color: 'var(--accent)',
            textDecoration: 'underline',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          Reload page
        </button>
      </div>
    );
  }

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      {/* Dataset header */}
      <div style={{
        padding: isMobile ? '10px 12px' : '12px 24px',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: isMobile ? 8 : 16,
        flexWrap: isMobile ? 'wrap' : 'nowrap',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Link to="/" style={{
            fontSize: 24,
            textDecoration: 'none',
            opacity: 0.6,
            transition: 'opacity 0.2s',
          }}
          onMouseEnter={e => { e.currentTarget.style.opacity = '1'; }}
          onMouseLeave={e => { e.currentTarget.style.opacity = '0.6'; }}
          title="Switch dataset"
          >
            ←
          </Link>
          <span style={{ fontSize: 24 }}>{meta?.icon}</span>
          <div>
            <h1 style={{
              fontSize: isMobile ? 16 : 18,
              fontWeight: 600,
              color: 'var(--text-primary)',
              lineHeight: 1.2,
            }}>
              {meta?.name}
            </h1>
            <span className="mono" style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 500 }}>
              {filteredTraces.length} of {allTraces.length} traces
              {searchQuery && ` matching "${searchQuery}"`}
            </span>
          </div>
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          flexWrap: 'wrap',
        }}>
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
                  padding: isMobile ? '6px 10px' : '4px 10px',
                  borderRadius: 'var(--radius)',
                  fontSize: 11,
                  fontWeight: 500,
                  textTransform: 'capitalize',
                  color: isActive ? color : 'var(--text-muted)',
                  background: isActive ? `color-mix(in srgb, ${color} 12%, transparent)` : 'transparent',
                  border: `1px solid ${isActive ? color : 'var(--border)'}`,
                  transition: 'all var(--transition)',
                  minHeight: 44,
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

          {/* Divider */}
          <div style={{ width: 1, height: 24, background: 'var(--border)', margin: '0 4px' }} />

          {/* View mode toggle */}
          <button
            onClick={() => setViewMode(viewMode === 'grid' ? 'trace-path' : 'grid')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              padding: isMobile ? '6px 10px' : '4px 10px',
              borderRadius: 'var(--radius)',
              fontSize: 11,
              fontWeight: 600,
              color: viewMode === 'trace-path' ? 'var(--accent)' : 'var(--text-muted)',
              background: viewMode === 'trace-path' ? 'var(--accent-dim)' : 'transparent',
              border: `1px solid ${viewMode === 'trace-path' ? 'var(--accent)' : 'var(--border)'}`,
              minHeight: 44,
              transition: 'all var(--transition)',
            }}
          >
            {viewMode === 'grid' ? <GitBranch size={12} /> : <LayoutGrid size={12} />}
            {viewMode === 'grid' ? 'Trace Path' : 'Grid View'}
          </button>

          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              padding: isMobile ? '6px 10px' : '4px 10px',
              borderRadius: 'var(--radius)',
              fontSize: 11,
              color: sidebarOpen ? 'var(--accent)' : 'var(--text-muted)',
              background: sidebarOpen ? 'var(--accent-dim)' : 'transparent',
              border: `1px solid ${sidebarOpen ? 'var(--accent)' : 'var(--border)'}`,
              minHeight: 44,
            }}
          >
            <Filter size={12} />
            Tags
          </button>
        </div>
      </div>

      {/* Main content */}
      <div style={{
        flex: 1,
        display: 'flex',
        overflow: 'hidden',
        position: 'relative',
      }}>
        {/* Mobile sidebar backdrop */}
        {isMobile && sidebarOpen && (
          <div
            onClick={() => setSidebarOpen(false)}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 140,
              background: 'rgba(0,0,0,0.5)',
              backdropFilter: 'blur(4px)',
            }}
          />
        )}

        {/* Sidebar */}
        {sidebarOpen && (
          <div style={isMobile ? {
            position: 'fixed',
            top: 0,
            left: 0,
            bottom: 0,
            zIndex: 150,
            width: 280,
            maxWidth: '85vw',
            boxShadow: 'var(--shadow-lg)',
            display: 'flex',
            flexDirection: 'column',
          } : undefined}>
            {isMobile && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 16px',
                borderBottom: '1px solid var(--border)',
                background: 'var(--bg-secondary)',
              }}>
                <span style={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                }}>Filter by tag</span>
                <button
                  onClick={() => setSidebarOpen(false)}
                  style={{
                    width: 44,
                    height: 44,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 'var(--radius)',
                    color: 'var(--text-muted)',
                  }}
                >
                  <X size={18} />
                </button>
              </div>
            )}
            <TagTree
              tagGroups={tagGroups}
              tagCounts={tagCounts}
              activeTags={activeTags}
              onToggleTag={handleToggleTag}
            />
          </div>
        )}

        {/* Trace grid / path */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: isMobile ? 12 : 20,
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
          ) : viewMode === 'trace-path' && tracePathChain.length > 0 ? (
            /* Trace Path view: linear chain with arrows */
            <div style={{
              maxWidth: 520,
              margin: '0 auto',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'stretch',
            }}>
              <div style={{
                padding: '8px 12px',
                marginBottom: 16,
                borderRadius: 'var(--radius)',
                background: 'var(--accent-dim)',
                border: '1px solid rgba(255, 79, 56, 0.2)',
                fontSize: 12,
                color: 'var(--accent)',
                fontWeight: 500,
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}>
                <GitBranch size={14} />
                Trace Path — showing causal chain ({tracePathChain.length} connected traces)
              </div>
              {tracePathChain.map((trace, i) => (
                <div key={trace.id}>
                  <TraceCard
                    trace={trace}
                    datasetId={dataset || 'wars'}
                    isExpanded={expandedTraceId === trace.id}
                    onExpand={() => setExpandedTraceId(
                      expandedTraceId === trace.id ? null : trace.id
                    )}
                    isTracePath={pathTraceIds.has(trace.id)}
                  />
                  {i < tracePathChain.length - 1 && (
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                      <CausalArrow
                        label={getRelationshipLabel(trace, tracePathChain[i + 1])}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            /* Grid view */
            <div style={{
              display: 'grid',
              gridTemplateColumns: isMobile
                ? '1fr'
                : 'repeat(auto-fill, minmax(340px, 1fr))',
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
                  isTracePath={viewMode === 'trace-path' && pathTraceIds.has(trace.id)}
                />
              ))}
            </div>
          )}

          {/* Timeline at bottom */}
          <div style={{
            marginTop: 32,
            borderRadius: 'var(--radius-lg)',
            overflow: 'hidden',
          }}>
            <div style={{
              overflowX: isMobile ? 'auto' : 'hidden',
              WebkitOverflowScrolling: 'touch',
            }}>
              <div style={{ minWidth: isMobile ? 600 : undefined }}>
                <Timeline
                  traces={filteredTraces}
                  onTraceClick={handleTimelineClick}
                  activeTraceId={expandedTraceId || undefined}
                />
              </div>
            </div>
          </div>
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
