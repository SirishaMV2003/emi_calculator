import { calculateEmi, calculateSchedule } from '../src/services/emiService';

describe('EMI calculations', () => {
  it('computes EMI with positive inputs', () => {
    const emi = calculateEmi(100000, 10, 12);
    expect(emi).toBeCloseTo(8791.59, 2);
  });

  it('produces a schedule that amortizes the loan', () => {
    const schedule = calculateSchedule(50000, 12, 24);
    expect(schedule).toHaveLength(24);
    const lastBalance = schedule[schedule.length - 1].balance;
    expect(lastBalance).toBeLessThanOrEqual(1);
  });
});
