export const CURRENT_YEAR = new Date().getFullYear();

export const DUMMY_PILLAR_SCORES = {
  goalPlanning: 82,
  emergencyFund: 54,
  insurance: 31,
  fireReadiness: 71,
  debtLoad: 60,
  wealthGrowth: 78,
};

export const DUMMY_PILLARS = [
  {
    key: 'goalPlanning',
    label: 'Goal Planning',
    score: 82,
    status: '3 goals set · On track',
    section: 'goals',
    icon: '🎯',
  },
  {
    key: 'emergencyFund',
    label: 'Emergency Fund',
    score: 54,
    status: '2.1 months covered · Need 6',
    section: 'emergency',
    icon: '🚨',
  },
  {
    key: 'insurance',
    label: 'Insurance Coverage',
    score: 31,
    status: 'Significant gap detected',
    section: 'insurance',
    icon: '🛡️',
  },
  {
    key: 'fireReadiness',
    label: 'FIRE Readiness',
    score: 71,
    status: 'On track for age 55',
    section: 'fire',
    icon: '🔥',
  },
  {
    key: 'debtLoad',
    label: 'Debt Load',
    score: 60,
    status: 'EMI is 28% of income',
    section: 'calculators',
    icon: '📊',
  },
  {
    key: 'wealthGrowth',
    label: 'Wealth Growth',
    score: 78,
    status: 'SIP active · Good rate',
    section: 'goals',
    icon: '📈',
  },
];

export const DEFAULT_SIP = {
  lumpSum: 100000,
  monthlySIP: 5000,
  annualRate: 12,
  years: 10,
  stepUp: false,
  stepUpPct: 10,
};

export const DEFAULT_SWP = {
  corpus: 5000000,
  annualWithdrawal: 360000,
  annualReturn: 8,
  tenure: 20,
};

export const DEFAULT_EMI = {
  loanAmount: 3000000,
  annualRate: 8.5,
  years: 20,
  months: 0,
};

export const DEFAULT_FIRE = {
  currentAge: 30,
  retirementAge: 50,
  monthlyExpenses: 60000,
  inflation: 6,
  annualReturn: 12,
  postReturnRate: 7,
  currentSavings: 500000,
};

export const DEFAULT_INSURANCE = {
  life: {
    annualIncome: 1200000,
    currentAge: 34,
    retirementAge: 60,
    liabilities: 5000000,
    existingAssets: 2000000,
    existingCover: 5000000,
  },
  health: {
    cityTier: 'Metro',
    adults: 2,
    children: 1,
    preExisting: false,
    existingCover: 500000,
  },
};

export const DEFAULT_EMERGENCY = {
  monthlyExpenses: 45000,
  employmentType: 'Salaried — Moderate risk',
  dependents: 1,
  currentFund: 100000,
  buildMonths: 12,
};

export const DEFAULT_GOALS = [
  {
    id: 1,
    type: 'Retirement',
    emoji: '🏖️',
    targetAmount: 5000000,
    targetYear: CURRENT_YEAR + 21,
    inflation: 6,
    expectedReturn: 12,
    currentCorpus: 300000,
  },
  {
    id: 2,
    type: "Child's Education",
    emoji: '🎓',
    targetAmount: 2000000,
    targetYear: CURRENT_YEAR + 15,
    inflation: 7,
    expectedReturn: 12,
    currentCorpus: 100000,
  },
];

export const GOAL_TYPES = [
  { type: 'Retirement', emoji: '🏖️' },
  { type: "Child's Education", emoji: '🎓' },
  { type: "Child's Marriage", emoji: '💍' },
  { type: 'Own Marriage', emoji: '💒' },
  { type: 'Buy a House', emoji: '🏠' },
  { type: 'Foreign Travel', emoji: '✈️' },
  { type: 'Emergency Fund', emoji: '🚨' },
  { type: 'Other', emoji: '📦' },
];

export const NAV_ITEMS = [
  { id: 'dashboard', label: 'Home', icon: '🏠' },
  { id: 'goals', label: 'Goals', icon: '🎯' },
  { id: 'calculators', label: 'Calculators', icon: '📈' },
  { id: 'fire', label: 'FIRE', icon: '🔥' },
  { id: 'insurance', label: 'Insurance', icon: '🛡️' },
  { id: 'emergency', label: 'Emergency Fund', icon: '🚨' },
  { id: 'buyVsRent', label: 'Buy vs Rent', icon: '🏡' },
];

export const DEFAULT_BUY_VS_RENT = {
  // Property purchase
  propertyPrice: 5000000,
  downPaymentPct: 20,
  loanTenure: 20,
  interestRate: 8.5,
  propertyAppreciation: 6,
  // Associated annual expenses
  propertyTaxPct: 1,
  propertyTaxIncrement: 5,
  societyMaintenance: 50000,
  societyMaintenanceIncrement: 5,
  houseMaintenance: 10000,
  houseMaintenanceIncrement: 5,
  // Renting
  monthlyRent: 20000,
  rentIncrease: 5,
  depositBrokerage: 60000,
  investmentReturn: 12,
  analysisPeriod: 20,
};
