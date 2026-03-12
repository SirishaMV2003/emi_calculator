export function calculateEmi(principal: number, annualRate: number, tenureMonths: number): number {
  const monthlyRate = annualRate / (12 * 100);
  const numerator = principal * monthlyRate * Math.pow(1 + monthlyRate, tenureMonths);
  const denominator = Math.pow(1 + monthlyRate, tenureMonths) - 1;
  return parseFloat((numerator / denominator).toFixed(2));
}

export function calculateSchedule(
  principal: number,
  annualRate: number,
  tenureMonths: number
) {
  const emi = calculateEmi(principal, annualRate, tenureMonths);
  const monthlyRate = annualRate / (12 * 100);
  const schedule = [] as Array<{ month: number; principalComponent: number; interest: number; balance: number }>;

  let balance = principal;
  for (let month = 1; month <= tenureMonths; month += 1) {
    const interest = parseFloat((balance * monthlyRate).toFixed(2));
    const principalComponent = parseFloat((emi - interest).toFixed(2));
    balance = parseFloat((balance - principalComponent).toFixed(2));
    schedule.push({ month, principalComponent, interest, balance: Math.max(balance, 0) });
  }

  return schedule;
}

export function calculateSip(
  monthlyContribution: number,
  annualRate: number,
  tenureMonths: number
): {
  maturity: number;
  totalInvestment: number;
  totalInterest: number;
  schedule: Array<{ month: number; contribution: number; interest: number; balance: number }>;
} {
  const monthlyRate = annualRate / (12 * 100);
  let balance = 0;
  const schedule: Array<{ month: number; contribution: number; interest: number; balance: number }> = [];

  for (let month = 1; month <= tenureMonths; month += 1) {
    balance += monthlyContribution;
    const interest = parseFloat((balance * monthlyRate).toFixed(2));
    balance = parseFloat((balance + interest).toFixed(2));
    schedule.push({ month, contribution: monthlyContribution, interest, balance });
  }

  const totalInvestment = monthlyContribution * tenureMonths;
  const maturity = balance;
  const totalInterest = parseFloat((maturity - totalInvestment).toFixed(2));

  return { maturity, totalInvestment, totalInterest, schedule };
}

export function calculateFd(
  principal: number,
  annualRate: number,
  tenureMonths: number
): {
  maturity: number;
  totalInterest: number;
  schedule: Array<{ month: number; interest: number; balance: number }>;
} {
  const monthlyRate = annualRate / (12 * 100);
  let balance = principal;
  const schedule: Array<{ month: number; interest: number; balance: number }> = [];

  for (let month = 1; month <= tenureMonths; month += 1) {
    const interest = parseFloat((balance * monthlyRate).toFixed(2));
    balance = parseFloat((balance + interest).toFixed(2));
    schedule.push({ month, interest, balance });
  }

  const maturity = balance;
  const totalInterest = parseFloat((maturity - principal).toFixed(2));

  return { maturity, totalInterest, schedule };
}
