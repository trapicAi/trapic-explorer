import { Link, useNavigate } from 'react-router-dom';
import { Sun, Moon, Search, Compass, ExternalLink, X } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';
import { useState, useRef, useEffect, type FormEvent } from 'react';

export function Header() {
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (searchOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [searchOpen]);

  function handleSearch(e: FormEvent) {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/d/wars?q=${encodeURIComponent(query.trim())}`);
      setSearchOpen(false);
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
        padding: '0 16px',
        height: 56,
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        position: 'relative',
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
          <span className="header-brand-text">Trapic Explorer</span>
        </Link>

        {/* Desktop search (hidden on mobile via CSS) */}
        <form onSubmit={handleSearch} className="header-search-desktop" style={{
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

        {/* Mobile search overlay */}
        {searchOpen && (
          <form
            onSubmit={handleSearch}
            className="header-search-mobile"
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              top: 0,
              bottom: 0,
              zIndex: 10,
              background: 'var(--bg-primary)',
              padding: '0 12px',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <Search size={16} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
            <input
              ref={inputRef}
              type="text"
              placeholder="Search traces..."
              value={query}
              onChange={e => setQuery(e.target.value)}
              style={{
                flex: 1,
                height: 40,
                padding: '0 8px',
                background: 'transparent',
                border: 'none',
                borderBottom: '2px solid var(--accent)',
                borderRadius: 0,
                color: 'var(--text-primary)',
                fontSize: 15,
                outline: 'none',
              }}
            />
            <button
              type="button"
              onClick={() => setSearchOpen(false)}
              style={{
                width: 44,
                height: 44,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 'var(--radius)',
                color: 'var(--text-muted)',
                flexShrink: 0,
              }}
            >
              <X size={18} />
            </button>
          </form>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
          {/* Mobile search toggle */}
          <button
            onClick={() => setSearchOpen(true)}
            className="header-search-toggle"
            style={{
              width: 44,
              height: 44,
              display: 'none',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 'var(--radius)',
              color: 'var(--text-secondary)',
            }}
          >
            <Search size={18} />
          </button>

          <button
            onClick={toggleTheme}
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            style={{
              width: 44,
              height: 44,
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
              width: 44,
              height: 44,
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
