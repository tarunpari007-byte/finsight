export default function Toggle({ checked, onChange, label }) {
  return (
    <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', userSelect: 'none' }}>
      <div
        onClick={() => onChange(!checked)}
        style={{
          width: 40, height: 22, borderRadius: 11,
          background: checked ? 'var(--accent-primary)' : 'var(--bg-raised)',
          border: `2px solid ${checked ? 'var(--accent-primary)' : 'var(--border-subtle)'}`,
          position: 'relative',
          transition: 'background 0.2s, border-color 0.2s',
          flexShrink: 0,
        }}
      >
        <div style={{
          position: 'absolute',
          top: 1, left: checked ? 19 : 1,
          width: 16, height: 16, borderRadius: '50%',
          background: 'white',
          transition: 'left 0.2s',
          boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
        }} />
      </div>
      {label && (
        <span style={{ fontSize: 13, color: 'var(--text-primary)', fontFamily: 'DM Sans, sans-serif' }}>
          {label}
        </span>
      )}
    </label>
  );
}
