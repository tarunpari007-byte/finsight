import { useMemo } from 'react';
import Card from '../components/Card';
import InputField from '../components/InputField';
import Tooltip from '../components/Tooltip';
import { calcEmergencyFund, formatIndianNumber } from '../utils/calculations';
import { DEFAULT_EMERGENCY } from '../data/defaults';

const EMPLOYMENT_TYPES = [
  { value: 'Salaried — Stable', label: 'Salaried — Stable (Govt / Large Corp)', months: 3 },
  { value: 'Salaried — Moderate risk', label: 'Salaried — Moderate Risk (Pvt / Startups)', months: 6 },
  { value: 'Self-employed', label: 'Self-employed', months: 9 },
  { value: 'Freelancer / Consultant', label: 'Freelancer / Consultant', months: 9 },
];

function AdequacyBar({ pct }) {
  const color = pct >= 100 ? 'var(--accent-primary)' : pct >= 50 ? 'var(--accent-warning)' : 'var(--accent-danger)';
  const label = pct >= 100 ? '✅ Fully funded' : pct >= 50 ? '⚠️ Partially funded' : '🚨 Critically underfunded';
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <span style={{ fontSize: 13, fontWeight: 600, color, fontFamily: 'DM Sans, sans-serif' }}>{label}</span>
        <span style={{ fontSize: 13, fontFamily: 'DM Mono, monospace', color, fontVariantNumeric: 'tabular-nums' }}>{Math.round(pct)}%</span>
      </div>
      <div style={{ height: 10, background: 'var(--bg-raised)', borderRadius: 5, overflow: 'hidden' }}>
        <div style={{
          height: '100%', width: `${Math.min(100, pct)}%`,
          background: color, borderRadius: 5,
          transition: 'width 0.4s ease',
        }} />
      </div>
    </div>
  );
}

export default function EmergencyFund({ efData, setEfData }) {
  const d = efData;

  const results = useMemo(() =>
    calcEmergencyFund(d.monthlyExpenses, d.employmentType, d.dependents, d.currentFund),
    [d]
  );

  const monthlySIP = results.gap > 0 ? results.gap / d.buildMonths : 0;

  return (
    <div className="section-enter">
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ margin: '0 0 4px', fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'DM Sans, sans-serif' }}>
          Emergency Fund
        </h2>
        <p style={{ margin: 0, fontSize: 13, color: 'var(--text-secondary)', fontFamily: 'DM Sans, sans-serif' }}>
          Calculate how much you need and how to build it
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 24 }}>
        <Card>
          <h3 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'DM Sans, sans-serif' }}>
            Your Details
          </h3>

          <InputField
            label="Monthly Essential Expenses"
            tooltip="Include rent, groceries, utilities, EMIs, and other non-discretionary expenses."
            prefix="₹"
            value={d.monthlyExpenses}
            onChange={v => setEfData(p => ({ ...p, monthlyExpenses: v }))}
            min={0}
          />

          {/* Employment Type */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 6 }}>
              Employment Type
            </label>
            <select
              value={d.employmentType}
              onChange={e => setEfData(p => ({ ...p, employmentType: e.target.value }))}
              style={{
                width: '100%', padding: '10px 12px',
                background: 'var(--bg-raised)', border: 'none', borderRadius: 8,
                color: 'var(--text-primary)', fontSize: 13,
                fontFamily: 'DM Sans, sans-serif', outline: 'none', cursor: 'pointer',
              }}
            >
              {EMPLOYMENT_TYPES.map(t => (
                <option key={t.value} value={t.value}>{t.label} ({t.months} months)</option>
              ))}
            </select>
          </div>

          <InputField label="Number of Dependents" value={d.dependents} onChange={v => setEfData(p => ({ ...p, dependents: v }))} min={0} max={10} />
          <InputField label="Current Emergency Fund" prefix="₹" value={d.currentFund} onChange={v => setEfData(p => ({ ...p, currentFund: v }))} min={0} />
        </Card>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Recommended Corpus */}
          <Card style={{ textAlign: 'center', background: 'rgba(52,201,125,0.06)', border: '1px solid rgba(52,201,125,0.2)' }}>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', fontFamily: 'DM Sans, sans-serif', marginBottom: 4 }}>
              Recommended Emergency Fund
            </div>
            <div style={{ fontFamily: 'DM Mono, monospace', fontSize: 38, fontWeight: 800, color: 'var(--accent-primary)', fontVariantNumeric: 'tabular-nums' }}>
              {formatIndianNumber(results.recommended)}
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4, fontFamily: 'DM Sans, sans-serif' }}>
              {results.months} months of essential expenses
              {d.dependents >= 2 ? ' (incl. +1 for dependents)' : ''}
            </div>
          </Card>

          {/* Adequacy */}
          <Card>
            <h4 style={{ margin: '0 0 12px', fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'DM Sans, sans-serif' }}>
              Current Coverage
            </h4>
            <AdequacyBar pct={results.pct} />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 16 }}>
              {[
                { label: 'Current Fund', value: d.currentFund, color: 'var(--accent-secondary)' },
                { label: 'Gap', value: results.gap, color: results.gap > 0 ? 'var(--accent-danger)' : 'var(--accent-success)' },
              ].map(item => (
                <div key={item.label} style={{ textAlign: 'center', padding: '10px 12px', background: 'var(--bg-raised)', borderRadius: 8 }}>
                  <div style={{ fontSize: 11, color: 'var(--text-secondary)', fontFamily: 'DM Sans, sans-serif', marginBottom: 4 }}>{item.label}</div>
                  <div style={{ fontFamily: 'DM Mono, monospace', fontSize: 16, fontWeight: 700, color: item.color, fontVariantNumeric: 'tabular-nums' }}>
                    {formatIndianNumber(item.value)}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Build plan */}
          {results.gap > 0 && (
            <Card>
              <h4 style={{ margin: '0 0 12px', fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'DM Sans, sans-serif' }}>
                Build Plan
              </h4>
              <div style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: 12, color: 'var(--text-secondary)', fontFamily: 'DM Sans, sans-serif' }}>
                    Build in {d.buildMonths} months
                  </span>
                  <span style={{ fontSize: 12, fontFamily: 'DM Mono, monospace', color: 'var(--accent-primary)', fontVariantNumeric: 'tabular-nums' }}>
                    {formatIndianNumber(monthlySIP)}/mo
                  </span>
                </div>
                <input
                  type="range"
                  min={3} max={60} value={d.buildMonths}
                  onChange={e => setEfData(p => ({ ...p, buildMonths: Number(e.target.value) }))}
                  style={{ width: '100%' }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--text-secondary)', fontFamily: 'DM Mono, monospace', marginTop: 4 }}>
                  <span>3 mo</span><span>60 mo</span>
                </div>
              </div>
              <div style={{ textAlign: 'center', padding: '12px', background: 'rgba(52,201,125,0.08)', borderRadius: 8 }}>
                <div style={{ fontSize: 11, color: 'var(--text-secondary)', fontFamily: 'DM Sans, sans-serif', marginBottom: 4 }}>
                  Monthly savings needed
                </div>
                <div style={{ fontFamily: 'DM Mono, monospace', fontSize: 26, fontWeight: 800, color: 'var(--accent-primary)', fontVariantNumeric: 'tabular-nums' }}>
                  {formatIndianNumber(monthlySIP)}
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
