import { Link } from 'react-router-dom';
import type { ExplorerTrace } from '@/types/trace';
import { getTraceById, getTypeColor, getChainForTrace } from '@/lib/data';
import { X, GitBranch, ArrowRight, Shield } from 'lucide-react';
import { CausalChainMini } from './CausalChain';

interface TraceDetailProps {
  trace: ExplorerTrace;
  datasetId: string;
  onClose: () => void;
}

function formatDate(dateStr: string, year: number): string {
  if (year < 0) return `${Math.abs(year)} BC`;
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return `${year}`;
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  } catch {
    return `${year}`;
  }
}

export function TraceDetail({ trace, datasetId, onClose }: TraceDetailProps) {
  const typeColor = getTypeColor(trace.type);
  const chain = getChainForTrace(trace.id);
  const causes = trace.caused_by
    .map(id => getTraceById(id))
    .filter((t): t is ExplorerTrace => t !== undefined);
  const effects = chain.filter(t =>
    t.id !== trace.id && t.caused_by.includes(trace.id)
  );

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 200,
      display: 'flex',
      justifyContent: 'flex-end',
    }}>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(0,0,0,0.5)',
          backdropFilter: 'blur(4px)',
        }}
      />

      {/* Panel */}
      <div
        className="animate-slide-in"
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: 560,
          background: 'var(--bg-primary)',
          borderLeft: '1px solid var(--border)',
          overflowY: 'auto',
          boxShadow: 'var(--shadow-lg)',
        }}
      >
        {/* Top bar */}
        <div style={{
          position: 'sticky',
          top: 0,
          background: 'var(--bg-primary)',
          borderBottom: '1px solid var(--border)',
          padding: '12px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          zIndex: 10,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{
              padding: '3px 10px',
              borderRadius: 4,
              fontSize: 11,
              fontWeight: 600,
              textTransform: 'uppercase',
              color: typeColor,
              background: `color-mix(in srgb, ${typeColor} 12%, transparent)`,
            }}>
              {trace.type}
            </span>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              {formatDate(trace.date_start, trace.year_numeric)}
            </span>
          </div>
          <button
            onClick={onClose}
            style={{
              width: 28,
              height: 28,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 'var(--radius)',
              color: 'var(--text-muted)',
            }}
          >
            <X size={16} />
          </button>
        </div>

        <div style={{ padding: 20 }}>
          {/* Content */}
          <h2 style={{
            fontSize: 18,
            fontWeight: 600,
            lineHeight: 1.4,
            color: 'var(--text-primary)',
            marginBottom: 16,
          }}>
            {trace.content}
          </h2>

          {trace.context && (
            <div style={{
              padding: '12px 16px',
              background: 'var(--bg-secondary)',
              borderRadius: 'var(--radius)',
              borderLeft: `3px solid ${typeColor}`,
              marginBottom: 20,
            }}>
              <p style={{
                fontSize: 14,
                lineHeight: 1.7,
                color: 'var(--text-secondary)',
              }}>
                {trace.context}
              </p>
            </div>
          )}

          {/* Confidence */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            marginBottom: 20,
            fontSize: 12,
            color: 'var(--text-muted)',
          }}>
            <Shield size={12} />
            Confidence: <span style={{
              color: trace.confidence === 'high' ? 'var(--confidence-high)'
                : trace.confidence === 'medium' ? 'var(--confidence-medium)'
                : 'var(--confidence-low)',
              fontWeight: 500,
              textTransform: 'capitalize',
            }}>{trace.confidence}</span>
          </div>

          {/* Tags */}
          <div style={{ marginBottom: 20 }}>
            <div style={{
              fontSize: 11,
              fontWeight: 600,
              color: 'var(--text-muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginBottom: 8,
            }}>
              Tags
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
              {trace.tags.map(tag => (
                <span key={tag} style={{
                  padding: '3px 8px',
                  borderRadius: 4,
                  fontSize: 12,
                  color: 'var(--text-secondary)',
                  background: 'var(--bg-tertiary)',
                  border: '1px solid var(--border)',
                }}>
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Causes */}
          {causes.length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <div style={{
                fontSize: 11,
                fontWeight: 600,
                color: 'var(--text-muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                marginBottom: 8,
              }}>
                Caused by
              </div>
              {causes.map(cause => (
                <Link
                  key={cause.id}
                  to={`/d/${datasetId}/trace/${cause.id}`}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 8,
                    padding: '8px 12px',
                    borderRadius: 'var(--radius)',
                    background: 'var(--bg-secondary)',
                    marginBottom: 4,
                    textDecoration: 'none',
                    color: 'var(--text-secondary)',
                    fontSize: 13,
                    transition: 'background var(--transition)',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-tertiary)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'var(--bg-secondary)'; }}
                >
                  <ArrowRight size={14} style={{
                    color: getTypeColor(cause.type),
                    flexShrink: 0,
                    marginTop: 2,
                    transform: 'rotate(180deg)',
                  }} />
                  <span>{cause.content}</span>
                </Link>
              ))}
            </div>
          )}

          {/* Effects */}
          {effects.length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <div style={{
                fontSize: 11,
                fontWeight: 600,
                color: 'var(--text-muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                marginBottom: 8,
              }}>
                Led to
              </div>
              {effects.map(effect => (
                <Link
                  key={effect.id}
                  to={`/d/${datasetId}/trace/${effect.id}`}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 8,
                    padding: '8px 12px',
                    borderRadius: 'var(--radius)',
                    background: 'var(--bg-secondary)',
                    marginBottom: 4,
                    textDecoration: 'none',
                    color: 'var(--text-secondary)',
                    fontSize: 13,
                    transition: 'background var(--transition)',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-tertiary)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'var(--bg-secondary)'; }}
                >
                  <ArrowRight size={14} style={{
                    color: getTypeColor(effect.type),
                    flexShrink: 0,
                    marginTop: 2,
                  }} />
                  <span>{effect.content}</span>
                </Link>
              ))}
            </div>
          )}

          {/* Chain visualization */}
          {chain.length > 1 && (
            <div style={{ marginBottom: 20 }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 12,
              }}>
                <div style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: 'var(--text-muted)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}>
                  Causal Chain
                </div>
                <Link
                  to={`/d/${datasetId}/chain/${trace.id}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                    fontSize: 11,
                    color: 'var(--accent)',
                  }}
                >
                  <GitBranch size={12} />
                  View full chain
                </Link>
              </div>
              <CausalChainMini
                chain={chain}
                highlightId={trace.id}
                datasetId={datasetId}
              />
            </div>
          )}

          {/* Trace ID */}
          <div style={{
            fontSize: 10,
            color: 'var(--text-muted)',
            fontFamily: 'monospace',
            paddingTop: 12,
            borderTop: '1px solid var(--border)',
          }}>
            ID: {trace.id}
          </div>
        </div>
      </div>
    </div>
  );
}
