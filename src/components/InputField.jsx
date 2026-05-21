import Tooltip from './Tooltip';

export default function InputField({ label, tooltip, value, onChange, type = 'number', min, max, step, prefix, suffix, placeholder }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{
        display: 'flex', alignItems: 'center',
        fontSize: 12, fontWeight: 500, color: 'var(--text-secondary)',
        marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em',
        fontFamily: 'DM Sans, sans-serif',
      }}>
        {label}
        {tooltip && <Tooltip text={tooltip} />}
      </label>
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        {prefix && (
          <span style={{
            position: 'absolute', left: 12, color: 'var(--text-secondary)',
            fontSize: 14, fontFamily: 'DM Mono, monospace', pointerEvents: 'none',
          }}>{prefix}</span>
        )}
        <input
          type={type}
          value={value}
          onChange={e => onChange(type === 'number' ? Number(e.target.value) : e.target.value)}
          min={min}
          max={max}
          step={step}
          placeholder={placeholder}
          style={{
            width: '100%',
            background: 'var(--bg-raised)',
            border: 'none',
            borderBottom: '2px solid transparent',
            borderRadius: 8,
            padding: prefix ? '10px 12px 10px 28px' : suffix ? '10px 36px 10px 12px' : '10px 12px',
            color: 'var(--text-primary)',
            fontSize: 14,
            fontFamily: type === 'number' ? 'DM Mono, monospace' : 'DM Sans, sans-serif',
            outline: 'none',
            transition: 'border-bottom-color 0.2s',
          }}
          onFocus={e => { e.target.style.borderBottomColor = 'var(--accent-primary)'; }}
          onBlur={e => { e.target.style.borderBottomColor = 'transparent'; }}
        />
        {suffix && (
          <span style={{
            position: 'absolute', right: 12, color: 'var(--text-secondary)',
            fontSize: 13, fontFamily: 'DM Sans, sans-serif', pointerEvents: 'none',
          }}>{suffix}</span>
        )}
      </div>
    </div>
  );
}
