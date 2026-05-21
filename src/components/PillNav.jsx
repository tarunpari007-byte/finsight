import { useEffect, useState } from 'react';
import { NAV_ITEMS } from '../data/defaults';

export default function PillNav({ activeSection, onNavigate }) {
  const [compact, setCompact] = useState(false);

  useEffect(() => {
    const onScroll = () => setCompact(window.scrollY > 40);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      {/* Desktop pill nav */}
      <nav
        style={{
          position: 'fixed',
          top: compact ? 10 : 14,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 40,
          background: 'rgba(255,255,255,0.07)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: 99,
          boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
          padding: compact ? '4px 6px' : '6px 8px',
          display: 'flex', alignItems: 'center', gap: 2,
          transition: 'top 0.2s, padding 0.2s',
        }}
        className="hidden md:flex"
      >
        {NAV_ITEMS.map(item => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            style={{
              padding: compact ? '5px 14px' : '6px 16px',
              borderRadius: 99,
              border: 'none',
              cursor: 'pointer',
              fontSize: 13,
              fontWeight: 500,
              fontFamily: 'DM Sans, sans-serif',
              transition: 'background 0.15s, color 0.15s',
              background: activeSection === item.id ? 'var(--accent-primary)' : 'transparent',
              color: activeSection === item.id ? '#0D1117' : 'var(--text-secondary)',
              whiteSpace: 'nowrap',
            }}
            onMouseEnter={e => {
              if (activeSection !== item.id) {
                e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
                e.currentTarget.style.color = 'var(--text-primary)';
              }
            }}
            onMouseLeave={e => {
              if (activeSection !== item.id) {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = 'var(--text-secondary)';
              }
            }}
          >
            <span style={{ marginRight: 5 }}>{item.icon}</span>
            {item.label}
          </button>
        ))}
      </nav>

      {/* Mobile bottom dock */}
      <nav
        style={{
          position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 40,
          background: 'rgba(13,17,23,0.92)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderTop: '1px solid var(--border-subtle)',
          display: 'flex',
          overflowX: 'auto',
          paddingBottom: 'env(safe-area-inset-bottom)',
        }}
        className="flex md:hidden"
      >
        {NAV_ITEMS.map(item => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            style={{
              flex: '0 0 auto',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              padding: '10px 16px',
              border: 'none', background: 'transparent', cursor: 'pointer',
              color: activeSection === item.id ? 'var(--accent-primary)' : 'var(--text-secondary)',
              transition: 'color 0.15s',
              minWidth: 64,
            }}
          >
            <span style={{ fontSize: 20 }}>{item.icon}</span>
            <span style={{ fontSize: 10, fontWeight: 500, fontFamily: 'DM Sans, sans-serif', marginTop: 3 }}>
              {item.label}
            </span>
          </button>
        ))}
      </nav>
    </>
  );
}
