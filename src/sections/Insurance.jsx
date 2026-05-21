import { useMemo } from 'react';
import Card from '../components/Card';
import InputField from '../components/InputField';
import Toggle from '../components/Toggle';
import SegmentedControl from '../components/SegmentedControl';
import { useState } from 'react';
import { calcLifeInsurance, calcHealthInsurance, formatIndianNumber } from '../utils/calculations';
import { DEFAULT_INSURANCE } from '../data/defaults';

function GapIndicator({ recommended, existing, gap }) {
  const adequate = gap <= 0;
  const items = [
    { label: 'Recommended Cover', value: recommended, color: 'var(--text-primary)' },
    { label: 'Existing Cover', value: existing, color: 'var(--text-primary)' },
    { label: adequate ? 'Surplus' : 'Cover Gap', value: Math.abs(gap), color: adequate ? 'var(--accent-success)' : 'var(--accent-danger)' },
  ];
  return (
    <div style={{
      padding: '14px 16px',
      background: adequate ? 'rgba(52,201,125,0.06)' : 'rgba(224,92,107,0.06)',
      border: `1px solid ${adequate ? 'rgba(52,201,125,0.2)' : 'rgba(224,92,107,0.25)'}`,
      borderRadius: 10,
      marginTop: 16,
    }}>
      {/* Status line */}
      <div style={{
        fontSize: 13, fontWeight: 600,
        color: adequate ? 'var(--accent-success)' : 'var(--accent-danger)',
        fontFamily: 'DM Sans, sans-serif',
        marginBottom: 12,
      }}>
        {adequate ? '✅ Adequately covered' : '🚨 Insufficient coverage'}
      </div>

      {/* Row layout: label → value, each on its own line */}
      {items.map(item => (
        <div key={item.label} style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '6px 0',
          borderBottom: '1px solid var(--border-subtle)',
        }}>
          <span style={{ fontSize: 12, color: 'var(--text-secondary)', fontFamily: 'DM Sans, sans-serif' }}>
            {item.label}
          </span>
          <span style={{
            fontFamily: 'DM Mono, monospace', fontSize: 14, fontWeight: 700,
            color: item.color, fontVariantNumeric: 'tabular-nums',
          }}>
            {formatIndianNumber(item.value)}
          </span>
        </div>
      ))}
    </div>
  );
}

function LifeInsurance({ data, setData }) {
  const d = data;
  const results = useMemo(() =>
    calcLifeInsurance(d.annualIncome, d.currentAge, d.retirementAge, d.liabilities, d.existingAssets, d.existingCover),
    [d]
  );

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 24 }}>
        <Card>
          <h3 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'DM Sans, sans-serif' }}>
            Life Insurance Details
          </h3>
          <InputField label="Annual Income" prefix="₹" value={d.annualIncome} onChange={v => setData(p => ({ ...p, annualIncome: v }))} min={0} />
          <InputField label="Current Age" value={d.currentAge} onChange={v => setData(p => ({ ...p, currentAge: v }))} min={18} max={70} />
          <InputField label="Retirement Age" value={d.retirementAge} onChange={v => setData(p => ({ ...p, retirementAge: v }))} min={25} max={80} />
          <InputField label="Outstanding Liabilities" prefix="₹" value={d.liabilities} onChange={v => setData(p => ({ ...p, liabilities: v }))} min={0} />
          <InputField label="Existing Assets (Savings/Investments)" prefix="₹" value={d.existingAssets} onChange={v => setData(p => ({ ...p, existingAssets: v }))} min={0} />
          <InputField label="Existing Life Insurance Cover" prefix="₹" value={d.existingCover} onChange={v => setData(p => ({ ...p, existingCover: v }))} min={0} />
        </Card>

        <div>
          <Card>
            <h3 style={{ margin: '0 0 4px', fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'DM Sans, sans-serif' }}>
              Adequacy Assessment
            </h3>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', fontFamily: 'DM Sans, sans-serif', marginBottom: 8 }}>
              Based on Human Life Value (HLV) method
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-secondary)', fontFamily: 'DM Sans, sans-serif', marginBottom: 12, lineHeight: 1.5 }}>
              Formula: (Annual Income × Years to Retirement) + Liabilities − Existing Assets
            </div>
            <GapIndicator recommended={results.recommended} existing={results.existingCover} gap={results.gap} />
            <div style={{ marginTop: 12, padding: '10px 12px', background: 'var(--bg-raised)', borderRadius: 8, fontSize: 11, color: 'var(--text-secondary)', fontFamily: 'DM Sans, sans-serif', lineHeight: 1.5 }}>
              ⚠️ Indicative estimate based on Human Life Value method. Consult a certified financial advisor for precise recommendations.
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

function HealthInsurance({ data, setData }) {
  const d = data;
  const results = useMemo(() =>
    calcHealthInsurance(d.cityTier, d.adults, d.children, d.preExisting, d.existingCover),
    [d]
  );

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 24 }}>
        <Card>
          <h3 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'DM Sans, sans-serif' }}>
            Health Insurance Details
          </h3>

          {/* City Tier */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 8 }}>
              City Tier
            </label>
            <SegmentedControl
              tabs={[
                { id: 'Metro', label: 'Metro' },
                { id: 'Tier 2', label: 'Tier 2' },
                { id: 'Tier 3', label: 'Tier 3' },
              ]}
              active={d.cityTier}
              onChange={v => setData(p => ({ ...p, cityTier: v }))}
            />
          </div>

          <InputField label="Number of Adults" value={d.adults} onChange={v => setData(p => ({ ...p, adults: v }))} min={1} max={6} />
          <InputField label="Number of Children" value={d.children} onChange={v => setData(p => ({ ...p, children: v }))} min={0} max={6} />

          <div style={{ marginBottom: 16 }}>
            <Toggle
              checked={d.preExisting}
              onChange={v => setData(p => ({ ...p, preExisting: v }))}
              label="Pre-existing conditions"
            />
          </div>

          <InputField label="Existing Health Cover" prefix="₹" value={d.existingCover} onChange={v => setData(p => ({ ...p, existingCover: v }))} min={0} />
        </Card>

        <div>
          <Card>
            <h3 style={{ margin: '0 0 8px', fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'DM Sans, sans-serif' }}>
              Recommendation
            </h3>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', fontFamily: 'DM Sans, sans-serif', marginBottom: 8 }}>
              Base: {d.cityTier === 'Metro' ? '₹10L' : d.cityTier === 'Tier 2' ? '₹7L' : '₹5L'}/adult
              {d.preExisting ? ' + ₹3L (pre-existing add-on)' : ''}
            </div>
            <GapIndicator recommended={results.recommended} existing={results.existingCover} gap={results.gap} />
            <div style={{ marginTop: 12, padding: '10px 12px', background: 'var(--bg-raised)', borderRadius: 8, fontSize: 11, color: 'var(--text-secondary)', fontFamily: 'DM Sans, sans-serif', lineHeight: 1.5 }}>
              ⚠️ Indicative estimate based on general guidelines. Actual needs may vary. Consult an insurance advisor.
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function Insurance({ lifeData, setLifeData, healthData, setHealthData }) {
  const [tab, setTab] = useState('life');

  return (
    <div className="section-enter">
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ margin: '0 0 4px', fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'DM Sans, sans-serif' }}>
          Insurance Adequacy
        </h2>
        <p style={{ margin: '0 0 16px', fontSize: 13, color: 'var(--text-secondary)', fontFamily: 'DM Sans, sans-serif' }}>
          Check if your life and health cover is adequate
        </p>
        <SegmentedControl
          tabs={[
            { id: 'life', label: '🛡️ Life Insurance' },
            { id: 'health', label: '🏥 Health Insurance' },
          ]}
          active={tab}
          onChange={setTab}
        />
      </div>

      {tab === 'life' && <LifeInsurance data={lifeData} setData={setLifeData} />}
      {tab === 'health' && <HealthInsurance data={healthData} setData={setHealthData} />}
    </div>
  );
}
