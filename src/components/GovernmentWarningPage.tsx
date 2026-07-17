import React from 'react';
import { ArrowLeft, Scale, ShieldAlert, Check, HelpCircle } from 'lucide-react';

interface GovernmentWarningPageProps {
  onBackToHome: () => void;
}

export default function GovernmentWarningPage({ onBackToHome }: GovernmentWarningPageProps) {
  // Scroll to top on page load
  React.useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <div className="w-full bg-black min-h-screen text-white pt-24 pb-32" id="dedicated-government-warning-view">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Back navigation button */}
        <div className="mb-12 text-left">
          <button
            onClick={onBackToHome}
            className="flex items-center gap-2 text-xs sm:text-sm font-mono font-black uppercase tracking-widest text-red-400 hover:text-red-300 transition-colors cursor-pointer group"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            Back to Home Page
          </button>
        </div>

        {/* Massive Red Warning Header with Icon */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex h-16 w-16 rounded-full bg-red-950/40 border-2 border-red-500/80 items-center justify-center text-red-500 mb-6 animate-pulse shadow-[0_0_25px_rgba(239,68,68,0.5)]">
            <ShieldAlert className="h-8 w-8 stroke-[2.5]" />
          </div>
          
          <span className="font-mono text-xs sm:text-sm uppercase tracking-widest text-red-400 font-black block mb-3">
            INTERNATIONAL ENFORCEMENT & ASSET SEIZURE PROTOCOL
          </span>
          
          <h1 className="font-display text-4xl sm:text-6xl lg:text-7xl font-black text-white uppercase tracking-tight leading-none">
            GLOBAL GOVERNMENT WARNING
          </h1>
          
          <p className="text-red-400 mt-6 text-sm sm:text-lg font-black uppercase tracking-wider leading-relaxed">
            PREVENTATIVE WARNING AGAINST INTENTIONAL NON-PAYMENT, FINTECH DEFAULT & COGNITIVE FRAUD
          </p>
        </div>

        {/* The Warning Panel Content with Super Bold and Thick texts */}
        <div className="relative rounded-3xl border-2 border-red-500/60 bg-gradient-to-b from-red-950/30 via-black to-black p-8 sm:p-14 shadow-[0_25px_80px_rgba(239,68,68,0.2)] overflow-hidden">
          
          {/* Subtle Ambient Red Glow */}
          <div className="absolute -inset-10 bg-red-500/[0.04] rounded-2xl blur-3xl opacity-50 pointer-events-none" />
          
          <div className="relative space-y-10 z-10 text-left font-sans">
            
            <p className="text-sm sm:text-lg text-zinc-100 font-black leading-relaxed uppercase tracking-wide">
              Elon Capital Loan is a highly regulated, internationally aligned sovereign liquidity vehicle. We work in direct coordination with global central banking associations, national tax agencies (IRS, HMRC, ATO, etc.), Interpol, federal recovery courts, and international asset tracing tribunals. 
            </p>

            <div className="border-t border-red-500/20 my-8" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              
              {/* Left warning bullet */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Scale className="h-6 w-6 text-red-500" />
                  <h4 className="text-base sm:text-lg font-black text-white uppercase tracking-wide">
                    ASSET SEIZURE & SYSTEM COMPLIANCE
                  </h4>
                </div>
                <p className="text-xs sm:text-sm text-zinc-200 font-black leading-relaxed uppercase tracking-wide">
                  Any individual, developer, or business entity that attempts to secure funds from this platform with the intent to default, escape, or hide assets will be met with immediate, absolute worldwide recovery actions. This includes the legal freezing and seizure of all local bank accounts, real estate holdings, vehicle titles, corporate holdings, and physical assets in any of your home countries.
                </p>
              </div>

              {/* Right warning bullet */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="h-6 w-6 text-red-500" />
                  <h4 className="text-base sm:text-lg font-black text-white uppercase tracking-wide">
                    LEDGER & CRYPTO RECOVERY
                  </h4>
                </div>
                <p className="text-xs sm:text-sm text-zinc-200 font-black leading-relaxed uppercase tracking-wide">
                  Our advanced smart contract ledgers track transactions on-chain. If necessary, our partner government agencies will seize and lock connected digital wallets, cold storage ledger hardware, intellectual property domains, active servers, and decentralized assets until full restitution is settled in court.
                </p>
              </div>

            </div>

            <div className="border-t border-red-500/20 my-8" />

            <div className="bg-red-950/30 border-2 border-red-500/40 rounded-2xl p-6 sm:p-10 space-y-6">
              <h4 className="text-base sm:text-lg font-black text-red-400 uppercase tracking-widest text-center flex items-center justify-center gap-2">
                ⚠️ THE CRITICAL COMPLIANCE DIRECTIVE
              </h4>
              <p className="text-xs sm:text-sm text-zinc-100 font-black text-center leading-relaxed uppercase tracking-wider">
                Our approach is simple: BORROW TO INVEST AND PAY BACK. If you know you cannot or do not intend to repay, do not apply. Intentionally borrowing and running away is a felony crime. You will lose everything you have worked for all your life. Borrow responsibly, build successfully, and return the capital according to your contract parameters.
              </p>
            </div>

            {/* Back action inside warning */}
            <div className="text-center pt-6">
              <button
                onClick={onBackToHome}
                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-red-950/40 border border-red-500/30 text-xs sm:text-sm text-red-400 hover:bg-red-900/20 transition-all font-mono uppercase font-black cursor-pointer"
              >
                <ArrowLeft className="h-4 w-4" />
                I Understand, Return to main site
              </button>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
