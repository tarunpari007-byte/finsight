import Card from '../components/Card';
import { DUMMY_PILLARS } from '../data/defaults';

// Map each pillar to the section key it corresponds to
const PILLAR_SECTION_MAP = {
  goalPlanning: 'goals',
  emergencyFund: 'emergency',
  insurance: 'insurance',
  fireReadiness: 'fire',
  debtLoad: 'calculators',
  wealthGrowth: 'goals',
};

function scoreColor(score) {
  if (score >= 70) return 'var(--accent-primary)';
  if (score >= 40) return 'var(--accent-warning)';
  return 'var(--accent-danger)';
}

function DataBadge({ isFilled }) {
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: '2px 8px',
      borderRadius: 99,
      fontSize: 10,
      fontWeight: 500,
      fontFamily: 'DM Sans, sans-serif',
      background: isFilled ? 'rgba(52,201,125,0.12)' : 'rgba(136,150,165,0.1)',
      color: isFilled ? 'var(--accent-success)' : 'var(--text-secondary)',
      border: `1px solid ${isFilled ? 'rgba(52,201,125,0.25)' : 'rgba(136,150,165,0.15)'}`,
      whiteSpace: 'nowrap',
    }}>
      <span style={{ fontSize: 8 }}>{isFilled ? '●' : '○'}</span>
      {isFilled ? 'Your data' : 'Sample data'}
    </div>
  );
}

function PillarCard({ pillar, isFilled, onNavigate }) {
  const color = scoreColor(pillar.score);
  return (
    <Card
      onClick={() => onNavigate(pillar.section)}
      style={{ position: 'relative', overflow: 'hidden', cursor: 'pointer' }}
    >
      {/* Colored top border */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 3,
        background: color, borderRadius: '16px 16px 0 0',
      }} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <span style={{ fontSize: 18 }}>{pillar.icon}</span>
            <DataBadge isFilled={isFilled} />
          </div>
          <div style={{
            fontSize: 13, fontWeight: 600, color: 'var(--text-primary)',
            fontFamily: 'DM Sans, sans-serif', marginBottom: 4,
          }}>
            {pillar.label}
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-secondary)', fontFamily: 'DM Sans, sans-serif' }}>
            {pillar.status}
          </div>
        </div>
        <div style={{
          fontFamily: 'DM Mono, monospace', fontSize: 28, fontWeight: 800,
          color, fontVariantNumeric: 'tabular-nums', lineHeight: 1,
          marginLeft: 12, flexShrink: 0,
        }}>
          {pillar.score}
        </div>
      </div>
    </Card>
  );
}

export default function Dashboard({ scores, filledSections = new Set(), onNavigate }) {
  const pillars = DUMMY_PILLARS.map(p => ({
    ...p,
    score: scores ? (scores[p.key] ?? p.score) : p.score,
  }));

  const overallScore = Math.round(pillars.reduce((s, p) => s + p.score, 0) / pillars.length);
  const overallColor = scoreColor(overallScore);
  const hasRealData = !!scores;

  return (
    <div className="section-enter">
      {/* Amber banner — only when no sections filled */}
      {!hasRealData && (
        <div style={{
          background: 'rgba(245,166,35,0.1)',
          border: '1px solid rgba(245,166,35,0.3)',
          borderRadius: 12,
          padding: '12px 20px',
          marginBottom: 24,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexWrap: 'wrap', gap: 12,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 18 }}>👤</span>
            <span style={{ fontSize: 13, color: 'var(--text-primary)', fontFamily: 'DM Sans, sans-serif' }}>
              You're viewing a sample profile for <strong>Arjun, 34, Bengaluru</strong>.
              Fill in your details across sections to see your real Financial Health Score.
            </span>
          </div>
          <button
            onClick={() => onNavigate('goals')}
            style={{
              background: 'var(--accent-warning)',
              color: '#0D1117',
              border: 'none',
              borderRadius: 8,
              padding: '7px 16px',
              fontSize: 13, fontWeight: 600,
              cursor: 'pointer',
              fontFamily: 'DM Sans, sans-serif',
              whiteSpace: 'nowrap',
            }}
          >
            Start with Goals →
          </button>
        </div>
      )}

      {/* Overall Score */}
      <Card style={{ marginBottom: 24 }}>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexWrap: 'wrap', gap: 16,
        }}>
          <div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)', fontFamily: 'DM Sans, sans-serif', marginBottom: 4 }}>
              Overall Financial Health Score
            </div>
            <div style={{
              fontFamily: 'DM Mono, monospace', fontWeight: 800, lineHeight: 1,
              color: overallColor, fontVariantNumeric: 'tabular-nums',
            }}>
              <span style={{ fontSize: 64 }}>{overallScore}</span>
              <span style={{ fontSize: 28, color: 'var(--text-secondary)', fontWeight: 400 }}>/100</span>
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4, fontFamily: 'DM Sans, sans-serif' }}>
              {overallScore >= 70 ? '✅ Good financial health' : overallScore >= 40 ? '⚠️ Moderate — some gaps to address' : '🚨 Needs attention — review sections below'}
            </div>
          </div>

          {/* Progress bar */}
          <div style={{ flex: '1 1 200px', maxWidth: 360 }}>
            <div style={{
              height: 12, background: 'var(--bg-raised)', borderRadius: 6, overflow: 'hidden',
            }}>
              <div style={{
                height: '100%', width: `${overallScore}%`,
                background: overallColor,
                borderRadius: 6,
                transition: 'width 0.6s ease',
              }} />
            </div>
            <div style={{
              display: 'flex', justifyContent: 'space-between', marginTop: 6,
              fontSize: 11, color: 'var(--text-secondary)', fontFamily: 'DM Mono, monospace',
            }}>
              <span>0</span><span>50</span><span>100</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Pillar cards grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
        gap: 16,
      }}>
        {pillars.map(p => (
          <PillarCard
            key={p.key}
            pillar={p}
            isFilled={filledSections.has(PILLAR_SECTION_MAP[p.key])}
            onNavigate={onNavigate}
          />
        ))}
      </div>
    </div>
  );
}
