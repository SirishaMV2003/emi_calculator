import { useMemo, useState } from 'react';
import './App.css';

type ScheduleRow = {
  month: number;
  principalComponent: number;
  interest: number;
  balance: number;
};

type Loan = {
  id: number;
  principal: number;
  annualRate: number;
  tenureMonths: number;
  name?: string;
  createdAt: string;
};

type LoanWithSchedule = Loan & {
  emi: number;
  schedule: ScheduleRow[];
};

type SipRow = { month: number; contribution: number; interest: number; balance: number };
type SipResult = {
  maturity: number;
  totalInvestment: number;
  totalInterest: number;
  schedule: SipRow[];
};

type FdRow = { month: number; interest: number; balance: number };
type FdResult = {
  maturity: number;
  totalInterest: number;
  schedule: FdRow[];
};

const formatINR = (value: number, fractionDigits = 0) =>
  new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits
  }).format(value);

const apiBase = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api';

function App() {
  const tabs = [
    { id: 'emi', label: 'EMI', sub: 'Loans & amortization' },
    { id: 'sip', label: 'SIP', sub: 'Monthly investments' },
    { id: 'fd', label: 'FD', sub: 'Lump-sum growth' }
  ] as const;

  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]['id']>('emi');
  const [principal, setPrincipal] = useState('10000');
  const [annualRate, setAnnualRate] = useState('10');
  const [tenureMonths, setTenureMonths] = useState('12');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<LoanWithSchedule | null>(null);
  const [sipInputs, setSipInputs] = useState({ monthlyContribution: '10000', annualRate: '10', tenureMonths: '12' });
  const [sipResult, setSipResult] = useState<SipResult | null>(null);
  const [fdInputs, setFdInputs] = useState({ principal: '10000', annualRate: '10', tenureMonths: '12' });
  const [fdResult, setFdResult] = useState<FdResult | null>(null);

  const formattedEmi = useMemo(
    () => (result ? formatINR(result.emi, 2) : null),
    [result]
  );


  const calculate = async () => {
    setError(null);
    setLoading(true);
    try {
      const payload = {
        principal: Number(principal || 0),
        annualRate: Number(annualRate || 0),
        tenureMonths: Number(tenureMonths || 0)
      };

      const response = await fetch(`${apiBase}/emi/calculate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data?.error || 'Calculation failed');
      }

      const data = await response.json();
      const hydrated: LoanWithSchedule = {
        id: 0,
        createdAt: new Date().toISOString(),
        principal: payload.principal,
        annualRate: payload.annualRate,
        tenureMonths: payload.tenureMonths,
        name: undefined,
        emi: data.emi,
        schedule: data.schedule
      };

      setResult(hydrated);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unexpected error';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const runSip = async () => {
    setError(null);
    try {
      const response = await fetch(`${apiBase}/invest/sip`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          monthlyContribution: Number(sipInputs.monthlyContribution || 0),
          annualRate: Number(sipInputs.annualRate || 0),
          tenureMonths: Number(sipInputs.tenureMonths || 0)
        })
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data?.error || 'Calculation failed');
      }
      const data: SipResult = await response.json();
      setSipResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unexpected error');
    }
  };

  const runFd = async () => {
    setError(null);
    try {
      const response = await fetch(`${apiBase}/invest/fd`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          principal: Number(fdInputs.principal || 0),
          annualRate: Number(fdInputs.annualRate || 0),
          tenureMonths: Number(fdInputs.tenureMonths || 0)
        })
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data?.error || 'Calculation failed');
      }
      const data: FdResult = await response.json();
      setFdResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unexpected error');
    }
  };

  return (
    <div className="page">
      <header className="hero">
        <div>
          <p className="eyebrow">Payflow tools</p>
          <h1>EMI planner & API sandbox</h1>
          <p className="lede">
            Calculate EMIs, SIPs, and fixed deposits in one spot. Stateless API sandbox for quick planning.
          </p>
        </div>
      </header>

      <main className="layout">
        <section className="panel calculator">
          <div className="tab-bar">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                className={`tab ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <span>{tab.label}</span>
                <small>{tab.sub}</small>
              </button>
            ))}
          </div>

          {activeTab === 'emi' && (
            <div className="tab-content">
              <div className="grid">
                <label>
                  <span>Principal (₹)</span>
                  <input
                    type="number"
                    value={principal}
                    min={1000}
                    step={1000}
                    onChange={(e) => setPrincipal(e.target.value)}
                  />
                </label>
                <label>
                  <span>Annual rate (%)</span>
                  <input
                    type="number"
                    value={annualRate}
                    min={1}
                    step={0.1}
                    onChange={(e) => setAnnualRate(e.target.value)}
                  />
                </label>
                <label>
                  <span>Tenure (months)</span>
                  <input
                    type="number"
                    value={tenureMonths}
                    min={3}
                    step={1}
                    onChange={(e) => setTenureMonths(e.target.value)}
                  />
                </label>
              </div>

              <div className="inline-actions">
                <button className="primary" onClick={calculate} disabled={loading}>
                  {loading ? 'Calculating…' : 'Calculate EMI'}
                </button>
                {formattedEmi ? <span className="pill">EMI ₹{formattedEmi}</span> : null}
              </div>
              {error && activeTab === 'emi' ? <p className="error">{error}</p> : null}

              {!result && <p className="muted">Run a calculation to see the schedule.</p>}
              {result ? (
                <div className="result">
                  <div className="stats">
                    <div>
                      <p className="label">Principal</p>
                      <p className="value">₹{formatINR(result.principal)}</p>
                    </div>
                    <div>
                      <p className="label">Annual rate</p>
                      <p className="value">{result.annualRate}%</p>
                    </div>
                    <div>
                      <p className="label">Tenure</p>
                      <p className="value">{result.tenureMonths} months</p>
                    </div>
                  </div>
                  <div className="table">
                    <div className="table-head">
                      <span>Month</span>
                      <span>Interest</span>
                      <span>Principal</span>
                      <span>Balance</span>
                    </div>
                    <div className="table-body">
                      {result.schedule.map((row) => (
                        <div className="table-row" key={row.month}>
                          <span>{row.month}</span>
                            <span>₹{formatINR(row.interest, 2)}</span>
                            <span>₹{formatINR(row.principalComponent, 2)}</span>
                            <span>₹{formatINR(row.balance, 2)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          )}

          {activeTab === 'sip' && (
            <div className="tab-content">
              <div className="grid">
                <label>
                  <span>Monthly contribution</span>
                  <input
                    type="number"
                    min={500}
                    step={500}
                    value={sipInputs.monthlyContribution}
                    onChange={(e) => setSipInputs((s) => ({ ...s, monthlyContribution: e.target.value }))}
                  />
                </label>
                <label>
                  <span>Annual rate (%)</span>
                  <input
                    type="number"
                    min={1}
                    step={0.1}
                    value={sipInputs.annualRate}
                    onChange={(e) => setSipInputs((s) => ({ ...s, annualRate: e.target.value }))}
                  />
                </label>
                <label>
                  <span>Tenure (months)</span>
                  <input
                    type="number"
                    min={6}
                    step={1}
                    value={sipInputs.tenureMonths}
                    onChange={(e) => setSipInputs((s) => ({ ...s, tenureMonths: e.target.value }))}
                  />
                </label>
              </div>
              <div className="inline-actions">
                <button className="primary" onClick={runSip}>
                  Calculate SIP
                </button>
              </div>
              {error && activeTab === 'sip' ? <p className="error">{error}</p> : null}
              {sipResult ? (
                <div className="result">
                  <div className="stats">
                    <div>
                      <p className="label">Total invested</p>
                      <p className="value">₹{formatINR(sipResult.totalInvestment)}</p>
                    </div>
                    <div>
                      <p className="label">Total interest</p>
                      <p className="value">₹{formatINR(sipResult.totalInterest, 2)}</p>
                    </div>
                    <div>
                      <p className="label">Maturity</p>
                      <p className="value">₹{formatINR(sipResult.maturity, 2)}</p>
                    </div>
                  </div>
                  <div className="table">
                    <div className="table-head">
                      <span>Month</span>
                      <span>Contribution</span>
                      <span>Interest</span>
                      <span>Balance</span>
                    </div>
                    <div className="table-body">
                      {sipResult.schedule.map((row) => (
                        <div className="table-row" key={`sip-${row.month}`}>
                          <span>{row.month}</span>
                            <span>₹{formatINR(row.contribution)}</span>
                            <span>₹{formatINR(row.interest, 2)}</span>
                            <span>₹{formatINR(row.balance, 2)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <p className="muted">Enter details and calculate to see SIP growth.</p>
              )}
            </div>
          )}

          {activeTab === 'fd' && (
            <div className="tab-content">
              <div className="grid">
                <label>
                  <span>Principal (₹)</span>
                  <input
                    type="number"
                    min={10000}
                    step={1000}
                    value={fdInputs.principal}
                    onChange={(e) => setFdInputs((s) => ({ ...s, principal: e.target.value }))}
                  />
                </label>
                <label>
                  <span>Annual rate (%)</span>
                  <input
                    type="number"
                    min={1}
                    step={0.1}
                    value={fdInputs.annualRate}
                    onChange={(e) => setFdInputs((s) => ({ ...s, annualRate: e.target.value }))}
                  />
                </label>
                <label>
                  <span>Tenure (months)</span>
                  <input
                    type="number"
                    min={3}
                    step={1}
                    value={fdInputs.tenureMonths}
                    onChange={(e) => setFdInputs((s) => ({ ...s, tenureMonths: e.target.value }))}
                  />
                </label>
              </div>
              <div className="inline-actions">
                <button className="primary" onClick={runFd}>
                  Calculate FD
                </button>
              </div>
              {error && activeTab === 'fd' ? <p className="error">{error}</p> : null}
              {fdResult ? (
                <div className="result">
                  <div className="stats">
                    <div>
                      <p className="label">Principal</p>
                      <p className="value">₹{formatINR(Number(fdInputs.principal || 0))}</p>
                    </div>
                    <div>
                      <p className="label">Total interest</p>
                      <p className="value">₹{formatINR(fdResult.totalInterest, 2)}</p>
                    </div>
                    <div>
                      <p className="label">Maturity</p>
                      <p className="value">₹{formatINR(fdResult.maturity, 2)}</p>
                    </div>
                  </div>
                  <div className="table">
                    <div className="table-head">
                      <span>Month</span>
                      <span>Interest</span>
                      <span>Balance</span>
                    </div>
                    <div className="table-body">
                      {fdResult.schedule.map((row) => (
                        <div className="table-row" key={`fd-${row.month}`}>
                          <span>{row.month}</span>
                            <span>₹{formatINR(row.interest, 2)}</span>
                            <span>₹{formatINR(row.balance, 2)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <p className="muted">Enter FD inputs and calculate to view maturity schedule.</p>
              )}
            </div>
          )}
        </section>

      </main>
    </div>
  );
}

export default App;
