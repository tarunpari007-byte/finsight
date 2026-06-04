import { useMemo, useRef } from 'react';
import Card from '../components/Card';
import InputField from '../components/InputField';
import Tooltip from '../components/Tooltip';
import DownloadPDFButton from '../components/DownloadPDFButton';
import { calcBuyVsRent, formatFull } from '../utils/calculations';

// ── Table style tokens ──────────────────────────────────────────────────────
const TH = {
  padding: '7px 10px', fontSize: 10, fontWeight: 700,
  letterSpacing: '0.07em', textTransform: 'uppercase',
  fontFamily: 'DM Sans, sans-serif', background: 'var(--bg-raised)',
  color: 'var(--text-secondary)', textAlign: 'left', whiteSpace: 'nowrap',
};
const TD = {
  padding: '8px 10px', fontSize: 12,
  fontFamily: 'DM Sans, sans-serif', color: 'var(--text-primary)',
  borderTop: '1px solid var(--border-subtle)',
};
const TDr = { ...TD, fontFamily: 'DM Mono, monospace', fontVariantNumeric: 'tabular-nums', textAlign: 'right' };
const TDc = { ...TDr, textAlign: 'center' };
const TDb = { ...TD, fontWeight: 700 };
const TDrb = { ...TDr, fontWeight: 700 };

// ── Sub-components ──────────────────────────────────────────────────────────
function ExpenseSection({ label, pctOrAmount, isPct, increment, onPctChange, onIncrChange, onAmtChange }) {
  return (
    <div style={{ marginBottom: 4 }}>
      <div style={{ fontSize: 11, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', fontFamily: 'DM Sans, sans-serif', marginBottom: 6, marginTop: 12 }}>
        {label}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, alignItems: 'start' }}>
        {isPct
          ? <InputField label="% of Value" suffix="%" value={pctOrAmount} onChange={onPctChange} min={0} max={5} step={0.1} />
          : <InputField label="Amount / Year" prefix="₹" value={pctOrAmount} onChange={onAmtChange} min={0} />
        }
        <InputField label="Yearly Increment" suffix="%" value={increment} onChange={onIncrChange} min={0} max={30} />
      </div>
    </div>
  );
}

function ResultTable({ title, accentColor, rows }) {
  return (
    <Card>
      <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'DM Sans, sans-serif', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>
        {title}
      </div>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i}>
              <td style={row.bold ? { ...TDb, color: row.color || 'var(--text-primary)' } : TD}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                  {row.label}
                  {row.tooltip && <Tooltip text={row.tooltip} />}
                </span>
              </td>
              <td style={row.bold
                ? { ...TDrb, color: row.color || accentColor }
                : TDr
              }>
                {typeof row.value === 'string' ? row.value : formatFull(row.value)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}

// ── Main component ──────────────────────────────────────────────────────────
export default function BuyVsRent({ data, setData }) {
  const sectionRef = useRef(null);
  const r = useMemo(() => calcBuyVsRent(data), [data]);

  const isBuy = r.recommendation === 'Buy';
  const verdictColor = isBuy ? 'var(--accent-primary)' : 'var(--accent-secondary)';
  const verdictBg = isBuy ? 'rgba(52,201,125,0.06)' : 'rgba(108,142,245,0.06)';
  const verdictBorder = isBuy ? 'rgba(52,201,125,0.2)' : 'rgba(108,142,245,0.2)';

  const up = (key) => (v) => setData(p => ({ ...p, [key]: v }));

  return (
    <div className="section-enter" ref={sectionRef}>

      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 10 }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'DM Sans, sans-serif' }}>
              Buy vs Rent Analysis
            </h2>
            <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--text-secondary)', fontFamily: 'DM Sans, sans-serif' }}>
              Compare the long-term financial impact of buying vs renting a home
            </p>
          </div>
          <DownloadPDFButton sectionRef={sectionRef} filename="finsight-buy-vs-rent" />
        </div>
      </div>

      {/* 3-column layout: Buying | Renting | Results */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 24, alignItems: 'start' }}>

        {/* ── Col 1: Buying Scenario ── */}
        <Card>
          <h3 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'DM Sans, sans-serif' }}>
            Buying Scenario
          </h3>

          <InputField label="Property Price" prefix="₹" value={data.propertyPrice} onChange={up('propertyPrice')} min={0} tooltip="Current market price of the property" />
          <InputField label="Down Payment" suffix="%" value={data.downPaymentPct} onChange={up('downPaymentPct')} min={5} max={90} tooltip="Upfront payment as % of property price" />
          <InputField label="Loan Tenure" suffix="yrs" value={data.loanTenure} onChange={up('loanTenure')} min={1} max={30} tooltip="Home loan repayment period in years" />
          <InputField label="Interest Rate" suffix="% p.a." value={data.interestRate} onChange={up('interestRate')} min={1} max={20} step={0.25} tooltip="Annual interest rate on the home loan" />
          <InputField label="Property Appreciation" suffix="% p.a." value={data.propertyAppreciation} onChange={up('propertyAppreciation')} min={0} max={20} step={0.5} tooltip="Expected annual increase in property value" />

          <div style={{ borderTop: '1px solid var(--border-subtle)', margin: '12px 0 0' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.07em', fontFamily: 'DM Sans, sans-serif', marginTop: 14 }}>
              Associated Annual Expenses
            </div>
            <ExpenseSection
              label="Annual Property Tax"
              isPct
              pctOrAmount={data.propertyTaxPct}
              increment={data.propertyTaxIncrement}
              onPctChange={up('propertyTaxPct')}
              onIncrChange={up('propertyTaxIncrement')}
            />
            <ExpenseSection
              label="Annual Society Maintenance"
              isPct={false}
              pctOrAmount={data.societyMaintenance}
              increment={data.societyMaintenanceIncrement}
              onAmtChange={up('societyMaintenance')}
              onIncrChange={up('societyMaintenanceIncrement')}
            />
            <ExpenseSection
              label="House Maintenance"
              isPct={false}
              pctOrAmount={data.houseMaintenance}
              increment={data.houseMaintenanceIncrement}
              onAmtChange={up('houseMaintenance')}
              onIncrChange={up('houseMaintenanceIncrement')}
            />
          </div>
        </Card>

        {/* ── Col 2: Renting Scenario ── */}
        <Card>
          <h3 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'DM Sans, sans-serif' }}>
            Renting Scenario
          </h3>

          <InputField label="Monthly Rent" prefix="₹" value={data.monthlyRent} onChange={up('monthlyRent')} min={0} tooltip="Current monthly rent you are paying or would pay" />
          <InputField label="Annual Rent Increase" suffix="% p.a." value={data.rentIncrease} onChange={up('rentIncrease')} min={0} max={20} step={0.5} tooltip="Expected annual increase in rent" />
          <InputField label="Deposit & Brokerage" prefix="₹" value={data.depositBrokerage} onChange={up('depositBrokerage')} min={0} tooltip="Security deposit + brokerage paid upfront when renting" />
          <InputField label="Investment Return" suffix="% p.a." value={data.investmentReturn} onChange={up('investmentReturn')} min={0} max={30} step={0.5} tooltip="Expected annual return on investments (e.g., mutual funds, index funds)" />
          <InputField label="Analysis Period" suffix="yrs" value={data.analysisPeriod} onChange={up('analysisPeriod')} min={1} max={50} tooltip="Number of years to compare buying vs renting" />

          {/* Key figures preview */}
          <div style={{ marginTop: 8, padding: '14px 16px', background: 'var(--bg-raised)', borderRadius: 10, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
              <div>
                <div style={{ fontSize: 11, color: 'var(--text-secondary)', fontFamily: 'DM Sans, sans-serif', marginBottom: 3, display: 'flex', alignItems: 'center', gap: 4 }}>
                  Monthly EMI (if buying)
                  <Tooltip text="P x r x (1+r)^n / ((1+r)^n - 1) where P=loan, r=monthly rate, n=months" />
                </div>
                <div style={{ fontFamily: 'DM Mono, monospace', fontSize: 18, fontWeight: 700, color: 'var(--accent-primary)', fontVariantNumeric: 'tabular-nums' }}>{formatFull(r.emi)}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 11, color: 'var(--text-secondary)', fontFamily: 'DM Sans, sans-serif', marginBottom: 3, display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'flex-end' }}>
                  Down Payment
                  <Tooltip text="Property Price x Down Payment %" />
                </div>
                <div style={{ fontFamily: 'DM Mono, monospace', fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', fontVariantNumeric: 'tabular-nums' }}>{formatFull(r.downPayment)}</div>
              </div>
            </div>
            <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: 10 }}>
              <div style={{ fontSize: 11, color: 'var(--text-secondary)', fontFamily: 'DM Sans, sans-serif', marginBottom: 3, display: 'flex', alignItems: 'center', gap: 4 }}>
                Monthly SIP = EMI - Rent
                <Tooltip text="If renting, this surplus is invested monthly at Investment Return %. Stops when rent exceeds EMI." />
              </div>
              <div style={{ fontFamily: 'DM Mono, monospace', fontSize: 14, fontWeight: 600, color: 'var(--accent-secondary)', fontVariantNumeric: 'tabular-nums' }}>
                {formatFull(Math.max(0, r.emi - data.monthlyRent))}
              </div>
            </div>
            <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: 10 }}>
              <div style={{ fontSize: 11, color: 'var(--text-secondary)', fontFamily: 'DM Sans, sans-serif', marginBottom: 3, display: 'flex', alignItems: 'center', gap: 4 }}>
                Lumpsum = Down Payment - Deposit
                <Tooltip text="Down Payment saved minus Deposit & Brokerage paid, invested as lumpsum at Investment Return %" />
              </div>
              <div style={{ fontFamily: 'DM Mono, monospace', fontSize: 14, fontWeight: 600, color: 'var(--accent-secondary)', fontVariantNumeric: 'tabular-nums' }}>
                {formatFull(r.lumpsum)}
              </div>
            </div>
          </div>
        </Card>

        {/* ── Col 3: All results ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Associated Expenses breakdown */}
          <Card>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'DM Sans, sans-serif', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>
              Associated Expenses (Buying)
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={TH}>Expense</th>
                    <th style={{ ...TH, textAlign: 'right' }}>Year 1</th>
                    <th style={{ ...TH, textAlign: 'center' }}>Incr%</th>
                    <th style={{ ...TH, textAlign: 'right' }}>Total ({data.analysisPeriod}y)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={TD}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                        Property Tax
                        <Tooltip text={`${data.propertyTaxPct}% of property value in Year 1, growing ${data.propertyTaxIncrement}% p.a.`} />
                      </span>
                    </td>
                    <td style={TDr}>{formatFull(r.annualPropertyTaxY1)}</td>
                    <td style={TDc}>{data.propertyTaxIncrement}%</td>
                    <td style={TDr}>{formatFull(r.totalPropertyTax)}</td>
                  </tr>
                  <tr>
                    <td style={TD}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                        Society Maint.
                        <Tooltip text={`Annual society maintenance, growing ${data.societyMaintenanceIncrement}% p.a.`} />
                      </span>
                    </td>
                    <td style={TDr}>{formatFull(data.societyMaintenance)}</td>
                    <td style={TDc}>{data.societyMaintenanceIncrement}%</td>
                    <td style={TDr}>{formatFull(r.totalSocietyMaint)}</td>
                  </tr>
                  <tr>
                    <td style={TD}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                        House Maint.
                        <Tooltip text={`Annual house maintenance, growing ${data.houseMaintenanceIncrement}% p.a.`} />
                      </span>
                    </td>
                    <td style={TDr}>{formatFull(data.houseMaintenance)}</td>
                    <td style={TDc}>{data.houseMaintenanceIncrement}%</td>
                    <td style={TDr}>{formatFull(r.totalHouseMaint)}</td>
                  </tr>
                  <tr>
                    <td style={TDb}>Total</td>
                    <td style={TDr}></td>
                    <td style={TDc}></td>
                    <td style={{ ...TDrb, color: 'var(--accent-warning)' }}>{formatFull(r.totalAssociatedExpenses)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Card>

          {/* Net Gain from Buying */}
          <ResultTable
            title="Net Gain from Buying"
            accentColor="var(--accent-primary)"
            rows={[
              { label: 'Down Payment', value: r.downPayment, tooltip: 'Property Price x Down Payment %' },
              { label: 'Loan Repayment', value: r.totalLoanRepayment, tooltip: `EMI x ${data.loanTenure} yrs x 12 months — total paid to bank` },
              { label: 'Associated Expenses', value: r.totalAssociatedExpenses, tooltip: 'Sum of property tax, society & house maintenance over the analysis period' },
              { label: 'Total Cost of House', value: r.totalCostOfHouse, bold: true, tooltip: 'Down Payment + Loan Repayment + Associated Expenses' },
              { label: `Value after ${r.analysisPeriod} yrs`, value: r.propertyValueAtEnd, tooltip: `Property Price x (1 + ${data.propertyAppreciation}%)^${r.analysisPeriod} years` },
              { label: 'NET GAIN', value: r.buyingNetGain, bold: true, color: r.buyingNetGain >= 0 ? 'var(--accent-primary)' : 'var(--accent-danger)', tooltip: 'Property Value at End - Total Cost of House' },
              { label: 'GAIN %', value: `${r.buyingGainPct}%`, bold: true, tooltip: 'NET GAIN / Total Cost x 100' },
            ]}
          />

          {/* Net Gain from Renting */}
          <ResultTable
            title="Net Gain from Renting"
            accentColor="var(--accent-secondary)"
            rows={[
              { label: 'Total Rent Paid', value: r.totalRentPaid, tooltip: `Monthly rent x 12, growing at ${data.rentIncrease}% p.a., summed over ${r.analysisPeriod} years` },
              { label: 'FV of SIP', value: r.sipCorpus, tooltip: `Monthly surplus (EMI - Rent) invested monthly at ${data.investmentReturn}% p.a., compounded monthly. Stops when rent exceeds EMI.` },
              { label: 'FV of Lumpsum', value: r.lumpsumFV, tooltip: `Down Payment - Deposit (= ${formatFull(r.lumpsum)}) invested at ${data.investmentReturn}% for ${r.analysisPeriod} yrs` },
              { label: 'Total Investments', value: r.totalInvestments, bold: true, tooltip: 'FV of SIP + FV of Lumpsum' },
              { label: 'NET GAIN', value: r.rentingNetGain, bold: true, color: r.rentingNetGain >= 0 ? 'var(--accent-secondary)' : 'var(--accent-danger)', tooltip: 'Total Investments - Total Rent Paid' },
            ]}
          />

          {/* Verdict */}
          <Card style={{ textAlign: 'center', background: verdictBg, border: `1px solid ${verdictBorder}` }}>
            <div style={{ fontSize: 11, color: 'var(--text-secondary)', fontFamily: 'DM Sans, sans-serif', marginBottom: 6 }}>
              Better financial choice over {r.analysisPeriod} years
            </div>
            <div style={{ fontFamily: 'DM Mono, monospace', fontSize: 44, fontWeight: 800, color: verdictColor, lineHeight: 1 }}>
              {r.recommendation}
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', fontFamily: 'DM Sans, sans-serif', marginTop: 8 }}>
              {isBuy ? 'Buying' : 'Renting'} yields a higher net gain
            </div>
          </Card>

        </div>
      </div>

    </div>
  );
}
