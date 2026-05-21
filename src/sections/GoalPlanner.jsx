import { useState } from 'react';
import { Trash2, Plus } from 'lucide-react';
import Card from '../components/Card';
import Tooltip from '../components/Tooltip';
import { calcGoalOutputs, formatIndianNumber } from '../utils/calculations';
import { DEFAULT_GOALS, GOAL_TYPES, CURRENT_YEAR } from '../data/defaults';

// Compact inline label style — proper case, smaller, no uppercase
const labelStyle = {
  display: 'flex', alignItems: 'center',
  fontSize: 11, fontWeight: 500,
  color: 'var(--text-secondary)',
  marginBottom: 5,
  fontFamily: 'DM Sans, sans-serif',
  whiteSpace: 'nowrap',
};

const inputStyle = {
  width: '100%',
  background: 'var(--bg-raised)',
  border: 'none',
  borderBottom: '2px solid transparent',
  borderRadius: 8,
  padding: '9px 10px',
  color: 'var(--text-primary)',
  fontSize: 13,
  fontFamily: 'DM Mono, monospace',
  outline: 'none',
  transition: 'border-bottom-color 0.2s',
  boxSizing: 'border-box',
};

function GoalInput({ label, tooltip, value, onChange, prefix, suffix, min, max, step }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <label style={labelStyle}>
        {label}
        {tooltip && <Tooltip text={tooltip} />}
      </label>
      <div style={{ position: 'relative' }}>
        {prefix && (
          <span style={{
            position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)',
            color: 'var(--text-secondary)', fontSize: 12,
            fontFamily: 'DM Mono, monospace', pointerEvents: 'none',
          }}>{prefix}</span>
        )}
        <input
          type="number"
          value={value}
          onChange={e => onChange(Number(e.target.value))}
          min={min} max={max} step={step || 1}
          style={{
            ...inputStyle,
            paddingLeft: prefix ? 22 : 10,
            paddingRight: suffix ? 28 : 10,
          }}
          onFocus={e => { e.target.style.borderBottomColor = 'var(--accent-primary)'; }}
          onBlur={e => { e.target.style.borderBottomColor = 'transparent'; }}
        />
        {suffix && (
          <span style={{
            position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
            color: 'var(--text-secondary)', fontSize: 11,
            fontFamily: 'DM Sans, sans-serif', pointerEvents: 'none',
          }}>{suffix}</span>
        )}
      </div>
    </div>
  );
}

function ProgressRing({ pct, size = 52 }) {
  const r = (size - 8) / 2;
  const circ = 2 * Math.PI * r;
  const filled = (pct / 100) * circ;
  const tooltipText = `${Math.round(pct)}% of the inflation-adjusted target is already covered by your current corpus.`;
  return (
    <div className="tooltip-container" style={{ flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)', display: 'block' }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none"
          stroke="var(--bg-raised)" strokeWidth={4} />
        <circle cx={size/2} cy={size/2} r={r} fill="none"
          stroke="var(--accent-primary)" strokeWidth={4}
          strokeDasharray={`${filled} ${circ}`}
          strokeLinecap="round"
          style={{ transition: 'stroke-dasharray 0.4s ease' }}
        />
        <text x={size/2} y={size/2 + 1}
          textAnchor="middle" dominantBaseline="middle"
          fill="var(--text-primary)" fontSize={9} fontWeight={600}
          transform={`rotate(90, ${size/2}, ${size/2})`}
          fontFamily="DM Mono, monospace"
        >
          {Math.round(pct)}%
        </text>
      </svg>
      <span className="tooltip-text" style={{ width: 130 }}>{tooltipText}</span>
    </div>
  );
}

function GoalCard({ goal, onUpdate, onDelete, currentYear }) {
  const outputs = calcGoalOutputs(goal, currentYear);

  return (
    <Card style={{ marginBottom: 16 }}>
      {/* Card header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 22 }}>{goal.emoji}</span>
          <div>
            <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'DM Sans, sans-serif' }}>
              {goal.type}
            </div>
            {outputs && (
              <div style={{ fontSize: 11, color: 'var(--text-secondary)', fontFamily: 'DM Sans, sans-serif' }}>
                {outputs.years} years away
              </div>
            )}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {outputs && <ProgressRing pct={outputs.progress} />}
          <button
            onClick={() => onDelete(goal.id)}
            style={{
              background: 'rgba(224,92,107,0.1)', border: '1px solid rgba(224,92,107,0.2)',
              borderRadius: 8, cursor: 'pointer', color: 'var(--accent-danger)',
              padding: '6px 7px', display: 'flex', alignItems: 'center',
              transition: 'background 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(224,92,107,0.2)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(224,92,107,0.1)'}
            title="Delete goal"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* Input grid — 3 cols on desktop, collapses on mobile */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
        gap: '0 12px',
      }}>
        <GoalInput
          label="Target Amount"
          tooltip="Today's value. Inflation-adjusted amount is calculated automatically."
          prefix="₹"
          value={goal.targetAmount}
          onChange={v => onUpdate(goal.id, { targetAmount: v })}
          min={0}
        />

        <GoalInput
          label="Target Year"
          value={goal.targetYear}
          onChange={v => onUpdate(goal.id, { targetYear: v, _fromYear: true })}
          min={currentYear + 1}
          max={currentYear + 80}
        />

        <GoalInput
          label="Years from Now"
          value={goal.targetYear - currentYear}
          onChange={v => onUpdate(goal.id, { targetYear: currentYear + Math.max(1, v) })}
          min={1}
          max={80}
        />

        <GoalInput
          label="Inflation"
          value={goal.inflation}
          onChange={v => onUpdate(goal.id, { inflation: v })}
          min={0} max={30} step={0.5}
          suffix="%"
        />

        <GoalInput
          label="Expected Return"
          value={goal.expectedReturn}
          onChange={v => onUpdate(goal.id, { expectedReturn: v })}
          min={0} max={40} step={0.5}
          suffix="%"
        />

        <GoalInput
          label="Current Corpus"
          prefix="₹"
          value={goal.currentCorpus}
          onChange={v => onUpdate(goal.id, { currentCorpus: v })}
          min={0}
        />
      </div>

      {/* Output strip */}
      {outputs && (
        <div style={{
          marginTop: 14,
          padding: '12px 16px',
          background: 'var(--bg-raised)',
          borderRadius: 10,
          display: 'flex',
          flexWrap: 'wrap',
          gap: 20,
        }}>
          <div>
            <div style={{ fontSize: 11, color: 'var(--text-secondary)', fontFamily: 'DM Sans, sans-serif', marginBottom: 2 }}>
              Inflation-Adjusted Target
            </div>
            <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'DM Mono, monospace', fontVariantNumeric: 'tabular-nums' }}>
              {formatIndianNumber(outputs.inflated)}
            </div>
            <div style={{ fontSize: 10, color: 'var(--text-secondary)', fontFamily: 'DM Sans, sans-serif' }}>
              in {outputs.years} yrs · {goal.inflation}% inflation
            </div>
          </div>
          <div>
            <div style={{ fontSize: 11, color: 'var(--text-secondary)', fontFamily: 'DM Sans, sans-serif', marginBottom: 2 }}>
              Monthly SIP Needed
            </div>
            <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--accent-primary)', fontFamily: 'DM Mono, monospace', fontVariantNumeric: 'tabular-nums' }}>
              {formatIndianNumber(outputs.sip)}
            </div>
            <div style={{ fontSize: 10, color: 'var(--text-secondary)', fontFamily: 'DM Sans, sans-serif' }}>
              /month · {goal.expectedReturn}% p.a.
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}

export default function GoalPlanner({ goals, setGoals }) {
  const currentYear = CURRENT_YEAR;
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedType, setSelectedType] = useState('');
  const [customName, setCustomName] = useState('');

  const usedTypes = goals.filter(g => g.type !== 'Other').map(g => g.type);
  const availableTypes = GOAL_TYPES.filter(gt => gt.type === 'Other' || !usedTypes.includes(gt.type));

  function addGoal() {
    if (!selectedType) return;
    const typeObj = GOAL_TYPES.find(g => g.type === selectedType);
    const name = selectedType === 'Other' ? (customName || 'Other Goal') : selectedType;
    setGoals(prev => [...prev, {
      id: Date.now(),
      type: name,
      emoji: typeObj?.emoji || '📦',
      targetAmount: 1000000,
      targetYear: currentYear + 10,
      inflation: 6,
      expectedReturn: 12,
      currentCorpus: 0,
    }]);
    setShowAddModal(false);
    setSelectedType('');
    setCustomName('');
  }

  function updateGoal(id, updates) {
    setGoals(prev => prev.map(g => g.id === id ? { ...g, ...updates } : g));
  }

  function deleteGoal(id) {
    setGoals(prev => prev.filter(g => g.id !== id));
  }

  const totalSIP = goals.reduce((sum, g) => {
    const out = calcGoalOutputs(g, currentYear);
    return sum + (out ? out.sip : 0);
  }, 0);

  return (
    <div className="section-enter">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'DM Sans, sans-serif' }}>
            Goal Planner
          </h2>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--text-secondary)', fontFamily: 'DM Sans, sans-serif' }}>
            Plan your financial goals and calculate the SIP needed
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: 'var(--accent-primary)', color: '#0D1117',
            border: 'none', borderRadius: 10, padding: '10px 18px',
            fontSize: 13, fontWeight: 600, cursor: 'pointer',
            fontFamily: 'DM Sans, sans-serif',
          }}
        >
          <Plus size={15} />
          Add a Goal
        </button>
      </div>

      {/* Add Goal Modal — anchored to top of viewport */}
      {showAddModal && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 200,
            background: 'rgba(0,0,0,0.6)',
            display: 'flex',
            alignItems: 'flex-start',      // anchor to top
            justifyContent: 'center',
            padding: '72px 16px 16px',     // 72px = nav height + gap
            overflowY: 'auto',
          }}
          onClick={e => { if (e.target === e.currentTarget) setShowAddModal(false); }}
        >
          <div style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 16, padding: 28,
            width: '100%', maxWidth: 420,
            boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
          }}>
            <h3 style={{ margin: '0 0 20px', fontSize: 17, fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'DM Sans, sans-serif' }}>
              Add a New Goal
            </h3>

            <label style={{ fontSize: 11, fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>
              Goal Type
            </label>
            <select
              value={selectedType}
              onChange={e => setSelectedType(e.target.value)}
              style={{
                width: '100%', padding: '10px 12px',
                background: 'var(--bg-raised)', border: 'none', borderRadius: 8,
                color: 'var(--text-primary)', fontSize: 14,
                fontFamily: 'DM Sans, sans-serif', marginBottom: 16, outline: 'none',
                cursor: 'pointer',
              }}
            >
              <option value="">Select goal type...</option>
              {availableTypes.map(gt => (
                <option key={gt.type} value={gt.type}>{gt.emoji} {gt.type}</option>
              ))}
            </select>

            {selectedType === 'Other' && (
              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 11, fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>
                  Goal Name
                </label>
                <input
                  value={customName}
                  onChange={e => setCustomName(e.target.value)}
                  placeholder="e.g. New Car, Vacation..."
                  style={{
                    width: '100%', padding: '10px 12px',
                    background: 'var(--bg-raised)', border: 'none', borderRadius: 8,
                    color: 'var(--text-primary)', fontSize: 14,
                    fontFamily: 'DM Sans, sans-serif', outline: 'none', boxSizing: 'border-box',
                  }}
                />
              </div>
            )}

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button
                onClick={() => { setShowAddModal(false); setSelectedType(''); setCustomName(''); }}
                style={{
                  padding: '9px 18px', borderRadius: 8,
                  border: '1px solid var(--border-subtle)',
                  background: 'transparent', color: 'var(--text-secondary)',
                  fontSize: 13, fontWeight: 500, cursor: 'pointer',
                  fontFamily: 'DM Sans, sans-serif',
                }}
              >
                Cancel
              </button>
              <button
                onClick={addGoal}
                disabled={!selectedType}
                style={{
                  padding: '9px 18px', borderRadius: 8,
                  background: selectedType ? 'var(--accent-primary)' : 'var(--bg-raised)',
                  border: 'none', color: selectedType ? '#0D1117' : 'var(--text-secondary)',
                  fontSize: 13, fontWeight: 600, cursor: selectedType ? 'pointer' : 'default',
                  fontFamily: 'DM Sans, sans-serif',
                }}
              >
                Add Goal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Goal cards */}
      {goals.length === 0 ? (
        <Card style={{ textAlign: 'center', padding: 48 }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🎯</div>
          <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'DM Sans, sans-serif', marginBottom: 6 }}>
            No goals yet
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)', fontFamily: 'DM Sans, sans-serif', marginBottom: 20 }}>
            Add your financial goals to calculate the SIP needed to achieve them.
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            style={{
              background: 'var(--accent-primary)', color: '#0D1117',
              border: 'none', borderRadius: 10, padding: '10px 24px',
              fontSize: 13, fontWeight: 600, cursor: 'pointer',
              fontFamily: 'DM Sans, sans-serif',
            }}
          >
            + Add your first goal
          </button>
        </Card>
      ) : (
        <>
          {goals.map(goal => (
            <GoalCard
              key={goal.id}
              goal={goal}
              onUpdate={updateGoal}
              onDelete={deleteGoal}
              currentYear={currentYear}
            />
          ))}

          {/* Total SIP summary */}
          <Card style={{
            background: 'rgba(52,201,125,0.08)',
            border: '1px solid rgba(52,201,125,0.25)',
            marginTop: 8,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'DM Sans, sans-serif' }}>
                  Total Monthly SIP Needed
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)', fontFamily: 'DM Sans, sans-serif', marginTop: 2 }}>
                  Across all {goals.length} active goal{goals.length > 1 ? 's' : ''}
                </div>
              </div>
              <div style={{
                fontFamily: 'DM Mono, monospace', fontSize: 32, fontWeight: 800,
                color: 'var(--accent-primary)', fontVariantNumeric: 'tabular-nums',
              }}>
                {formatIndianNumber(totalSIP)}
                <span style={{ fontSize: 14, fontWeight: 400, color: 'var(--text-secondary)' }}>/mo</span>
              </div>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}
