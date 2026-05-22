import { useCallback, useState } from 'react';
import { Download } from 'lucide-react';
import { toPng } from 'html-to-image';

export default function DownloadPDFButton({ sectionRef, filename = 'finsight-section' }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const handleDownload = useCallback(async () => {
    if (!sectionRef?.current || loading) return;
    setLoading(true);
    setError(false);
    try {
      const pixelRatio = Math.max(2, window.devicePixelRatio);
      const opts = {
        pixelRatio,
        cacheBust: true,
        skipFonts: true,
        // Explicit background so transparent areas render as the app's dark bg
        backgroundColor: getComputedStyle(document.documentElement)
          .getPropertyValue('--bg-base').trim() || '#0D1117',
      };

      // html-to-image commonly fails on the first call because the browser
      // hasn't cached font metrics for the SVG foreignObject renderer yet.
      // Calling it up to 3 times resolves this — subsequent calls succeed.
      let dataUrl;
      let lastErr;
      for (let attempt = 0; attempt < 3; attempt++) {
        try {
          dataUrl = await toPng(sectionRef.current, opts);
          break;
        } catch (e) {
          lastErr = e;
          await new Promise(r => setTimeout(r, 300));
        }
      }
      if (!dataUrl) throw lastErr;

      const link = document.createElement('a');
      link.download = `${filename}.png`;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error('Download failed:', err);
      // eslint-disable-next-line no-alert
      window.alert('Download error: ' + msg);
      setError(true);
      setTimeout(() => setError(false), 3000);
    } finally {
      setLoading(false);
    }
  }, [sectionRef, filename, loading]);

  const buttonColor = error ? 'var(--accent-danger)' : 'var(--text-secondary)';
  const borderColor = error ? 'rgba(224,92,107,0.4)' : 'var(--border-subtle)';

  return (
    <button
      onClick={handleDownload}
      disabled={loading}
      title="Save as PNG image"
      style={{
        display: 'flex', alignItems: 'center', gap: 5,
        background: 'var(--bg-raised)',
        border: `1px solid ${borderColor}`,
        borderRadius: 8,
        padding: '6px 12px',
        fontSize: 12,
        color: buttonColor,
        cursor: loading ? 'default' : 'pointer',
        fontFamily: 'DM Sans, sans-serif',
        fontWeight: 500,
        flexShrink: 0,
        transition: 'all 0.15s',
        opacity: loading ? 0.6 : 1,
      }}
      onMouseEnter={e => {
        if (!loading && !error) {
          e.currentTarget.style.background = 'var(--bg-surface)';
          e.currentTarget.style.color = 'var(--text-primary)';
          e.currentTarget.style.borderColor = 'var(--accent-primary)';
        }
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background = 'var(--bg-raised)';
        e.currentTarget.style.color = buttonColor;
        e.currentTarget.style.borderColor = borderColor;
      }}
    >
      <Download size={13} />
      {loading ? 'Saving…' : error ? 'Failed — try again' : 'Save as PNG'}
    </button>
  );
}
