import { Link, useNavigate } from 'react-router-dom';
import { Sun, Moon, Search, Compass, ExternalLink } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';
import { useState, type FormEvent } from 'react';

export function Header() {
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');

  function handleSearch(e: FormEvent) {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/d/wars?q=${encodeURIComponent(query.trim())}`);
    }
  }

  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 100,
      background: 'var(--bg-primary)',
      borderBottom: '1px solid var(--border)',
      backdropFilter: 'blur(12px)',
    }}>
      <div style={{
        maxWidth: 1400,
        margin: '0 auto',
        padding: '0 24px',
        height: 56,
        display: 'flex',
        alignItems: 'center',
        gap: 16,
      }}>
        <Link to="/" style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          color: 'var(--text-primary)',
          fontWeight: 600,
          fontSize: 16,
          letterSpacing: '-0.02em',
          textDecoration: 'none',
          flexShrink: 0,
        }}>
          <Compass size={20} style={{ color: 'var(--accent)' }} />
          Trapic Explorer
        </Link>

        <form onSubmit={handleSearch} style={{
          flex: 1,
          maxWidth: 480,
          margin: '0 auto',
        }}>
          <div style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
          }}>
            <Search size={14} style={{
              position: 'absolute',
              left: 12,
              color: 'var(--text-muted)',
              pointerEvents: 'none',
            }} />
            <input
              type="text"
              placeholder="Search traces..."
              value={query}
              onChange={e => setQuery(e.target.value)}
              style={{
                width: '100%',
                height: 34,
                padding: '0 12px 0 34px',
                background: 'var(--bg-tertiary)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius)',
                color: 'var(--text-primary)',
                fontSize: 13,
                outline: 'none',
                transition: 'border-color var(--transition)',
              }}
              onFocus={e => { e.currentTarget.style.borderColor = 'var(--accent)'; }}
              onBlur={e => { e.currentTarget.style.borderColor = 'var(--border)'; }}
            />
          </div>
        </form>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          <button
            onClick={toggleTheme}
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            style={{
              width: 34,
              height: 34,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 'var(--radius)',
              color: 'var(--text-secondary)',
              transition: 'background var(--transition)',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-tertiary)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
          >
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          <a
            href="https://github.com/trapicAi/trapic-explorer"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              width: 34,
              height: 34,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 'var(--radius)',
              color: 'var(--text-secondary)',
              transition: 'background var(--transition)',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-tertiary)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
          >
            <ExternalLink size={16} />
          </a>
        </div>
      </div>
    </header>
  );
}
