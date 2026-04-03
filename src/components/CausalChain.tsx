import { Link } from 'react-router-dom';
import type { ExplorerTrace } from '@/types/trace';
import { getTypeColor } from '@/lib/data';

interface CausalChainMiniProps {
  chain: ExplorerTrace[];
  highlightId?: string;
  datasetId: string;
}

interface CausalChainFullProps {
  chain: ExplorerTrace[];
  highlightId?: string;
  datasetId: string;
}

function formatYear(year: number): string {
  if (year < 0) return `${Math.abs(year)} BC`;
  return `${year}`;
}

export function CausalChainMini({ chain, highlightId, datasetId }: CausalChainMiniProps) {
  // Show max 8 nodes in mini view
  const visibleChain = chain.slice(0, 8);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: 0,
    }}>
      {visibleChain.map((trace, i) => {
        const isHighlighted = trace.id === highlightId;
        const typeColor = getTypeColor(trace.type);

        return (
          <div key={trace.id}>
            {/* Node */}
            <Link
              to={`/d/${datasetId}/trace/${trace.id}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '6px 10px',
                borderRadius: 'var(--radius)',
                background: isHighlighted ? `color-mix(in srgb, ${typeColor} 10%, transparent)` : 'transparent',
                border: isHighlighted ? `1px solid ${typeColor}` : '1px solid transparent',
                textDecoration: 'none',
                transition: 'all var(--transition)',
              }}
              onMouseEnter={e => {
                if (!isHighlighted) e.currentTarget.style.background = 'var(--bg-tertiary)';
              }}
              onMouseLeave={e => {
                if (!isHighlighted) e.currentTarget.style.background = 'transparent';
              }}
            >
              {/* Dot */}
              <div style={{
                width: 10,
                height: 10,
                borderRadius: '50%',
                background: typeColor,
                flexShrink: 0,
                boxShadow: isHighlighted ? `0 0 8px ${typeColor}` : 'none',
              }} />
              {/* Content */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontSize: 12,
                  color: isHighlighted ? 'var(--text-primary)' : 'var(--text-secondary)',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  fontWeight: isHighlighted ? 500 : 400,
                }}>
                  {trace.content}
                </div>
              </div>
              <span style={{
                fontSize: 10,
                color: 'var(--text-muted)',
                flexShrink: 0,
                fontVariantNumeric: 'tabular-nums',
              }}>
                {formatYear(trace.year_numeric)}
              </span>
            </Link>

            {/* Connector */}
            {i < visibleChain.length - 1 && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                paddingLeft: 14,
                height: 16,
              }}>
                <div style={{
                  width: 2,
                  height: '100%',
                  background: 'var(--border)',
                }} />
              </div>
            )}
          </div>
        );
      })}

      {chain.length > 8 && (
        <div style={{
          padding: '4px 10px',
          fontSize: 11,
          color: 'var(--text-muted)',
        }}>
          +{chain.length - 8} more in chain
        </div>
      )}
    </div>
  );
}

export function CausalChainFull({ chain, highlightId, datasetId }: CausalChainFullProps) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: 0,
      maxWidth: 800,
      margin: '0 auto',
    }}>
      {chain.map((trace, i) => {
        const isHighlighted = trace.id === highlightId;
        const typeColor = getTypeColor(trace.type);

        return (
          <div
            key={trace.id}
            className="animate-fade-in"
            style={{ animationDelay: `${i * 50}ms`, animationFillMode: 'backwards' }}
          >
            {/* Node */}
            <div style={{
              display: 'flex',
              gap: 16,
              padding: '12px 0',
            }}>
              {/* Left: vertical line + dot */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                width: 32,
                flexShrink: 0,
              }}>
                {/* Top connector */}
                {i > 0 && (
                  <div style={{
                    width: 2,
                    height: 12,
                    background: `linear-gradient(to bottom, ${getTypeColor(chain[i - 1].type)}, ${typeColor})`,
                  }} />
                )}

                {/* Dot */}
                <div style={{
                  width: isHighlighted ? 20 : 16,
                  height: isHighlighted ? 20 : 16,
                  borderRadius: '50%',
                  background: typeColor,
                  border: isHighlighted ? '3px solid var(--text-primary)' : `3px solid var(--bg-primary)`,
                  boxShadow: isHighlighted
                    ? `0 0 16px ${typeColor}, 0 0 32px ${typeColor}`
                    : `0 0 8px ${typeColor}`,
                  flexShrink: 0,
                  transition: 'all var(--transition)',
                }} />

                {/* Bottom connector */}
                {i < chain.length - 1 && (
                  <div style={{
                    width: 2,
                    flex: 1,
                    minHeight: 12,
                    background: `linear-gradient(to bottom, ${typeColor}, ${getTypeColor(chain[i + 1].type)})`,
                  }} />
                )}
              </div>

              {/* Right: card */}
              <Link
                to={`/d/${datasetId}/trace/${trace.id}`}
                style={{
                  flex: 1,
                  background: isHighlighted ? 'var(--bg-secondary)' : 'var(--bg-card)',
                  border: `1px solid ${isHighlighted ? typeColor : 'var(--border)'}`,
                  borderRadius: 'var(--radius-lg)',
                  padding: '14px 18px',
                  textDecoration: 'none',
                  transition: 'all var(--transition)',
                  boxShadow: isHighlighted ? `0 0 24px color-mix(in srgb, ${typeColor} 20%, transparent)` : 'none',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = typeColor;
                  e.currentTarget.style.boxShadow = `0 0 16px color-mix(in srgb, ${typeColor} 15%, transparent)`;
                }}
                onMouseLeave={e => {
                  if (!isHighlighted) {
                    e.currentTarget.style.borderColor = 'var(--border)';
                    e.currentTarget.style.boxShadow = 'none';
                  }
                }}
              >
                {/* Header */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 6,
                }}>
                  <span style={{
                    padding: '2px 8px',
                    borderRadius: 4,
                    fontSize: 10,
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    color: typeColor,
                    background: `color-mix(in srgb, ${typeColor} 12%, transparent)`,
                  }}>
                    {trace.type}
                  </span>
                  <span style={{
                    fontSize: 11,
                    color: 'var(--text-muted)',
                    fontVariantNumeric: 'tabular-nums',
                  }}>
                    {formatYear(trace.year_numeric)}
                  </span>
                </div>

                {/* Content */}
                <p style={{
                  fontSize: 14,
                  lineHeight: 1.5,
                  color: isHighlighted ? 'var(--text-primary)' : 'var(--text-secondary)',
                  fontWeight: isHighlighted ? 500 : 400,
                  marginBottom: trace.context && isHighlighted ? 8 : 0,
                }}>
                  {trace.content}
                </p>

                {/* Context (only for highlighted) */}
                {isHighlighted && trace.context && (
                  <p style={{
                    fontSize: 12,
                    lineHeight: 1.6,
                    color: 'var(--text-muted)',
                  }}>
                    {trace.context}
                  </p>
                )}

                {/* Tags */}
                <div style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 4,
                  marginTop: 8,
                }}>
                  {trace.tags.slice(0, 4).map(tag => (
                    <span key={tag} style={{
                      padding: '1px 6px',
                      borderRadius: 4,
                      fontSize: 10,
                      color: 'var(--text-muted)',
                      background: 'var(--bg-tertiary)',
                    }}>
                      {tag}
                    </span>
                  ))}
                  {trace.tags.length > 4 && (
                    <span style={{
                      fontSize: 10,
                      color: 'var(--text-muted)',
                      padding: '1px 4px',
                    }}>
                      +{trace.tags.length - 4}
                    </span>
                  )}
                </div>
              </Link>
            </div>
          </div>
        );
      })}
    </div>
  );
}
