import { useState, useEffect, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Search, Layers } from 'lucide-react';
import { getDatasets, loadAllTraces } from '@/lib/data';
import { useIsMobile } from '@/hooks/useIsMobile';

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
      transition: 'all 0.6s ease',
    }}>
      <div style={{
        fontSize: 36,
        fontWeight: 700,
        fontFamily: 'var(--font-mono)',
        letterSpacing: '-0.03em',
        color: 'var(--text-primary)',
        lineHeight: 1.1,
      }}>
        {target}
      </div>
      <div style={{
        fontSize: 11,
        color: 'var(--text-muted)',
        marginTop: 4,
        textTransform: 'uppercase',
        letterSpacing: '0.1em',
        fontWeight: 500,
      }}>
        {label}
      </div>
    </div>
  );
}

export function HomePage() {
  const [datasets, setDatasets] = useState<{ id: string; name: string; description: string; icon: string }[]>([]);
  const [traceCount, setTraceCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const isMobile = useIsMobile();
  const navigate = useNavigate();

  useEffect(() => {
    async function load() {
      try {
        const ds = await getDatasets();
        setDatasets(ds);
        const traces = await loadAllTraces('wars');
        setTraceCount(traces.length);
      } catch {
        setError('Failed to load datasets. Please try refreshing the page.');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  function handleSearch(e: FormEvent) {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/d/wars?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  }

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
    <div style={{ flex: 1 }}>
      {/* Hero */}
      <section style={{
        padding: isMobile ? '60px 16px 48px' : '100px 24px 72px',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Background glow */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: `
            radial-gradient(ellipse 60% 40% at 50% 0%, rgba(255, 79, 56, 0.06) 0%, transparent 70%),
            radial-gradient(ellipse 40% 30% at 30% 20%, rgba(129, 140, 248, 0.04) 0%, transparent 70%),
            radial-gradient(ellipse 40% 30% at 70% 20%, rgba(74, 222, 128, 0.03) 0%, transparent 70%)
          `,
          pointerEvents: 'none',
        }} />

        <div style={{
          maxWidth: 780,
          margin: '0 auto',
          position: 'relative',
          zIndex: 1,
        }}>
          <h1 style={{
            fontSize: isMobile ? 28 : 52,
            fontWeight: 800,
            letterSpacing: '-0.04em',
            lineHeight: 1.1,
            color: 'var(--text-primary)',
            marginBottom: 16,
            textTransform: 'uppercase',
          }}>
            Trace History as
            <br />
            <span style={{
              background: 'linear-gradient(135deg, var(--accent), #ff8c75)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>
              Causal Knowledge
            </span>
          </h1>

          <p style={{
            fontSize: isMobile ? 14 : 16,
            lineHeight: 1.7,
            color: 'var(--text-secondary)',
            maxWidth: 560,
            margin: '0 auto 36px',
          }}>
            Understand how events shape and connect our world,
            driven by AI-powered causal reasoning.
          </p>

          {/* Search bar */}
          <form
            onSubmit={handleSearch}
            style={{
              maxWidth: 600,
              margin: '0 auto 32px',
              position: 'relative',
            }}
          >
            <div style={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              background: 'var(--glass-bg)',
              backdropFilter: 'blur(var(--glass-blur))',
              WebkitBackdropFilter: 'blur(var(--glass-blur))',
              border: `1px solid ${searchFocused ? 'var(--accent)' : 'var(--glass-border)'}`,
              borderRadius: 16,
              transition: 'all 0.3s ease',
              boxShadow: searchFocused
                ? '0 0 0 3px rgba(255, 79, 56, 0.1), 0 8px 32px rgba(0,0,0,0.3)'
                : '0 4px 24px rgba(0,0,0,0.2)',
            }}>
              <Search size={18} style={{
                position: 'absolute',
                left: 18,
                color: searchFocused ? 'var(--accent)' : 'var(--text-muted)',
                transition: 'color 0.2s',
                pointerEvents: 'none',
              }} />
              <input
                type="text"
                placeholder="Search historical traces (e.g., 'Treaty of Nanking')..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
                style={{
                  width: '100%',
                  height: isMobile ? 52 : 56,
                  padding: '0 120px 0 48px',
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-primary)',
                  fontSize: isMobile ? 14 : 15,
                  outline: 'none',
                }}
              />
              <button
                type="submit"
                style={{
                  position: 'absolute',
                  right: 6,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '10px 20px',
                  borderRadius: 12,
                  background: 'var(--accent)',
                  color: '#fff',
                  fontSize: 13,
                  fontWeight: 600,
                  transition: 'all var(--transition)',
                  boxShadow: '0 2px 8px rgba(255, 79, 56, 0.3)',
                }}
              >
                Search
                <ArrowRight size={14} />
              </button>
            </div>
          </form>

          {/* Stats row */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: isMobile ? 28 : 56,
            flexWrap: 'wrap',
          }}>
            <AnimatedCounter target={`${traceCount}+`} label="Traces" delay={200} />
            <div style={{
              width: 1,
              alignSelf: 'stretch',
              background: 'var(--border)',
              opacity: 0.5,
            }} />
            <AnimatedCounter target="4" label="Conflicts" delay={400} />
            <div style={{
              width: 1,
              alignSelf: 'stretch',
              background: 'var(--border)',
              opacity: 0.5,
            }} />
            <AnimatedCounter target="5,000" label="Years" delay={600} />
          </div>
        </div>
      </section>

      {/* Dataset cards */}
      <section style={{
        maxWidth: 1100,
        margin: '0 auto',
        padding: isMobile ? '0 16px 48px' : '0 24px 72px',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          marginBottom: 28,
        }}>
          <div style={{
            width: 32,
            height: 32,
            borderRadius: 8,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'var(--accent-dim)',
            border: '1px solid rgba(255, 79, 56, 0.2)',
          }}>
            <Layers size={16} style={{ color: 'var(--accent)' }} />
          </div>
          <h2 style={{
            fontSize: 22,
            fontWeight: 700,
            color: 'var(--text-primary)',
            letterSpacing: '-0.02em',
          }}>
            Datasets
          </h2>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(340px, 1fr))',
          gap: 16,
        }}>
          {datasets.map(ds => (
            <Link
              key={ds.id}
              to={`/d/${ds.id}`}
              className="glass-card"
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 16,
                padding: '24px',
                textDecoration: 'none',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {/* Subtle gradient accent on left */}
              <div style={{
                position: 'absolute',
                left: 0,
                top: 0,
                bottom: 0,
                width: 3,
                background: 'linear-gradient(to bottom, var(--accent), transparent)',
                opacity: 0.5,
              }} />
              <span style={{ fontSize: 36, lineHeight: 1 }}>{ds.icon}</span>
              <div style={{ flex: 1 }}>
                <h3 style={{
                  fontSize: 17,
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                  marginBottom: 6,
                }}>
                  {ds.name}
                </h3>
                <p style={{
                  fontSize: 13,
                  color: 'var(--text-secondary)',
                  lineHeight: 1.6,
                  marginBottom: 12,
                }}>
                  {ds.description}
                </p>
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  fontSize: 12,
                  color: 'var(--accent)',
                  fontWeight: 600,
                  padding: '4px 12px',
                  borderRadius: 6,
                  background: 'var(--accent-dim)',
                  border: '1px solid rgba(255, 79, 56, 0.2)',
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
