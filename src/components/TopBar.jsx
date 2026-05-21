import { Sun, Moon } from 'lucide-react';

export default function TopBar({ theme, onThemeToggle }) {
  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '0 24px', height: 56,
      background: 'transparent',
      pointerEvents: 'none',
    }}>
      {/* Logo */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        pointerEvents: 'auto',
      }}>
        <div style={{
          width: 28, height: 28, borderRadius: 8,
          background: 'var(--accent-primary)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 16, fontWeight: 800, color: '#0D1117',
          fontFamily: 'DM Sans, sans-serif',
        }}>
          F
        </div>
        <span style={{
          fontSize: 18, fontWeight: 700, color: 'var(--text-primary)',
          fontFamily: 'DM Sans, sans-serif', letterSpacing: '-0.3px',
        }}>
          Finsight
        </span>
      </div>

      {/* Theme toggle */}
      <button
        onClick={onThemeToggle}
        style={{
          pointerEvents: 'auto',
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 99,
          width: 36, height: 36,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer',
          color: 'var(--text-secondary)',
          transition: 'color 0.2s, border-color 0.2s',
        }}
        onMouseEnter={e => { e.currentTarget.style.color = 'var(--accent-primary)'; e.currentTarget.style.borderColor = 'var(--border-active)'; }}
        onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.borderColor = 'var(--border-subtle)'; }}
        title="Toggle theme"
      >
        {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
      </button>
    </div>
  );
}
