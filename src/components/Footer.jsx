export default function Footer() {
  return (
    <footer style={{
      borderTop: '1px solid var(--border-subtle)',
      padding: '16px 32px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: 8,
      marginTop: 48,
    }}>
      <span style={{ fontSize: 11, color: 'var(--text-secondary)', fontFamily: 'DM Sans, sans-serif' }}>
        For educational purposes only. Does not constitute financial advice.
      </span>
      <span style={{ fontSize: 11, color: 'var(--text-secondary)', fontFamily: 'DM Sans, sans-serif' }}>
        Built by Tarun
      </span>
    </footer>
  );
}
