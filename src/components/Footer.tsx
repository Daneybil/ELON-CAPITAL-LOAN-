import React from 'react';
import logoImg from '../assets/images/elon_capital_logo_1785585548636.jpg';

interface FooterProps {
  onNavigateToHome: () => void;
  onOpenModal?: (type: 'privacy' | 'terms' | 'contact') => void;
  onLoanTransparencyClick?: () => void;
  onGovernmentWarningClick?: () => void;
  onSupportClick?: () => void;
}

export default function Footer({ 
  onNavigateToHome, 
  onOpenModal,
  onLoanTransparencyClick,
  onGovernmentWarningClick,
  onSupportClick 
}: FooterProps) {
  const handlePrivacy = () => {
    if (onLoanTransparencyClick) {
      onLoanTransparencyClick();
    } else if (onOpenModal) {
      onOpenModal('privacy');
    }
  };

  const handleTerms = () => {
    if (onGovernmentWarningClick) {
      onGovernmentWarningClick();
    } else if (onLoanTransparencyClick) {
      onLoanTransparencyClick();
    } else if (onOpenModal) {
      onOpenModal('terms');
    }
  };

  const handleSupport = () => {
    if (onSupportClick) {
      onSupportClick();
    } else {
      const el = document.getElementById('contact-section') || document.getElementById('footer-section');
      el?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleContact = () => {
    if (onSupportClick) {
      onSupportClick();
    } else {
      const el = document.getElementById('contact-section') || document.getElementById('footer-section');
      el?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <footer className="bg-black py-10 px-6 border-t border-white/5 select-none" id="footer-section">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-black border border-cyan-400/40 overflow-hidden flex items-center justify-center shrink-0 shadow-[0_0_10px_rgba(6,182,212,0.2)]">
            <img 
              src={logoImg} 
              alt="Elon Capital Logo" 
              onError={(e) => {
                const target = e.currentTarget as HTMLImageElement;
                target.onerror = null;
                target.src = '/elon_capital_logo.jpg';
              }}
              className="h-full w-full object-cover" 
            />
          </div>
          <span 
            onClick={onNavigateToHome}
            className="font-display text-xs font-extrabold tracking-[0.2em] text-white cursor-pointer uppercase hover:text-cyan-400 transition-colors"
          >
            Elon <span className="text-cyan-400 font-light">Capital Loan</span>
          </span>
          <span className="text-gray-800 text-[10px] font-mono">/</span>
          <p className="text-gray-600 text-[10px] font-mono tracking-wider">
            © {new Date().getFullYear()} ELONCAPITALLOAN.SPACE
          </p>
        </div>

        {/* Links */}
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[10px] font-mono uppercase tracking-widest text-gray-500">
          <button 
            onClick={handlePrivacy} 
            className="hover:text-cyan-400 transition-colors cursor-pointer"
          >
            Privacy Policy
          </button>
          <button 
            onClick={handleTerms} 
            className="hover:text-cyan-400 transition-colors cursor-pointer"
          >
            Terms
          </button>
          <button 
            onClick={handleSupport} 
            className="hover:text-cyan-400 transition-colors cursor-pointer"
          >
            Support
          </button>
          <button 
            onClick={handleContact} 
            className="hover:text-cyan-400 transition-colors cursor-pointer"
          >
            Contact
          </button>
        </div>
      </div>
    </footer>
  );
}
