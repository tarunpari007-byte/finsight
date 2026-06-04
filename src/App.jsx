import { useState, useMemo, useCallback, useEffect } from 'react';
import TopBar from './components/TopBar';
import PillNav from './components/PillNav';
import Footer from './components/Footer';
import Dashboard from './sections/Dashboard';
import GoalPlanner from './sections/GoalPlanner';
import Calculators from './sections/Calculators';
import FIRECalculator from './sections/FIRE';
import Insurance from './sections/Insurance';
import EmergencyFund from './sections/EmergencyFund';
import BuyVsRent from './sections/BuyVsRent';
import { calcDashboardScores } from './utils/calculations';
import {
  DEFAULT_GOALS, DEFAULT_SIP, DEFAULT_SWP, DEFAULT_EMI,
  DEFAULT_FIRE, DEFAULT_INSURANCE, DEFAULT_EMERGENCY, DEFAULT_BUY_VS_RENT,
} from './data/defaults';

const SECTION_TITLES = {
  dashboard: 'Home',
  goals: 'Goals',
  calculators: 'Calculators',
  fire: 'FIRE',
  insurance: 'Insurance',
  emergency: 'Emergency Fund',
  buyVsRent: 'Buy vs Rent',
};

export default function App() {
  const [theme, setTheme] = useState('dark');
  const [activeSection, setActiveSection] = useState('dashboard');

  // Track which sections the user has actually filled in
  const [filledSections, setFilledSections] = useState(new Set());

  const [goals, setGoals] = useState(DEFAULT_GOALS);
  const [sipData, setSipData] = useState(DEFAULT_SIP);
  const [swpData, setSwpData] = useState(DEFAULT_SWP);
  const [emiData, setEmiData] = useState(DEFAULT_EMI);
  const [emiMonthly, setEmiMonthly] = useState(0);
  const [fireData, setFireData] = useState(DEFAULT_FIRE);
  const [lifeData, setLifeData] = useState(DEFAULT_INSURANCE.life);
  const [healthData, setHealthData] = useState(DEFAULT_INSURANCE.health);
  const [efData, setEfData] = useState(DEFAULT_EMERGENCY);
  const [buyVsRentData, setBuyVsRentData] = useState(DEFAULT_BUY_VS_RENT);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme(t => t === 'dark' ? 'light' : 'dark');
  }, []);

  const markFilled = useCallback((section) => {
    setFilledSections(prev => new Set([...prev, section]));
  }, []);

  const hasRealData = filledSections.size > 0;

  const dashboardScores = useMemo(() => {
    if (!hasRealData) return null;
    return calcDashboardScores({
      goals,
      fire: fireData,
      insurance: { life: lifeData, health: healthData },
      emergencyFund: efData,
      emiData: { monthlyIncome: lifeData.annualIncome / 12, emi: emiMonthly },
    });
  }, [hasRealData, goals, fireData, lifeData, healthData, efData, emiMonthly]);

  const handleNavigate = useCallback((section) => {
    setActiveSection(section);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleEMIChange = useCallback((emi) => {
    setEmiMonthly(emi);
  }, []);

  const renderSection = () => {
    switch (activeSection) {
      case 'dashboard':
        return (
          <Dashboard
            scores={dashboardScores}
            filledSections={filledSections}
            onNavigate={handleNavigate}
          />
        );
      case 'goals':
        return (
          <GoalPlanner
            goals={goals}
            setGoals={(u) => { setGoals(u); markFilled('goals'); }}
          />
        );
      case 'calculators':
        return (
          <Calculators
            sipData={sipData} setSipData={setSipData}
            swpData={swpData} setSwpData={setSwpData}
            emiData={emiData} setEmiData={setEmiData}
            onEMIChange={handleEMIChange}
          />
        );
      case 'fire':
        return (
          <FIRECalculator
            fireData={fireData}
            setFireData={(u) => { setFireData(u); markFilled('fire'); }}
          />
        );
      case 'insurance':
        return (
          <Insurance
            lifeData={lifeData}
            setLifeData={(u) => { setLifeData(u); markFilled('insurance'); }}
            healthData={healthData}
            setHealthData={(u) => { setHealthData(u); markFilled('insurance'); }}
          />
        );
      case 'emergency':
        return (
          <EmergencyFund
            efData={efData}
            setEfData={(u) => { setEfData(u); markFilled('emergency'); }}
          />
        );
      case 'buyVsRent':
        return (
          <BuyVsRent
            data={buyVsRentData}
            setData={(u) => { setBuyVsRentData(u); markFilled('buyVsRent'); }}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)' }}>
      <TopBar theme={theme} onThemeToggle={toggleTheme} />
      <PillNav activeSection={activeSection} onNavigate={handleNavigate} />

      <main style={{
        maxWidth: 1100,
        margin: '0 auto',
        padding: '80px 24px 100px',
        boxSizing: 'border-box',
      }}>
        {activeSection !== 'dashboard' && (
          <div style={{ marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              onClick={() => handleNavigate('dashboard')}
              style={{
                background: 'none', border: 'none', padding: 0,
                fontSize: 13, color: 'var(--text-secondary)',
                cursor: 'pointer', fontFamily: 'DM Sans, sans-serif',
                transition: 'color 0.15s',
              }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}
            >
              Home
            </button>
            <span style={{ color: 'var(--border-subtle)', fontSize: 13 }}>/</span>
            <span style={{ fontSize: 13, color: 'var(--text-primary)', fontFamily: 'DM Sans, sans-serif' }}>
              {SECTION_TITLES[activeSection]}
            </span>
          </div>
        )}

        {renderSection()}
      </main>

      <Footer />
    </div>
  );
}
