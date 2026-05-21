import { useState, useMemo } from 'react';
import {
  AreaChart, Area, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip as ReTooltip, ResponsiveContainer, Legend,
} from 'recharts';
import Card from '../components/Card';
import InputField from '../components/InputField';
import Toggle from '../components/Toggle';
import SegmentedControl from '../components/SegmentedControl';
import Tooltip from '../components/Tooltip';
import {
  calcLumpSumFV, calcSIPFV, calcStepUpSIPFV, calcSIPYearlyData,
  calcSWPModeA, calcSWPModeB, calcEMI, calcAmortization, formatIndianNumber, formatFull,
} from '../utils/calculations';
import { DEFAULT_SIP, DEFAULT_SWP, DEFAULT_EMI } from '../data/defaults';

const CHART_COLORS = {
  primary: 'var(--accent-primary)',
  secondary: 'var(--accent-secondary)',
  danger: 'var(--accent-danger)',
  muted: 'rgba(108,142,245,0.5)',
};

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: 'var(--bg-raised)', border: '1px solid var(--border-subtle)',
      borderRadius: 8, padding: '10px 14px', fontSize: 12, fontFamily: 'DM Mono, monospace',
    }}>
      <div style={{ color: 'var(--text-secondary)', marginBottom: 6 }}>Year {label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color, marginBottom: 2 }}>
          {p.name}: {formatIndianNumber(p.value)}
        </div>
      ))}
    </div>
  );
}

function formatYAxis(v) {
  if (v >= 1_00_00_000) return `${(v / 1_00_00_000).toFixed(1)}Cr`;
  if (v >= 1_00_000) return `${(v / 1_00_000).toFixed(0)}L`;
  if (v >= 1000) return `${(v / 1000).toFixed(0)}K`;
  return v;
}

// ─── SIP/Compound Tab ────────────────────────────────────────────────────────

function SIPCalculator({ sipData, setSipData }) {
  const d = sipData;

  const { lumpFV, sipFV, combinedFV, totalInvested, chartData } = useMemo(() => {
    const lumpFV = calcLumpSumFV(d.lumpSum, d.annualRate, d.years);
    const sipFV = d.stepUp
      ? calcStepUpSIPFV(d.monthlySIP, d.annualRate, d.years, d.stepUpPct)
      : calcSIPFV(d.monthlySIP, d.annualRate, d.years);
    const combinedFV = lumpFV + sipFV;
    const chartData = calcSIPYearlyData(d.lumpSum, d.monthlySIP, d.annualRate, d.years, d.stepUp, d.stepUpPct);
    let totalInvested = d.lumpSum;
    if (d.stepUp) {
      let sip = d.monthlySIP;
      for (let y = 0; y < d.years; y++) { totalInvested += sip * 12; sip *= 1 + d.stepUpPct / 100; }
    } else {
      totalInvested += d.monthlySIP * d.years * 12;
    }
    return { lumpFV, sipFV, combinedFV, totalInvested, chartData };
  }, [d]);

  const wealthGained = combinedFV - totalInvested;

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 24 }}>
        <Card>
          <h3 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'DM Sans, sans-serif' }}>
            Inputs
          </h3>
          <InputField label="Lump Sum Amount" prefix="₹" value={d.lumpSum} onChange={v => setSipData(p => ({ ...p, lumpSum: v }))} min={0} />
          <InputField label="Monthly SIP Amount" prefix="₹" value={d.monthlySIP} onChange={v => setSipData(p => ({ ...p, monthlySIP: v }))} min={0} />
          <InputField
            label="Annual Rate of Interest"
            tooltip="Expected annual rate of return. Lump sum assumes annual compounding. SIP assumes monthly compounding."
            value={d.annualRate} onChange={v => setSipData(p => ({ ...p, annualRate: v }))}
            min={0} max={50} step={0.5} suffix="%"
          />
          <InputField label="Duration (Years)" value={d.years} onChange={v => setSipData(p => ({ ...p, years: v }))} min={1} max={50} />
          <div style={{ marginBottom: 16 }}>
            <Toggle checked={d.stepUp} onChange={v => setSipData(p => ({ ...p, stepUp: v }))} label="Step-up SIP" />
          </div>
          {d.stepUp && (
            <InputField label="Annual Step-up %" value={d.stepUpPct} onChange={v => setSipData(p => ({ ...p, stepUpPct: v }))} min={0} max={50} suffix="%" />
          )}
        </Card>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Big combined FV */}
          <Card style={{ textAlign: 'center', background: 'rgba(52,201,125,0.06)', border: '1px solid rgba(52,201,125,0.2)' }}>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', fontFamily: 'DM Sans, sans-serif', marginBottom: 4 }}>Combined Future Value</div>
            <div style={{ fontFamily: 'DM Mono, monospace', fontSize: 40, fontWeight: 800, color: 'var(--accent-primary)', fontVariantNumeric: 'tabular-nums' }}>
              {formatIndianNumber(combinedFV)}
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 4 }}>in {d.years} years</div>
          </Card>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {[
              { label: 'Lump Sum FV', value: lumpFV, color: 'var(--accent-secondary)' },
              { label: 'SIP FV', value: sipFV, color: 'var(--accent-secondary)' },
              { label: 'Total Invested', value: totalInvested, color: 'var(--text-primary)' },
              { label: 'Wealth Gained', value: wealthGained, color: 'var(--accent-success)' },
            ].map(item => (
              <Card key={item.label} style={{ padding: 16, textAlign: 'center' }}>
                <div style={{ fontSize: 11, color: 'var(--text-secondary)', fontFamily: 'DM Sans, sans-serif', marginBottom: 4 }}>{item.label}</div>
                <div style={{ fontFamily: 'DM Mono, monospace', fontSize: 16, fontWeight: 700, color: item.color, fontVariantNumeric: 'tabular-nums' }}>
                  {formatIndianNumber(item.value)}
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Chart */}
      <Card style={{ marginTop: 20 }}>
        <h3 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'DM Sans, sans-serif' }}>
          Growth Over Time
        </h3>
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
            <defs>
              <linearGradient id="corpusGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--accent-primary)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="var(--accent-primary)" stopOpacity={0.02} />
              </linearGradient>
              <linearGradient id="investedGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--accent-secondary)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="var(--accent-secondary)" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
            <XAxis dataKey="year" stroke="var(--text-secondary)" fontSize={11} fontFamily="DM Mono, monospace" />
            <YAxis tickFormatter={formatYAxis} stroke="var(--text-secondary)" fontSize={11} fontFamily="DM Mono, monospace" />
            <ReTooltip content={<ChartTooltip />} />
            <Legend wrapperStyle={{ fontSize: 12, fontFamily: 'DM Sans, sans-serif' }} />
            <Area type="monotone" dataKey="invested" name="Amount Invested" stroke="var(--accent-secondary)" fill="url(#investedGrad)" strokeWidth={2} />
            <Area type="monotone" dataKey="corpus" name="Total Corpus" stroke="var(--accent-primary)" fill="url(#corpusGrad)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
}

// ─── SWP Tab ─────────────────────────────────────────────────────────────────

function SWPCalculator({ swpData, setSwpData }) {
  const [mode, setMode] = useState('A');
  const d = swpData;

  const results = useMemo(() => {
    if (mode === 'A') {
      return calcSWPModeA(d.corpus, d.annualWithdrawal, d.annualReturn, d.tenure);
    } else {
      const { annualWithdrawal, monthlyWithdrawal } = calcSWPModeB(d.corpus, d.annualReturn, d.tenure);
      const rows = calcSWPModeA(d.corpus, annualWithdrawal, d.annualReturn, d.tenure).rows;
      return { annualWithdrawal, monthlyWithdrawal, rows };
    }
  }, [mode, d]);

  const chartData = results.rows?.map(r => ({ year: r.year, balance: r.closing })) || [];

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <SegmentedControl
          tabs={[
            { id: 'A', label: 'How long will my money last?' },
            { id: 'B', label: 'How much can I withdraw?' },
          ]}
          active={mode}
          onChange={setMode}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 24, marginBottom: 20 }}>
        <Card>
          <h3 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'DM Sans, sans-serif' }}>
            Inputs
          </h3>
          <InputField label="Corpus (₹)" prefix="₹" value={d.corpus} onChange={v => setSwpData(p => ({ ...p, corpus: v }))} min={0} />
          {mode === 'A' && (
            <InputField label="Annual Withdrawal (₹)" prefix="₹" value={d.annualWithdrawal} onChange={v => setSwpData(p => ({ ...p, annualWithdrawal: v }))} min={0} />
          )}
          <InputField label="Expected Annual Return (%)" value={d.annualReturn} onChange={v => setSwpData(p => ({ ...p, annualReturn: v }))} min={0} max={30} step={0.5} suffix="%" />
          <InputField label="Tenure (Years)" value={d.tenure} onChange={v => setSwpData(p => ({ ...p, tenure: v }))} min={1} max={60} />
        </Card>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {mode === 'A' ? (
            <>
              <Card style={{
                textAlign: 'center',
                background: results.depleted ? 'rgba(224,92,107,0.06)' : 'rgba(52,201,125,0.06)',
                border: results.depleted ? '1px solid rgba(224,92,107,0.25)' : '1px solid rgba(52,201,125,0.2)',
              }}>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)', fontFamily: 'DM Sans, sans-serif', marginBottom: 4 }}>
                  Corpus Remaining After {d.tenure} Years
                </div>
                <div style={{ fontFamily: 'DM Mono, monospace', fontSize: 36, fontWeight: 800, color: results.depleted ? 'var(--accent-danger)' : 'var(--accent-primary)', fontVariantNumeric: 'tabular-nums' }}>
                  {results.depleted ? '₹0' : formatIndianNumber(results.finalBalance)}
                </div>
              </Card>
              {results.depleted && (
                <div style={{
                  padding: '12px 16px',
                  background: 'rgba(245,166,35,0.1)',
                  border: '1px solid rgba(245,166,35,0.3)',
                  borderRadius: 10,
                  fontSize: 13, color: 'var(--accent-warning)', fontFamily: 'DM Sans, sans-serif',
                }}>
                  ⚠️ Corpus depletes in Year {results.depletionYear} — reduce withdrawals or grow corpus.
                </div>
              )}
            </>
          ) : (
            <>
              <Card style={{ textAlign: 'center', background: 'rgba(52,201,125,0.06)', border: '1px solid rgba(52,201,125,0.2)' }}>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)', fontFamily: 'DM Sans, sans-serif', marginBottom: 4 }}>Max Annual Withdrawal</div>
                <div style={{ fontFamily: 'DM Mono, monospace', fontSize: 36, fontWeight: 800, color: 'var(--accent-primary)', fontVariantNumeric: 'tabular-nums' }}>
                  {formatIndianNumber(results.annualWithdrawal)}
                </div>
                <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>
                  {formatIndianNumber(results.monthlyWithdrawal)}/month
                </div>
              </Card>
            </>
          )}
        </div>
      </div>

      {/* Chart */}
      <Card style={{ marginBottom: 20 }}>
        <h3 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'DM Sans, sans-serif' }}>
          Corpus Over Time
        </h3>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
            <XAxis dataKey="year" stroke="var(--text-secondary)" fontSize={11} fontFamily="DM Mono, monospace" />
            <YAxis tickFormatter={formatYAxis} stroke="var(--text-secondary)" fontSize={11} fontFamily="DM Mono, monospace" />
            <ReTooltip content={({ active, payload, label }) => {
              if (!active || !payload?.length) return null;
              return (
                <div style={{ background: 'var(--bg-raised)', border: '1px solid var(--border-subtle)', borderRadius: 8, padding: '10px 14px', fontSize: 12, fontFamily: 'DM Mono, monospace' }}>
                  <div style={{ color: 'var(--text-secondary)', marginBottom: 4 }}>Year {label}</div>
                  <div style={{ color: 'var(--accent-secondary)' }}>Corpus: {formatIndianNumber(payload[0].value)}</div>
                </div>
              );
            }} />
            <Line type="monotone" dataKey="balance" name="Corpus" stroke="var(--accent-secondary)" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      {/* Table */}
      <Card>
        <h3 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'DM Sans, sans-serif' }}>
          Year-by-Year Breakdown
        </h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'DM Mono, monospace', fontSize: 12 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                {['Year', 'Opening', 'Withdrawal', 'Interest', 'Closing'].map(h => (
                  <th key={h} style={{ padding: '8px 12px', textAlign: 'right', color: 'var(--text-secondary)', fontWeight: 500, fontFamily: 'DM Sans, sans-serif', fontSize: 11 }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {results.rows?.map((r, i) => (
                <tr key={r.year} className="table-row-alt">
                  {[r.year, r.opening, r.withdrawal, r.interest, r.closing].map((v, j) => (
                    <td key={j} style={{ padding: '8px 12px', textAlign: 'right', color: j === 0 ? 'var(--text-secondary)' : 'var(--text-primary)', fontVariantNumeric: 'tabular-nums' }}>
                      {j === 0 ? v : formatIndianNumber(v)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

// ─── EMI Tab ─────────────────────────────────────────────────────────────────

function EMICalculator({ emiData, setEmiData, onEMIChange }) {
  const [showAll, setShowAll] = useState(false);
  const d = emiData;
  const totalMonths = d.years * 12 + d.months;

  const { emi, totalInterest, totalPayment, rows } = useMemo(() => {
    if (totalMonths <= 0 || d.loanAmount <= 0) return { emi: 0, totalInterest: 0, totalPayment: 0, rows: [] };
    const rows = calcAmortization(d.loanAmount, d.annualRate, totalMonths);
    const totalInterest = rows.reduce((s, r) => s + r.interestPaid, 0);
    const totalPayment = d.loanAmount + totalInterest;
    const emi = rows[0]?.emi || 0;
    return { emi, totalInterest, totalPayment, rows };
  }, [d]);

  useMemo(() => {
    onEMIChange && onEMIChange(emi);
  }, [emi]);

  const pieData = [
    { name: 'Principal', value: Math.round(d.loanAmount), color: 'var(--accent-primary)' },
    { name: 'Interest', value: Math.round(totalInterest), color: 'var(--accent-danger)' },
  ];

  const displayRows = showAll ? rows : rows.slice(0, 12);

  const lineData = rows.filter((_, i) => i % Math.max(1, Math.floor(rows.length / 60)) === 0).map(r => ({
    month: r.month,
    balance: r.closing,
    cumInterest: r.cumulativeInterest,
  }));

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 24, marginBottom: 20 }}>
        <Card>
          <h3 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'DM Sans, sans-serif' }}>
            Inputs
          </h3>
          <InputField label="Loan Amount" prefix="₹" value={d.loanAmount} onChange={v => setEmiData(p => ({ ...p, loanAmount: v }))} min={0} />
          <InputField label="Annual Interest Rate (%)" value={d.annualRate} onChange={v => setEmiData(p => ({ ...p, annualRate: v }))} min={0} max={50} step={0.1} suffix="%" />
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 6 }}>
              Tenure
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <div style={{ position: 'relative' }}>
                <input type="number" value={d.years} min={0} max={40}
                  onChange={e => setEmiData(p => ({ ...p, years: Number(e.target.value) }))}
                  style={{ width: '100%', background: 'var(--bg-raised)', border: 'none', borderRadius: 8, padding: '10px 36px 10px 12px', color: 'var(--text-primary)', fontSize: 14, fontFamily: 'DM Mono, monospace', outline: 'none' }}
                />
                <span style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)', fontSize: 11 }}>yr</span>
              </div>
              <div style={{ position: 'relative' }}>
                <input type="number" value={d.months} min={0} max={11}
                  onChange={e => setEmiData(p => ({ ...p, months: Number(e.target.value) }))}
                  style={{ width: '100%', background: 'var(--bg-raised)', border: 'none', borderRadius: 8, padding: '10px 36px 10px 12px', color: 'var(--text-primary)', fontSize: 14, fontFamily: 'DM Mono, monospace', outline: 'none' }}
                />
                <span style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)', fontSize: 11 }}>mo</span>
              </div>
            </div>
          </div>
        </Card>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Big EMI */}
          <Card style={{ textAlign: 'center', background: 'rgba(52,201,125,0.06)', border: '1px solid rgba(52,201,125,0.2)' }}>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', fontFamily: 'DM Sans, sans-serif', marginBottom: 4 }}>Monthly EMI</div>
            <div style={{ fontFamily: 'DM Mono, monospace', fontSize: 40, fontWeight: 800, color: 'var(--accent-primary)', fontVariantNumeric: 'tabular-nums' }}>
              {formatIndianNumber(emi)}
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 4 }}>per month for {totalMonths} months</div>
          </Card>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {[
              { label: 'Principal', value: d.loanAmount, color: 'var(--accent-primary)' },
              { label: 'Total Interest', value: totalInterest, color: 'var(--accent-danger)' },
              { label: 'Total Payment', value: totalPayment, color: 'var(--text-primary)' },
            ].map(item => (
              <Card key={item.label} style={{ padding: 14, textAlign: 'center' }}>
                <div style={{ fontSize: 11, color: 'var(--text-secondary)', fontFamily: 'DM Sans, sans-serif', marginBottom: 4 }}>{item.label}</div>
                <div style={{ fontFamily: 'DM Mono, monospace', fontSize: 15, fontWeight: 700, color: item.color, fontVariantNumeric: 'tabular-nums' }}>
                  {formatIndianNumber(item.value)}
                </div>
              </Card>
            ))}

            {/* Donut chart */}
            <Card style={{ padding: 14, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <ResponsiveContainer width="100%" height={80}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={25} outerRadius={38} dataKey="value" startAngle={90} endAngle={-270}>
                    {pieData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div style={{ display: 'flex', gap: 12, fontSize: 10, fontFamily: 'DM Sans, sans-serif' }}>
                {pieData.map(d => (
                  <span key={d.name} style={{ color: d.color }}>● {d.name}</span>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Line chart */}
      <Card style={{ marginBottom: 20 }}>
        <h3 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'DM Sans, sans-serif' }}>
          Balance vs Cumulative Interest
        </h3>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={lineData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
            <XAxis dataKey="month" stroke="var(--text-secondary)" fontSize={11} fontFamily="DM Mono, monospace" />
            <YAxis tickFormatter={formatYAxis} stroke="var(--text-secondary)" fontSize={11} fontFamily="DM Mono, monospace" />
            <ReTooltip content={({ active, payload, label }) => {
              if (!active || !payload?.length) return null;
              return (
                <div style={{ background: 'var(--bg-raised)', border: '1px solid var(--border-subtle)', borderRadius: 8, padding: '10px 14px', fontSize: 12, fontFamily: 'DM Mono, monospace' }}>
                  <div style={{ color: 'var(--text-secondary)', marginBottom: 4 }}>Month {label}</div>
                  {payload.map((p, i) => <div key={i} style={{ color: p.color }}>{p.name}: {formatIndianNumber(p.value)}</div>)}
                </div>
              );
            }} />
            <Legend wrapperStyle={{ fontSize: 12, fontFamily: 'DM Sans, sans-serif' }} />
            <Line type="monotone" dataKey="balance" name="Closing Balance" stroke="var(--accent-secondary)" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="cumInterest" name="Cumulative Interest" stroke="var(--accent-danger)" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      {/* Amortization table */}
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'DM Sans, sans-serif' }}>
            Amortization Schedule
          </h3>
          {rows.length > 12 && (
            <button
              onClick={() => setShowAll(p => !p)}
              style={{
                background: 'var(--bg-raised)', border: 'none', borderRadius: 6,
                padding: '5px 12px', fontSize: 12, color: 'var(--text-secondary)',
                cursor: 'pointer', fontFamily: 'DM Sans, sans-serif',
              }}
            >
              {showAll ? 'Show less' : `Show all ${rows.length} months`}
            </button>
          )}
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'DM Mono, monospace', fontSize: 12 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                {['Month', 'Opening', 'EMI', 'Principal', 'Interest', 'Closing'].map(h => (
                  <th key={h} style={{ padding: '8px 10px', textAlign: 'right', color: 'var(--text-secondary)', fontWeight: 500, fontFamily: 'DM Sans, sans-serif', fontSize: 11 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {displayRows.map((r, i) => (
                <tr key={r.month} className="table-row-alt">
                  {[r.month, r.opening, r.emi, r.principalPaid, r.interestPaid, r.closing].map((v, j) => (
                    <td key={j} style={{ padding: '7px 10px', textAlign: 'right', color: j === 0 ? 'var(--text-secondary)' : 'var(--text-primary)', fontVariantNumeric: 'tabular-nums' }}>
                      {j === 0 ? v : formatIndianNumber(v)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

// ─── Main Calculators Section ─────────────────────────────────────────────────

export default function Calculators({ sipData, setSipData, swpData, setSwpData, emiData, setEmiData, onEMIChange }) {
  const [tab, setTab] = useState('sip');

  return (
    <div className="section-enter">
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ margin: '0 0 4px', fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'DM Sans, sans-serif' }}>
          Calculators
        </h2>
        <p style={{ margin: '0 0 16px', fontSize: 13, color: 'var(--text-secondary)', fontFamily: 'DM Sans, sans-serif' }}>
          SIP, SWP, and EMI calculators with live outputs
        </p>
        <SegmentedControl
          tabs={[
            { id: 'sip', label: '📈 Compound / SIP' },
            { id: 'swp', label: '💸 SWP' },
            { id: 'emi', label: '🏦 EMI' },
          ]}
          active={tab}
          onChange={setTab}
        />
      </div>

      {tab === 'sip' && <SIPCalculator sipData={sipData} setSipData={setSipData} />}
      {tab === 'swp' && <SWPCalculator swpData={swpData} setSwpData={setSwpData} />}
      {tab === 'emi' && <EMICalculator emiData={emiData} setEmiData={setEmiData} onEMIChange={onEMIChange} />}
    </div>
  );
}
