import React from 'react';
import { ArrowLeft, ArrowRight, Check, Info, ShieldAlert } from 'lucide-react';
import GovernmentWarning from './GovernmentWarning';

interface HowItWorksPageProps {
  onBackToHome: () => void;
  onCalculatorClick: () => void;
}

export default function HowItWorksPage({ onBackToHome, onCalculatorClick }: HowItWorksPageProps) {
  // Scroll to top on page load
  React.useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <div className="w-full bg-black min-h-screen text-white pt-24 pb-32" id="dedicated-how-it-works-view">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Back navigation button */}
        <div className="mb-12 text-left">
          <button
            onClick={onBackToHome}
            className="flex items-center gap-2 text-xs sm:text-sm font-mono font-black uppercase tracking-widest text-cyan-400 hover:text-cyan-300 transition-colors cursor-pointer group"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            Back to Home Page
          </button>
        </div>

        {/* Header Title Section */}
        <div className="text-center max-w-4xl mx-auto mb-20">
          <span className="font-mono text-xs sm:text-sm uppercase tracking-widest text-blue-400 font-black block mb-3">
            Sovereign Funding Operations
          </span>
          <h1 className="font-display text-4xl sm:text-6xl lg:text-7xl font-black text-white uppercase tracking-tight leading-none mb-6">
            HOW ELON CAPITAL LOAN WORKS
          </h1>
          <p className="text-zinc-200 mt-4 text-sm sm:text-xl font-extrabold uppercase tracking-wide max-w-2xl mx-auto">
            A simple, highly structured, transparent process from application to rapid funding.
          </p>
        </div>

        {/* 6-Step timeline flow with thick, bold texts */}
        <div className="relative border-l-2 border-zinc-800 ml-4 sm:ml-12 pl-8 sm:pl-16 space-y-16 sm:space-y-24 max-w-4xl mx-auto text-left">
          
          {/* Step 1 */}
          <div className="relative group/step">
            <div className="absolute -left-[41px] sm:-left-[73px] top-2 h-4 w-4 rounded-full bg-black border-2 border-blue-500 flex items-center justify-center z-10 transition-all duration-300 group-hover/step:border-blue-400 group-hover/step:shadow-[0_0_15px_rgba(59,130,246,0.8)]">
              <div className="h-1 w-1 rounded-full bg-blue-500" />
            </div>
            
            <div className="flex flex-col sm:flex-row sm:items-start gap-4 sm:gap-8">
              <span className="font-sans font-black text-5xl sm:text-6xl text-blue-500 tracking-tighter leading-none shrink-0 select-none">
                01
              </span>
              <div className="space-y-1.5">
                <h3 className="text-xl sm:text-2xl font-black text-white tracking-wide uppercase font-display">
                  Create Your Account
                </h3>
                <p className="text-sm sm:text-base text-zinc-100 font-bold leading-relaxed">
                  Register using your email address and complete your personal or business profile.
                </p>
              </div>
            </div>
          </div>

          {/* Step 2 */}
          <div className="relative group/step">
            <div className="absolute -left-[41px] sm:-left-[73px] top-2 h-4 w-4 rounded-full bg-black border-2 border-blue-500 flex items-center justify-center z-10 transition-all duration-300 group-hover/step:border-blue-400 group-hover/step:shadow-[0_0_15px_rgba(59,130,246,0.8)]">
              <div className="h-1 w-1 rounded-full bg-blue-500" />
            </div>
            
            <div className="flex flex-col sm:flex-row sm:items-start gap-4 sm:gap-8">
              <span className="font-sans font-black text-5xl sm:text-6xl text-blue-500 tracking-tighter leading-none shrink-0 select-none">
                02
              </span>
              <div className="space-y-1.5">
                <h3 className="text-xl sm:text-2xl font-black text-white tracking-wide uppercase font-display">
                  Complete Identity Verification
                </h3>
                <p className="text-sm sm:text-base text-zinc-100 font-bold leading-relaxed">
                  Upload the required identification documents for review.
                </p>
              </div>
            </div>
          </div>

          {/* Step 3 */}
          <div className="relative group/step">
            <div className="absolute -left-[41px] sm:-left-[73px] top-2 h-4 w-4 rounded-full bg-black border-2 border-blue-500 flex items-center justify-center z-10 transition-all duration-300 group-hover/step:border-blue-400 group-hover/step:shadow-[0_0_15px_rgba(59,130,246,0.8)]">
              <div className="h-1 w-1 rounded-full bg-blue-500" />
            </div>
            
            <div className="flex flex-col sm:flex-row sm:items-start gap-4 sm:gap-8">
              <span className="font-sans font-black text-5xl sm:text-6xl text-blue-500 tracking-tighter leading-none shrink-0 select-none">
                03
              </span>
              <div className="space-y-1.5">
                <h3 className="text-xl sm:text-2xl font-black text-white tracking-wide uppercase font-display">
                  Submit Your Funding Request
                </h3>
                <p className="text-sm sm:text-base text-zinc-100 font-bold leading-relaxed">
                  Choose the amount you need and provide details about your business, project, or funding purpose.
                </p>
              </div>
            </div>
          </div>

          {/* Step 4 */}
          <div className="relative group/step">
            <div className="absolute -left-[41px] sm:-left-[73px] top-2 h-4 w-4 rounded-full bg-black border-2 border-blue-500 flex items-center justify-center z-10 transition-all duration-300 group-hover/step:border-blue-400 group-hover/step:shadow-[0_0_15px_rgba(59,130,246,0.8)]">
              <div className="h-1 w-1 rounded-full bg-blue-500" />
            </div>
            
            <div className="flex flex-col sm:flex-row sm:items-start gap-4 sm:gap-8">
              <span className="font-sans font-black text-5xl sm:text-6xl text-blue-500 tracking-tighter leading-none shrink-0 select-none">
                04
              </span>
              <div className="space-y-1.5">
                <h3 className="text-xl sm:text-2xl font-black text-white tracking-wide uppercase font-display">
                  Application Review
                </h3>
                <p className="text-sm sm:text-base text-zinc-100 font-bold leading-relaxed">
                  Our team reviews the application and may request additional supporting documents when necessary.
                </p>
              </div>
            </div>
          </div>

          {/* Step 5 */}
          <div className="relative group/step">
            <div className="absolute -left-[41px] sm:-left-[73px] top-2 h-4 w-4 rounded-full bg-black border-2 border-blue-500 flex items-center justify-center z-10 transition-all duration-300 group-hover/step:border-blue-400 group-hover/step:shadow-[0_0_15px_rgba(59,130,246,0.8)]">
              <div className="h-1 w-1 rounded-full bg-blue-500" />
            </div>
            
            <div className="flex flex-col sm:flex-row sm:items-start gap-4 sm:gap-8">
              <span className="font-sans font-black text-5xl sm:text-6xl text-blue-500 tracking-tighter leading-none shrink-0 select-none">
                05
              </span>
              <div className="space-y-1.5">
                <h3 className="text-xl sm:text-2xl font-black text-white tracking-wide uppercase font-display">
                  Funding Decision
                </h3>
                <p className="text-sm sm:text-base text-zinc-100 font-bold leading-relaxed">
                  Once approved, you will receive a notification in your dashboard with the next steps.
                </p>
              </div>
            </div>
          </div>

          {/* Step 6 */}
          <div className="relative group/step">
            <div className="absolute -left-[41px] sm:-left-[73px] top-2 h-4 w-4 rounded-full bg-black border-2 border-blue-500 flex items-center justify-center z-10 transition-all duration-300 group-hover/step:border-blue-400 group-hover/step:shadow-[0_0_15px_rgba(59,130,246,0.8)]">
              <div className="h-1 w-1 rounded-full bg-blue-500" />
            </div>
            
            <div className="flex flex-col sm:flex-row sm:items-start gap-4 sm:gap-8">
              <span className="font-sans font-black text-5xl sm:text-6xl text-blue-500 tracking-tighter leading-none shrink-0 select-none">
                06
              </span>
              <div className="space-y-1.5">
                <h3 className="text-xl sm:text-2xl font-black text-white tracking-wide uppercase font-display">
                  Receive Your Funds
                </h3>
                <p className="text-sm sm:text-base text-zinc-100 font-bold leading-relaxed">
                  After all required verification and agreement steps are completed, approved funds become available through your account.
                </p>
              </div>
            </div>
          </div>

        </div>

        {/* Separate Premium Information Card */}
        <div className="max-w-4xl mx-auto mt-24 px-4">
          <div className="relative rounded-2xl border border-blue-500/30 bg-zinc-950/60 p-8 sm:p-10 shadow-[0_25px_60px_rgba(0,0,0,0.85)] overflow-hidden group hover:border-blue-500/50 transition-all duration-500">
            <div className="absolute -inset-10 bg-gradient-to-r from-blue-500/5 to-transparent rounded-2xl blur-3xl opacity-50 pointer-events-none" />
            
            <div className="relative flex flex-col md:flex-row items-start gap-6 z-10">
              <div className="h-12 w-12 rounded-xl bg-blue-950/40 border border-blue-500/40 flex items-center justify-center shrink-0 mt-1">
                <Info className="h-6 w-6 text-blue-500" />
              </div>
              <div className="text-left space-y-3">
                <h4 className="font-display text-xl sm:text-2xl font-black text-white uppercase tracking-wide">
                  Need Larger Funding?
                </h4>
                <p className="text-sm sm:text-base text-zinc-100 font-bold leading-relaxed">
                  Funding requests above the standard limit may require enhanced verification. Depending on the application, this may include additional business documents, corporate records, financial statements, legal documentation, and other supporting information.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Government Warning Block directly built-in */}
        <div className="mt-24">
          <GovernmentWarning />
        </div>

        {/* Why Businesses Choose ELON CAPITAL LOAN */}
        <div className="max-w-5xl mx-auto mt-24 px-4">
          <h3 className="font-display text-2xl sm:text-3xl font-black text-white text-center uppercase tracking-wider mb-12">
            Why Businesses Choose ELON CAPITAL LOAN
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {[
              "Built for entrepreneurs",
              "Designed for startups",
              "Supports business expansion",
              "Funding for innovation",
              "Transparent application process",
              "Dedicated support throughout your application"
            ].map((benefit, idx) => (
              <div key={idx} className="flex items-start gap-4 bg-zinc-950/40 border border-white/5 rounded-xl p-5 hover:border-blue-500/20 hover:bg-zinc-950/80 transition-all duration-300 text-left">
                <div className="h-6 w-6 rounded-full bg-blue-950/30 border border-blue-500/30 flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="h-3.5 w-3.5 text-blue-500 stroke-[3]" />
                </div>
                <span className="text-sm sm:text-base font-black text-white tracking-wide uppercase">
                  {benefit}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Centered Large Premium Call-To-Action Button */}
        <div className="flex justify-center mt-24">
          <button
            onClick={onCalculatorClick}
            className="relative group rounded-2xl bg-blue-800 p-[1.5px] transition-transform duration-200 active:scale-95 cursor-pointer block"
            id="btn-howitworks-dedicated-eligibility"
          >
            <span className="absolute inset-0 rounded-2xl bg-blue-900 translate-y-2 block"></span>
            <span className="relative flex items-center justify-center gap-3 px-16 py-5 rounded-2xl bg-blue-600 text-white text-xs sm:text-sm font-black uppercase tracking-widest -translate-y-2 group-hover:-translate-y-1 group-active:translate-y-0 transition-all duration-150 shadow-[0_8px_30px_rgba(59,130,246,0.35)] border border-blue-400 font-display">
              Check Your Eligibility
              <ArrowRight className="h-5 w-5 text-white stroke-[2.5]" />
            </span>
          </button>
        </div>

      </div>
    </div>
  );
}
