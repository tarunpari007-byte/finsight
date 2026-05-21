import { formatIndianNumber } from '../utils/calculations';

export default function StatBox({ label, value, color, sub, large }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{
        fontFamily: 'DM Mono, monospace',
        fontSize: large ? 36 : 22,
        fontWeight: 800,
        color: color || 'var(--accent-primary)',
        fontVariantNumeric: 'tabular-nums',
        lineHeight: 1.1,
      }}>
        {value}
      </div>
      <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4, fontFamily: 'DM Sans, sans-serif' }}>
        {label}
      </div>
      {sub && <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2 }}>{sub}</div>}
    </div>
  );
}
