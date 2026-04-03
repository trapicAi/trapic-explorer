import type { ExplorerTrace } from '@/types/trace';
import { getTypeColor } from '@/lib/data';
import { useRef, useCallback } from 'react';

interface TimelineProps {
  traces: ExplorerTrace[];
  onTraceClick: (traceId: string) => void;
  activeTraceId?: string;
}

interface Era {
  label: string;
  startYear: number;
  endYear: number;
  color: string;
}

const ERAS: Era[] = [
  { label: 'Ancient', startYear: -800, endYear: 300, color: '#92400e' },
  { label: 'Medieval', startYear: 300, endYear: 1500, color: '#6b21a8' },
  { label: 'Early Modern', startYear: 1500, endYear: 1800, color: '#155e75' },
  { label: 'Modern', startYear: 1800, endYear: 1945, color: '#1e3a5f' },
  { label: 'Contemporary', startYear: 1945, endYear: 2000, color: '#3f1515' },
];

export function Timeline({ traces, onTraceClick, activeTraceId }: TimelineProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const minYear = traces.length > 0 ? Math.min(...traces.map(t => t.year_numeric)) : -500;
  const maxYear = traces.length > 0 ? Math.max(...traces.map(t => t.year_numeric)) : 2000;
  const range = maxYear - minYear || 1;

  const getPosition = useCallback((year: number) => {
    return ((year - minYear) / range) * 100;
  }, [minYear, range]);

  const visibleEras = ERAS.filter(era =>
    era.endYear > minYear && era.startYear < maxYear
  );

  return (
    <div style={{
      background: 'var(--glass-bg)',
      backdropFilter: 'blur(var(--glass-blur))',
      WebkitBackdropFilter: 'blur(var(--glass-blur))',
      borderTop: '1px solid var(--glass-border)',
      borderBottom: '1px solid var(--glass-border)',
      padding: '20px 24px 12px',
      overflow: 'hidden',
    }}>
      {/* Section label */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 12,
      }}>
        <div style={{
          fontSize: 11,
          fontWeight: 700,
          color: 'var(--text-muted)',
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
        }}>
          Timeline
        </div>
        <div className="mono" style={{
          fontSize: 10,
          color: 'var(--text-muted)',
          fontWeight: 500,
        }}>
          {traces.length} traces
        </div>
      </div>

      <div
        ref={containerRef}
        style={{
          position: 'relative',
          height: 64,
          marginBottom: 6,
        }}
      >
        {/* Era background segments */}
        {visibleEras.map(era => {
          const left = Math.max(0, getPosition(Math.max(era.startYear, minYear)));
          const right = Math.min(100, getPosition(Math.min(era.endYear, maxYear)));
          return (
            <div
              key={era.label}
              style={{
                position: 'absolute',
                left: `${left}%`,
                width: `${right - left}%`,
                top: 0,
                height: 36,
                background: `linear-gradient(135deg, ${era.color}, transparent)`,
                opacity: 0.3,
                borderRadius: 6,
              }}
            />
          );
        })}

        {/* Timeline axis */}
        <div style={{
          position: 'absolute',
          top: 17,
          left: 0,
          right: 0,
          height: 2,
          background: 'var(--border)',
          borderRadius: 1,
        }} />

        {/* Trace dots */}
        {traces.map((trace, i) => {
          const pos = getPosition(trace.year_numeric);
          const isActive = trace.id === activeTraceId;
          const dotColor = getTypeColor(trace.type);
          return (
            <button
              key={trace.id}
              onClick={() => onTraceClick(trace.id)}
              title={`${trace.content.slice(0, 60)}... (${trace.year_numeric < 0 ? `${Math.abs(trace.year_numeric)} BC` : trace.year_numeric})`}
              style={{
                position: 'absolute',
                left: `${pos}%`,
                top: isActive ? 8 : 11,
                width: isActive ? 16 : 10,
                height: isActive ? 16 : 10,
                borderRadius: '50%',
                background: dotColor,
                border: isActive ? '2px solid var(--text-primary)' : '2px solid var(--bg-secondary)',
                transform: 'translateX(-50%)',
                cursor: 'pointer',
                transition: 'all var(--transition)',
                zIndex: isActive ? 10 : traces.length - i,
                boxShadow: isActive ? `0 0 16px ${dotColor}, 0 0 4px ${dotColor}` : 'none',
              }}
            />
          );
        })}

        {/* Era labels */}
        <div style={{
          position: 'absolute',
          top: 40,
          left: 0,
          right: 0,
          display: 'flex',
        }}>
          {visibleEras.map(era => {
            const left = Math.max(0, getPosition(Math.max(era.startYear, minYear)));
            const right = Math.min(100, getPosition(Math.min(era.endYear, maxYear)));
            return (
              <div
                key={era.label}
                style={{
                  position: 'absolute',
                  left: `${left}%`,
                  width: `${right - left}%`,
                  textAlign: 'center',
                  fontSize: 10,
                  fontWeight: 600,
                  color: 'var(--text-muted)',
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  fontFamily: 'var(--font-mono)',
                }}
              >
                {era.label}
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div style={{
        display: 'flex',
        gap: 16,
        justifyContent: 'center',
        paddingTop: 4,
      }}>
        {(['decision', 'fact', 'convention', 'state'] as const).map(type => (
          <div key={type} style={{
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            fontSize: 10,
            color: 'var(--text-muted)',
            textTransform: 'capitalize',
          }}>
            <span style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: getTypeColor(type),
              flexShrink: 0,
            }} />
            {type}
          </div>
        ))}
      </div>
    </div>
  );
}
