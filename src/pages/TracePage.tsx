import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { loadAllTraces, getTraceById, getChainForTrace, getTypeColor, getCausesCount, getEffectsCount } from '@/lib/data';
import type { ExplorerTrace } from '@/types/trace';
import { CausalChainMini } from '@/components/CausalChain';
import { ArrowLeft, ArrowRight, GitBranch, Shield } from 'lucide-react';

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

export function TracePage() {
  const { dataset, id } = useParams<{ dataset: string; id: string }>();
  const [trace, setTrace] = useState<ExplorerTrace | null>(null);
  const [chain, setChain] = useState<ExplorerTrace[]>([]);
  const [causes, setCauses] = useState<ExplorerTrace[]>([]);
  const [effects, setEffects] = useState<ExplorerTrace[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!dataset || !id) return;
    setLoading(true);
    loadAllTraces(dataset).then(() => {
      const t = getTraceById(id);
      if (t) {
        setTrace(t);
        const c = getChainForTrace(id);
        setChain(c);
        const causesArr = t.caused_by
          .map(cid => getTraceById(cid))
          .filter((x): x is ExplorerTrace => x !== undefined);
        setCauses(causesArr);
        const effectsArr = c.filter(ct => ct.id !== t.id && ct.caused_by.includes(t.id));
        setEffects(effectsArr);
      }
    }).finally(() => setLoading(false));
  }, [dataset, id]);

  if (loading) {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
        Loading trace...
      </div>
    );
  }

  if (!trace) {
    return (
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
        <p style={{ color: 'var(--text-muted)', fontSize: 15 }}>Trace not found</p>
        <Link to={`/d/${dataset}`} style={{ color: 'var(--accent)', fontSize: 13 }}>
          Back to explorer
        </Link>
      </div>
    );
  }

  const typeColor = getTypeColor(trace.type);
  const causesCount = getCausesCount(trace.id);
  const effectsCount = getEffectsCount(trace.id);

  return (
    <div style={{ flex: 1, overflowY: 'auto' }}>
      <div style={{
        maxWidth: 800,
        margin: '0 auto',
        padding: '24px 16px 60px',
      }}>
        {/* Breadcrumb */}
        <Link
          to={`/d/${dataset}`}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            fontSize: 13,
            color: 'var(--text-muted)',
            marginBottom: 24,
          }}
        >
          <ArrowLeft size={14} />
          Back to {dataset}
        </Link>

        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          marginBottom: 16,
        }}>
          <span style={{
            padding: '4px 12px',
            borderRadius: 6,
            fontSize: 12,
            fontWeight: 600,
            textTransform: 'uppercase',
            color: typeColor,
            background: `color-mix(in srgb, ${typeColor} 12%, transparent)`,
          }}>
            {trace.type}
          </span>
          <span style={{ fontSize: 14, color: 'var(--text-muted)' }}>
            {formatDate(trace.date_start, trace.year_numeric)}
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginLeft: 'auto' }}>
            <Shield size={12} style={{ color: 'var(--text-muted)' }} />
            <span style={{
              fontSize: 12,
              color: trace.confidence === 'high' ? 'var(--confidence-high)'
                : trace.confidence === 'medium' ? 'var(--confidence-medium)'
                : 'var(--confidence-low)',
              textTransform: 'capitalize',
            }}>
              {trace.confidence}
            </span>
          </div>
        </div>

        {/* Content */}
        <h1 style={{
          fontSize: 28,
          fontWeight: 700,
          lineHeight: 1.3,
          letterSpacing: '-0.02em',
          color: 'var(--text-primary)',
          marginBottom: 20,
        }}>
          {trace.content}
        </h1>

        {trace.context && (
          <div style={{
            padding: '16px 20px',
            background: 'var(--bg-secondary)',
            borderRadius: 'var(--radius-lg)',
            borderLeft: `4px solid ${typeColor}`,
            marginBottom: 28,
          }}>
            <p style={{
              fontSize: 15,
              lineHeight: 1.7,
              color: 'var(--text-secondary)',
            }}>
              {trace.context}
            </p>
          </div>
        )}

        {/* Tags */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 6,
          marginBottom: 28,
        }}>
          {trace.tags.map(tag => (
            <span key={tag} style={{
              padding: '4px 10px',
              borderRadius: 6,
              fontSize: 12,
              color: 'var(--text-secondary)',
              background: 'var(--bg-tertiary)',
              border: '1px solid var(--border)',
            }}>
              {tag}
            </span>
          ))}
        </div>

        {/* Causes */}
        {causes.length > 0 && (
          <div style={{ marginBottom: 28 }}>
            <h3 style={{
              fontSize: 13,
              fontWeight: 600,
              color: 'var(--text-muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginBottom: 12,
            }}>
              Caused by ({causesCount})
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {causes.map(cause => (
                <Link
                  key={cause.id}
                  to={`/d/${dataset}/trace/${cause.id}`}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 10,
                    padding: '10px 14px',
                    borderRadius: 'var(--radius)',
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border)',
                    textDecoration: 'none',
                    transition: 'border-color var(--transition)',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = getTypeColor(cause.type); }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; }}
                >
                  <ArrowRight size={14} style={{
                    color: getTypeColor(cause.type),
                    transform: 'rotate(180deg)',
                    flexShrink: 0,
                    marginTop: 3,
                  }} />
                  <div>
                    <span style={{ fontSize: 13, color: 'var(--text-primary)' }}>
                      {cause.content}
                    </span>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                      {cause.year_numeric < 0 ? `${Math.abs(cause.year_numeric)} BC` : cause.year_numeric}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Effects */}
        {effects.length > 0 && (
          <div style={{ marginBottom: 28 }}>
            <h3 style={{
              fontSize: 13,
              fontWeight: 600,
              color: 'var(--text-muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginBottom: 12,
            }}>
              Led to ({effectsCount})
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {effects.map(effect => (
                <Link
                  key={effect.id}
                  to={`/d/${dataset}/trace/${effect.id}`}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 10,
                    padding: '10px 14px',
                    borderRadius: 'var(--radius)',
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border)',
                    textDecoration: 'none',
                    transition: 'border-color var(--transition)',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = getTypeColor(effect.type); }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; }}
                >
                  <ArrowRight size={14} style={{
                    color: getTypeColor(effect.type),
                    flexShrink: 0,
                    marginTop: 3,
                  }} />
                  <div>
                    <span style={{ fontSize: 13, color: 'var(--text-primary)' }}>
                      {effect.content}
                    </span>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                      {effect.year_numeric < 0 ? `${Math.abs(effect.year_numeric)} BC` : effect.year_numeric}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Chain */}
        {chain.length > 1 && (
          <div style={{ marginBottom: 28 }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 16,
            }}>
              <h3 style={{
                fontSize: 13,
                fontWeight: 600,
                color: 'var(--text-muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}>
                Causal Chain ({chain.length} traces)
              </h3>
              <Link
                to={`/d/${dataset}/chain/${trace.id}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  fontSize: 12,
                  color: 'var(--accent)',
                }}
              >
                <GitBranch size={12} />
                Full chain view
              </Link>
            </div>
            <div style={{
              background: 'var(--bg-secondary)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border)',
              padding: '12px 16px',
            }}>
              <CausalChainMini
                chain={chain}
                highlightId={trace.id}
                datasetId={dataset || 'wars'}
              />
            </div>
          </div>
        )}

        {/* ID */}
        <div style={{
          fontSize: 11,
          color: 'var(--text-muted)',
          fontFamily: 'monospace',
          paddingTop: 16,
          borderTop: '1px solid var(--border)',
        }}>
          Trace ID: {trace.id}
        </div>
      </div>
    </div>
  );
}
