import { useCallback, useState } from 'react';
import { Download } from 'lucide-react';

export default function DownloadPDFButton({ sectionRef, filename = 'finsight-section' }) {
  const [loading, setLoading] = useState(false);

  const handleDownload = useCallback(async () => {
    if (!sectionRef?.current || loading) return;
    setLoading(true);
    try {
      const html2canvas = (await import('html2canvas')).default;
      const { jsPDF } = await import('jspdf');

      const element = sectionRef.current;
      const bgColor = getComputedStyle(document.documentElement)
        .getPropertyValue('--bg-base').trim() || '#0D1117';

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: bgColor,
        logging: false,
      });

      const imgData = canvas.toDataURL('image/png');

      // A4 portrait, 10mm margins
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageW = pdf.internal.pageSize.getWidth();
      const pageH = pdf.internal.pageSize.getHeight();
      const margin = 10;
      const printW = pageW - 2 * margin;
      const printH = (canvas.height / canvas.width) * printW;

      if (printH <= pageH - 2 * margin) {
        pdf.addImage(imgData, 'PNG', margin, margin, printW, printH);
      } else {
        // Multi-page: slice the image across pages
        const ratio = printW / canvas.width;
        const sliceH = (pageH - 2 * margin) / ratio; // canvas px per page
        let yOffset = 0;
        while (yOffset < canvas.height) {
          if (yOffset > 0) pdf.addPage();
          const sliceCanvas = document.createElement('canvas');
          sliceCanvas.width = canvas.width;
          sliceCanvas.height = Math.min(sliceH, canvas.height - yOffset);
          const ctx = sliceCanvas.getContext('2d');
          ctx.drawImage(canvas, 0, -yOffset, canvas.width, canvas.height);
          const sliceData = sliceCanvas.toDataURL('image/png');
          const slicePrintH = sliceCanvas.height * ratio;
          pdf.addImage(sliceData, 'PNG', margin, margin, printW, slicePrintH);
          yOffset += sliceH;
        }
      }

      pdf.save(`${filename}.pdf`);
    } catch (err) {
      console.error('PDF download failed:', err);
    } finally {
      setLoading(false);
    }
  }, [sectionRef, filename, loading]);

  return (
    <button
      onClick={handleDownload}
      disabled={loading}
      title="Download as PDF"
      style={{
        display: 'flex', alignItems: 'center', gap: 5,
        background: 'var(--bg-raised)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 8,
        padding: '6px 12px',
        fontSize: 12,
        color: loading ? 'var(--text-secondary)' : 'var(--text-secondary)',
        cursor: loading ? 'default' : 'pointer',
        fontFamily: 'DM Sans, sans-serif',
        fontWeight: 500,
        flexShrink: 0,
        transition: 'all 0.15s',
        opacity: loading ? 0.6 : 1,
      }}
      onMouseEnter={e => {
        if (!loading) {
          e.currentTarget.style.background = 'var(--bg-surface)';
          e.currentTarget.style.color = 'var(--text-primary)';
          e.currentTarget.style.borderColor = 'var(--accent-primary)';
        }
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background = 'var(--bg-raised)';
        e.currentTarget.style.color = 'var(--text-secondary)';
        e.currentTarget.style.borderColor = 'var(--border-subtle)';
      }}
    >
      <Download size={13} />
      {loading ? 'Generating…' : 'Download PDF'}
    </button>
  );
}
