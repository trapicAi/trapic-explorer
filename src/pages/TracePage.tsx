import { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { loadAllTraces, getTraceById, getChainForTrace, getTypeColor, getCausesCount, getEffectsCount } from '@/lib/data';
import { getTypeLabel } from '@/lib/typeLabels';
import type { ExplorerTrace } from '@/types/trace';
import { CausalChainMini } from '@/components/CausalChain';
import { Timeline } from '@/components/Timeline';
import { ArrowLeft, ArrowRight, GitBranch, Shield, Crosshair, BarChart3, BookOpen, Zap } from 'lucide-react';
import { useIsMobile } from '@/hooks/useIsMobile';

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

function formatYear(year: number): string {
  if (year < 0) return `${Math.abs(year)} BC`;
  return `${year}`;
}

function getTypeIcon(type: string) {
  switch (type) {
    case 'decision': return <Crosshair size={14} />;
    case 'fact': return <BarChart3 size={14} />;
    case 'convention': return <BookOpen size={14} />;
    case 'state': return <Zap size={14} />;
    default: return null;
  }
}

function getBadgeClass(type: string): string {
  switch (type) {
    case 'decision': return 'badge-decision';
    case 'fact': return 'badge-fact';
    case 'convention': return 'badge-convention';
    case 'state': return 'badge-state';
    default: return '';
  }
}

function getGlowClass(type: string): string {
  switch (type) {
    case 'decision': return 'glow-decision';
    case 'fact': return 'glow-fact';
    case 'convention': return 'glow-convention';
    case 'state': return 'glow-state';
    default: return '';
  }
}

function getRelationshipLabel(from: ExplorerTrace, to: ExplorerTrace): string {
  const fromType = from.type;
  const toType = to.type;
  if (fromType === 'decision' && toType === 'fact') return 'Triggers';
  if (fromType === 'decision' && toType === 'state') return 'Triggers';
  if (fromType === 'fact' && toType === 'decision') return 'Leads to';
  if (fromType === 'state' && toType === 'decision') return 'Escalates to';
  if (fromType === 'state' && toType === 'state') return 'Escalates to';
  if (fromType === 'convention' && toType === 'fact') return 'Mitigates';
  if (fromType === 'decision' && toType === 'convention') return 'Establishes';
  if (toType === 'state') return 'Results in';
  if (toType === 'decision') return 'Leads to';
  return 'Causes';
}

export function TracePage() {
  const { dataset, id } = useParams<{ dataset: string; id: string }>();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [trace, setTrace] = useState<ExplorerTrace | null>(null);
  const [allTraces, setAllTraces] = useState<ExplorerTrace[]>([]);
  const [chain, setChain] = useState<ExplorerTrace[]>([]);
  const [causes, setCauses] = useState<ExplorerTrace[]>([]);
  const [effects, setEffects] = useState<ExplorerTrace[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!dataset || !id) return;
    setLoading(true);
    loadAllTraces(dataset).then((traces) => {
      setAllTraces(traces);
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

  // Nearby traces for mini-timeline (same chain or close in time)
  const nearbyTraces = useMemo(() => {
    if (!trace || allTraces.length === 0) return [];
    // Use chain traces if available, otherwise find nearby by year
    if (chain.length > 1) return chain;
    const year = trace.year_numeric;
    return allTraces
      .filter(t => Math.abs(t.year_numeric - year) <= 100)
      .sort((a, b) => a.year_numeric - b.year_numeric)
      .slice(0, 20);
  }, [trace, chain, allTraces]);

  const handleTimelineClick = (traceId: string) => {
    navigate(`/d/${dataset}/trace/${traceId}`);
  };

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
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Breadcrumb bar */}
      <div style={{
        padding: isMobile ? '10px 12px' : '12px 24px',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        flexShrink: 0,
      }}>
        <Link
          to={`/d/${dataset}`}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            fontSize: 13,
            color: 'var(--text-muted)',
            transition: 'color var(--transition)',
          }}
          onMouseEnter={e => { e.currentTarget.style.color = 'var(--text-primary)'; }}
          onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; }}
        >
          <ArrowLeft size={14} />
          {dataset}
        </Link>
        <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>/</span>
        <span style={{
          fontSize: 13,
          color: 'var(--text-primary)',
          fontWeight: 500,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}>
          {trace.content.length > 60 ? trace.content.slice(0, 60) + '...' : trace.content}
        </span>
      </div>

      {/* Main content area */}
      <div style={{
        flex: 1,
        overflow: 'auto',
        display: 'flex',
        flexDirection: 'column',
      }}>
        {/* Section header */}
        <div style={{
          padding: isMobile ? '20px 12px 12px' : '28px 24px 16px',
          maxWidth: 1400,
          width: '100%',
          margin: '0 auto',
        }}>
          <h2 style={{
            fontSize: isMobile ? 11 : 12,
            fontWeight: 700,
            color: 'var(--text-muted)',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            lineHeight: 1.4,
          }}>
            Understand the &lsquo;why&rsquo; behind
          </h2>
          <h1 style={{
            fontSize: isMobile ? 18 : 24,
            fontWeight: 700,
            color: 'var(--text-primary)',
            lineHeight: 1.3,
            letterSpacing: '-0.02em',
            marginTop: 4,
          }}>
            {trace.content}
          </h1>
        </div>

        {/* Two-column layout */}
        <div style={{
          display: isMobile ? 'flex' : 'grid',
          gridTemplateColumns: isMobile ? undefined : '1fr 420px',
          flexDirection: isMobile ? 'column' : undefined,
          gap: isMobile ? 16 : 24,
          padding: isMobile ? '0 12px 24px' : '0 24px 32px',
          maxWidth: 1400,
          width: '100%',
          margin: '0 auto',
          flex: 1,
        }}>
          {/* ===== LEFT COLUMN: Main trace card ===== */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Main trace card */}
            <div
              className={`glass-card ${getGlowClass(trace.type)}`}
              style={{
                borderColor: typeColor,
                overflow: 'hidden',
              }}
            >
              <div style={{ padding: isMobile ? '18px 16px' : '24px 28px' }}>
                {/* Header: type badge + counts + confidence */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: 16,
                  flexWrap: 'wrap',
                  gap: 8,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span
                      className={getBadgeClass(trace.type)}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 5,
                        padding: '5px 12px',
                        borderRadius: 6,
                        fontSize: 11,
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        letterSpacing: '0.06em',
                      }}
                    >
                      {getTypeIcon(trace.type)}
                      {getTypeLabel(trace.type)}
                    </span>

                    {(causesCount > 0 || effectsCount > 0) && (
                      <span className="mono" style={{
                        fontSize: 11,
                        color: 'var(--text-muted)',
                        fontWeight: 500,
                      }}>
                        {causesCount > 0 ? `${causesCount} cause${causesCount !== 1 ? 's' : ''}` : ''}
                        {causesCount > 0 && effectsCount > 0 ? ' / ' : ''}
                        {effectsCount > 0 ? `${effectsCount} effect${effectsCount !== 1 ? 's' : ''}` : ''}
                      </span>
                    )}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Shield size={13} style={{ color: 'var(--text-muted)' }} />
                    <span style={{
                      fontSize: 12,
                      fontWeight: 500,
                      color: trace.confidence === 'high' ? 'var(--confidence-high)'
                        : trace.confidence === 'medium' ? 'var(--confidence-medium)'
                        : 'var(--confidence-low)',
                      textTransform: 'capitalize',
                    }}>
                      {trace.confidence}
                    </span>
                  </div>
                </div>

                {/* Content text */}
                <h2 style={{
                  fontSize: isMobile ? 18 : 22,
                  fontWeight: 700,
                  lineHeight: 1.35,
                  letterSpacing: '-0.01em',
                  color: 'var(--text-primary)',
                  marginBottom: 16,
                }}>
                  {trace.content}
                </h2>

                {/* Reasoning section */}
                {trace.context && (
                  <div style={{ marginBottom: 20 }}>
                    <div style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: 'var(--text-muted)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.08em',
                      marginBottom: 8,
                    }}>
                      Reasoning
                    </div>
                    <div style={{
                      padding: '14px 18px',
                      background: 'var(--bg-secondary)',
                      borderRadius: 'var(--radius)',
                      borderLeft: `4px solid ${typeColor}`,
                    }}>
                      <p style={{
                        fontSize: 14,
                        lineHeight: 1.75,
                        color: 'var(--text-secondary)',
                      }}>
                        {trace.context}
                      </p>
                    </div>
                  </div>
                )}

                {/* Tags */}
                <div style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 6,
                  marginBottom: 16,
                }}>
                  {trace.tags.map(tag => (
                    <span key={tag} style={{
                      padding: '4px 10px',
                      borderRadius: 6,
                      fontSize: 11,
                      color: 'var(--text-secondary)',
                      background: 'var(--bg-tertiary)',
                      border: '1px solid var(--border-subtle)',
                      fontWeight: 500,
                    }}>
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Date + ID footer */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingTop: 14,
                  borderTop: '1px solid var(--glass-border)',
                  flexWrap: 'wrap',
                  gap: 8,
                }}>
                  <span className="mono" style={{
                    fontSize: 12,
                    color: 'var(--text-muted)',
                    fontWeight: 500,
                  }}>
                    {formatDate(trace.date_start, trace.year_numeric)}
                  </span>
                  <span className="mono" style={{
                    fontSize: 10,
                    color: 'var(--text-muted)',
                    opacity: 0.7,
                  }}>
                    ID: {trace.id}
                  </span>
                </div>
              </div>
            </div>

            {/* Time-scrubber: mini timeline */}
            {nearbyTraces.length > 1 && (
              <div style={{
                borderRadius: 'var(--radius-lg)',
                overflow: 'hidden',
              }}>
                <Timeline
                  traces={nearbyTraces}
                  onTraceClick={handleTimelineClick}
                  activeTraceId={trace.id}
                />
              </div>
            )}
          </div>

          {/* ===== RIGHT COLUMN: Causal chain + connections ===== */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Causal Chain Logic */}
            {chain.length > 1 && (
              <div className="glass-card" style={{ overflow: 'hidden' }}>
                <div style={{ padding: isMobile ? '14px 14px' : '18px 20px' }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 14,
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                    }}>
                      <GitBranch size={14} style={{ color: 'var(--accent)' }} />
                      <span style={{
                        fontSize: 12,
                        fontWeight: 700,
                        color: 'var(--text-primary)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.06em',
                      }}>
                        Causal Chain
                      </span>
                      <span className="mono" style={{
                        fontSize: 10,
                        color: 'var(--text-muted)',
                        fontWeight: 500,
                      }}>
                        {chain.length} traces
                      </span>
                    </div>
                    <Link
                      to={`/d/${dataset}/chain/${trace.id}`}
                      style={{
                        fontSize: 11,
                        color: 'var(--accent)',
                        fontWeight: 500,
                      }}
                    >
                      Full view
                    </Link>
                  </div>

                  <CausalChainMini
                    chain={chain}
                    highlightId={trace.id}
                    datasetId={dataset || 'wars'}
                  />
                </div>
              </div>
            )}

            {/* Caused by section */}
            {causes.length > 0 && (
              <div className="glass-card" style={{ overflow: 'hidden' }}>
                <div style={{ padding: isMobile ? '14px 14px' : '18px 20px' }}>
                  <h3 style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: 'var(--text-muted)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    marginBottom: 12,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                  }}>
                    <ArrowRight size={13} style={{ transform: 'rotate(180deg)', color: typeColor }} />
                    Caused by
                    <span className="mono" style={{ fontWeight: 500, fontSize: 10 }}>
                      ({causesCount})
                    </span>
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {causes.map(cause => {
                      const causeColor = getTypeColor(cause.type);
                      // Find relationship label
                      const label = getRelationshipLabel(cause, trace);
                      return (
                        <Link
                          key={cause.id}
                          to={`/d/${dataset}/trace/${cause.id}`}
                          style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 4,
                            padding: '10px 14px',
                            borderRadius: 'var(--radius)',
                            background: 'var(--bg-secondary)',
                            border: '1px solid var(--border)',
                            textDecoration: 'none',
                            transition: 'all var(--transition)',
                          }}
                          onMouseEnter={e => {
                            e.currentTarget.style.borderColor = causeColor;
                            e.currentTarget.style.background = 'var(--bg-tertiary)';
                          }}
                          onMouseLeave={e => {
                            e.currentTarget.style.borderColor = 'var(--border)';
                            e.currentTarget.style.background = 'var(--bg-secondary)';
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span style={{
                              padding: '1px 6px',
                              borderRadius: 4,
                              fontSize: 9,
                              fontWeight: 600,
                              textTransform: 'uppercase',
                              color: causeColor,
                              background: `color-mix(in srgb, ${causeColor} 12%, transparent)`,
                            }}>
                              {getTypeLabel(cause.type)}
                            </span>
                            <span className="mono" style={{
                              fontSize: 10,
                              color: 'var(--accent)',
                              fontWeight: 500,
                            }}>
                              {label}
                            </span>
                          </div>
                          <span style={{ fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.4 }}>
                            {cause.content}
                          </span>
                          <span className="mono" style={{ fontSize: 10, color: 'var(--text-muted)' }}>
                            {formatYear(cause.year_numeric)}
                          </span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Led to section */}
            {effects.length > 0 && (
              <div className="glass-card" style={{ overflow: 'hidden' }}>
                <div style={{ padding: isMobile ? '14px 14px' : '18px 20px' }}>
                  <h3 style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: 'var(--text-muted)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    marginBottom: 12,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                  }}>
                    <ArrowRight size={13} style={{ color: typeColor }} />
                    Led to
                    <span className="mono" style={{ fontWeight: 500, fontSize: 10 }}>
                      ({effectsCount})
                    </span>
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {effects.map(effect => {
                      const effectColor = getTypeColor(effect.type);
                      const label = getRelationshipLabel(trace, effect);
                      return (
                        <Link
                          key={effect.id}
                          to={`/d/${dataset}/trace/${effect.id}`}
                          style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 4,
                            padding: '10px 14px',
                            borderRadius: 'var(--radius)',
                            background: 'var(--bg-secondary)',
                            border: '1px solid var(--border)',
                            textDecoration: 'none',
                            transition: 'all var(--transition)',
                          }}
                          onMouseEnter={e => {
                            e.currentTarget.style.borderColor = effectColor;
                            e.currentTarget.style.background = 'var(--bg-tertiary)';
                          }}
                          onMouseLeave={e => {
                            e.currentTarget.style.borderColor = 'var(--border)';
                            e.currentTarget.style.background = 'var(--bg-secondary)';
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span style={{
                              padding: '1px 6px',
                              borderRadius: 4,
                              fontSize: 9,
                              fontWeight: 600,
                              textTransform: 'uppercase',
                              color: effectColor,
                              background: `color-mix(in srgb, ${effectColor} 12%, transparent)`,
                            }}>
                              {getTypeLabel(effect.type)}
                            </span>
                            <span className="mono" style={{
                              fontSize: 10,
                              color: 'var(--accent)',
                              fontWeight: 500,
                            }}>
                              {label}
                            </span>
                          </div>
                          <span style={{ fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.4 }}>
                            {effect.content}
                          </span>
                          <span className="mono" style={{ fontSize: 10, color: 'var(--text-muted)' }}>
                            {formatYear(effect.year_numeric)}
                          </span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Empty state for no connections */}
            {chain.length <= 1 && causes.length === 0 && effects.length === 0 && (
              <div className="glass-card" style={{ overflow: 'hidden' }}>
                <div style={{
                  padding: '24px 20px',
                  textAlign: 'center',
                  color: 'var(--text-muted)',
                  fontSize: 13,
                }}>
                  <GitBranch size={20} style={{ marginBottom: 8, opacity: 0.5 }} />
                  <p>No causal connections found for this trace.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
