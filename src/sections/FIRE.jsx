import { useMemo, useRef } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as ReTooltip, ResponsiveContainer } from 'recharts';
import Card from '../components/Card';
import InputField from '../components/InputField';
import { calcFIRE, formatIndianNumber, formatFull } from '../utils/calculations';
import { DEFAULT_FIRE } from '../data/defaults';
import DownloadPDFButton from '../components/DownloadPDFButton';

function formatYAxis(v) {
  if (v >= 1_00_00_000) return `${(v / 1_00_00_000).toFixed(1)}Cr`;
  if (v >= 1_00_000) return `${(v / 1_00_000).toFixed(0)}L`;
  return v;
}

function MilestoneTimeline({ currentAge, retirementAge, fireNumber, savedGrown }) {
  const midAge = Math.round((currentAge + retirementAge) / 2);
  const pct = fireNumber > 0 ? Math.min(100, (savedGrown / fireNumber) * 100) : 0;
  return (
    <div style={{ position: 'relative', padding: '20px 0' }}>
      <div style={{ height: 4, background: 'var(--bg-raised)', borderRadius: 2, position: 'relative', margin: '0 20px' }}>
        <div style={{
          position: 'absolute', left: 0, top: 0, height: '100%',
          width: `${pct}%`, background: 'var(--accent-primary)', borderRadius: 2,
          transition: 'width 0.5s ease',
        }} />
      </div>
      {[
        { label: 'Today', age: currentAge, pos: '0%' },
        { label: `Age ${midAge}`, age: midAge, pos: '50%' },
        { label: `Retire`, age: retirementAge, pos: '100%' },
      ].map(m => (
        <div key={m.label} style={{
          position: 'absolute', top: 0,
          left: `calc(${m.pos} + ${m.pos === '0%' ? '20px' : m.pos === '100%' ? '-20px' : '0px'})`,
          transform: `translateX(${m.pos === '0%' ? '0' : m.pos === '100%' ? '-100%' : '-50%'})`,
          textAlign: 'center',
        }}>
          <div style={{
            width: 12, height: 12, borderRadius: '50%',
            background: 'var(--accent-primary)',
            border: '2px solid var(--bg-surface)',
            margin: '0 auto 4px',
            marginTop: 12,
          }} />
          <div style={{ fontSize: 11, color: 'var(--text-secondary)', fontFamily: 'DM Sans, sans-serif' }}>{m.label}</div>
          <div style={{ fontSize: 10, color: 'var(--text-secondary)', fontFamily: 'DM Mono, monospace' }}>Age {m.age}</div>
        </div>
      ))}
    </div>
  );
}

export default function FIRECalculator({ fireData, setFireData }) {
  const d = fireData;
  const sectionRef = useRef(null);

  const results = useMemo(() =>
    calcFIRE(d.currentAge, d.retirementAge, d.monthlyExpenses, d.inflation, d.annualReturn, d.postReturnRate, d.currentSavings),
    [d]
  );

  const chartData = useMemo(() => {
    if (!results) return [];
    const data = [];
    const mr = d.annualReturn / 12 / 100;
    const sipPerMonth = results.sipNeeded;
    let corpus = d.currentSavings;
    for (let y = 0; y <= results.yearsToRetirement; y++) {
      data.push({ year: d.currentAge + y, corpus: Math.round(corpus), target: Math.round(results.fireNumber) });
      for (let m = 0; m < 12; m++) corpus = (corpus + sipPerMonth) * (1 + mr);
    }
    return data;
  }, [results, d]);

  return (
    <div className="section-enter" ref={sectionRef}>
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4, flexWrap: 'wrap', gap: 10 }}>
          <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'DM Sans, sans-serif' }}>
            FIRE Calculator
          </h2>
          <DownloadPDFButton sectionRef={sectionRef} filename="finsight-fire" />
        </div>
        <p style={{ margin: 0, fontSize: 13, color: 'var(--text-secondary)', fontFamily: 'DM Sans, sans-serif' }}>
          Financial Independence, Retire Early — calculate your number
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 24, marginBottom: 24 }}>
        <Card>
          <h3 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'DM Sans, sans-serif' }}>
            Your Details
          </h3>
          <InputField label="Current Age" value={d.currentAge} onChange={v => setFireData(p => ({ ...p, currentAge: v }))} min={18} max={70} />
          <InputField label="Target Retirement Age" value={d.retirementAge} onChange={v => setFireData(p => ({ ...p, retirementAge: v }))} min={25} max={80} />
          <InputField
            label="Monthly Expenses (Today)"
            tooltip="Enter your current monthly expenses. This will be adjusted for inflation to estimate expenses at retirement."
            prefix="₹" value={d.monthlyExpenses}
            onChange={v => setFireData(p => ({ ...p, monthlyExpenses: v }))} min={0}
          />
          <InputField label="Expected Inflation (%)" value={d.inflation} onChange={v => setFireData(p => ({ ...p, inflation: v }))} min={0} max={20} step={0.5} suffix="%" />
          <InputField label="Annual Return (Building phase, %)" value={d.annualReturn} onChange={v => setFireData(p => ({ ...p, annualReturn: v }))} min={0} max={40} step={0.5} suffix="%" />
          <InputField
            label="Post-Retirement Return (%)"
            tooltip="The annual return your corpus is expected to earn after retirement, typically from safer instruments like debt funds or FDs. Usually 6–8%."
            value={d.postReturnRate}
            onChange={v => setFireData(p => ({ ...p, postReturnRate: v }))} min={0} max={20} step={0.5} suffix="%"
          />
          <InputField label="Current Savings (₹)" prefix="₹" value={d.currentSavings} onChange={v => setFireData(p => ({ ...p, currentSavings: v }))} min={0} />
        </Card>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {results ? (
            <>
              {/* FIRE Number */}
              <Card style={{ textAlign: 'center', background: 'rgba(52,201,125,0.06)', border: '1px solid rgba(52,201,125,0.2)' }}>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)', fontFamily: 'DM Sans, sans-serif', marginBottom: 4 }}>
                  🔥 Your FIRE Number
                </div>
                <div style={{ fontFamily: 'DM Mono, monospace', fontSize: 42, fontWeight: 800, color: 'var(--accent-primary)', fontVariantNumeric: 'tabular-nums' }}>
                  {formatIndianNumber(results.fireNumber)}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4, fontFamily: 'DM Sans, sans-serif' }}>
                  Total corpus needed to retire at age {d.retirementAge}
                </div>
              </Card>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {[
                  { label: 'Years to Retirement', value: `${results.yearsToRetirement} yrs`, color: 'var(--text-primary)' },
                  { label: 'Monthly SIP Needed', value: formatIndianNumber(results.sipNeeded), color: 'var(--accent-primary)' },
                  { label: 'Expenses at Retirement', value: `${formatIndianNumber(results.monthlyExpensesAtRetirement)}/mo`, color: 'var(--accent-secondary)' },
                  { label: 'Current Savings Grown', value: formatIndianNumber(results.savedGrown), color: 'var(--accent-success)' },
                ].map(item => (
                  <Card key={item.label} style={{ padding: 14, textAlign: 'center' }}>
                    <div style={{ fontSize: 11, color: 'var(--text-secondary)', fontFamily: 'DM Sans, sans-serif', marginBottom: 4 }}>{item.label}</div>
                    <div style={{ fontFamily: 'DM Mono, monospace', fontSize: 15, fontWeight: 700, color: item.color, fontVariantNumeric: 'tabular-nums' }}>
                      {item.value}
                    </div>
                  </Card>
                ))}
              </div>

              {/* Milestone timeline */}
              <Card>
                <h4 style={{ margin: '0 0 12px', fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'DM Sans, sans-serif' }}>
                  Journey to FIRE
                </h4>
                <MilestoneTimeline
                  currentAge={d.currentAge}
                  retirementAge={d.retirementAge}
                  fireNumber={results.fireNumber}
                  savedGrown={d.currentSavings}
                />
                <div style={{ marginTop: 24, fontSize: 12, color: 'var(--text-secondary)', fontFamily: 'DM Sans, sans-serif', textAlign: 'center' }}>
                  Current savings = {((d.currentSavings / results.fireNumber) * 100).toFixed(1)}% of FIRE number
                </div>
              </Card>
            </>
          ) : (
            <Card style={{ textAlign: 'center', padding: 40 }}>
              <div style={{ color: 'var(--text-secondary)', fontSize: 13 }}>Enter your details to see your FIRE number</div>
            </Card>
          )}
        </div>
      </div>

      {/* Corpus growth chart */}
      {results && chartData.length > 0 && (
        <Card>
          <h3 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'DM Sans, sans-serif' }}>
            Corpus Growth Projection
          </h3>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
              <defs>
                <linearGradient id="fireCorpusGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--accent-primary)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="var(--accent-primary)" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
              <XAxis dataKey="year" stroke="var(--text-secondary)" fontSize={11} fontFamily="DM Mono, monospace" />
              <YAxis tickFormatter={formatYAxis} stroke="var(--text-secondary)" fontSize={11} fontFamily="DM Mono, monospace" />
              <ReTooltip content={({ active, payload, label }) => {
                if (!active || !payload?.length) return null;
                return (
                  <div style={{ background: 'var(--bg-raised)', border: '1px solid var(--border-subtle)', borderRadius: 8, padding: '10px 14px', fontSize: 12, fontFamily: 'DM Mono, monospace' }}>
                    <div style={{ color: 'var(--text-secondary)', marginBottom: 4 }}>Age {label}</div>
                    {payload.map((p, i) => <div key={i} style={{ color: p.color }}>{p.name}: {formatIndianNumber(p.value)}</div>)}
                  </div>
                );
              }} />
              <Area type="monotone" dataKey="corpus" name="Projected Corpus" stroke="var(--accent-primary)" fill="url(#fireCorpusGrad)" strokeWidth={2} />
              <Area type="monotone" dataKey="target" name="FIRE Target" stroke="var(--accent-secondary)" fill="none" strokeWidth={2} strokeDasharray="5 5" />
            </AreaChart>
          </ResponsiveContainer>
        </Card>
      )}
    </div>
  );
}
