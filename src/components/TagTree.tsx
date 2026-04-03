import { useState } from 'react';
import { ChevronRight, ChevronDown } from 'lucide-react';

interface TagTreeProps {
  tagGroups: Record<string, string[]>;
  tagCounts: Record<string, number>;
  activeTags: string[];
  onToggleTag: (tag: string) => void;
}

function TagGroup({
  prefix,
  values,
  tagCounts,
  activeTags,
  onToggleTag,
}: {
  prefix: string;
  values: string[];
  tagCounts: Record<string, number>;
  activeTags: string[];
  onToggleTag: (tag: string) => void;
}) {
  const [expanded, setExpanded] = useState(true);
  const totalCount = values.reduce((sum, v) => sum + (tagCounts[`${prefix}:${v}`] || 0), 0);

  return (
    <div style={{ marginBottom: 4 }}>
      <button
        onClick={() => setExpanded(!expanded)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          width: '100%',
          padding: '6px 8px',
          borderRadius: 'var(--radius)',
          color: 'var(--text-secondary)',
          fontSize: 12,
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          transition: 'background var(--transition)',
        }}
        onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-tertiary)'; }}
        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
      >
        {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        <span style={{ flex: 1, textAlign: 'left' }}>{prefix}</span>
        <span style={{
          fontSize: 10,
          color: 'var(--text-muted)',
          background: 'var(--bg-tertiary)',
          padding: '1px 6px',
          borderRadius: 10,
        }}>
          {totalCount}
        </span>
      </button>

      {expanded && (
        <div style={{ paddingLeft: 12 }}>
          {values.map(value => {
            const fullTag = `${prefix}:${value}`;
            const count = tagCounts[fullTag] || 0;
            const isActive = activeTags.includes(fullTag);

            return (
              <button
                key={value}
                onClick={() => onToggleTag(fullTag)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  width: '100%',
                  padding: '4px 8px',
                  borderRadius: 'var(--radius)',
                  fontSize: 13,
                  color: isActive ? 'var(--accent)' : 'var(--text-secondary)',
                  background: isActive ? 'var(--accent-dim)' : 'transparent',
                  transition: 'all var(--transition)',
                  textAlign: 'left',
                }}
                onMouseEnter={e => {
                  if (!isActive) e.currentTarget.style.background = 'var(--bg-tertiary)';
                }}
                onMouseLeave={e => {
                  if (!isActive) e.currentTarget.style.background = 'transparent';
                }}
              >
                <span style={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  background: isActive ? 'var(--accent)' : 'var(--border)',
                  flexShrink: 0,
                  transition: 'background var(--transition)',
                }} />
                <span style={{ flex: 1 }}>{value}</span>
                <span style={{
                  fontSize: 10,
                  color: 'var(--text-muted)',
                }}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function TagTree({ tagGroups, tagCounts, activeTags, onToggleTag }: TagTreeProps) {
  return (
    <div style={{
      width: 240,
      flexShrink: 0,
      borderRight: '1px solid var(--border)',
      padding: '12px 8px',
      overflowY: 'auto',
      background: 'var(--bg-secondary)',
      flex: 1,
    }}>
      <div style={{
        padding: '4px 8px 12px',
        fontSize: 11,
        fontWeight: 600,
        color: 'var(--text-muted)',
        textTransform: 'uppercase',
        letterSpacing: '0.08em',
      }}>
        Filter by tag
      </div>

      {activeTags.length > 0 && (
        <div style={{
          padding: '4px 8px 8px',
          marginBottom: 8,
          borderBottom: '1px solid var(--border)',
        }}>
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 4,
          }}>
            {activeTags.map(tag => (
              <button
                key={tag}
                onClick={() => onToggleTag(tag)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  padding: '2px 8px',
                  borderRadius: 10,
                  fontSize: 11,
                  background: 'var(--accent-dim)',
                  color: 'var(--accent)',
                  border: '1px solid var(--accent)',
                }}
              >
                {tag}
                <span style={{ fontSize: 10 }}>x</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {Object.entries(tagGroups).map(([prefix, values]) => (
        <TagGroup
          key={prefix}
          prefix={prefix}
          values={values}
          tagCounts={tagCounts}
          activeTags={activeTags}
          onToggleTag={onToggleTag}
        />
      ))}
    </div>
  );
}
