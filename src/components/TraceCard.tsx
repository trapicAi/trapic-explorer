import { Link, useNavigate } from 'react-router-dom';
import type { ExplorerTrace } from '@/types/trace';
import { getTypeColor, getCausesCount, getEffectsCount } from '@/lib/data';
import { getTypeLabel } from '@/lib/typeLabels';
import { GitBranch, Crosshair, BarChart3, BookOpen, Zap } from 'lucide-react';

interface TraceCardProps {
  trace: ExplorerTrace;
  datasetId: string;
  isExpanded?: boolean;
  onExpand?: () => void;
  isTracePath?: boolean;
}

function formatYear(year: number): string {
  if (year < 0) return `${Math.abs(year)} BC`;
  return `${year}`;
}

function getTypeIcon(type: string) {
  switch (type) {
    case 'decision': return <Crosshair size={13} />;
    case 'fact': return <BarChart3 size={13} />;
    case 'convention': return <BookOpen size={13} />;
    case 'state': return <Zap size={13} />;
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

export function TraceCard({ trace, datasetId, isExpanded, onExpand, isTracePath }: TraceCardProps) {
  const navigate = useNavigate();
  const causes = getCausesCount(trace.id);
  const effects = getEffectsCount(trace.id);
  const typeColor = getTypeColor(trace.type);

  const handleClick = () => {
    // Navigate to full trace page
    navigate(`/d/${datasetId}/trace/${trace.id}`);
  };

  return (
    <div
      id={`trace-${trace.id}`}
      onClick={handleClick}
      className={`animate-fade-in glass-card${isExpanded || isTracePath ? ` ${getGlowClass(trace.type)}` : ''}`}
      style={{
        position: 'relative',
        cursor: 'pointer',
        borderColor: isExpanded || isTracePath ? typeColor : undefined,
        overflow: 'hidden',
      }}
      onMouseEnter={e => {
        if (!isExpanded) {
          e.currentTarget.style.borderColor = typeColor;
          e.currentTarget.classList.add(getGlowClass(trace.type));
        }
      }}
      onMouseLeave={e => {
        if (!isExpanded && !isTracePath) {
          e.currentTarget.style.borderColor = '';
          e.currentTarget.classList.remove(getGlowClass(trace.type));
        }
      }}
    >
      <div style={{ padding: '16px 18px' }}>
        {/* Header row: type badge + causal counts */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 12,
          gap: 8,
        }}>
          <span
            className={getBadgeClass(trace.type)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5,
              padding: '4px 10px',
              borderRadius: 6,
              fontSize: 10,
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
            }}
          >
            {getTypeIcon(trace.type)}
            {getTypeLabel(trace.type)}
          </span>
          {(causes > 0 || effects > 0) && (
            <span className="mono" style={{
              fontSize: 10,
              color: 'var(--text-muted)',
              fontWeight: 500,
            }}>
              {causes > 0 ? `${causes} cause${causes !== 1 ? 's' : ''}` : ''}
              {causes > 0 && effects > 0 ? ' / ' : ''}
              {effects > 0 ? `${effects} effect${effects !== 1 ? 's' : ''}` : ''}
            </span>
          )}
        </div>

        {/* Title */}
        <h3 style={{
          fontSize: 15,
          fontWeight: 600,
          lineHeight: 1.45,
          color: 'var(--text-primary)',
          marginBottom: 4,
        }}>
          {trace.content}
        </h3>

        {/* Year */}
        <div className="mono" style={{
          fontSize: 11,
          color: 'var(--text-muted)',
          marginBottom: isExpanded ? 12 : 0,
          fontWeight: 500,
        }}>
          {formatYear(trace.year_numeric)}
          {trace.confidence !== 'high' && (
            <span style={{
              marginLeft: 8,
              color: trace.confidence === 'medium' ? 'var(--confidence-medium)' : 'var(--confidence-low)',
            }}>
              [{trace.confidence}]
            </span>
          )}
        </div>

        {/* Expanded: context */}
        {isExpanded && trace.context && (
          <p style={{
            fontSize: 13,
            lineHeight: 1.65,
            color: 'var(--text-secondary)',
            marginBottom: 12,
            paddingLeft: 12,
            borderLeft: `2px solid ${typeColor}`,
          }}>
            {trace.context}
          </p>
        )}

        {/* Tags */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 4,
          marginTop: 12,
        }}>
          {trace.tags.slice(0, 5).map(tag => (
            <span
              key={tag}
              style={{
                padding: '2px 7px',
                borderRadius: 4,
                fontSize: 10,
                color: 'var(--text-muted)',
                background: 'var(--bg-tertiary)',
                border: '1px solid var(--border-subtle)',
                fontWeight: 500,
              }}
            >
              {tag}
            </span>
          ))}
          {trace.tags.length > 5 && (
            <span className="mono" style={{
              fontSize: 10,
              color: 'var(--text-muted)',
              padding: '2px 4px',
            }}>
              +{trace.tags.length - 5}
            </span>
          )}
        </div>

        {/* Causal chain link */}
        {(causes > 0 || effects > 0) && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            marginTop: 12,
            paddingTop: 12,
            borderTop: '1px solid var(--glass-border)',
          }}>
            <Link
              to={`/d/${datasetId}/chain/${trace.id}`}
              onClick={e => e.stopPropagation()}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                fontSize: 11,
                color: 'var(--text-muted)',
                textDecoration: 'none',
                transition: 'color var(--transition)',
                fontWeight: 500,
              }}
              onMouseEnter={e => { e.currentTarget.style.color = 'var(--accent)'; }}
              onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; }}
            >
              <GitBranch size={12} />
              View causal chain
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

/* Arrow connector between cards for Trace Path mode */
export function CausalArrow({ label }: { label: string }) {
  return (
    <div className="causal-arrow" style={{ padding: '6px 0' }}>
      <div className="causal-arrow-line" />
      <div className="causal-arrow-label">{label}</div>
      <div className="causal-arrow-head" />
    </div>
  );
}
