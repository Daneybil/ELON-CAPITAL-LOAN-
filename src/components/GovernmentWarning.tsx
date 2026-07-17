import React from 'react';
import { ShieldAlert, Scale, HelpCircle, Check, Info } from 'lucide-react';

export default function GovernmentWarning() {
  return (
    <div className="w-full bg-black py-20 border-t border-b border-red-500/10" id="government-warning-section">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Massive Red Warning Header with Icon */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex h-14 w-14 rounded-full bg-red-950/40 border-2 border-red-500/80 items-center justify-center text-red-500 mb-6 animate-pulse shadow-[0_0_20px_rgba(239,68,68,0.4)]">
            <ShieldAlert className="h-7 w-7 stroke-[2.5]" />
          </div>
          
          <span className="font-mono text-xs uppercase tracking-widest text-red-400 font-black block mb-3">
            INTERNATIONAL ENFORCEMENT & ASSET SEIZURE PROTOCOL
          </span>
          
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-black text-white uppercase tracking-tight leading-none">
            GLOBAL GOVERNMENT WARNING
          </h2>
          
          <p className="text-red-400 mt-4 text-sm sm:text-base font-extrabold uppercase tracking-wider">
            PREVENTATIVE WARNING AGAINST INTENTIONAL NON-PAYMENT & FINANCIAL FRAUD
          </p>
        </div>

        {/* The Warning Panel Content with Super Bold and Thick texts */}
        <div className="relative rounded-2xl border-2 border-red-500/60 bg-gradient-to-b from-red-950/20 to-black p-8 sm:p-12 shadow-[0_20px_60px_rgba(239,68,68,0.15)] overflow-hidden">
          
          {/* Subtle Ambient Red Glow */}
          <div className="absolute -inset-10 bg-red-500/[0.03] rounded-2xl blur-3xl opacity-50 pointer-events-none" />
          
          <div className="relative space-y-8 z-10 text-left">
            
            <p className="text-sm sm:text-base text-zinc-100 font-extrabold leading-relaxed uppercase tracking-wide">
              Elon Capital Loan is a highly regulated, internationally aligned sovereign liquidity vehicle. We work in direct coordination with global central banking associations, national tax agencies, Interpol, federal recovery courts, and international asset tracing tribunals. 
            </p>

            <div className="border-t border-red-500/20 my-6" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              {/* Left warning bullet */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Scale className="h-5 w-5 text-red-500" />
                  <h4 className="text-sm sm:text-base font-black text-white uppercase tracking-wide">
                    ASSET SEIZURE & SYSTEM COMPLIANCE
                  </h4>
                </div>
                <p className="text-xs sm:text-sm text-zinc-200 font-black leading-relaxed uppercase">
                  Any individual, developer, or business entity that attempts to secure funds from this platform with the intent to default, escape, or hide assets will be met with immediate, absolute worldwide recovery actions. This includes the legal freezing and seizure of all local bank accounts, real estate holdings, vehicle titles, corporate holdings, and physical assets.
                </p>
              </div>

              {/* Right warning bullet */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="h-5 w-5 text-red-500" />
                  <h4 className="text-sm sm:text-base font-black text-white uppercase tracking-wide">
                    LEDGER & CRYPTO RECOVERY
                  </h4>
                </div>
                <p className="text-xs sm:text-sm text-zinc-200 font-black leading-relaxed uppercase">
                  Our advanced smart contract ledgers track transactions on-chain. If necessary, our partner government agencies will seize and lock connected digital wallets, cold storage ledger hardware, intellectual property domains, active servers, and decentralized assets until full restitution is settled.
                </p>
              </div>

            </div>

            <div className="border-t border-red-500/20 my-6" />

            <div className="bg-red-950/20 border border-red-500/30 rounded-xl p-6 sm:p-8 space-y-4">
              <h4 className="text-sm sm:text-base font-black text-red-400 uppercase tracking-widest text-center">
                ⚠️ THE CRITICAL COMPLIANCE DIRECTIVE
              </h4>
              <p className="text-xs sm:text-sm text-zinc-100 font-black text-center leading-relaxed uppercase tracking-wide">
                Our approach is simple: BORROW TO INVEST AND PAY BACK. If you know you cannot or do not intend to repay, do not apply. Intentionally borrowing and running away is a felony crime. You will lose everything you have worked for all your life. Borrow responsibly, build successfully, and return the capital according to your contract parameters.
              </p>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
