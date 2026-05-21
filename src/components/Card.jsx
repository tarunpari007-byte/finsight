export default function Card({ children, className = '', style = {}, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 16,
        padding: 24,
        transition: 'border-color 0.2s',
        cursor: onClick ? 'pointer' : 'default',
        ...style,
      }}
      className={`hover:border-white/15 ${className}`}
    >
      {children}
    </div>
  );
}
