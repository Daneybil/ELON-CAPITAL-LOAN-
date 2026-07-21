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
  const [amountInput, setAmountInput] = React.useState<string>(initialAmount.toString());
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
    const monthlyPayment = term > 0 ? totalPayback / term : 0;

    setCalculatedResult({
      monthly: Math.round(monthlyPayment),
      total: Math.round(totalPayback),
      rate: rate
    });
  }, [amount, term]);

  const handleAmountChangeInput = (valStr: string) => {
    // Allow users to completely clean/clear the input
    if (valStr === '') {
      setAmountInput('');
      setAmount(0);
      return;
    }
    
    // Remove non-numeric characters except optional decimal point
    const cleanStr = valStr.replace(/[^0-9.]/g, '');
    setAmountInput(cleanStr);
    
    const numeric = parseFloat(cleanStr);
    if (!isNaN(numeric)) {
      // Limit to max 500,000,000 but do not enforce minimum until blur
      setAmount(Math.min(numeric, 500000000));
    } else {
      setAmount(0);
    }
  };

  const handleAmountBlur = () => {
    // Enforce minimum of $1,000 on blur so that incomplete typings are normalized
    if (amount < 1000) {
      setAmount(1000);
      setAmountInput('1000');
    } else {
      setAmountInput(amount.toString());
    }
  };

  const handlePresetSelect = (presetVal: number) => {
    setAmount(presetVal);
    setAmountInput(presetVal.toString());
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
          className="inline-flex items-center gap-3 px-6 py-3 border border-cyan-500/20 bg-cyan-950/20 rounded-xl text-xs sm:text-sm font-mono font-black uppercase tracking-widest text-cyan-400 hover:text-cyan-300 hover:border-cyan-400/50 hover:bg-cyan-950/40 transition-all duration-200 cursor-pointer group shadow-[0_4px_20px_rgba(34,211,238,0.05)] active:scale-95 mb-10"
          id="btn-back-home"
        >
          <ArrowLeft className="h-5 w-5 transition-transform group-hover:-translate-x-1" />
          Back to Homepage
        </button>

        {/* Headline */}
        <div className="text-center sm:text-left mb-12">
          <span className="px-3 py-1 text-[10px] sm:text-xs font-mono font-black uppercase tracking-widest text-cyan-400 bg-cyan-950/40 border border-cyan-500/20 rounded-full inline-block mb-4">
            Official Amortization Pipeline
          </span>
          <h1 className="font-display text-4xl sm:text-6xl font-black text-white tracking-tight uppercase leading-none">
            Elon Capital Dispatch Engine
          </h1>
          <p className="text-sm sm:text-lg text-zinc-100 mt-4 font-black uppercase tracking-wide leading-relaxed">
            Configure your institutional funding package with absolute mathematical certainty. Transparency is our core protocol—no compounding traps, no fine print.
          </p>
        </div>

        {/* 3D Calculator Card wrapper */}
        <div className="relative group rounded-3xl bg-zinc-900/80 p-[1.5px] border border-white/10 shadow-[0_30px_80px_rgba(0,0,0,0.85)] hover:border-cyan-500/20 transition-all duration-300">
          <div className="rounded-3xl bg-zinc-950/80 p-8 sm:p-12 text-left">
            
            <div className="space-y-10">
              
              {/* SECTION A: Amount Selector */}
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center text-xs sm:text-sm font-mono uppercase tracking-widest text-zinc-300 font-black gap-2">
                  <span>1. Select Credit Line Capacity</span>
                  <span className="text-cyan-400 font-black">Limits: $1,000 - $500,000,000</span>
                </div>

                {/* Big input display with manual input capability */}
                <div className="flex items-center gap-4 border-b-2 border-white/20 focus-within:border-cyan-400 transition-colors py-4">
                  <span className="text-3xl sm:text-5xl text-gray-500 font-black font-display">$</span>
                  <input 
                    type="text"
                    value={amountInput}
                    onChange={(e) => handleAmountChangeInput(e.target.value)}
                    onBlur={handleAmountBlur}
                    className="w-full bg-transparent text-3xl sm:text-5xl font-black text-white focus:outline-none font-display uppercase tracking-tight"
                    placeholder="Enter amount (Min $1,000)"
                  />
                </div>

                {/* Presets in high contrast style */}
                <div className="flex flex-wrap gap-2 pt-2">
                  {presets.map((preset) => (
                    <button
                      key={preset.value}
                      type="button"
                      onClick={() => handlePresetSelect(preset.value)}
                      className={`px-4 py-2 text-xs sm:text-sm font-mono font-black rounded-lg transition-all duration-200 border cursor-pointer ${
                        amount === preset.value
                          ? 'bg-cyan-400 text-black border-cyan-400 font-bold'
                          : 'bg-white/[0.02] border-white/10 text-gray-400 hover:text-white hover:bg-white/[0.05]'
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
                    value={amount || 1000}
                    onChange={(e) => handlePresetSelect(Number(e.target.value))}
                    className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                  />
                  <div className="flex justify-between text-xs font-mono font-black text-gray-500 mt-2">
                    <span>MIN: $1,000</span>
                    <span>MAX: $500,000,000</span>
                  </div>
                </div>
              </div>

              {/* SECTION B: Term selector */}
              <div className="space-y-4">
                <div className="text-xs sm:text-sm font-mono uppercase tracking-widest text-zinc-300 font-black">
                  2. Select Amortization Payback Window
                </div>
                <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                  {terms.map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setTerm(m)}
                      className={`py-3 text-xs sm:text-sm font-mono rounded-lg transition-all border cursor-pointer text-center font-black ${
                        term === m
                          ? 'bg-cyan-400 text-black border-cyan-400'
                          : 'bg-white/[0.02] border-white/10 text-gray-400 hover:text-white hover:bg-white/[0.05]'
                      }`}
                    >
                      {m} Mo
                    </button>
                  ))}
                </div>
              </div>

              {/* SECTION C: Capital Ledger */}
              <div className="space-y-4 p-6 bg-white/[0.01] border-2 border-white/10 rounded-2xl text-left">
                <div className="flex items-center gap-2 mb-2">
                  <ShieldCheck className="h-4 w-4 text-cyan-400" />
                  <span className="text-xs font-mono uppercase tracking-widest text-cyan-400 font-black">
                    Secure Loan Ledger Summary
                  </span>
                </div>

                <div className="space-y-3.5 divide-y divide-white/5 text-xs sm:text-sm font-mono font-black">
                  <div className="flex justify-between items-center py-2 text-zinc-300">
                    <span>1. Principal Amount Transmitted:</span>
                    <span className="text-white font-black text-sm sm:text-base">${amount.toLocaleString()}</span>
                  </div>

                  <div className="flex justify-between items-start py-2.5">
                    <span className="text-zinc-300">2. Refundable Collateral (25%):</span>
                    <div className="text-right">
                      <span className="text-cyan-400 font-black text-sm sm:text-base block">
                        ${(amount * 0.25).toLocaleString()}
                      </span>
                      <span className="text-[10px] text-zinc-400 font-bold block mt-0.5">
                        100% Refunded back to your dashboard on final repayment
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-between items-start py-2.5">
                    <span className="text-zinc-300">3. One-Time Setup Fee (3.5%):</span>
                    <div className="text-right">
                      <span className="text-white font-black text-sm sm:text-base block">
                        ${(amount * 0.035).toLocaleString()}
                      </span>
                      <span className="text-[10px] text-zinc-400 font-bold block mt-0.5">
                        One-time company setup and compliance charge
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center py-2 text-zinc-300">
                    <span>4. Amortization Rate Applied:</span>
                    <span className="text-white font-black text-sm sm:text-base">{calculatedResult.rate}% Non-Compounding</span>
                  </div>

                  <div className="flex justify-between items-center py-2 text-zinc-300">
                    <span>5. Fixed Monthly Repayment:</span>
                    <span className="text-cyan-400 font-black text-sm sm:text-base">${calculatedResult.monthly.toLocaleString()} / month</span>
                  </div>

                  <div className="flex justify-between items-center py-2.5 pt-3 border-t border-white/20">
                    <span className="text-zinc-200 font-black uppercase text-xs tracking-wider">
                      6. Total Repayment Commitment:
                    </span>
                    <span className="text-cyan-400 font-black text-lg sm:text-xl">${calculatedResult.total.toLocaleString()}</span>
                  </div>
                </div>

                {/* Important disclosures in a high contrast text-block */}
                <div className="bg-cyan-950/20 border border-cyan-500/20 rounded-xl p-5 text-xs sm:text-sm font-mono text-zinc-100 leading-relaxed space-y-3 mt-4">
                  <p>
                    <strong className="text-white font-black">Structured Breakdown:</strong> You are configuring a capital injection of <strong className="text-cyan-400 font-black">${amount.toLocaleString()}</strong>. Over your chosen <strong className="text-white font-black">{term}-month</strong> payback timeframe, you will commit to a fixed monthly repayment installment of <strong className="text-cyan-400 font-black">${calculatedResult.monthly.toLocaleString()}</strong>. The total interest is <strong className="text-white font-black">${(calculatedResult.total - amount).toLocaleString()}</strong>.
                  </p>
                  <p className="border-t border-cyan-500/20 pt-3 text-xs text-cyan-400 flex items-center gap-2 font-black">
                    <AlertTriangle className="h-4 w-4 text-cyan-400 shrink-0" />
                    <span>A 25% Refundable Collateral and 3.5% Company Setup Fee are required to unlock escrow disbursement.</span>
                  </p>
                </div>
              </div>

              {/* OVERDUE COURT PROSECUTION SECTION */}
              <div className="bg-red-950/20 border-2 border-red-500/40 rounded-2xl p-6 sm:p-8 space-y-4 text-left">
                <div className="flex items-center gap-2 text-red-500">
                  <AlertTriangle className="h-5 w-5 stroke-[2.5]" />
                  <h4 className="text-sm sm:text-base font-black uppercase tracking-wider font-mono">
                    ⚠️ CRIMINAL PROSECUTION & DEFAULT AGREEMENT
                  </h4>
                </div>
                <p className="text-xs sm:text-sm text-zinc-100 font-black uppercase tracking-wide leading-relaxed font-sans">
                  Failure to pay back borrowed capital is treated as a high-tier financial felony. Our platform offers a maximum of 1-month grace window if your repayment goes overdue. 
                </p>
                <p className="text-xs sm:text-sm text-zinc-200 font-black uppercase tracking-wide leading-relaxed font-sans">
                  If payment is not settled within 30 days past the due date, we will immediately initiate criminal court charges in your resident country or international jurisdiction. You will face the absolute weight of national law, leading to immediate asset seizures, freezing of credit profiles, and severe jail sentences. DO NOT borrow if you do not plan to pay.
                </p>
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
                  <span className="relative flex items-center justify-center gap-3 px-10 py-6 rounded-2xl bg-cyan-400 text-black text-sm sm:text-base font-black uppercase tracking-widest -translate-y-2 group-hover:-translate-y-1 group-active:translate-y-0 transition-all duration-150 shadow-[0_8px_30px_rgba(34,211,238,0.35)] font-display">
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
