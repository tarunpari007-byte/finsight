export default function SegmentedControl({ tabs, active, onChange }) {
  return (
    <div style={{
      display: 'inline-flex',
      background: 'var(--bg-raised)',
      borderRadius: 99,
      padding: 4,
      gap: 2,
    }}>
      {tabs.map(tab => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          style={{
            padding: '6px 18px',
            borderRadius: 99,
            border: 'none',
            cursor: 'pointer',
            fontSize: 13,
            fontWeight: 500,
            fontFamily: 'DM Sans, sans-serif',
            transition: 'background 0.2s, color 0.2s',
            background: active === tab.id ? 'var(--accent-primary)' : 'transparent',
            color: active === tab.id ? '#0D1117' : 'var(--text-secondary)',
          }}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
