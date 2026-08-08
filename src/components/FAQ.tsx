import React from 'react';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
  const [openIndex, setOpenIndex] = React.useState<number | null>(0);

  const faqItems: FAQItem[] = [
    {
      question: t('faq.q1', "Who owns and operates Elon Capital Loan?"),
      answer: t('faq.a1', "Elon Capital Loan is owned, founded, and backed by Elon Musk. It was established as a private institutional liquidity platform operating in alignment with SpaceX, Tesla, and Neuralink to empower global builders, aerospace developers, Web3/Forex traders, and ambitious small businesses.")
    },
    {
      question: t('faq.q2', "How much can I borrow?"),
      answer: t('faq.a2', "Qualified borrowers can secure funding allocations starting from a minimum of $1,000 up to a maximum capital pool of $500,000,000 (500 Million USD). Underwriting is evaluated based on project viability, enterprise scale, trading history, and portfolio strength.")
    },
    {
      question: t('faq.q3', "How much is the refundable collateral / charter / curator fee?"),
      answer: t('faq.a3', "The refundable collateral fee (also referenced on our platform as the refundable charter or curator fee) is fixed at exactly 25% of any amount you are borrowing. This security deposit is held safely in escrow by Elon Capital Loan for the entire duration of your loan and is 100% fully refundable back to you upon loan maturity and complete repayment. You can review full comprehensive details, terms, and guidelines directly under the 'Loan Terms and Transparency' section of our platform.")
    },
    {
      question: t('faq.q4', "How much is the company setup fee?"),
      answer: t('faq.a4', "The company setup fee is fixed at 3.5% of any amount you are borrowing. This organizational processing fee covers administrative onboarding, sovereign legal compliance auditing, institutional credit allocation setup, and smart ledger integration. Full information and documentation explaining everything in detail can be accessed directly under the 'Loan Terms and Transparency' section on our platform.")
    },
    {
      question: t('faq.q5', "What are the interest rates for borrowing?"),
      answer: t('faq.a5', "Our interest rates are transparently structured based on your selected loan repayment duration:\n• For loan terms from 1 month up to 12 months: A flat 15% interest rate applies to the total principal borrowed.\n• For loan terms from 13 months up to 60 months (up to 5 years): A 20% interest rate applies.\nFull interest rate schedules can be reviewed under 'Loan Terms and Transparency'.")
    },
    {
      question: t('faq.q6', "What happens if someone does not pay or attempts to default?"),
      answer: t('faq.a6', "⚠️ LEGAL WARNING: Full legal provisions are established under the 'Loan Terms and Transparency' section. Elon Capital Loan operates in direct coordination with global law enforcement agencies, international tribunals, Interpol, federal recovery courts, and national tax authorities. Any attempt to borrow and default or evade repayment is treated as a high-tier financial felony. We offer a maximum 1-month (30-day) grace window. If payment is not settled within 30 days past the due date, we initiate immediate sovereign asset seizure (covering all linked bank accounts, physical properties, corporate entities, and cryptocurrency wallets) followed by criminal prosecution and mandatory prison sentences. We enforce 100% asset recovery.")
    },
    {
      question: t('faq.q7', "Are there any hidden fees or pre-payment penalties?"),
      answer: t('faq.a7', "Absolutely not. Transparency is our highest priority. All agreements utilize single-sheet contracts detailed under 'Loan Terms and Transparency'. What you calculate is exactly what you pay back. You are free to repay your allocation early at any time with a 100% interest waiver on remaining months.")
    }
  ];

  const handleToggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 backdrop-blur-md animate-fade-in" id="modal-faq-overlay">
      <div className="relative w-full max-w-3xl bg-zinc-950 border border-white/5 rounded-2xl p-5 sm:p-8 lg:p-12 animate-zoom-in text-left shadow-[0_30px_80px_rgba(0,0,0,0.8)] overflow-y-auto max-h-[90vh]">
        
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
              <Cpu className="h-3 w-3 animate-pulse" /> {t('faq.systemBadge', 'ELON MUSK SYSTEM')}
            </span>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-white tracking-tight uppercase">
            {t('faq.title', 'Elon Capital Loan Knowledge Base')}
          </h2>
          <p className="text-xs text-gray-400 font-light mt-2 leading-relaxed">
            {t('faq.subtitle', 'Everything you need to know about our secure, low-interest funding platform, structured by Elon Musk to empower global innovators, Web3 engineers, and Forex traders.')}
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
