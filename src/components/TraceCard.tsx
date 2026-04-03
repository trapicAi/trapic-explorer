import { Link } from 'react-router-dom';
import type { ExplorerTrace } from '@/types/trace';
import { getTypeColor, getCausesCount, getEffectsCount } from '@/lib/data';
import { GitBranch } from 'lucide-react';

interface TraceCardProps {
  trace: ExplorerTrace;
  datasetId: string;
  isExpanded?: boolean;
  onExpand?: () => void;
}

function formatYear(year: number): string {
  if (year < 0) return `${Math.abs(year)} BC`;
  return `${year}`;
}

export function TraceCard({ trace, datasetId, isExpanded, onExpand }: TraceCardProps) {
  const causes = getCausesCount(trace.id);
  const effects = getEffectsCount(trace.id);
  const typeColor = getTypeColor(trace.type);

  return (
    <div
      id={`trace-${trace.id}`}
      onClick={onExpand}
      className="animate-fade-in"
      style={{
        position: 'relative',
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
        cursor: 'pointer',
        transition: 'all var(--transition)',
        boxShadow: isExpanded ? 'var(--shadow)' : 'none',
      }}
      onMouseEnter={e => {
        if (!isExpanded) e.currentTarget.style.borderColor = typeColor;
      }}
      onMouseLeave={e => {
        if (!isExpanded) e.currentTarget.style.borderColor = 'var(--border)';
      }}
    >
      {/* Left color bar */}
      <div style={{
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
        width: 4,
        background: typeColor,
      }} />

      <div style={{ padding: '14px 16px 14px 20px' }}>
        {/* Header row */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: 8,
          gap: 12,
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}>
            <span style={{
              display: 'inline-block',
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
            {trace.confidence !== 'high' && (
              <span style={{
                fontSize: 10,
                color: trace.confidence === 'medium' ? 'var(--confidence-medium)' : 'var(--confidence-low)',
              }}>
                {trace.confidence}
              </span>
            )}
          </div>
          <span style={{
            fontSize: 11,
            color: 'var(--text-muted)',
            fontVariantNumeric: 'tabular-nums',
            flexShrink: 0,
          }}>
            {formatYear(trace.year_numeric)}
          </span>
        </div>

        {/* Content */}
        <p style={{
          fontSize: 14,
          lineHeight: 1.5,
          color: 'var(--text-primary)',
          marginBottom: isExpanded ? 10 : 0,
        }}>
          {trace.content}
        </p>

        {/* Expanded: context */}
        {isExpanded && trace.context && (
          <p style={{
            fontSize: 13,
            lineHeight: 1.6,
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
          marginTop: 10,
        }}>
          {trace.tags.map(tag => (
            <span
              key={tag}
              style={{
                padding: '1px 6px',
                borderRadius: 4,
                fontSize: 10,
                color: 'var(--text-muted)',
                background: 'var(--bg-tertiary)',
                border: '1px solid var(--border-subtle)',
              }}
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Causal chain link */}
        {(causes > 0 || effects > 0) && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            marginTop: 10,
            paddingTop: 10,
            borderTop: '1px solid var(--border-subtle)',
          }}>
            <Link
              to={`/d/${datasetId}/chain/${trace.id}`}
              onClick={e => e.stopPropagation()}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                fontSize: 11,
                color: 'var(--text-muted)',
                textDecoration: 'none',
                transition: 'color var(--transition)',
              }}
              onMouseEnter={e => { e.currentTarget.style.color = 'var(--accent)'; }}
              onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; }}
            >
              <GitBranch size={12} />
              {causes > 0 && <span>{causes} cause{causes !== 1 ? 's' : ''}</span>}
              {causes > 0 && effects > 0 && <span style={{ color: 'var(--border)' }}>|</span>}
              {effects > 0 && <span>{effects} effect{effects !== 1 ? 's' : ''}</span>}
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
