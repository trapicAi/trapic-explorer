import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, GitBranch, Database, Layers } from 'lucide-react';
import { getDatasets, loadAllTraces, getChainForTrace } from '@/lib/data';
import type { ExplorerTrace } from '@/types/trace';
import { getTypeColor } from '@/lib/data';

function AnimatedCounter({ target, label, delay }: { target: string; label: string; delay: number }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(t);
  }, [delay]);

  return (
    <div style={{
      textAlign: 'center',
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateY(0)' : 'translateY(12px)',
      transition: 'all 0.5s ease',
    }}>
      <div style={{
        fontSize: 40,
        fontWeight: 700,
        letterSpacing: '-0.03em',
        color: 'var(--text-primary)',
        lineHeight: 1.1,
      }}>
        {target}
      </div>
      <div style={{
        fontSize: 13,
        color: 'var(--text-muted)',
        marginTop: 4,
        textTransform: 'uppercase',
        letterSpacing: '0.08em',
        fontWeight: 500,
      }}>
        {label}
      </div>
    </div>
  );
}

function formatYear(year: number): string {
  if (year < 0) return `${Math.abs(year)} BC`;
  return `${year}`;
}

function ChainPreview({ chain, datasetId }: { chain: ExplorerTrace[]; datasetId: string }) {
  const preview = chain.slice(0, 6);
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: 0,
    }}>
      {preview.map((trace, i) => {
        const typeColor = getTypeColor(trace.type);
        return (
          <div
            key={trace.id}
            className="animate-fade-in"
            style={{ animationDelay: `${800 + i * 100}ms`, animationFillMode: 'backwards' }}
          >
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '8px 0',
            }}>
              {/* Dot + line */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                width: 20,
              }}>
                <div style={{
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  background: typeColor,
                  boxShadow: `0 0 8px ${typeColor}`,
                  flexShrink: 0,
                }} />
              </div>
              {/* Content */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontSize: 13,
                  color: 'var(--text-primary)',
                  lineHeight: 1.4,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}>
                  {trace.content}
                </div>
                <div style={{
                  fontSize: 11,
                  color: 'var(--text-muted)',
                  marginTop: 2,
                }}>
                  {formatYear(trace.year_numeric)}
                </div>
              </div>
            </div>
            {/* Connector */}
            {i < preview.length - 1 && (
              <div style={{
                marginLeft: 9,
                width: 2,
                height: 8,
                background: `linear-gradient(to bottom, ${typeColor}, ${getTypeColor(preview[i + 1].type)})`,
              }} />
            )}
          </div>
        );
      })}
      {chain.length > 6 && (
        <Link
          to={`/d/${datasetId}/chain/ww2-001`}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '8px 0 0',
            fontSize: 12,
            color: 'var(--accent)',
          }}
        >
          <GitBranch size={12} />
          View full chain ({chain.length} traces)
          <ArrowRight size={12} />
        </Link>
      )}
    </div>
  );
}

export function HomePage() {
  const [datasets, setDatasets] = useState<{ id: string; name: string; description: string; icon: string }[]>([]);
  const [traceCount, setTraceCount] = useState(0);
  const [featuredChain, setFeaturedChain] = useState<ExplorerTrace[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const ds = await getDatasets();
        setDatasets(ds);
        const traces = await loadAllTraces('wars');
        setTraceCount(traces.length);
        // Get the WW1->WW2 chain starting from Treaty of Versailles
        const chain = getChainForTrace('ww2-001');
        setFeaturedChain(chain);
      } catch (err) {
        console.error('Failed to load data:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--text-muted)',
      }}>
        Loading knowledge traces...
      </div>
    );
  }

  return (
    <div style={{ flex: 1 }}>
      {/* Hero */}
      <section style={{
        padding: '80px 24px 60px',
        textAlign: 'center',
        background: `radial-gradient(ellipse at 50% 0%, color-mix(in srgb, var(--accent) 6%, transparent) 0%, transparent 70%)`,
      }}>
        <div style={{
          maxWidth: 720,
          margin: '0 auto',
        }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '4px 14px',
            borderRadius: 20,
            fontSize: 12,
            fontWeight: 500,
            color: 'var(--accent)',
            background: 'var(--accent-dim)',
            border: '1px solid color-mix(in srgb, var(--accent) 25%, transparent)',
            marginBottom: 24,
          }}>
            <Database size={12} />
            Knowledge trace explorer
          </div>

          <h1 style={{
            fontSize: 48,
            fontWeight: 700,
            letterSpacing: '-0.03em',
            lineHeight: 1.15,
            color: 'var(--text-primary)',
            marginBottom: 16,
          }}>
            Explore history as
            <br />
            <span style={{ color: 'var(--accent)' }}>causal knowledge</span>
          </h1>

          <p style={{
            fontSize: 17,
            lineHeight: 1.6,
            color: 'var(--text-secondary)',
            maxWidth: 540,
            margin: '0 auto 40px',
          }}>
            Decisions, facts, conventions, and state changes — connected through
            causal chains that reveal how events shape history.
          </p>

          {/* Stats */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: 48,
            marginBottom: 40,
          }}>
            <AnimatedCounter target={`${traceCount}+`} label="Traces" delay={200} />
            <AnimatedCounter target="4" label="Conflicts" delay={400} />
            <AnimatedCounter target="5,000" label="Years" delay={600} />
          </div>

          <Link
            to="/d/wars"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '12px 28px',
              borderRadius: 'var(--radius)',
              background: 'var(--accent)',
              color: '#fff',
              fontSize: 15,
              fontWeight: 600,
              textDecoration: 'none',
              transition: 'all var(--transition)',
              boxShadow: '0 4px 16px color-mix(in srgb, var(--accent) 30%, transparent)',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.boxShadow = '0 6px 24px color-mix(in srgb, var(--accent) 40%, transparent)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 16px color-mix(in srgb, var(--accent) 30%, transparent)';
            }}
          >
            Start Exploring
            <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* Featured chain */}
      <section style={{
        maxWidth: 1100,
        margin: '0 auto',
        padding: '40px 24px 60px',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 40,
        alignItems: 'start',
      }}>
        <div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            marginBottom: 16,
          }}>
            <GitBranch size={16} style={{ color: 'var(--accent)' }} />
            <h2 style={{
              fontSize: 20,
              fontWeight: 600,
              color: 'var(--text-primary)',
              letterSpacing: '-0.02em',
            }}>
              Featured Causal Chain
            </h2>
          </div>
          <p style={{
            fontSize: 14,
            lineHeight: 1.6,
            color: 'var(--text-secondary)',
            marginBottom: 24,
          }}>
            From the Treaty of Versailles to the atomic age — trace how one decision
            cascaded through decades, reshaping the world.
          </p>

          {/* Type legend */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 8,
          }}>
            {[
              { type: 'decision', desc: 'Strategic choices made by leaders' },
              { type: 'fact', desc: 'Verified historical events' },
              { type: 'convention', desc: 'Military doctrines & patterns' },
              { type: 'state', desc: 'Regime changes & turning points' },
            ].map(item => (
              <div key={item.type} style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 8,
                padding: '10px 12px',
                background: 'var(--bg-secondary)',
                borderRadius: 'var(--radius)',
                border: '1px solid var(--border)',
              }}>
                <div style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: getTypeColor(item.type),
                  flexShrink: 0,
                  marginTop: 4,
                }} />
                <div>
                  <div style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: getTypeColor(item.type),
                    textTransform: 'capitalize',
                    marginBottom: 2,
                  }}>
                    {item.type}
                  </div>
                  <div style={{
                    fontSize: 11,
                    color: 'var(--text-muted)',
                    lineHeight: 1.4,
                  }}>
                    {item.desc}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)',
          padding: '20px 24px',
          boxShadow: 'var(--shadow)',
        }}>
          <ChainPreview chain={featuredChain} datasetId="wars" />
        </div>
      </section>

      {/* Dataset cards */}
      <section style={{
        maxWidth: 1100,
        margin: '0 auto',
        padding: '0 24px 60px',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          marginBottom: 24,
        }}>
          <Layers size={16} style={{ color: 'var(--accent)' }} />
          <h2 style={{
            fontSize: 20,
            fontWeight: 600,
            color: 'var(--text-primary)',
            letterSpacing: '-0.02em',
          }}>
            Datasets
          </h2>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320, 1fr))',
          gap: 16,
        }}>
          {datasets.map(ds => (
            <Link
              key={ds.id}
              to={`/d/${ds.id}`}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 16,
                padding: '20px 24px',
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-lg)',
                textDecoration: 'none',
                transition: 'all var(--transition)',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = 'var(--accent)';
                e.currentTarget.style.boxShadow = 'var(--shadow)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'var(--border)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <span style={{ fontSize: 32 }}>{ds.icon}</span>
              <div>
                <h3 style={{
                  fontSize: 16,
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                  marginBottom: 4,
                }}>
                  {ds.name}
                </h3>
                <p style={{
                  fontSize: 13,
                  color: 'var(--text-secondary)',
                  lineHeight: 1.5,
                  marginBottom: 8,
                }}>
                  {ds.description}
                </p>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  fontSize: 12,
                  color: 'var(--accent)',
                  fontWeight: 500,
                }}>
                  Explore
                  <ArrowRight size={12} />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid var(--border)',
        padding: '24px',
        textAlign: 'center',
      }}>
        <div style={{
          fontSize: 13,
          color: 'var(--text-muted)',
        }}>
          Powered by{' '}
          <a
            href="https://trapic.ai"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: 'var(--accent)', fontWeight: 500 }}
          >
            Trapic
          </a>
          {' '} — Knowledge traces for AI agents
        </div>
      </footer>
    </div>
  );
}
