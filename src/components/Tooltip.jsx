import { Info } from 'lucide-react';

export default function Tooltip({ text }) {
  return (
    <span className="tooltip-container ml-1 cursor-help" style={{ color: 'var(--text-secondary)' }}>
      <Info size={13} />
      <span className="tooltip-text">{text}</span>
    </span>
  );
}
