import { Router } from 'express';
import { z } from 'zod';
import { calculateEmi, calculateFd, calculateSchedule, calculateSip } from '../services/emiService';

const router = Router();

const loanSchema = z.object({
  principal: z.number().positive(),
  annualRate: z.number().positive(),
  tenureMonths: z.number().int().positive()
});

const sipSchema = z.object({
  monthlyContribution: z.number().positive(),
  annualRate: z.number().positive(),
  tenureMonths: z.number().int().positive()
});

const fdSchema = z.object({
  principal: z.number().positive(),
  annualRate: z.number().positive(),
  tenureMonths: z.number().int().positive()
});

router.post('/emi/calculate', (req, res) => {
  const parsed = loanSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }

  const { principal, annualRate, tenureMonths } = parsed.data;
  const emi = calculateEmi(principal, annualRate, tenureMonths);
  const schedule = calculateSchedule(principal, annualRate, tenureMonths);
  return res.json({ emi, schedule });
});

router.post('/invest/sip', (req, res) => {
  const parsed = sipSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }

  const { monthlyContribution, annualRate, tenureMonths } = parsed.data;
  const result = calculateSip(monthlyContribution, annualRate, tenureMonths);
  return res.json(result);
});

router.post('/invest/fd', (req, res) => {
  const parsed = fdSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }

  const { principal, annualRate, tenureMonths } = parsed.data;
  const result = calculateFd(principal, annualRate, tenureMonths);
  return res.json(result);
});

export default router;
