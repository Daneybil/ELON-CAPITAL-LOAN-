import React from 'react';
import logoImg from '../assets/images/elon_capital_logo_1785585548636.jpg';
import { 
  ArrowLeft, 
  ShieldCheck, 
  Clock, 
  Percent, 
  Receipt, 
  Lock, 
  CheckCircle2, 
  Layers, 
  CreditCard, 
  Wallet, 
  RefreshCw, 
  AlertTriangle, 
  Sparkles, 
  ArrowRight,
  Coins,
  Globe
} from 'lucide-react';

interface LoanTransparencyPageProps {
  onBackToHome: () => void;
  onApplyClick?: () => void;
}

export default function LoanTransparencyPage({ onBackToHome, onApplyClick }: LoanTransparencyPageProps) {
  // Scroll to top when page mounts
  React.useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <div className="w-full bg-black min-h-screen text-white pt-20 pb-32 selection:bg-cyan-500/30 selection:text-cyan-200" id="dedicated-loan-transparency-view">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Back Navigation Header */}
        <div className="mb-12 text-left flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <button
            onClick={onBackToHome}
            className="inline-flex items-center gap-3 px-6 py-3.5 border-2 border-emerald-500/50 bg-emerald-950/40 rounded-2xl text-xs sm:text-base font-mono font-black uppercase tracking-widest text-emerald-300 hover:text-emerald-100 hover:border-emerald-400 hover:bg-emerald-950/80 transition-all duration-200 cursor-pointer group shadow-[0_4px_25px_rgba(52,211,153,0.2)] active:scale-95"
            id="btn-loan-transparency-back"
          >
            <ArrowLeft className="h-5 w-5 sm:h-6 sm:w-6 transition-transform group-hover:-translate-x-1 stroke-[3]" />
            Back to Home Page
          </button>

          {onApplyClick && (
            <button
              onClick={onApplyClick}
              className="inline-flex items-center gap-2.5 px-7 py-3.5 bg-cyan-400 hover:bg-cyan-300 text-black text-xs sm:text-base font-display font-black uppercase tracking-wider rounded-2xl transition-all shadow-[0_0_25px_rgba(34,211,238,0.5)] hover:scale-105 active:scale-95 cursor-pointer"
            >
              Apply For Funding Now <ArrowRight className="h-5 w-5 stroke-[3]" />
            </button>
          )}
        </div>

        {/* Hero Title Section */}
        <div className="text-center max-w-4xl mx-auto mb-16 sm:mb-20 space-y-6">
          {/* Official 3D Logo Emblem */}
          <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-2xl bg-black border-2 border-emerald-400/80 overflow-hidden flex items-center justify-center mx-auto mb-4 relative z-10 shadow-[0_0_40px_rgba(52,211,153,0.5)] transform hover:scale-105 transition-transform duration-300">
            <img 
              src={logoImg} 
              alt="Elon Capital Official 3D Logo" 
              onError={(e) => {
                const target = e.currentTarget as HTMLImageElement;
                target.onerror = null;
                target.src = '/elon_capital_logo.jpg';
              }}
              className="h-full w-full object-cover" 
            />
          </div>

          <div className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full bg-emerald-950/90 border-2 border-emerald-500/60 text-emerald-300 font-mono text-xs sm:text-sm font-black uppercase tracking-widest shadow-[0_0_30px_rgba(52,211,153,0.3)]">
            <ShieldCheck className="h-5 w-5 text-emerald-400 stroke-[2.5]" />
            <span>INSTITUTIONAL LENDING STANDARD</span>
          </div>

          <h1 className="font-display text-4xl sm:text-6xl lg:text-7xl font-black text-white uppercase tracking-tight leading-none" id="transparency-title">
            LOAN TERMS & <span className="text-emerald-400 drop-shadow-[0_0_35px_rgba(52,211,153,0.5)]">TRANSPARENCY</span>
          </h1>

          <p className="text-white text-base sm:text-xl lg:text-2xl font-bold sm:font-extrabold max-w-3xl mx-auto leading-relaxed sm:leading-loose pt-2">
            A comprehensive, transparent breakdown of our lending terms, interest rates, processing fees, 100% refundable collateral deposit, and step-by-step capital disbursement workflow.
          </p>
        </div>

        {/* ==================== 12 TRANSPARENCY SECTIONS ==================== */}
        <div className="space-y-12 sm:space-y-16 lg:space-y-20">

          {/* SECTION 1: HOW OUR LOAN SYSTEM WORKS */}
          <div className="p-8 sm:p-12 lg:p-14 rounded-3xl bg-zinc-950/95 border-2 border-white/20 shadow-2xl relative overflow-hidden group hover:border-emerald-500/60 transition-all">
            <div className="flex flex-col sm:flex-row items-start gap-6">
              <div className="p-4 bg-emerald-950/90 border-2 border-emerald-500/60 rounded-2xl text-emerald-400 shrink-0 shadow-[0_0_20px_rgba(52,211,153,0.3)]">
                <Globe className="h-8 w-8 sm:h-9 sm:w-9 stroke-[2.5]" />
              </div>
              <div className="space-y-4 text-left w-full">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="text-xs sm:text-sm font-mono font-black text-emerald-300 uppercase tracking-widest bg-emerald-950/90 px-3 py-1 rounded-lg border border-emerald-500/50">
                    SECTION 01
                  </span>
                  <h2 className="font-display text-2xl sm:text-4xl font-black text-white uppercase tracking-tight">
                    How Our Loan System Works
                  </h2>
                </div>
                <p className="text-base sm:text-xl text-white font-bold sm:font-extrabold leading-relaxed sm:leading-loose">
                  Elon Capital provides institutional business funding, venture capital, and personal liquidity solutions to qualified applicants worldwide. Before any capital is released, every application undergoes rigorous credit evaluation and verification. Once approved, every loan facility follows a structured, multi-stage funding workflow engineered to safeguard both the borrower and the liquidity treasury.
                </p>
              </div>
            </div>
          </div>

          {/* SECTION 2: LOAN DURATION */}
          <div className="p-8 sm:p-12 lg:p-14 rounded-3xl bg-zinc-950/95 border-2 border-white/20 shadow-2xl relative overflow-hidden group hover:border-cyan-500/60 transition-all">
            <div className="flex flex-col sm:flex-row items-start gap-6">
              <div className="p-4 bg-cyan-950/90 border-2 border-cyan-500/60 rounded-2xl text-cyan-400 shrink-0 shadow-[0_0_20px_rgba(34,211,238,0.3)]">
                <Clock className="h-8 w-8 sm:h-9 sm:w-9 stroke-[2.5]" />
              </div>
              <div className="space-y-6 text-left w-full">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="text-xs sm:text-sm font-mono font-black text-cyan-300 uppercase tracking-widest bg-cyan-950/90 px-3 py-1 rounded-lg border border-cyan-500/50">
                    SECTION 02
                  </span>
                  <h2 className="font-display text-2xl sm:text-4xl font-black text-white uppercase tracking-tight">
                    Loan Duration & Repayment Horizons
                  </h2>
                </div>
                <p className="text-base sm:text-xl text-white font-bold sm:font-extrabold leading-relaxed sm:leading-loose">
                  Borrowers enjoy total flexibility to tailor repayment schedules according to their business cash flow requirements.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
                  <div className="p-6 bg-black/90 border-2 border-white/20 rounded-2xl space-y-2">
                    <span className="text-xs sm:text-sm font-mono text-cyan-400 font-black uppercase tracking-wider block">Minimum Duration</span>
                    <div className="text-2xl sm:text-3xl font-mono font-black text-white">1 Month</div>
                    <p className="text-sm sm:text-base text-white font-bold leading-relaxed">Short-term liquidity bridge for rapid deployment.</p>
                  </div>
                  <div className="p-6 bg-black/90 border-2 border-white/20 rounded-2xl space-y-2">
                    <span className="text-xs sm:text-sm font-mono text-cyan-400 font-black uppercase tracking-wider block">Maximum Duration</span>
                    <div className="text-2xl sm:text-3xl font-mono font-black text-white">5 Years (60 Months)</div>
                    <p className="text-sm sm:text-base text-white font-bold leading-relaxed">Extended multi-year capital facility for long-term growth.</p>
                  </div>
                  <div className="p-6 bg-black/90 border-2 border-white/20 rounded-2xl space-y-2">
                    <span className="text-xs sm:text-sm font-mono text-emerald-400 font-black uppercase tracking-wider block">Active Loan Limit</span>
                    <div className="text-2xl sm:text-3xl font-mono font-black text-white">Strict 60-Month Cap</div>
                    <p className="text-sm sm:text-base text-white font-bold leading-relaxed">No loan facility may remain active beyond 5 years.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 3: INTEREST RATE */}
          <div className="p-8 sm:p-12 lg:p-14 rounded-3xl bg-zinc-950/95 border-2 border-white/20 shadow-2xl relative overflow-hidden group hover:border-yellow-500/60 transition-all">
            <div className="flex flex-col sm:flex-row items-start gap-6">
              <div className="p-4 bg-yellow-950/90 border-2 border-yellow-500/60 rounded-2xl text-yellow-400 shrink-0 shadow-[0_0_20px_rgba(234,179,8,0.3)]">
                <Percent className="h-8 w-8 sm:h-9 sm:w-9 stroke-[2.5]" />
              </div>
              <div className="space-y-6 text-left w-full">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="text-xs sm:text-sm font-mono font-black text-yellow-300 uppercase tracking-widest bg-yellow-950/90 px-3 py-1 rounded-lg border border-yellow-500/50">
                    SECTION 03
                  </span>
                  <h2 className="font-display text-2xl sm:text-4xl font-black text-white uppercase tracking-tight">
                    Interest Rate Structure
                  </h2>
                </div>
                <p className="text-base sm:text-xl text-white font-bold sm:font-extrabold leading-relaxed sm:leading-loose">
                  Our interest rates are fixed, predictable, and fully transparent with zero variable floating spikes.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 pt-2">
                  <div className="p-6 sm:p-8 bg-gradient-to-br from-black via-zinc-900 to-black border-2 border-yellow-500/50 rounded-2xl space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <span className="text-xs sm:text-sm font-mono font-black text-yellow-300 uppercase tracking-wider">1 Month to 12 Months</span>
                      <span className="text-3xl sm:text-4xl font-mono font-black text-white bg-yellow-950/90 px-4 py-1.5 rounded-xl border-2 border-yellow-500/60 shadow-[0_0_15px_rgba(234,179,8,0.3)]">15%</span>
                    </div>
                    <h4 className="text-xl sm:text-2xl font-black text-white">Short-Term Loans (Up to 1 Year)</h4>
                    <p className="text-base sm:text-lg text-white font-bold sm:font-extrabold leading-relaxed">
                      If a borrower selects any repayment duration between 1 month and 12 months, the total fixed interest charged on the approved loan principal is exactly <strong className="text-yellow-300 font-black">15%</strong>.
                    </p>
                  </div>

                  <div className="p-6 sm:p-8 bg-gradient-to-br from-black via-zinc-900 to-black border-2 border-yellow-500/50 rounded-2xl space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <span className="text-xs sm:text-sm font-mono font-black text-yellow-300 uppercase tracking-wider">Above 12 Months to 60 Months</span>
                      <span className="text-3xl sm:text-4xl font-mono font-black text-white bg-yellow-950/90 px-4 py-1.5 rounded-xl border-2 border-yellow-500/60 shadow-[0_0_15px_rgba(234,179,8,0.3)]">20%</span>
                    </div>
                    <h4 className="text-xl sm:text-2xl font-black text-white">Long-Term Loans (1 to 5 Years)</h4>
                    <p className="text-base sm:text-lg text-white font-bold sm:font-extrabold leading-relaxed">
                      Loans exceeding 12 months up to the maximum 60-month limit (5 years) carry a fixed <strong className="text-yellow-300 font-black">20%</strong> total interest rate across the entire duration.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 4: ORGANIZATION PROCESSING FEE */}
          <div className="p-8 sm:p-12 lg:p-14 rounded-3xl bg-zinc-950/95 border-2 border-white/20 shadow-2xl relative overflow-hidden group hover:border-blue-500/60 transition-all">
            <div className="flex flex-col sm:flex-row items-start gap-6">
              <div className="p-4 bg-blue-950/90 border-2 border-blue-500/60 rounded-2xl text-blue-400 shrink-0 shadow-[0_0_20px_rgba(59,130,246,0.3)]">
                <Receipt className="h-8 w-8 sm:h-9 sm:w-9 stroke-[2.5]" />
              </div>
              <div className="space-y-6 text-left w-full">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="text-xs sm:text-sm font-mono font-black text-blue-300 uppercase tracking-widest bg-blue-950/90 px-3 py-1 rounded-lg border border-blue-500/50">
                    SECTION 04
                  </span>
                  <h2 className="font-display text-2xl sm:text-4xl font-black text-white uppercase tracking-tight">
                    Organization Processing Fee (3.5%)
                  </h2>
                </div>
                <div className="p-6 sm:p-8 bg-black/90 border-2 border-blue-500/50 rounded-2xl space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b-2 border-white/15 pb-4">
                    <span className="text-xl sm:text-2xl font-black text-white">One-Time Operational Charge</span>
                    <span className="text-3xl sm:text-4xl font-mono font-black text-blue-400">3.5% Fixed</span>
                  </div>
                  <p className="text-base sm:text-xl text-white font-bold sm:font-extrabold leading-relaxed sm:leading-loose">
                    A single, one-time organizational processing fee of <strong className="text-blue-300 font-black">3.5%</strong> is charged on every approved loan principal. This fee covers operational compliance, administrative processing, legal documentation, KYC/AML background verification, treasury liquidity allocation, and digital escrow logistics.
                  </p>
                  <div className="p-4 sm:p-5 bg-blue-950/90 rounded-2xl border-2 border-blue-500/60 text-sm sm:text-base font-mono font-black text-blue-100 leading-relaxed">
                    ℹ️ IMPORTANT NOTE: This 3.5% organization fee is charged only once upon loan approval. It is non-refundable once administrative processing commences.
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 5: 25% REFUNDABLE COLLATERAL (BIGGEST FEATURED CARD) */}
          <div className="p-8 sm:p-12 lg:p-16 rounded-3xl bg-gradient-to-br from-emerald-950/95 via-zinc-950 to-emerald-950/80 border-2 border-emerald-500/80 shadow-[0_0_60px_rgba(52,211,153,0.25)] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/[0.1] rounded-full blur-3xl pointer-events-none" />
            
            <div className="relative space-y-8 text-left">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b-2 border-emerald-500/50 pb-8">
                <div className="flex items-center gap-5">
                  <div className="p-4 sm:p-5 bg-emerald-950/90 border-2 border-emerald-500/80 rounded-2xl text-emerald-400 shadow-[0_0_25px_rgba(52,211,153,0.4)] shrink-0">
                    <Lock className="h-9 w-9 sm:h-10 sm:w-10 stroke-[2.5]" />
                  </div>
                  <div>
                    <span className="text-xs sm:text-sm font-mono font-black text-emerald-300 uppercase tracking-widest bg-emerald-950/90 px-3 py-1 rounded-lg border border-emerald-500/60">
                      SECTION 05 — CORE SECURITY GUARANTEE
                    </span>
                    <h2 className="font-display text-3xl sm:text-5xl lg:text-6xl font-black text-white uppercase tracking-tight mt-2">
                      25% Refundable Collateral Deposit
                    </h2>
                  </div>
                </div>
                <div className="bg-emerald-950/90 border-2 border-emerald-400 px-6 py-4 rounded-2xl text-center shrink-0 shadow-[0_0_25px_rgba(52,211,153,0.3)]">
                  <span className="text-xs font-mono text-emerald-300 uppercase font-black block tracking-wider">Deposit Status</span>
                  <span className="text-2xl sm:text-3xl font-mono font-black text-white">100% REFUNDABLE</span>
                </div>
              </div>

              <div className="space-y-6">
                <h3 className="text-2xl sm:text-3xl font-black text-emerald-300 uppercase font-display">
                  Understand How Your Collateral Works:
                </h3>
                <p className="text-lg sm:text-2xl text-white font-black leading-relaxed">
                  Every approved borrower is required to deposit a <strong className="text-emerald-300 font-black">25% refundable collateral deposit</strong> prior to final loan disbursement.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 pt-2">
                  <div className="p-6 sm:p-8 bg-black/90 border-2 border-emerald-500/50 rounded-2xl space-y-3">
                    <div className="flex items-center gap-2.5 text-emerald-300 font-mono font-black text-base sm:text-lg uppercase">
                      <CheckCircle2 className="h-6 w-6 text-emerald-400 shrink-0 stroke-[2.5]" /> NOT an Additional Fee
                    </div>
                    <p className="text-base sm:text-lg text-zinc-50 font-bold sm:font-extrabold leading-relaxed">
                      Your 25% collateral is <strong className="text-white font-black">NOT</strong> an additional charge or fee. It remains 100% your financial property throughout the lifecycle of the loan agreement.
                    </p>
                  </div>

                  <div className="p-6 sm:p-8 bg-black/90 border-2 border-emerald-500/50 rounded-2xl space-y-3">
                    <div className="flex items-center gap-2.5 text-emerald-300 font-mono font-black text-base sm:text-lg uppercase">
                      <ShieldCheck className="h-6 w-6 text-emerald-400 shrink-0 stroke-[2.5]" /> Risk Reduction & Security
                    </div>
                    <p className="text-base sm:text-lg text-zinc-50 font-bold sm:font-extrabold leading-relaxed">
                      The collateral deposit acts as credit security for the lending process, mitigating counterparty risk and demonstrating borrower commitment to fulfill loan terms.
                    </p>
                  </div>

                  <div className="p-6 sm:p-8 bg-black/90 border-2 border-emerald-500/50 rounded-2xl space-y-3 md:col-span-2">
                    <div className="flex items-center gap-2.5 text-emerald-300 font-mono font-black text-base sm:text-lg uppercase">
                      <Coins className="h-6 w-6 text-emerald-400 shrink-0 stroke-[2.5]" /> 100% Unlocked & Refundable Upon Repayment
                    </div>
                    <p className="text-base sm:text-lg text-zinc-50 font-bold sm:font-extrabold leading-relaxed">
                      Once you fully repay your borrowed loan principal according to the agreement, your collateral is immediately unlocked. You can withdraw <strong className="text-emerald-300 font-black">100% of your collateral deposit</strong> back to your bank account or cryptocurrency wallet without deductions.
                    </p>
                  </div>
                </div>

                {/* Dashboard Status Indicators Box */}
                <div className="p-6 sm:p-8 bg-emerald-950/90 border-2 border-emerald-500/60 rounded-2xl space-y-4">
                  <span className="text-sm sm:text-base font-mono font-black text-emerald-300 uppercase tracking-wider block">
                    📊 Live Dashboard Tracking
                  </span>
                  <p className="text-base sm:text-lg text-white font-bold sm:font-extrabold leading-relaxed">
                    Your collateral balance remains permanently visible in your personal borrower dashboard, marked under protected escrow tags:
                  </p>
                  <div className="flex flex-wrap gap-3 font-mono text-xs sm:text-sm font-black">
                    <span className="px-4 py-2 bg-black border-2 border-emerald-500/60 text-emerald-300 rounded-xl">🔒 "Locked"</span>
                    <span className="px-4 py-2 bg-black border-2 border-cyan-500/60 text-cyan-300 rounded-xl">🛡️ "Protected"</span>
                    <span className="px-4 py-2 bg-black border-2 border-yellow-500/60 text-yellow-300 rounded-xl">💎 "Refundable"</span>
                    <span className="px-4 py-2 bg-black border-2 border-emerald-400 text-emerald-200 rounded-xl">✅ "Available for Withdrawal After Full Loan Repayment"</span>
                  </div>
                </div>

                {/* Legal & Default Policy Explanation */}
                <div className="p-6 bg-black/80 border-2 border-white/15 rounded-2xl space-y-2">
                  <span className="text-xs sm:text-sm font-mono font-black text-zinc-200 uppercase">Risk Management Policy Disclosure</span>
                  <p className="text-sm sm:text-base text-zinc-100 font-bold leading-relaxed">
                    If a borrower defaults and fails to meet agreed repayment obligations, the collateral forms part of the platform's risk management recovery process while legal recovery procedures are initiated in accordance with applicable loan contracts and governing financial laws.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 6: PAYMENT VERIFICATION */}
          <div className="p-8 sm:p-12 lg:p-14 rounded-3xl bg-zinc-950/95 border-2 border-white/20 shadow-2xl relative overflow-hidden group hover:border-cyan-500/60 transition-all">
            <div className="flex flex-col sm:flex-row items-start gap-6">
              <div className="p-4 bg-cyan-950/90 border-2 border-cyan-500/60 rounded-2xl text-cyan-400 shrink-0 shadow-[0_0_20px_rgba(34,211,238,0.3)]">
                <CheckCircle2 className="h-8 w-8 sm:h-9 sm:w-9 stroke-[2.5]" />
              </div>
              <div className="space-y-6 text-left w-full">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="text-xs sm:text-sm font-mono font-black text-cyan-300 uppercase tracking-widest bg-cyan-950/90 px-3 py-1 rounded-lg border border-cyan-500/50">
                    SECTION 06
                  </span>
                  <h2 className="font-display text-2xl sm:text-4xl font-black text-white uppercase tracking-tight">
                    Payment Verification & 24-Hour Release
                  </h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="p-6 bg-black/90 border-2 border-white/20 rounded-2xl space-y-3">
                    <span className="text-base sm:text-lg font-mono text-cyan-400 font-black block">1. Payment Submission</span>
                    <p className="text-base sm:text-lg text-white font-bold leading-relaxed">Whenever a borrower submits proof for collateral or processing fees, it enters instant audit queue.</p>
                  </div>
                  <div className="p-6 bg-black/90 border-2 border-white/20 rounded-2xl space-y-3">
                    <span className="text-base sm:text-lg font-mono text-cyan-400 font-black block">2. Treasury Audit</span>
                    <p className="text-base sm:text-lg text-white font-bold leading-relaxed">Our finance desk verifies the transaction hash or bank confirmation for accuracy.</p>
                  </div>
                  <div className="p-6 bg-black/90 border-2 border-white/20 rounded-2xl space-y-3">
                    <span className="text-base sm:text-lg font-mono text-cyan-400 font-black block">3. 24-Hour Release</span>
                    <p className="text-base sm:text-lg text-white font-bold leading-relaxed">Approved loan capital is released to your destination within 24 hours of verification.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 7: LARGE COLLATERAL PAYMENTS */}
          <div className="p-8 sm:p-12 lg:p-14 rounded-3xl bg-zinc-950/95 border-2 border-white/20 shadow-2xl relative overflow-hidden group hover:border-purple-500/60 transition-all">
            <div className="flex flex-col sm:flex-row items-start gap-6">
              <div className="p-4 bg-purple-950/90 border-2 border-purple-500/60 rounded-2xl text-purple-400 shrink-0 shadow-[0_0_20px_rgba(168,85,247,0.3)]">
                <Layers className="h-8 w-8 sm:h-9 sm:w-9 stroke-[2.5]" />
              </div>
              <div className="space-y-6 text-left w-full">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="text-xs sm:text-sm font-mono font-black text-purple-300 uppercase tracking-widest bg-purple-950/90 px-3 py-1 rounded-lg border border-purple-500/50">
                    SECTION 07
                  </span>
                  <h2 className="font-display text-2xl sm:text-4xl font-black text-white uppercase tracking-tight">
                    Large Collateral Installment Option (4 Equal Payments)
                  </h2>
                </div>
                <p className="text-base sm:text-xl text-white font-bold sm:font-extrabold leading-relaxed sm:leading-loose">
                  For high-value approved corporate loans, the required 25% collateral deposit may represent a large capital sum.
                </p>
                <div className="p-6 sm:p-8 bg-black/90 border-2 border-purple-500/50 rounded-2xl space-y-4">
                  <h4 className="text-xl sm:text-2xl font-black text-white">Four (4) Equal Installments Option:</h4>
                  <p className="text-base sm:text-lg text-white font-bold sm:font-extrabold leading-relaxed sm:leading-loose">
                    If completing the full collateral in one transaction is not feasible, borrowers may pay the collateral in <strong className="text-purple-300 font-black">four equal installments</strong>. Each installment is reviewed and verified individually. Loan disbursement occurs immediately once all four installments have been completed and verified.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 8: PAYMENT METHODS */}
          <div className="p-8 sm:p-12 lg:p-14 rounded-3xl bg-zinc-950/95 border-2 border-white/20 shadow-2xl relative overflow-hidden group hover:border-emerald-500/60 transition-all">
            <div className="flex flex-col sm:flex-row items-start gap-6">
              <div className="p-4 bg-emerald-950/90 border-2 border-emerald-500/60 rounded-2xl text-emerald-400 shrink-0 shadow-[0_0_20px_rgba(52,211,153,0.3)]">
                <CreditCard className="h-8 w-8 sm:h-9 sm:w-9 stroke-[2.5]" />
              </div>
              <div className="space-y-8 text-left w-full">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="text-xs sm:text-sm font-mono font-black text-emerald-300 uppercase tracking-widest bg-emerald-950/90 px-3 py-1 rounded-lg border border-emerald-500/50">
                    SECTION 08
                  </span>
                  <h2 className="font-display text-2xl sm:text-4xl font-black text-white uppercase tracking-tight">
                    Supported Payment Methods
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                  {/* Traditional Category */}
                  <div className="p-6 sm:p-8 bg-black/90 border-2 border-white/20 rounded-2xl space-y-5">
                    <div className="flex items-center gap-3 border-b-2 border-white/15 pb-4">
                      <CreditCard className="h-6 w-6 text-cyan-400 shrink-0 stroke-[2.5]" />
                      <h4 className="text-xl sm:text-2xl font-black text-white">Traditional Banking Methods</h4>
                    </div>
                    <ul className="space-y-3 text-base sm:text-lg font-mono text-white font-bold sm:font-extrabold">
                      <li className="flex items-center gap-2">• Bank Transfer (Domestic SWIFT / ACH / SEPA)</li>
                      <li className="flex items-center gap-2">• Wire Transfer (Institutional Banking)</li>
                      <li className="flex items-center gap-2">• Debit Cards & Credit Cards</li>
                      <li className="flex items-center gap-2">• Apple Pay & Google Pay</li>
                      <li className="flex items-center gap-2">• Visa, Mastercard, American Express</li>
                    </ul>
                  </div>

                  {/* Crypto Category */}
                  <div className="p-6 sm:p-8 bg-black/90 border-2 border-white/20 rounded-2xl space-y-5">
                    <div className="flex items-center gap-3 border-b-2 border-white/15 pb-4">
                      <Wallet className="h-6 w-6 text-emerald-400 shrink-0 stroke-[2.5]" />
                      <h4 className="text-xl sm:text-2xl font-black text-white">Cryptocurrency Payment Networks</h4>
                    </div>
                    <ul className="space-y-3 text-base sm:text-lg font-mono text-white font-bold sm:font-extrabold">
                      <li className="flex items-center gap-2">• USDT (TRC-20, ERC-20, BEP-20 / BSC)</li>
                      <li className="flex items-center gap-2">• Bitcoin (BTC Native Network)</li>
                      <li className="flex items-center gap-2">• Ethereum (ETH Network)</li>
                      <li className="flex items-center gap-2">• Solana (SOL Network) & BNB Chain</li>
                      <li className="flex items-center gap-2">• TRON (TRC-20) & Web3 Smart Contracts</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 9: LOAN REPAYMENT */}
          <div className="p-8 sm:p-12 lg:p-14 rounded-3xl bg-zinc-950/95 border-2 border-white/20 shadow-2xl relative overflow-hidden group hover:border-cyan-500/60 transition-all">
            <div className="flex flex-col sm:flex-row items-start gap-6">
              <div className="p-4 bg-cyan-950/90 border-2 border-cyan-500/60 rounded-2xl text-cyan-400 shrink-0 shadow-[0_0_20px_rgba(34,211,238,0.3)]">
                <RefreshCw className="h-8 w-8 sm:h-9 sm:w-9 stroke-[2.5]" />
              </div>
              <div className="space-y-6 text-left w-full">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="text-xs sm:text-sm font-mono font-black text-cyan-300 uppercase tracking-widest bg-cyan-950/90 px-3 py-1 rounded-lg border border-cyan-500/50">
                    SECTION 09
                  </span>
                  <h2 className="font-display text-2xl sm:text-4xl font-black text-white uppercase tracking-tight">
                    Loan Repayment Procedure
                  </h2>
                </div>
                <p className="text-base sm:text-xl text-white font-bold sm:font-extrabold leading-relaxed sm:leading-loose">
                  Repayments are made seamlessly using supported cryptocurrency or bank wire options. Borrowers can navigate directly to the <strong className="text-cyan-300 font-black">Loan Repayment</strong> tab inside their User Dashboard to complete payments and submit transaction reference proofs. Every repayment is permanently recorded in your personal ledger.
                </p>
              </div>
            </div>
          </div>

          {/* SECTION 10: LOAN DISBURSEMENT WORKFLOW TIMELINE */}
          <div className="p-8 sm:p-12 lg:p-16 rounded-3xl bg-zinc-950/95 border-2 border-white/20 shadow-2xl relative overflow-hidden">
            <div className="space-y-8 text-left">
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-xs sm:text-sm font-mono font-black text-cyan-300 uppercase tracking-widest bg-cyan-950/90 px-3 py-1 rounded-lg border border-cyan-500/50">
                  SECTION 10
                </span>
                <h2 className="font-display text-2xl sm:text-4xl lg:text-5xl font-black text-white uppercase tracking-tight">
                  Complete Funding & Disbursement Workflow
                </h2>
              </div>
              <p className="text-base sm:text-xl text-white font-bold sm:font-extrabold leading-relaxed">
                Step-by-step roadmap from initial application to capital withdrawal:
              </p>

              {/* Timeline Container */}
              <div className="relative border-l-4 border-cyan-500/50 ml-4 sm:ml-6 pl-6 sm:pl-10 space-y-10 pt-2">
                
                {/* Step 1 */}
                <div className="relative group">
                  <div className="absolute -left-[35px] sm:-left-[51px] top-0 h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-cyan-400 text-black font-mono font-black text-sm sm:text-base flex items-center justify-center shadow-[0_0_20px_rgba(34,211,238,0.7)]">1</div>
                  <h4 className="text-xl sm:text-2xl font-black text-white uppercase font-display">1. Loan Application</h4>
                  <p className="text-base sm:text-lg text-white font-bold sm:font-extrabold mt-1 leading-relaxed">Borrower submits funding request with preferred loan amount and repayment term.</p>
                </div>

                {/* Step 2 */}
                <div className="relative group">
                  <div className="absolute -left-[35px] sm:-left-[51px] top-0 h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-cyan-400 text-black font-mono font-black text-sm sm:text-base flex items-center justify-center shadow-[0_0_20px_rgba(34,211,238,0.7)]">2</div>
                  <h4 className="text-xl sm:text-2xl font-black text-white uppercase font-display">2. Team Review</h4>
                  <p className="text-base sm:text-lg text-white font-bold sm:font-extrabold mt-1 leading-relaxed">Credit committee evaluates application details, documentation, and venture profile.</p>
                </div>

                {/* Step 3 */}
                <div className="relative group">
                  <div className="absolute -left-[35px] sm:-left-[51px] top-0 h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-cyan-400 text-black font-mono font-black text-sm sm:text-base flex items-center justify-center shadow-[0_0_20px_rgba(34,211,238,0.7)]">3</div>
                  <h4 className="text-xl sm:text-2xl font-black text-white uppercase font-display">3. Loan Approval</h4>
                  <p className="text-base sm:text-lg text-white font-bold sm:font-extrabold mt-1 leading-relaxed">Application is officially approved and formal term sheet is issued to borrower dashboard.</p>
                </div>

                {/* Step 4 */}
                <div className="relative group">
                  <div className="absolute -left-[35px] sm:-left-[51px] top-0 h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-emerald-400 text-black font-mono font-black text-sm sm:text-base flex items-center justify-center shadow-[0_0_20px_rgba(52,211,153,0.7)]">4</div>
                  <h4 className="text-xl sm:text-2xl font-black text-emerald-400 uppercase font-display">4. Deposit Requirements (Collateral + Fee)</h4>
                  <p className="text-base sm:text-lg text-white font-bold sm:font-extrabold mt-1 leading-relaxed">Borrower completes 25% Refundable Collateral Deposit & 3.5% Organization Processing Fee (or 4 equal installments).</p>
                </div>

                {/* Step 5 */}
                <div className="relative group">
                  <div className="absolute -left-[35px] sm:-left-[51px] top-0 h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-cyan-400 text-black font-mono font-black text-sm sm:text-base flex items-center justify-center shadow-[0_0_20px_rgba(34,211,238,0.7)]">5</div>
                  <h4 className="text-xl sm:text-2xl font-black text-white uppercase font-display">5. Payment Verification</h4>
                  <p className="text-base sm:text-lg text-white font-bold sm:font-extrabold mt-1 leading-relaxed">Finance desk confirms payment reference details and logs collateral escrow in system ledger.</p>
                </div>

                {/* Step 6 */}
                <div className="relative group">
                  <div className="absolute -left-[35px] sm:-left-[51px] top-0 h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-cyan-400 text-black font-mono font-black text-sm sm:text-base flex items-center justify-center shadow-[0_0_20px_rgba(34,211,238,0.7)]">6</div>
                  <h4 className="text-xl sm:text-2xl font-black text-white uppercase font-display">6. Final Authorization</h4>
                  <p className="text-base sm:text-lg text-white font-bold sm:font-extrabold mt-1 leading-relaxed">Senior risk clearance granted for liquidity transfer.</p>
                </div>

                {/* Step 7 */}
                <div className="relative group">
                  <div className="absolute -left-[35px] sm:-left-[51px] top-0 h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-emerald-400 text-black font-mono font-black text-sm sm:text-base flex items-center justify-center shadow-[0_0_20px_rgba(52,211,153,0.7)]">7</div>
                  <h4 className="text-xl sm:text-2xl font-black text-emerald-300 uppercase font-display">7. Loan Capital Disbursement</h4>
                  <p className="text-base sm:text-lg text-white font-bold sm:font-extrabold mt-1 leading-relaxed">Loan capital released within 24 hours to user account or wallet destination.</p>
                </div>

                {/* Step 8 */}
                <div className="relative group">
                  <div className="absolute -left-[35px] sm:-left-[51px] top-0 h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-cyan-400 text-black font-mono font-black text-sm sm:text-base flex items-center justify-center shadow-[0_0_20px_rgba(34,211,238,0.7)]">8</div>
                  <h4 className="text-xl sm:text-2xl font-black text-white uppercase font-display">8. User Dashboard Reflects Active Loan</h4>
                  <p className="text-base sm:text-lg text-white font-bold sm:font-extrabold mt-1 leading-relaxed">Disbursed balance and protected collateral appear live in Borrower Workspace.</p>
                </div>

                {/* Step 9 */}
                <div className="relative group">
                  <div className="absolute -left-[35px] sm:-left-[51px] top-0 h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-cyan-400 text-black font-mono font-black text-sm sm:text-base flex items-center justify-center shadow-[0_0_20px_rgba(34,211,238,0.7)]">9</div>
                  <h4 className="text-xl sm:text-2xl font-black text-cyan-300 uppercase font-display">9. Instant Withdrawal to Bank or Crypto Wallet</h4>
                  <p className="text-base sm:text-lg text-white font-bold sm:font-extrabold mt-1 leading-relaxed">Borrower completes instant withdrawal to personal bank or crypto wallet.</p>
                </div>

              </div>
            </div>
          </div>

          {/* SECTION 11: BORROW RESPONSIBLY NOTICE */}
          <div className="p-8 sm:p-12 rounded-3xl bg-amber-950/95 border-2 border-amber-400 shadow-[0_0_40px_rgba(251,191,36,0.3)] text-left space-y-5">
            <div className="flex items-center gap-4">
              <AlertTriangle className="h-9 w-9 sm:h-10 sm:w-10 text-amber-400 shrink-0 stroke-[2.5]" />
              <div>
                <span className="text-xs sm:text-sm font-mono font-black text-amber-300 uppercase tracking-widest bg-black/80 px-3 py-1 rounded-lg border border-amber-500/50">
                  SECTION 11 — BORROWER RESPONSIBILITY
                </span>
                <h3 className="font-display text-2xl sm:text-4xl font-black text-white uppercase tracking-tight mt-1">
                  Borrow Responsibly
                </h3>
              </div>
            </div>
            <p className="text-base sm:text-xl text-amber-50 font-bold sm:font-extrabold leading-relaxed sm:leading-loose">
              Only apply for a loan facility if you genuinely intend and possess the financial capacity to meet your agreed repayment schedule. Failure to settle loan obligations according to the agreement may result in credit reporting, collection procedures, and legal recovery actions in accordance with applicable financial laws and contract agreements.
            </p>
          </div>

          {/* SECTION 12: TRANSPARENCY PROMISE */}
          <div className="p-8 sm:p-14 lg:p-16 rounded-3xl bg-gradient-to-r from-zinc-950 via-cyan-950/60 to-zinc-950 border-2 border-cyan-500/70 shadow-2xl text-center space-y-8">
            <div className="inline-flex p-5 bg-cyan-950/90 border-2 border-cyan-500/70 rounded-2xl text-cyan-400 shadow-[0_0_25px_rgba(34,211,238,0.3)] mx-auto">
              <Sparkles className="h-9 w-9 sm:h-10 sm:w-10 stroke-[2.5]" />
            </div>
            <div className="space-y-4 max-w-4xl mx-auto">
              <span className="text-xs sm:text-sm font-mono font-black text-cyan-300 uppercase tracking-widest">
                SECTION 12 — OUR ETHICAL CODE
              </span>
              <h3 className="font-display text-3xl sm:text-5xl font-black text-white uppercase tracking-tight">
                Our Transparency Promise
              </h3>
              <p className="text-base sm:text-xl text-white font-bold sm:font-extrabold leading-relaxed sm:leading-loose pt-2">
                We believe every borrower deserves total clarity before signing any financial agreement. Every rate, fee, collateral requirement, and repayment step is fully disclosed on this platform up front. There are zero surprise hidden charges. We encourage every applicant to review these terms carefully before applying.
              </p>
            </div>

            {onApplyClick && (
              <div className="pt-4">
                <button
                  onClick={onApplyClick}
                  className="px-10 py-5 bg-cyan-400 hover:bg-cyan-300 text-black text-sm sm:text-lg font-display font-black uppercase tracking-wider rounded-2xl transition-all shadow-[0_0_35px_rgba(34,211,238,0.5)] hover:scale-105 active:scale-95 cursor-pointer inline-flex items-center gap-3"
                >
                  Apply For Funding Now <ArrowRight className="h-6 w-6 stroke-[3]" />
                </button>
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
