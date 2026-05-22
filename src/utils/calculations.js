// ─── Formatting ─────────────────────────────────────────────────────────────

// For input field display: formats raw number as Indian comma-separated string
// e.g. 100000 → "1,00,000", 10000000 → "1,00,00,000"
export function formatWithIndianCommas(num) {
  if (num === null || num === undefined) return '';
  if (num === 0) return '0';
  const n = Math.floor(Math.abs(Number(num)));
  const str = n.toString();
  if (str.length <= 3) return str;
  const lastThree = str.slice(-3);
  const remaining = str.slice(0, -3);
  return remaining.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + ',' + lastThree;
}

export function formatIndianNumber(num) {
  if (!num && num !== 0) return '0';
  const n = Math.round(num);
  if (n >= 1_00_00_000) return `₹${(n / 1_00_00_000).toFixed(2)}Cr`;
  if (n >= 1_00_000) return `₹${(n / 1_00_000).toFixed(2)}L`;
  return `₹${n.toLocaleString('en-IN')}`;
}

export function formatFull(num) {
  if (!num && num !== 0) return '₹0';
  return `₹${Math.round(num).toLocaleString('en-IN')}`;
}

// ─── Goal Planner ────────────────────────────────────────────────────────────

export function calcInflationAdjusted(target, inflation, years) {
  return target * Math.pow(1 + inflation / 100, years);
}

export function calcMonthlySIP(remainingCorpus, annualReturn, months) {
  if (months <= 0 || remainingCorpus <= 0) return 0;
  const mr = annualReturn / 12 / 100;
  if (mr === 0) return remainingCorpus / months;
  return (remainingCorpus * mr) / (Math.pow(1 + mr, months) - 1);
}

export function calcGoalOutputs(goal, currentYear) {
  const years = goal.targetYear - currentYear;
  if (years <= 0) return null;
  const months = years * 12;
  const inflated = calcInflationAdjusted(goal.targetAmount, goal.inflation, years);
  const currentCorpusGrown = (goal.currentCorpus || 0) * Math.pow(1 + goal.expectedReturn / 100, years);
  const remaining = Math.max(0, inflated - currentCorpusGrown);
  const sip = calcMonthlySIP(remaining, goal.expectedReturn, months);
  const progress = inflated > 0 ? Math.min(100, ((goal.currentCorpus || 0) / inflated) * 100) : 0;
  return { inflated, remaining, sip, progress, years };
}

// ─── SIP / Compound Calculator ───────────────────────────────────────────────

export function calcLumpSumFV(principal, annualRate, years) {
  return principal * Math.pow(1 + annualRate / 100, years);
}

export function calcSIPFV(monthly, annualRate, years) {
  const months = years * 12;
  const mr = annualRate / 12 / 100;
  if (mr === 0) return monthly * months;
  return monthly * ((Math.pow(1 + mr, months) - 1) / mr) * (1 + mr);
}

export function calcStepUpSIPFV(monthlySIP, annualRate, years, stepUpPct) {
  let fv = 0;
  let currentSIP = monthlySIP;
  const mr = annualRate / 12 / 100;
  for (let y = 1; y <= years; y++) {
    const months = years - y + 1;
    const yearFV = currentSIP * ((Math.pow(1 + mr, months * 12) - 1) / mr) * (1 + mr);
    fv += yearFV - (y > 1 ? currentSIP / (1 + stepUpPct / 100) * ((Math.pow(1 + mr, (months + 1) * 12 - (months) * 12) - 1) / mr) * (1 + mr) : 0);
    currentSIP *= (1 + stepUpPct / 100);
  }
  // Simpler year-by-year approach
  fv = 0;
  currentSIP = monthlySIP;
  for (let y = 0; y < years; y++) {
    const remainingMonths = (years - y) * 12;
    const yearSIPFV = currentSIP * ((Math.pow(1 + mr, remainingMonths) - 1) / mr) * (1 + mr);
    fv += yearSIPFV;
    currentSIP *= (1 + stepUpPct / 100);
  }
  return fv;
}

export function calcSIPYearlyData(lumpSum, monthlySIP, annualRate, years, stepUp, stepUpPct) {
  const data = [];
  const mr = annualRate / 12 / 100;
  let totalInvested = lumpSum;
  let lumpFV = lumpSum;
  let sipFV = 0;
  let currentSIP = monthlySIP;

  for (let y = 1; y <= years; y++) {
    lumpFV = lumpFV * Math.pow(1 + mr, 12);
    for (let m = 0; m < 12; m++) {
      sipFV = (sipFV + currentSIP) * (1 + mr);
    }
    totalInvested += currentSIP * 12;
    data.push({
      year: y,
      invested: Math.round(totalInvested),
      corpus: Math.round(lumpFV + sipFV),
    });
    if (stepUp) currentSIP *= (1 + stepUpPct / 100);
  }
  return data;
}

// ─── SWP Calculator ──────────────────────────────────────────────────────────

export function calcSWPModeA(corpus, annualWithdrawal, annualReturn, tenure) {
  const r = annualReturn / 100;
  const rows = [];
  let balance = corpus;
  let depleted = false;
  let depletionYear = null;
  for (let y = 1; y <= tenure; y++) {
    const opening = balance;
    const interest = opening * r;
    const closing = opening + interest - annualWithdrawal;
    rows.push({
      year: y,
      opening: Math.round(opening),
      withdrawal: Math.round(annualWithdrawal),
      interest: Math.round(interest),
      closing: Math.round(Math.max(0, closing)),
    });
    if (!depleted && closing <= 0) {
      depleted = true;
      depletionYear = y;
      balance = 0;
    } else {
      balance = Math.max(0, closing);
    }
  }
  return { rows, finalBalance: Math.round(balance), depleted, depletionYear };
}

export function calcSWPModeB(corpus, annualReturn, tenure) {
  const r = annualReturn / 100;
  if (r === 0) return { annualWithdrawal: corpus / tenure, monthlyWithdrawal: corpus / tenure / 12 };
  const annualWithdrawal = corpus * r / (1 - Math.pow(1 + r, -tenure));
  return { annualWithdrawal, monthlyWithdrawal: annualWithdrawal / 12 };
}

// ─── EMI Calculator ──────────────────────────────────────────────────────────

export function calcEMI(principal, annualRate, totalMonths) {
  const mr = annualRate / 12 / 100;
  if (mr === 0) return principal / totalMonths;
  return principal * mr * Math.pow(1 + mr, totalMonths) / (Math.pow(1 + mr, totalMonths) - 1);
}

export function calcAmortization(principal, annualRate, totalMonths) {
  const mr = annualRate / 12 / 100;
  const emi = calcEMI(principal, annualRate, totalMonths);
  const rows = [];
  let balance = principal;
  let cumulativeInterest = 0;
  for (let m = 1; m <= totalMonths; m++) {
    const interestPaid = balance * mr;
    const principalPaid = emi - interestPaid;
    const closing = balance - principalPaid;
    cumulativeInterest += interestPaid;
    rows.push({
      month: m,
      opening: Math.round(balance),
      emi: Math.round(emi),
      principalPaid: Math.round(principalPaid),
      interestPaid: Math.round(interestPaid),
      closing: Math.round(Math.max(0, closing)),
      cumulativeInterest: Math.round(cumulativeInterest),
    });
    balance = Math.max(0, closing);
  }
  return rows;
}

// ─── FIRE Calculator ─────────────────────────────────────────────────────────

export function calcFIRE(currentAge, retirementAge, monthlyExpenses, inflation, annualReturn, postReturnRate, currentSavings) {
  const yearsToRetirement = retirementAge - currentAge;
  if (yearsToRetirement <= 0) return null;
  const months = yearsToRetirement * 12;
  const mr = annualReturn / 12 / 100;
  const monthlyExpensesAtRetirement = monthlyExpenses * Math.pow(1 + inflation / 100, yearsToRetirement);
  const annualExpensesAtRetirement = monthlyExpensesAtRetirement * 12;
  const fireNumber = annualExpensesAtRetirement / (postReturnRate / 100);
  const savedGrown = currentSavings * Math.pow(1 + annualReturn / 100, yearsToRetirement);
  const remaining = Math.max(0, fireNumber - savedGrown);
  const sipNeeded = mr === 0 ? remaining / months : remaining * mr / (Math.pow(1 + mr, months) - 1);
  return {
    yearsToRetirement,
    monthlyExpensesAtRetirement,
    annualExpensesAtRetirement,
    fireNumber,
    savedGrown,
    remaining,
    sipNeeded,
  };
}

// ─── Insurance Calculator ────────────────────────────────────────────────────

export function calcLifeInsurance(annualIncome, currentAge, retirementAge, liabilities, existingAssets, existingCover) {
  const years = Math.max(0, retirementAge - currentAge);
  const recommended = (annualIncome * years) + liabilities - existingAssets;
  const gap = Math.max(0, recommended - existingCover);
  return { recommended: Math.max(0, recommended), existingCover, gap };
}

export function calcHealthInsurance(cityTier, adults, children, preExisting, existingCover) {
  const baseMap = { Metro: 10_00_000, 'Tier 2': 7_00_000, 'Tier 3': 5_00_000 };
  const base = baseMap[cityTier] || 10_00_000;
  const childBase = base * 0.5;
  const preAdd = preExisting ? 3_00_000 : 0;
  const recommended = adults * base + children * childBase + preAdd;
  const gap = Math.max(0, recommended - existingCover);
  return { recommended, existingCover, gap };
}

// ─── Emergency Fund ───────────────────────────────────────────────────────────

const EMP_MONTHS = {
  'Salaried — Stable': 3,
  'Salaried — Moderate risk': 6,
  'Self-employed': 9,
  'Freelancer / Consultant': 9,
};

export function calcEmergencyFund(monthlyExpenses, employmentType, dependents, currentFund) {
  let months = EMP_MONTHS[employmentType] || 6;
  if (dependents >= 2) months += 1;
  const recommended = monthlyExpenses * months;
  const gap = Math.max(0, recommended - currentFund);
  const pct = recommended > 0 ? Math.min(100, (currentFund / recommended) * 100) : 100;
  return { recommended, gap, pct, months };
}

// ─── Dashboard Scores ─────────────────────────────────────────────────────────

export function calcDashboardScores(appData) {
  const { goals, fire, insurance, emergencyFund, emiData } = appData;

  // Goal Planning
  let goalScore = 50;
  if (goals && goals.length > 0) {
    const currentYear = new Date().getFullYear();
    const totalSIPNeeded = goals.reduce((sum, g) => {
      const out = calcGoalOutputs(g, currentYear);
      return sum + (out ? out.sip : 0);
    }, 0);
    goalScore = totalSIPNeeded > 0 ? Math.min(100, 80 + (goals.length * 5)) : 60;
  }

  // Emergency Fund
  let efScore = 0;
  if (emergencyFund && emergencyFund.monthlyExpenses > 0) {
    const ef = calcEmergencyFund(
      emergencyFund.monthlyExpenses,
      emergencyFund.employmentType,
      emergencyFund.dependents,
      emergencyFund.currentFund
    );
    efScore = Math.min(100, ef.pct);
  }

  // Insurance
  let insScore = 0;
  if (insurance) {
    const life = insurance.life;
    const health = insurance.health;
    let lifeScore = 0, healthScore = 0;
    if (life && life.annualIncome > 0) {
      const lifeCalc = calcLifeInsurance(life.annualIncome, life.currentAge, life.retirementAge, life.liabilities, life.existingAssets, life.existingCover);
      lifeScore = lifeCalc.recommended > 0 ? Math.min(100, (life.existingCover / lifeCalc.recommended) * 100) : 100;
    }
    if (health && health.adults > 0) {
      const healthCalc = calcHealthInsurance(health.cityTier, health.adults, health.children, health.preExisting, health.existingCover);
      healthScore = healthCalc.recommended > 0 ? Math.min(100, (health.existingCover / healthCalc.recommended) * 100) : 0;
    }
    insScore = (lifeScore + healthScore) / 2;
  }

  // FIRE
  let fireScore = 0;
  if (fire && fire.currentAge && fire.retirementAge) {
    const f = calcFIRE(fire.currentAge, fire.retirementAge, fire.monthlyExpenses, fire.inflation, fire.annualReturn, fire.postReturnRate, fire.currentSavings);
    if (f) {
      fireScore = f.fireNumber > 0 ? Math.min(100, (fire.currentSavings / f.fireNumber) * 100 * 3) : 0;
    }
  }

  // Debt Load
  let debtScore = 70;
  if (emiData && emiData.monthlyIncome > 0 && emiData.emi > 0) {
    const ratio = emiData.emi / emiData.monthlyIncome;
    debtScore = Math.max(0, 100 - ratio * 250);
  }

  // Wealth Growth
  let wealthScore = 50;
  if (goals && goals.length > 0) {
    const currentYear = new Date().getFullYear();
    const totalSIP = goals.reduce((s, g) => {
      const o = calcGoalOutputs(g, currentYear);
      return s + (o ? o.sip : 0);
    }, 0);
    wealthScore = totalSIP > 0 ? Math.min(100, 65 + goals.length * 5) : 40;
  }

  return {
    goalPlanning: Math.round(goalScore),
    emergencyFund: Math.round(efScore),
    insurance: Math.round(insScore),
    fireReadiness: Math.round(fireScore),
    debtLoad: Math.round(debtScore),
    wealthGrowth: Math.round(wealthScore),
  };
}
