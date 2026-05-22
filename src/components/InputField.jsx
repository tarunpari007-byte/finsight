import { useState } from 'react';
import Tooltip from './Tooltip';
import { formatWithIndianCommas } from '../utils/calculations';

export default function InputField({ label, tooltip, value, onChange, type = 'number', min, max, step, prefix, suffix, placeholder }) {
  const isCurrency = prefix === '₹';
  const [focused, setFocused] = useState(false);
  const [rawText, setRawText] = useState('');

  const displayValue = isCurrency
    ? (focused ? rawText : formatWithIndianCommas(value))
    : value;

  const handleFocus = (e) => {
    if (isCurrency) {
      setFocused(true);
      setRawText(value === 0 ? '' : String(value));
    }
    e.target.style.borderBottomColor = 'var(--accent-primary)';
  };

  const handleBlur = (e) => {
    if (isCurrency) setFocused(false);
    e.target.style.borderBottomColor = 'transparent';
  };

  const handleChange = (e) => {
    if (isCurrency) {
      const digits = e.target.value.replace(/[^0-9]/g, '');
      setRawText(digits);
      onChange(digits === '' ? 0 : Number(digits));
    } else {
      onChange(type === 'number' ? Number(e.target.value) : e.target.value);
    }
  };

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
          type={isCurrency ? 'text' : type}
          inputMode={isCurrency ? 'numeric' : undefined}
          value={displayValue}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          min={isCurrency ? undefined : min}
          max={isCurrency ? undefined : max}
          step={isCurrency ? undefined : step}
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
            fontFamily: 'DM Mono, monospace',
            outline: 'none',
            transition: 'border-bottom-color 0.2s',
          }}
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
