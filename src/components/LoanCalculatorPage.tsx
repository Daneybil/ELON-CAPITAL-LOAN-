import React from 'react';
import { Percent, ArrowLeft, ArrowRight, HelpCircle, AlertTriangle, ShieldCheck, Clock } from 'lucide-react';

interface LoanCalculatorPageProps {
  initialAmount?: number;
  initialTerm?: number;
  onBackToHome: () => void;
  onApplyClick: (amount: number, term: number) => void;
}

export default function LoanCalculatorPage({
  initialAmount = 100000,
  initialTerm = 24,
  onBackToHome,
  onApplyClick,
}: LoanCalculatorPageProps) {
  const [amount, setAmount] = React.useState<number>(initialAmount);
  const [term, setTerm] = React.useState<number>(initialTerm);
  const [calculatedResult, setCalculatedResult] = React.useState({
    monthly: 0,
    total: 0,
    rate: 0
  });

  // Calculate values dynamically
  React.useEffect(() => {
    // Interest rate is 15% if term is less than or equal to 12 months, otherwise 25%
    const rate = term <= 12 ? 15 : 25;
    const totalInterest = amount * (rate / 100);
    const totalPayback = amount + totalInterest;
    const monthlyPayment = totalPayback / term;

    setCalculatedResult({
      monthly: Math.round(monthlyPayment),
      total: Math.round(totalPayback),
      rate: rate
    });
  }, [amount, term]);

  const handleAmountChange = (val: number) => {
    const safeVal = Math.max(1000, Math.min(val, 500000000));
    setAmount(safeVal);
  };

  const presets = [
    { label: '$10K', value: 10000 },
    { label: '$100K', value: 100000 },
    { label: '$1M', value: 1000000 },
    { label: '$10M', value: 10000000 },
    { label: '$100M', value: 100000000 },
    { label: '$500M', value: 500000000 },
  ];

  const terms = [6, 12, 18, 24, 36, 48, 60];

  return (
    <div className="relative min-h-screen bg-black text-white pt-24 pb-16 selection:bg-cyan-500/30 selection:text-cyan-200" id="calculator-page">
      {/* Background grids and glowing graphics */}
      <div className="absolute top-0 left-0 w-full h-[600px] bg-gradient-to-b from-cyan-950/20 via-transparent to-transparent pointer-events-none" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-cyan-500/[0.03] rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.003)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.003)_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />

      <div className="max-w-4xl mx-auto px-4 relative z-10">
        
        {/* Back Link */}
        <button 
          onClick={onBackToHome}
          className="flex items-center gap-2 text-gray-500 hover:text-cyan-400 text-xs font-mono uppercase tracking-widest mb-10 transition-colors cursor-pointer group"
          id="btn-back-home"
        >
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          Back to Homepage
        </button>

        {/* Headline */}
        <div className="text-center sm:text-left mb-12">
          <span className="px-3 py-1 text-[8px] font-mono font-bold uppercase tracking-widest text-cyan-400 bg-cyan-950/40 border border-cyan-500/20 rounded-full inline-block mb-4">
            Official Amortization Pipeline
          </span>
          <h1 className="font-display text-3xl sm:text-5xl font-black text-white tracking-tight uppercase leading-none">
            Elon Capital Dispatch Engine
          </h1>
          <p className="text-sm text-gray-400 mt-3 font-light max-w-2xl leading-relaxed">
            Configure your institutional funding package with absolute mathematical certainty. Transparency is our core protocol—no compounding traps, no fine print.
          </p>
        </div>

        {/* 3D Calculator Card wrapper */}
        <div className="relative group rounded-3xl bg-zinc-900/80 p-[1.5px] border border-white/5 shadow-[0_30px_80px_rgba(0,0,0,0.85)] hover:border-cyan-500/10 transition-all duration-300">
          <div className="rounded-3xl bg-zinc-950/80 p-8 sm:p-12 text-left">
            
            <div className="space-y-10">
              
              {/* SECTION A: Amount Selector */}
              <div className="space-y-4">
                <div className="flex justify-between items-center text-[10px] font-mono uppercase tracking-widest text-gray-500">
                  <span className="font-bold">1. Select Credit Line Capacity</span>
                  <span className="text-cyan-400 font-bold">Limits: $1,000 - $500,000,000</span>
                </div>

                {/* Big input display with manual input capability */}
                <div className="flex items-center gap-4 border-b border-white/10 focus-within:border-cyan-400 transition-colors py-4">
                  <span className="text-3xl sm:text-5xl text-gray-600 font-light font-display">$</span>
                  <input 
                    type="number"
                    value={amount}
                    onChange={(e) => handleAmountChange(Number(e.target.value))}
                    className="w-full bg-transparent text-3xl sm:text-5xl font-black text-white focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none font-display"
                    placeholder="100,000"
                  />
                </div>

                {/* Presets in high contrast style */}
                <div className="flex flex-wrap gap-2 pt-2">
                  {presets.map((preset) => (
                    <button
                      key={preset.value}
                      type="button"
                      onClick={() => handleAmountChange(preset.value)}
                      className={`px-4 py-2 text-xs font-mono rounded-lg transition-all duration-200 border cursor-pointer ${
                        amount === preset.value
                          ? 'bg-cyan-400 text-black border-cyan-400 font-bold'
                          : 'bg-white/[0.02] border-white/5 text-gray-400 hover:text-white hover:bg-white/[0.05]'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>

                {/* Smooth slider */}
                <div className="pt-4">
                  <input 
                    type="range"
                    min="1000"
                    max="500000000"
                    step="1000"
                    value={amount}
                    onChange={(e) => handleAmountChange(Number(e.target.value))}
                    className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                  />
                  <div className="flex justify-between text-[9px] font-mono text-gray-600 mt-2">
                    <span>MIN: $1,000</span>
                    <span>MAX: $500,000,000</span>
                  </div>
                </div>
              </div>

              {/* SECTION B: Term selector */}
              <div className="space-y-4">
                <div className="text-[10px] font-mono uppercase tracking-widest text-gray-500 font-bold">
                  2. Select Amortization Payback Window
                </div>
                <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                  {terms.map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setTerm(m)}
                      className={`py-3 text-xs font-mono rounded-lg transition-all border cursor-pointer text-center ${
                        term === m
                          ? 'bg-cyan-400 text-black border-cyan-400 font-bold'
                          : 'bg-white/[0.02] border-white/5 text-gray-400 hover:text-white hover:bg-white/[0.05]'
                      }`}
                    >
                      {m} Mo
                    </button>
                  ))}
                </div>
              </div>

              {/* SECTION C: Capital Ledger */}
              <div className="space-y-4 p-6 bg-white/[0.01] border border-white/5 rounded-2xl text-left">
                <div className="flex items-center gap-2 mb-2">
                  <ShieldCheck className="h-4 w-4 text-cyan-400" />
                  <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-400 font-bold">
                    Secure Loan Ledger Summary
                  </span>
                </div>

                <div className="space-y-3.5 divide-y divide-white/5 text-xs font-mono">
                  <div className="flex justify-between items-center py-2 text-gray-400">
                    <span>1. Principal Amount Transmitted:</span>
                    <span className="text-white font-bold text-sm">${amount.toLocaleString()}</span>
                  </div>

                  <div className="flex justify-between items-start py-2.5">
                    <span className="text-gray-400">2. Refundable Collateral (15%):</span>
                    <div className="text-right">
                      <span className="text-cyan-400 font-bold text-sm block">
                        ${(amount * 0.15).toLocaleString()}
                      </span>
                      <span className="text-[9px] text-gray-500 font-normal block mt-0.5">
                        100% Refunded back to you on final repayment
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-between items-start py-2.5">
                    <span className="text-gray-400">3. One-Time Setup Fee (3.5%):</span>
                    <div className="text-right">
                      <span className="text-white font-bold text-sm block">
                        ${(amount * 0.035).toLocaleString()}
                      </span>
                      <span className="text-[9px] text-gray-500 font-normal block mt-0.5">
                        One-time compliance and escrow processing charge
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center py-2 text-gray-400">
                    <span>4. Amortization Rate Applied:</span>
                    <span className="text-white font-bold text-sm">{calculatedResult.rate}% Non-Compounding</span>
                  </div>

                  <div className="flex justify-between items-center py-2 text-gray-400">
                    <span>5. Fixed Monthly Repayment:</span>
                    <span className="text-cyan-400 font-extrabold text-sm">${calculatedResult.monthly.toLocaleString()} / month</span>
                  </div>

                  <div className="flex justify-between items-center py-2.5 pt-3 border-t border-white/10">
                    <span className="text-gray-300 font-bold uppercase text-[10px] tracking-wider">
                      6. Total Repayment Commitment:
                    </span>
                    <span className="text-cyan-400 font-black text-lg">${calculatedResult.total.toLocaleString()}</span>
                  </div>
                </div>

                {/* Important disclosures in a high contrast text-block */}
                <div className="bg-cyan-950/20 border border-cyan-500/10 rounded-xl p-5 text-[11px] font-mono text-gray-400 leading-relaxed space-y-3 mt-4">
                  <p>
                    <strong className="text-white">Structured Breakdown:</strong> You are configuring a capital injection of <strong className="text-cyan-400">${amount.toLocaleString()}</strong>. Over your chosen <strong className="text-white">{term}-month</strong> payback timeframe, you will commit to a fixed monthly repayment installment of <strong className="text-cyan-400">${calculatedResult.monthly.toLocaleString()}</strong>. The total interest is <strong className="text-white">${(calculatedResult.total - amount).toLocaleString()}</strong>.
                  </p>
                  <p className="border-t border-cyan-500/10 pt-3 text-[10px] text-cyan-400 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-cyan-400 shrink-0" />
                    <span>A 15% Refundable Collateral and 3.5% Setup Fee are required to unlock escrow disbursement.</span>
                  </p>
                </div>
              </div>

              {/* SECTION D: Apply Action - Classical Giant 3D Button! */}
              <div className="pt-4">
                <button
                  type="button"
                  onClick={() => onApplyClick(amount, term)}
                  className="relative group w-full rounded-2xl bg-cyan-700 p-[2px] transition-transform duration-200 active:scale-[0.98] cursor-pointer"
                  id="btn-calculator-page-apply"
                >
                  <span className="absolute inset-0 rounded-2xl bg-cyan-800/90 translate-y-2 block"></span>
                  <span className="relative flex items-center justify-center gap-3 px-10 py-6 rounded-2xl bg-cyan-400 text-black text-sm sm:text-base font-extrabold uppercase tracking-widest -translate-y-2 group-hover:-translate-y-1 group-active:translate-y-0 transition-all duration-150 shadow-[0_8px_30px_rgba(34,211,238,0.35)] font-display">
                    Apply for ${amount.toLocaleString()} Liquidity Allocation
                    <ArrowRight className="h-5 w-5 text-black stroke-[3]" />
                  </span>
                </button>
              </div>

            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
