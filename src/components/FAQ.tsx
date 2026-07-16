import React from 'react';
import { HelpCircle, ChevronDown, ChevronUp, X, Sparkles, Shield, Cpu } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function FAQ({ isOpen = false, onClose }: FAQProps) {
  const [openIndex, setOpenIndex] = React.useState<number | null>(0);

  const faqItems: FAQItem[] = [
    {
      question: "Who owns and operates Elon Capital Loan?",
      answer: "Elon Capital Loan is owned, founded, and backed by Elon Musk. It was established as a private institutional liquidity platform to disrupt traditional banking gatekeeping and empower ambitious humanity-first builders—from sole entrepreneurs starting with zero, to Web3/Forex traders, to scaling aerospace and artificial intelligence companies."
    },
    {
      question: "What is the primary mission of the Elon Capital Loan platform?",
      answer: "Traditional commercial banks fail to support builders who are starting from nothing or operating in advanced fields like decentralized finance (DeFi), algorithmic Forex trading, or Web3. Our mission is to democratize capital allocation, dispatching quick, low-interest, and non-dilutive liquidity directly to tomorrow's visionary leaders."
    },
    {
      question: "What are the fees, rates, and terms involved?",
      answer: "We offer completely transparent, fixed pricing with zero compounding traps: (1) Collateral Fee: A refundable 25% collateral fee is required, which is fully returned back to you as soon as the loan is successfully repaid. (2) Company Fee: A simple 3.5% company service fee is charged for processing. (3) Annual Interest Rate: If you borrow for a duration of under 1 year (12 months or less), your interest rate is a fixed 15%. For any duration greater than 1 year (up to 4 years / 48 months or more), the interest rate is a fixed 25%."
    },
    {
      question: "How does the platform cater to Forex and Cryptocurrency traders?",
      answer: "Unlike standard credit institutions that view digital assets with suspicion, Elon Capital Loan has integrated native Web3 wallets and Forex portfolio auditing tools. We evaluate trading history, smart contract code, or quantitative yield metrics to underwrite custom liquidity lines instantly."
    },
    {
      question: "How does the 'Enhanced Verification' process work?",
      answer: "Allocations exceeding $5,000,000 are subject to automated Enhanced Verification. This process does not involve tedious manual bank bureaucracy; instead, our high-performance ledger validates portfolio coordinates or corporate revenue in minutes, backed by Elon Musk's private capital treasury."
    },
    {
      question: "Are there any hidden fees or pre-payment penalties?",
      answer: "Absolutely not. Transparency is our highest priority. All agreements utilize a plain-English single-sheet contract. What you calculate is exactly what you pay back. You are free to repay your allocation early at any time with a 100% interest waiver on the remaining months."
    }
  ];

  const handleToggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 backdrop-blur-md animate-fade-in" id="modal-faq-overlay">
      <div className="relative w-full max-w-3xl bg-zinc-950 border border-white/5 rounded-2xl p-8 sm:p-12 animate-zoom-in text-left shadow-[0_30px_80px_rgba(0,0,0,0.8)] overflow-y-auto max-h-[90vh]">
        
        {/* Close Button */}
        {onClose && (
          <button 
            onClick={onClose}
            className="absolute top-6 right-6 p-2 text-gray-500 hover:text-white hover:bg-white/5 rounded-lg transition-all cursor-pointer"
            id="btn-faq-close"
          >
            <X className="h-5 w-5" />
          </button>
        )}

        {/* Header Block */}
        <div className="text-center sm:text-left mb-10 pb-6 border-b border-white/5">
          <div className="flex items-center gap-3 mb-4 justify-center sm:justify-start">
            <span className="px-3 py-1 text-[9px] font-mono font-bold uppercase tracking-widest text-cyan-400 bg-cyan-950/40 border border-cyan-500/20 rounded-full flex items-center gap-1.5">
              <Cpu className="h-3 w-3 animate-pulse" /> ELON MUSK SYSTEM
            </span>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-white tracking-tight uppercase">
            Elon Capital Loan Knowledge Base
          </h2>
          <p className="text-xs text-gray-400 font-light mt-2 leading-relaxed">
            Everything you need to know about our secure, low-interest funding platform, structured by Elon Musk to empower global innovators, Web3 engineers, and Forex traders.
          </p>
        </div>

        {/* Accordion List */}
        <div className="space-y-4" id="faq-accordion-list">
          {faqItems.map((item, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div 
                key={idx}
                className={`border rounded-xl transition-all duration-300 bg-white/[0.01] ${
                  isOpen ? 'border-cyan-500/30 shadow-[0_0_20px_rgba(6,182,212,0.05)] bg-white/[0.02]' : 'border-white/5 hover:border-white/10'
                }`}
                id={`faq-item-${idx}`}
              >
                <button
                  onClick={() => handleToggle(idx)}
                  className="w-full flex items-center justify-between p-5 text-left cursor-pointer focus:outline-none"
                  id={`btn-faq-toggle-${idx}`}
                >
                  <span className="font-display text-sm sm:text-base font-medium text-white pr-4">
                    {item.question}
                  </span>
                  {isOpen ? (
                    <ChevronUp className="h-4 w-4 text-cyan-400 flex-shrink-0" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-gray-500 flex-shrink-0" />
                  )}
                </button>
                
                {/* Accordion body */}
                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-gray-400 font-light leading-relaxed border-t border-white/5">
                    {item.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footnote stating ownership explicitly */}
        <div className="mt-8 pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px] font-mono text-gray-500 uppercase tracking-widest">
          <span className="flex items-center gap-1.5">
            <Shield className="h-3 w-3 text-cyan-400" /> SECURE DECENTRALIZED PROTOCOL
          </span>
          <span>© {new Date().getFullYear()} ELON CAPITAL LOAN VENTURES</span>
        </div>

      </div>
    </div>
  );
}
