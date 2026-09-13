import React from 'react';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
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
    // Interest rate is 15% if term is less than or equal to 12 months, otherwise 20%
    const rate = term <= 12 ? 15 : 20;
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
    <div className="relative min-h-screen bg-[#fbf9f4] text-zinc-900 pt-8 pb-16 selection:bg-cyan-500/30 selection:text-cyan-900" id="calculator-page">
      <div className="max-w-4xl mx-auto px-4 relative z-10">
        
        {/* Back Link */}
        <button 
          onClick={onBackToHome}
          className="inline-flex items-center gap-3 px-6 py-3 border-2 border-cyan-500/50 bg-black hover:bg-zinc-900 rounded-xl text-xs sm:text-sm font-mono font-black uppercase tracking-widest text-cyan-300 hover:text-white transition-all duration-200 cursor-pointer group shadow-lg active:scale-95 mb-10"
          id="btn-back-home"
        >
          <ArrowLeft className="h-5 w-5 transition-transform group-hover:-translate-x-1" />
          {t('nav.backToHome', 'Back to Menu / Homepage')}
        </button>

        {/* Headline */}
        <div className="text-center sm:text-left mb-12">
          <span className="px-3.5 py-1.5 text-[10px] sm:text-xs font-mono font-black uppercase tracking-widest text-cyan-400 bg-zinc-900 border border-cyan-500/40 rounded-full inline-block mb-4 shadow-sm">
            {t('calculator.pipeline', 'Official Amortization Pipeline')}
          </span>
          <h1 className="font-display text-4xl sm:text-6xl font-black text-white tracking-tight uppercase leading-none">
            {t('calculator.title', 'Elon Capital Dispatch Engine')}
          </h1>
          <p className="text-sm sm:text-lg text-zinc-300 mt-4 font-bold uppercase tracking-wide leading-relaxed">
            {t('calculator.subtitle', 'Configure your institutional funding package with absolute mathematical certainty. Transparency is our core protocol—no compounding traps, no fine print.')}
          </p>
        </div>

        {/* 3D Calculator Card wrapper */}
        <div className="relative rounded-3xl bg-black border-2 border-zinc-800 shadow-2xl">
          <div className="rounded-3xl p-8 sm:p-12 text-left">
            
            <div className="space-y-10">
              
              {/* SECTION A: Amount Selector */}
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center text-sm sm:text-base font-mono uppercase tracking-wider text-white font-black gap-2 border-b-2 border-zinc-800 pb-2">
                  <span className="text-white font-black flex items-center gap-2">
                    <span className="px-2.5 py-1 bg-cyan-950 text-cyan-300 rounded-lg border border-cyan-500 text-xs font-black">1</span>
                    SELECT CREDIT LINE CAPACITY
                  </span>
                  <span className="text-cyan-300 bg-zinc-900 px-3 py-1 rounded-lg border border-cyan-500/50 font-black text-xs sm:text-sm">
                    CREDIT LIMITS: $1,000 – $500,000,000
                  </span>
                </div>

                {/* Big input display with manual input capability */}
                <div className="flex items-center gap-4 border-2 border-cyan-500/80 focus-within:border-cyan-400 transition-colors py-4 bg-zinc-900 px-4 rounded-2xl shadow-inner">
                  <span className="text-3xl sm:text-6xl text-cyan-400 font-black font-display">$</span>
                  <input 
                    type="text"
                    value={amountInput}
                    onChange={(e) => handleAmountChangeInput(e.target.value)}
                    onBlur={handleAmountBlur}
                    className="w-full bg-transparent text-3xl sm:text-6xl font-black text-white focus:outline-none font-display uppercase tracking-tight"
                    placeholder="Enter amount (Min $1,000)"
                  />
                </div>

                {/* Presets in high contrast style */}
                <div className="flex flex-wrap gap-2.5 pt-2">
                  {presets.map((preset) => (
                    <button
                      key={preset.value}
                      type="button"
                      onClick={() => handlePresetSelect(preset.value)}
                      className={`px-4 py-2.5 text-xs sm:text-sm font-mono font-black rounded-xl transition-all duration-200 border-2 cursor-pointer ${
                        amount === preset.value
                          ? 'bg-cyan-400 text-black border-cyan-300 font-black shadow-lg scale-105'
                          : 'bg-zinc-900 border-zinc-700 text-zinc-300 hover:text-white hover:bg-zinc-800 hover:border-cyan-400'
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
                    className="w-full h-2.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                  />
                  <div className="flex justify-between text-xs sm:text-sm font-mono font-black text-zinc-400 mt-2">
                    <span>MIN: $1,000 USD</span>
                    <span>MAX: $500,000,000 USD</span>
                  </div>
                </div>
              </div>

              {/* SECTION B: Term selector */}
              <div className="space-y-4 pt-2">
                <div className="text-sm sm:text-base font-mono uppercase tracking-wider text-white font-black flex items-center justify-between border-b-2 border-zinc-800 pb-2">
                  <span className="flex items-center gap-2">
                    <span className="px-2.5 py-1 bg-cyan-950 text-cyan-300 rounded-lg border border-cyan-500 text-xs font-black">2</span>
                    SELECT AMORTIZATION PAYBACK WINDOW
                  </span>
                  <span className="text-emerald-400 font-mono font-black text-xs sm:text-sm bg-zinc-900 px-3 py-1 rounded-lg border border-emerald-500/50">
                    SELECTED: {term} MONTHS
                  </span>
                </div>
                <div className="grid grid-cols-4 sm:grid-cols-7 gap-2.5">
                  {terms.map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setTerm(m)}
                      className={`py-3.5 text-xs sm:text-base font-mono rounded-xl transition-all border-2 cursor-pointer text-center font-black ${
                        term === m
                          ? 'bg-cyan-400 text-black border-cyan-300 shadow-lg scale-105'
                          : 'bg-zinc-900 border-zinc-700 text-zinc-300 hover:text-white hover:bg-zinc-800 hover:border-cyan-400'
                      }`}
                    >
                      {m} Mo
                    </button>
                  ))}
                </div>
              </div>

              {/* LOAN INTEREST POLICY DISPLAY CARD */}
              <div className="p-6 bg-zinc-950 border-2 border-zinc-800 rounded-2xl space-y-4 shadow-xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-zinc-800 pb-3 gap-2">
                  <span className="text-sm sm:text-base font-mono font-black text-cyan-400 uppercase tracking-wider flex items-center gap-2">
                    <Percent className="h-5 w-5 text-cyan-400" /> OFFICIAL LOAN INTEREST RATE POLICY
                  </span>
                  <span className="text-xs font-mono font-black text-emerald-400 bg-zinc-900 px-3 py-1 rounded-lg border border-emerald-500/50 uppercase">
                    FIXED NON-COMPOUNDING
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm font-mono font-bold">
                  <div className={`p-4 rounded-xl border-2 transition-all ${
                    term <= 12 ? 'bg-cyan-950/40 border-cyan-500 text-white shadow-md' : 'bg-zinc-900 border-zinc-800 text-zinc-400'
                  }`}>
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="uppercase text-xs font-black tracking-wider text-cyan-400">1 Month – 12 Months Term</span>
                      {term <= 12 && <span className="text-xs bg-cyan-400 text-black px-2.5 py-0.5 rounded-md font-black">APPLIED (15%)</span>}
                    </div>
                    <div className="text-2xl font-black text-white">15% Fixed Interest</div>
                    <p className="text-xs text-zinc-300 font-extrabold mt-1.5 leading-relaxed">Applies to short-term financing facilities up to 12 months.</p>
                  </div>
                  <div className={`p-4 rounded-xl border-2 transition-all ${
                    term > 12 ? 'bg-cyan-950/40 border-cyan-500 text-white shadow-md' : 'bg-zinc-900 border-zinc-800 text-zinc-400'
                  }`}>
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="uppercase text-xs font-black tracking-wider text-cyan-400">&gt;12 Months – 60 Months (5 Yrs)</span>
                      {term > 12 && <span className="text-xs bg-cyan-400 text-black px-2.5 py-0.5 rounded-md font-black">APPLIED (20%)</span>}
                    </div>
                    <div className="text-2xl font-black text-white">20% Fixed Interest</div>
                    <p className="text-xs text-zinc-300 font-extrabold mt-1.5 leading-relaxed">Applies to long-term amortization facilities exceeding 12 months up to 5 years.</p>
                  </div>
                </div>
              </div>

              {/* SECTION C: Capital Ledger */}
              <div className="space-y-5 p-6 sm:p-8 bg-zinc-950 border-2 border-zinc-800 rounded-2xl text-left shadow-2xl">
                <div className="flex items-center justify-between border-b-2 border-zinc-800 pb-3">
                  <div className="flex items-center gap-2.5">
                    <ShieldCheck className="h-6 w-6 text-cyan-400 stroke-[2.5]" />
                    <span className="text-base sm:text-xl font-mono uppercase tracking-wider text-white font-black">
                      SECURE LOAN LEDGER SUMMARY
                    </span>
                  </div>
                  <span className="text-xs font-mono font-black text-emerald-400 bg-zinc-900 px-3 py-1 rounded-lg border border-emerald-500/50 uppercase">
                    AUDITED LEDGER
                  </span>
                </div>

                <div className="space-y-4 divide-y divide-zinc-800 text-sm sm:text-base font-mono font-black">
                  <div className="flex justify-between items-center py-3 text-white">
                    <span className="text-sm sm:text-base font-black text-zinc-200">1. Principal Amount Transmitted:</span>
                    <span className="text-white font-black text-base sm:text-xl bg-zinc-900 px-4 py-1.5 rounded-xl border border-zinc-700">${amount.toLocaleString()} USD</span>
                  </div>

                  <div className="flex justify-between items-start py-3.5">
                    <div className="space-y-1">
                      <span className="text-sm sm:text-base font-black text-zinc-200 block">2. Refundable Collateral (25%):</span>
                      <span className="text-xs sm:text-sm text-emerald-400 font-extrabold block">
                        🛡️ 100% Refunded back to your dashboard on final repayment
                      </span>
                    </div>
                    <div className="text-right shrink-0 ml-4">
                      <span className="text-emerald-400 font-black text-base sm:text-xl block bg-zinc-900 px-4 py-1.5 rounded-xl border border-emerald-500/50">
                        ${(amount * 0.25).toLocaleString()} USD
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-between items-start py-3.5">
                    <div className="space-y-1">
                      <span className="text-sm sm:text-base font-black text-zinc-200 block">3. One-Time Setup Fee (3.5%):</span>
                      <span className="text-xs sm:text-sm text-cyan-400 font-extrabold block">
                        ⚙️ One-time company setup and compliance set off charge
                      </span>
                    </div>
                    <div className="text-right shrink-0 ml-4">
                      <span className="text-white font-black text-base sm:text-xl block bg-zinc-900 px-4 py-1.5 rounded-xl border border-zinc-700">
                        ${(amount * 0.035).toLocaleString()} USD
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center py-3 text-white">
                    <span className="text-sm sm:text-base font-black text-zinc-200">4. Amortization Rate Applied:</span>
                    <span className="text-amber-400 font-black text-base sm:text-lg bg-zinc-900 px-4 py-1.5 rounded-xl border border-amber-500/50">{calculatedResult.rate}% Non-Compounding</span>
                  </div>

                  <div className="flex justify-between items-center py-3 text-white">
                    <span className="text-sm sm:text-base font-black text-zinc-200">5. Fixed Monthly Repayment:</span>
                    <span className="text-cyan-400 font-black text-base sm:text-xl bg-zinc-900 px-4 py-1.5 rounded-xl border border-cyan-500/50">${calculatedResult.monthly.toLocaleString()} USD / month</span>
                  </div>

                  <div className="flex justify-between items-center py-4 pt-4 border-t-2 border-zinc-800">
                    <span className="text-white font-black uppercase text-sm sm:text-base tracking-wider">
                      6. Total Repayment Commitment:
                    </span>
                    <span className="text-cyan-300 font-black text-xl sm:text-3xl bg-zinc-900 px-5 py-2 rounded-2xl border-2 border-cyan-400 shadow-lg">${calculatedResult.total.toLocaleString()} USD</span>
                  </div>
                </div>

                {/* Prominent High-Contrast Key Notice Banner */}
                <div className="bg-zinc-900 border-2 border-zinc-800 rounded-2xl p-6 text-sm sm:text-base font-mono text-zinc-200 leading-relaxed space-y-4 mt-6 shadow-xl">
                  <p className="text-zinc-200 font-bold text-sm sm:text-base leading-relaxed">
                    <strong className="text-cyan-400 font-black uppercase">Structured Breakdown:</strong> You are configuring a capital injection of <strong className="text-cyan-400 font-black text-base sm:text-lg">${amount.toLocaleString()} USD</strong>. Over your chosen <strong className="text-white font-black text-base sm:text-lg">{term}-month</strong> payback timeframe, you will commit to a fixed monthly repayment installment of <strong className="text-cyan-400 font-black text-base sm:text-lg">${calculatedResult.monthly.toLocaleString()} USD</strong>. The total interest is <strong className="text-amber-400 font-black text-base sm:text-lg">${(calculatedResult.total - amount).toLocaleString()} USD</strong>.
                  </p>
                  
                  <div className="p-4 bg-emerald-950/40 border-2 border-emerald-500/60 rounded-xl text-xs sm:text-sm font-mono font-bold text-emerald-200 leading-relaxed flex items-start gap-3 shadow-lg">
                    <AlertTriangle className="h-6 w-6 text-emerald-400 shrink-0 stroke-[2.5] mt-0.5" />
                    <div>
                      <span className="text-emerald-400 font-black uppercase block tracking-wider mb-1 text-xs">DISBURSEMENT ESCROW REQUIREMENT</span>
                      <span>From <strong>$1,000 – $500,000,000</strong> credit line limits: a <strong>25% refundable collateral deposit</strong> and <strong>3.5% company set off fee</strong> are required to unlock escrow disbursement.</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* OVERDUE COURT PROSECUTION SECTION */}
              <div className="bg-red-950/40 border-2 border-red-600/60 rounded-2xl p-6 sm:p-8 space-y-4 text-left shadow-xl">
                <div className="flex items-center gap-2 text-red-400">
                  <AlertTriangle className="h-5 w-5 stroke-[2.5]" />
                  <h4 className="text-sm sm:text-base font-black uppercase tracking-wider font-mono">
                    ⚠️ CRIMINAL PROSECUTION & DEFAULT AGREEMENT
                  </h4>
                </div>
                <p className="text-xs sm:text-sm text-white font-black uppercase tracking-wide leading-relaxed font-sans">
                  Failure to pay back borrowed capital is treated as a high-tier financial felony. Our platform offers a maximum of 1-month grace window if your repayment goes overdue. 
                </p>
                <p className="text-xs sm:text-sm text-zinc-300 font-bold uppercase tracking-wide leading-relaxed font-sans">
                  If payment is not settled within 30 days past the due date, we will immediately initiate criminal court charges in your resident country or international jurisdiction. You will face the absolute weight of national law, leading to immediate asset seizures, freezing of credit profiles, and severe jail sentences. DO NOT borrow if you do not plan to pay.
                </p>
              </div>

              {/* SECTION D: Apply Action - Classical Giant 3D Button! */}
              <div className="pt-4">
                <button
                  type="button"
                  onClick={() => onApplyClick(amount, term)}
                  className="w-full py-5 px-8 rounded-2xl bg-cyan-400 hover:bg-cyan-300 border-2 border-cyan-500 text-black text-sm sm:text-base font-black uppercase tracking-widest transition-all shadow-xl cursor-pointer flex items-center justify-center gap-3 font-display"
                  id="btn-calculator-page-apply"
                >
                  Apply for ${amount.toLocaleString()} Liquidity Allocation
                  <ArrowRight className="h-5 w-5 text-black stroke-[3]" />
                </button>
              </div>

            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
