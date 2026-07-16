import React from 'react';

interface FooterProps {
  onNavigateToHome: () => void;
  onOpenModal?: (type: 'privacy' | 'terms' | 'contact') => void;
}

export default function Footer({ onNavigateToHome, onOpenModal }: FooterProps) {
  return (
    <footer className="bg-black py-10 px-6 border-t border-white/5 select-none" id="footer-section">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-2">
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
            onClick={() => onOpenModal?.('privacy')} 
            className="hover:text-white transition-colors cursor-pointer"
          >
            Privacy Policy
          </button>
          <button 
            onClick={() => onOpenModal?.('terms')} 
            className="hover:text-white transition-colors cursor-pointer"
          >
            Terms
          </button>
          <button 
            onClick={() => {
              const el = document.getElementById('contact-section') || document.getElementById('footer-section');
              el?.scrollIntoView({ behavior: 'smooth' });
            }} 
            className="hover:text-white transition-colors cursor-pointer"
          >
            Support
          </button>
          <button 
            onClick={() => {
              const el = document.getElementById('contact-section') || document.getElementById('footer-section');
              el?.scrollIntoView({ behavior: 'smooth' });
            }} 
            className="hover:text-white transition-colors cursor-pointer"
          >
            Contact
          </button>
        </div>
      </div>
    </footer>
  );
}
