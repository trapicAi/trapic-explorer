import { useState, useMemo } from 'react';
import { ChevronRight, ChevronDown } from 'lucide-react';

interface TagTreeProps {
  tagGroups: Record<string, string[]>;
  tagCounts: Record<string, number>;
  activeTags: string[];
  onToggleTag: (tag: string) => void;
}

function TagGroup({
  prefix,
  label,
  values,
  tagCounts,
  activeTags,
  onToggleTag,
}: {
  prefix: string;
  label: string;
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
          fontSize: 11,
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          transition: 'background var(--transition)',
        }}
        onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-tertiary)'; }}
        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
      >
        {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        <span style={{ flex: 1, textAlign: 'left' }}>{label}</span>
        <span className="mono" style={{
          fontSize: 10,
          color: 'var(--text-muted)',
          background: 'var(--bg-tertiary)',
          padding: '1px 6px',
          borderRadius: 10,
          fontWeight: 500,
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
                  padding: '5px 8px',
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
                <span style={{ flex: 1, textTransform: 'capitalize' }}>{value}</span>
                <span className="mono" style={{
                  fontSize: 10,
                  color: 'var(--text-muted)',
                  fontWeight: 500,
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

// Derive impact from tags: if tag contains "global", "world", "international" -> Global
// "regional", "european", "asian" -> Regional, else Local
function deriveImpact(tags: string[]): 'global' | 'regional' | 'local' {
  const joined = tags.join(' ').toLowerCase();
  if (joined.includes('global') || joined.includes('world') || joined.includes('international')) return 'global';
  if (joined.includes('regional') || joined.includes('european') || joined.includes('asian') || joined.includes('african') || joined.includes('american')) return 'regional';
  return 'local';
}

export function TagTree({ tagGroups, tagCounts, activeTags, onToggleTag }: TagTreeProps) {
  // Build special groups: EPOCH, TYPE (already in header), IMPACT
  const epochGroup = tagGroups['epoch'] || [];
  const otherGroups = useMemo(() => {
    const result: Record<string, string[]> = {};
    for (const [prefix, values] of Object.entries(tagGroups)) {
      if (prefix === 'epoch') continue;
      result[prefix] = values;
    }
    return result;
  }, [tagGroups]);

  // Compute impact counts from all tags in tagCounts
  const impactCounts = useMemo(() => {
    const counts: Record<string, number> = { global: 0, regional: 0, local: 0 };
    // Approximate from tag prefixes
    for (const [tag, count] of Object.entries(tagCounts)) {
      const impact = deriveImpact([tag]);
      if (impact === 'global') counts['global'] += count;
      else if (impact === 'regional') counts['regional'] += count;
    }
    return counts;
  }, [tagCounts]);

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
        padding: '4px 8px 14px',
        fontSize: 11,
        fontWeight: 700,
        color: 'var(--text-muted)',
        textTransform: 'uppercase',
        letterSpacing: '0.1em',
      }}>
        Filter by Tag
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
                  fontWeight: 500,
                }}
              >
                {tag}
                <span style={{ fontSize: 10 }}>x</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Epoch group first if available */}
      {epochGroup.length > 0 && (
        <TagGroup
          prefix="epoch"
          label="Epoch"
          values={epochGroup}
          tagCounts={tagCounts}
          activeTags={activeTags}
          onToggleTag={onToggleTag}
        />
      )}

      {/* Impact section */}
      {(impactCounts.global > 0 || impactCounts.regional > 0) && (
        <div style={{ marginBottom: 4 }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            padding: '6px 8px',
            fontSize: 11,
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            color: 'var(--text-secondary)',
          }}>
            Impact
          </div>
          <div style={{ paddingLeft: 12 }}>
            {['global', 'regional', 'local'].map(level => (
              <div
                key={level}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '5px 8px',
                  fontSize: 13,
                  color: 'var(--text-secondary)',
                  textTransform: 'capitalize',
                }}
              >
                <span style={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  background: level === 'global' ? 'var(--decision)' : level === 'regional' ? 'var(--fact)' : 'var(--convention)',
                  flexShrink: 0,
                }} />
                <span style={{ flex: 1 }}>{level}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Other tag groups */}
      {Object.entries(otherGroups).map(([prefix, values]) => (
        <TagGroup
          key={prefix}
          prefix={prefix}
          label={prefix}
          values={values}
          tagCounts={tagCounts}
          activeTags={activeTags}
          onToggleTag={onToggleTag}
        />
      ))}
    </div>
  );
}
