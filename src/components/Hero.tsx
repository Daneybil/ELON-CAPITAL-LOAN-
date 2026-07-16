import React from 'react';
import { 
  ArrowRight, 
  ChevronRight, 
  Menu, 
  X, 
  HelpCircle, 
  Check, 
  DollarSign, 
  Clock, 
  ShieldCheck, 
  Percent,
  Calendar,
  Info,
  Instagram
} from 'lucide-react';
import { HomePageContent } from '../types';
import Testimonials from './Testimonials';
import FAQ from './FAQ';
import HelloSection from './HelloSection';

interface HeroProps {
  content: HomePageContent;
  onApplyClick: () => void;
  onOpenAuth?: (mode: 'login' | 'register') => void;
  onNavigateToDashboard?: () => void;
  onSupportClick?: () => void;
  onCalculatorClick?: () => void;
}

export default function Hero({ 
  content, 
  onApplyClick, 
  onOpenAuth, 
  onNavigateToDashboard,
  onSupportClick,
  onCalculatorClick
}: HeroProps) {
  // Modal / Drawer states
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [howItWorksOpen, setHowItWorksOpen] = React.useState(false);
  const [faqOpen, setFaqOpen] = React.useState(false);
  const [legalModal, setLegalModal] = React.useState<'privacy' | 'terms' | null>(null);

  // Smooth scroll handler
  const scrollToSection = (id: string) => {
    setMenuOpen(false);
    setTimeout(() => {
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  return (
    <div className="relative min-h-screen bg-black text-white selection:bg-cyan-500/30 selection:text-cyan-200" id="homepage-container">
      
      {/* Background glow effects */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-cyan-500/[0.02] rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute top-1/2 right-1/4 w-[500px] h-[500px] bg-white/[0.01] rounded-full blur-[130px] pointer-events-none" />

      {/* ----------------- 1. HERO SECTION ----------------- */}
      <div className="max-w-5xl mx-auto text-center px-6 pt-24 pb-16 lg:pt-32 lg:pb-20 select-none animate-fade-in">
        
        {/* Very large, bold, matched headline */}
        <h1 className="font-display text-6xl sm:text-8xl lg:text-[110px] font-black tracking-tight text-white uppercase mb-10 leading-[0.95] space-y-4" id="hero-title">
          <span className="block drop-shadow-[0_4px_20px_rgba(255,255,255,0.05)]">Build Bigger.</span>
          <span className="block drop-shadow-[0_4px_20px_rgba(255,255,255,0.05)]">Grow Faster.</span>
          <span className="text-cyan-400 block drop-shadow-[0_4px_25px_rgba(34,211,238,0.15)] text-4xl sm:text-6xl lg:text-[85px] tracking-tight leading-[0.95] font-black">
            Borrow from $1,000 to $500,000,000
          </span>
          <span className="text-white font-extrabold text-xs sm:text-sm tracking-[0.25em] uppercase block mt-10 max-w-2xl mx-auto leading-relaxed border-t border-white/10 pt-6">
            NEW ERA HAS BEGUN BRING YOUR DREAM TO LIFE
          </span>
        </h1>

        {/* Professional, comprehensive, targeted tagline */}
        <p className="text-base sm:text-lg text-white font-semibold leading-relaxed max-w-4xl mx-auto mb-16 tracking-wide text-center bg-white/[0.02] border border-white/5 rounded-2xl p-6 sm:p-8 shadow-[0_4px_30px_rgba(0,0,0,0.4)]" id="hero-desc">
          Elon Capital Loan is engineered because traditional bank gatekeepers refuse to support the dreamers of tomorrow. Whether you are an ambitious builder starting with <strong className="text-cyan-400 font-extrabold">zero initial capital</strong>, a high-growth startup, an independent entrepreneur, a cryptocurrency trader seeking leverage, a Web3 developer, a Forex specialist, or an expanding small business—this platform was built for you. We eliminate archaic financial barriers to dispatch instant liquidity, transforming your vision into actionable reality.
        </p>

        {/* 5 PREMIUM GIANT HERO ACTIONS IN CLASSICAL 3D FORM */}
        <div className="flex flex-wrap items-center justify-center gap-6 max-w-5xl mx-auto mb-16" id="hero-buttons">
          {/* Button 1: Apply for Funding */}
          <button
            onClick={onApplyClick}
            className="relative group rounded-2xl bg-cyan-800 p-[1.5px] transition-transform duration-200 active:scale-95 cursor-pointer"
            id="btn-hero-apply"
          >
            <span className="absolute inset-0 rounded-2xl bg-cyan-900/90 translate-y-2 block"></span>
            <span className="relative flex items-center justify-center gap-2.5 px-12 py-6 rounded-2xl bg-cyan-400 text-black text-xs sm:text-sm font-black uppercase tracking-widest -translate-y-2 group-hover:-translate-y-1 group-active:translate-y-0 transition-all duration-150 shadow-[0_8px_20px_rgba(34,211,238,0.25)] border border-cyan-500/35 font-display">
              Apply for Funding
              <ArrowRight className="h-4.5 w-4.5 text-black stroke-[3]" />
            </span>
          </button>

          {/* Button 2: Get Started */}
          <button
            onClick={() => onOpenAuth?.('register')}
            className="relative group rounded-2xl bg-blue-800 p-[1.5px] transition-transform duration-200 active:scale-95 cursor-pointer"
            id="btn-hero-start"
          >
            <span className="absolute inset-0 rounded-2xl bg-blue-900 translate-y-2 block"></span>
            <span className="relative flex items-center justify-center gap-2 px-12 py-6 rounded-2xl bg-white text-black text-xs sm:text-sm font-black uppercase tracking-widest -translate-y-2 group-hover:-translate-y-1 group-active:translate-y-0 transition-all duration-150 shadow-[0_8px_20px_rgba(255,255,255,0.1)] border-2 border-blue-500 font-display">
              Get Started
            </span>
          </button>

          {/* Button 3: How It Works */}
          <button
            onClick={() => setHowItWorksOpen(true)}
            className="relative group rounded-2xl bg-blue-900 p-[1.5px] transition-transform duration-200 active:scale-95 cursor-pointer"
            id="btn-hero-how"
          >
            <span className="absolute inset-0 rounded-2xl bg-blue-950 translate-y-2 block"></span>
            <span className="relative flex items-center justify-center gap-2 px-12 py-6 rounded-2xl bg-blue-600 text-white text-xs sm:text-sm font-black uppercase tracking-widest -translate-y-2 group-hover:-translate-y-1 group-active:translate-y-0 transition-all duration-150 border-2 border-blue-400 font-display">
              How It Works
            </span>
          </button>

          {/* Button 4: FAQ */}
          <button
            onClick={() => setFaqOpen(true)}
            className="relative group rounded-2xl bg-blue-800 p-[1.5px] transition-transform duration-200 active:scale-95 cursor-pointer"
            id="btn-hero-faq"
          >
            <span className="absolute inset-0 rounded-2xl bg-blue-900 translate-y-2 block"></span>
            <span className="relative flex items-center justify-center gap-2 px-12 py-6 rounded-2xl bg-white text-black hover:text-cyan-400 text-xs sm:text-sm font-black uppercase tracking-widest -translate-y-2 group-hover:-translate-y-1 group-active:translate-y-0 transition-all duration-150 shadow-[0_8px_20px_rgba(255,255,255,0.05)] border-2 border-blue-500 font-display">
              FAQ
            </span>
          </button>

          {/* Button 5: Menu */}
          <button
            onClick={() => setMenuOpen(true)}
            className="relative group rounded-2xl bg-blue-950 p-[1.5px] transition-transform duration-200 active:scale-95 cursor-pointer"
            id="btn-hero-menu"
          >
            <span className="absolute inset-0 rounded-2xl bg-black translate-y-2 block"></span>
            <span className="relative flex items-center justify-center gap-2.5 px-12 py-6 rounded-2xl bg-blue-700 text-white text-xs sm:text-sm font-black uppercase tracking-widest -translate-y-2 group-hover:-translate-y-1 group-active:translate-y-0 transition-all duration-150 border-2 border-blue-400 font-display">
              <Menu className="h-4.5 w-4.5 text-cyan-300 stroke-[3]" />
              Menu
            </span>
          </button>
        </div>

        {/* Massive 3D Social Media Portals directly under the 5 main buttons */}
        <div className="mt-8 text-center" id="social-portals-hero">
          <span className="block text-[10px] font-mono font-bold uppercase tracking-[0.25em] text-cyan-400 mb-6">
            Official Elon Musk Social Portals
          </span>
          <div className="flex flex-wrap justify-center items-center gap-6 max-w-2xl mx-auto mb-20">
            {/* Twitter / X */}
            <a 
              href="https://x.com/elonmusk" 
              target="_blank" 
              rel="noopener noreferrer"
              className="relative group block rounded-2xl bg-zinc-800/80 p-[1px] transition-transform duration-200 active:scale-95 cursor-pointer shrink-0"
              title="Elon Musk Twitter/X"
            >
              <span className="absolute inset-0 rounded-2xl bg-cyan-900 translate-y-1.5 block"></span>
              <span className="relative flex items-center justify-center gap-3 px-10 py-5 rounded-2xl bg-zinc-950 border border-white/10 text-sm font-mono uppercase tracking-wider text-gray-300 group-hover:text-cyan-400 -translate-y-1.5 group-hover:-translate-y-0.5 group-active:translate-y-0 transition-all duration-150 shadow-[0_4px_15px_rgba(34,211,238,0.15)]">
                <svg className="h-5 w-5 fill-current text-cyan-400 shrink-0" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
                <span className="font-bold">X / @elonmusk</span>
              </span>
            </a>

            {/* Instagram */}
            <a 
              href="https://instagram.com/elonmusk" 
              target="_blank" 
              rel="noopener noreferrer"
              className="relative group block rounded-2xl bg-zinc-800/80 p-[1px] transition-transform duration-200 active:scale-95 cursor-pointer shrink-0"
              title="Elon Musk Instagram"
            >
              <span className="absolute inset-0 rounded-2xl bg-pink-900 translate-y-1.5 block"></span>
              <span className="relative flex items-center justify-center gap-3 px-10 py-5 rounded-2xl bg-zinc-950 border border-white/10 text-sm font-mono uppercase tracking-wider text-gray-300 group-hover:text-pink-400 -translate-y-1.5 group-hover:-translate-y-0.5 group-active:translate-y-0 transition-all duration-150 shadow-[0_4px_15px_rgba(236,72,153,0.15)]">
                <Instagram className="h-5 w-5 text-pink-400 shrink-0" />
                <span className="font-bold">Instagram</span>
              </span>
            </a>

            {/* Musk Foundation Website */}
            <a 
              href="https://www.muskfoundation.org" 
              target="_blank" 
              rel="noopener noreferrer"
              className="relative group block rounded-2xl bg-zinc-800/80 p-[1px] transition-transform duration-200 active:scale-95 cursor-pointer shrink-0"
              title="Elon Musk Foundation Website"
            >
              <span className="absolute inset-0 rounded-2xl bg-yellow-900 translate-y-1.5 block"></span>
              <span className="relative flex items-center justify-center gap-3 px-10 py-5 rounded-2xl bg-zinc-950 border border-white/10 text-sm font-mono uppercase tracking-wider text-gray-300 group-hover:text-yellow-400 -translate-y-1.5 group-hover:-translate-y-0.5 group-active:translate-y-0 transition-all duration-150 shadow-[0_4px_15px_rgba(234,179,8,0.15)]">
                <svg className="h-5 w-5 fill-none stroke-current stroke-2 text-yellow-400 shrink-0" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="2" y1="12" x2="22" y2="12" />
                  <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                </svg>
                <span className="font-bold">Musk Foundation</span>
              </span>
            </a>
          </div>
        </div>

        {/* ----------------- 2. RESTORED HELLO SECTION (WITH IMAGE) ----------------- */}
        <HelloSection onApplyClick={onApplyClick} />

        {/* ----------------- 3. QUALIFY ON VOLUME SECTION (PUSHED DOWN) ----------------- */}
        <div className="w-full max-w-5xl mx-auto px-4 mb-28" id="image-section">
          <div className="relative min-h-[450px] w-full rounded-2xl border border-white/5 bg-zinc-950/40 p-8 sm:p-12 shadow-[0_25px_60px_rgba(0,0,0,0.85)] group hover:border-cyan-500/10 transition-all duration-500 overflow-hidden flex flex-col lg:flex-row items-center justify-between gap-12">
            
            {/* Absolute decorative grids and glow */}
            <div className="absolute inset-0 bg-gradient-to-tr from-black via-transparent to-cyan-500/[0.01] pointer-events-none" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-cyan-500/[0.03] rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.002)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.002)_1px,transparent_1px)] bg-[size:3rem_3rem] pointer-events-none" />

            {/* Left Column: Title & Text */}
            <div className="flex-1 text-left z-10 max-w-xl">
              <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white uppercase leading-tight mb-4">
                Qualify on Volume,<br />
                Not Personal Income.
              </h2>
              <p className="text-sm sm:text-base text-gray-200 font-semibold leading-relaxed mb-8">
                Elon Capital Loan is structured for modern traders, digital asset developers, and international builders. We do not require traditional US credit history or standard tax filings. Instead, we qualify allocations directly based on your verified portfolio strength, active trading volumes, smart contract logic, and venture cash flow.
              </p>
            </div>

            {/* Right Column: Dynamic Floating Badges (checklist from screenshot but styled with black/cyan premium theme) */}
            <div className="flex-1 w-full max-w-md z-10 relative flex flex-col gap-4">
              <div className="absolute -inset-2 bg-gradient-to-r from-cyan-500/5 to-white/5 rounded-2xl blur-xl opacity-50 pointer-events-none" />
              
              <div className="bg-zinc-950/90 border border-white/10 rounded-xl p-4 flex items-center gap-4 shadow-xl hover:translate-x-2 transition-transform duration-300">
                <div className="h-7 w-7 rounded-full bg-cyan-950/30 border border-cyan-500/20 flex items-center justify-center shrink-0">
                  <Check className="h-4 w-4 text-cyan-400 animate-pulse" />
                </div>
                <div className="text-left">
                  <span className="block text-xs font-bold text-white uppercase tracking-wider">No Personal Income Verification</span>
                  <span className="block text-[11px] text-cyan-400 font-mono font-bold mt-0.5">Asset-backed underwriting framework</span>
                </div>
              </div>

              <div className="bg-zinc-950/90 border border-white/10 rounded-xl p-4 flex items-center gap-4 shadow-xl hover:translate-x-2 transition-transform duration-300">
                <div className="h-7 w-7 rounded-full bg-cyan-950/30 border border-cyan-500/20 flex items-center justify-center shrink-0">
                  <Check className="h-4 w-4 text-cyan-400 animate-pulse" />
                </div>
                <div className="text-left">
                  <span className="block text-xs font-bold text-white uppercase tracking-wider">No US Credit History Required</span>
                  <span className="block text-[11px] text-cyan-400 font-mono font-bold mt-0.5">Perfect for international clients and traders</span>
                </div>
              </div>

              <div className="bg-zinc-950/90 border border-white/10 rounded-xl p-4 flex items-center gap-4 shadow-xl hover:translate-x-2 transition-transform duration-300">
                <div className="h-7 w-7 rounded-full bg-cyan-950/30 border border-cyan-500/20 flex items-center justify-center shrink-0">
                  <Check className="h-4 w-4 text-cyan-400 animate-pulse" />
                </div>
                <div className="text-left">
                  <span className="block text-xs font-bold text-white uppercase tracking-wider">LLC-Friendly Vesting</span>
                  <span className="block text-[11px] text-cyan-400 font-mono font-bold mt-0.5">Corporate wrapper structures accepted</span>
                </div>
              </div>

              <div className="bg-zinc-950/90 border border-white/10 rounded-xl p-4 flex items-center gap-4 shadow-xl hover:translate-x-2 transition-transform duration-300">
                <div className="h-7 w-7 rounded-full bg-cyan-950/30 border border-cyan-500/20 flex items-center justify-center shrink-0">
                  <Check className="h-4 w-4 text-cyan-400 animate-pulse" />
                </div>
                <div className="text-left">
                  <span className="block text-xs font-bold text-white uppercase tracking-wider">Trading & Portfolio qualified</span>
                  <span className="block text-[11px] text-cyan-400 font-mono font-bold mt-0.5">Qualify on volume, yield, & ledger data</span>
                </div>
              </div>

              <div className="bg-zinc-950/90 border border-white/10 rounded-xl p-4 flex items-center gap-4 shadow-xl hover:translate-x-2 transition-transform duration-300">
                <div className="h-7 w-7 rounded-full bg-cyan-950/30 border border-cyan-500/20 flex items-center justify-center shrink-0">
                  <Check className="h-4 w-4 text-cyan-400 animate-pulse" />
                </div>
                <div className="text-left">
                  <span className="block text-xs font-bold text-white uppercase tracking-wider">No US Visa Required</span>
                  <span className="block text-[11px] text-cyan-400 font-mono font-bold mt-0.5">Global access from any geographic coordinate</span>
                </div>
              </div>

              {/* Check Your Eligibility - 3D Styled Button redirecting to Calculator page */}
              <div className="mt-4 pt-2 w-full">
                <button 
                  onClick={onCalculatorClick}
                  className="relative group w-full rounded-2xl bg-cyan-700 p-[1.5px] transition-transform duration-200 active:scale-95 cursor-pointer block"
                >
                  <span className="absolute inset-0 rounded-2xl bg-cyan-800/95 translate-y-2 block"></span>
                  <span className="relative flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-cyan-400 text-black text-xs sm:text-sm font-extrabold uppercase tracking-widest -translate-y-2 group-hover:-translate-y-1 group-active:translate-y-0 transition-all duration-150 shadow-[0_4px_15px_rgba(34,211,238,0.3)] border border-cyan-500/30 font-display">
                    Check Your Eligibility
                    <ArrowRight className="h-4.5 w-4.5 text-black stroke-[2.5]" />
                  </span>
                </button>
              </div>

            </div>

          </div>
        </div>

        {/* ----------------- 4. TESTIMONIALS SECTION ----------------- */}
        <div className="w-full mb-10" id="testimonials-section-anchor">
          <Testimonials />
        </div>

      </div>

      {/* ----------------- OVERLAY 1: SIDE MENU DRAWER ----------------- */}
      {menuOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden" id="menu-side-drawer">
          {/* Backdrop */}
          <div 
            onClick={() => setMenuOpen(false)} 
            className="absolute inset-0 bg-black/85 backdrop-blur-sm transition-opacity" 
          />
          
          <div className="absolute inset-y-0 right-0 max-w-full flex">
            <div className="w-screen max-w-sm bg-zinc-950 border-l border-white/5 p-8 flex flex-col justify-between animate-slide-left">
              
              <div className="space-y-12">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <span className="font-display text-xs font-bold tracking-[0.25em] text-cyan-400">
                    ELON CAPITAL LOAN
                  </span>
                  <button 
                    onClick={() => setMenuOpen(false)}
                    className="p-1.5 text-gray-500 hover:text-white hover:bg-white/5 rounded-lg cursor-pointer"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {/* Navigation Links */}
                <div className="flex flex-col gap-4 text-sm font-mono uppercase tracking-widest">
                  <button 
                    onClick={() => { setMenuOpen(false); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                    className="text-left text-gray-400 hover:text-white transition-colors py-1.5 border-b border-white/[0.02]"
                  >
                    Home
                  </button>
                  <button 
                    onClick={() => { setMenuOpen(false); onNavigateToDashboard?.(); }}
                    className="text-left text-gray-400 hover:text-white transition-colors py-1.5 border-b border-white/[0.02]"
                  >
                    Dashboard
                  </button>
                  <button 
                    onClick={() => scrollToSection('calculator-section-anchor')}
                    className="text-left text-gray-400 hover:text-white transition-colors py-1.5 border-b border-white/[0.02]"
                  >
                    Loan Calculator
                  </button>
                  <button 
                    onClick={() => { setMenuOpen(false); onSupportClick?.(); }}
                    className="text-left text-gray-400 hover:text-white transition-colors py-1.5 border-b border-white/[0.02]"
                  >
                    Support
                  </button>
                  <button 
                    onClick={() => { setMenuOpen(false); setFaqOpen(true); }}
                    className="text-left text-cyan-400 hover:text-cyan-300 transition-colors py-1.5 border-b border-white/[0.02] font-semibold"
                  >
                    FAQ
                  </button>
                  <button 
                    onClick={() => scrollToSection('footer-section')}
                    className="text-left text-gray-400 hover:text-white transition-colors py-1.5 border-b border-white/[0.02]"
                  >
                    Contact
                  </button>
                  <button 
                    onClick={() => { setMenuOpen(false); setLegalModal('privacy'); }}
                    className="text-left text-gray-400 hover:text-white transition-colors py-1.5 border-b border-white/[0.02]"
                  >
                    Privacy Policy
                  </button>
                  <button 
                    onClick={() => { setMenuOpen(false); setLegalModal('terms'); }}
                    className="text-left text-gray-400 hover:text-white transition-colors py-1.5 border-b border-white/[0.02]"
                  >
                    Terms of Service
                  </button>
                  <button 
                    onClick={() => { setMenuOpen(false); onNavigateToDashboard?.(); }}
                    className="text-left text-gray-400 hover:text-white transition-colors py-1.5"
                  >
                    Settings
                  </button>
                </div>

                {/* Elon Musk's Portals - 3D Buttons */}
                <div className="space-y-4 pt-6 border-t border-white/5">
                  <span className="block text-[9px] font-mono font-bold uppercase tracking-widest text-cyan-400">
                    Elon Musk's Portals
                  </span>
                  
                  <div className="flex flex-col gap-3">
                    {/* Twitter / X */}
                    <a 
                      href="https://x.com/elonmusk" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="relative group block rounded-xl bg-zinc-800/80 p-[1px] transition-transform duration-200 active:scale-[0.98] cursor-pointer"
                    >
                      <span className="absolute inset-0 rounded-xl bg-cyan-900 translate-y-1 block"></span>
                      <span className="relative flex items-center gap-3 px-4 py-3 rounded-xl bg-zinc-950 border border-white/10 text-xs font-mono uppercase tracking-wider text-gray-300 group-hover:text-cyan-400 -translate-y-1 group-hover:-translate-y-0.5 group-active:translate-y-0 transition-all duration-150">
                        {/* Twitter / X SVG */}
                        <svg className="h-4 w-4 fill-current text-cyan-400 shrink-0" viewBox="0 0 24 24">
                          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                        </svg>
                        <span>X / @elonmusk</span>
                      </span>
                    </a>

                    {/* Instagram */}
                    <a 
                      href="https://instagram.com/elonmusk" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="relative group block rounded-xl bg-zinc-800/80 p-[1px] transition-transform duration-200 active:scale-[0.98] cursor-pointer"
                    >
                      <span className="absolute inset-0 rounded-xl bg-pink-900 translate-y-1 block"></span>
                      <span className="relative flex items-center gap-3 px-4 py-3 rounded-xl bg-zinc-950 border border-white/10 text-xs font-mono uppercase tracking-wider text-gray-300 group-hover:text-pink-400 -translate-y-1 group-hover:-translate-y-0.5 group-active:translate-y-0 transition-all duration-150">
                        <Instagram className="h-4 w-4 text-pink-400 shrink-0" />
                        <span>Instagram / @elonmusk</span>
                      </span>
                    </a>

                    {/* Elon Musk Website Link */}
                    <a 
                      href="https://www.muskfoundation.org" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="relative group block rounded-xl bg-zinc-800/80 p-[1px] transition-transform duration-200 active:scale-[0.98] cursor-pointer"
                    >
                      <span className="absolute inset-0 rounded-xl bg-yellow-900 translate-y-1 block"></span>
                      <span className="relative flex items-center gap-3 px-4 py-3 rounded-xl bg-zinc-950 border border-white/10 text-xs font-mono uppercase tracking-wider text-gray-300 group-hover:text-yellow-400 -translate-y-1 group-hover:-translate-y-0.5 group-active:translate-y-0 transition-all duration-150">
                        <svg className="h-4 w-4 fill-none stroke-current stroke-2 text-yellow-400 shrink-0" viewBox="0 0 24 24">
                          <circle cx="12" cy="12" r="10" />
                          <line x1="2" y1="12" x2="22" y2="12" />
                          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                        </svg>
                        <span>Musk Foundation Portal</span>
                      </span>
                    </a>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="border-t border-white/5 pt-6 text-[9px] font-mono text-gray-600 uppercase tracking-widest">
                © {new Date().getFullYear()} ELONCAPITALLOAN.COM
              </div>

            </div>
          </div>
        </div>
      )}

      {/* ----------------- OVERLAY 2: HOW IT WORKS MODAL ----------------- */}
      {howItWorksOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md" id="modal-how-it-works">
          <div className="relative w-full max-w-2xl bg-zinc-950 border border-white/5 rounded-2xl p-8 sm:p-12 animate-zoom-in">
            <button 
              onClick={() => setHowItWorksOpen(false)}
              className="absolute top-6 right-6 p-1.5 text-gray-500 hover:text-white hover:bg-white/5 rounded-lg cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="space-y-8">
              <div>
                <span className="font-mono text-[9px] uppercase tracking-widest text-cyan-400">Application Pipeline</span>
                <h3 className="font-display text-3xl font-bold text-white tracking-tight uppercase mt-2">
                  Unified Capital Allocation Protocol
                </h3>
              </div>

              <div className="space-y-6 text-left">
                <div className="flex gap-4 items-start">
                  <div className="h-8 w-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center font-mono text-xs text-cyan-400 shrink-0">
                    01
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold uppercase text-white tracking-wider">Configure Loan Preferences</h4>
                    <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                      Use our secure, fluid calculator to configure exact liquidity terms ranging from $1,000 to $500,000,000. Select modular payback windows optimized for growth schedules.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 items-start">
                  <div className="h-8 w-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center font-mono text-xs text-cyan-400 shrink-0">
                    02
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold uppercase text-white tracking-wider">Dynamic Multi-Step Application</h4>
                    <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                      Submit professional demographic records, verifiable financial audit files, and corporate descriptors via our sleek step-by-step verification pipeline.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 items-start">
                  <div className="h-8 w-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center font-mono text-xs text-cyan-400 shrink-0">
                    03
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold uppercase text-white tracking-wider">Automated Verification & Allocation</h4>
                    <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                      Our automated ledger validation systems execute quick KYC and risk analysis. Standard tiers approve in 24 hours, transmitting secure liquid funds.
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => { setHowItWorksOpen(false); onApplyClick(); }}
                  className="w-full py-3.5 bg-white text-black font-mono text-xs uppercase tracking-widest font-bold hover:bg-cyan-400 transition-colors rounded-lg cursor-pointer"
                >
                  Initiate Secure Application Process
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ----------------- OVERLAY 3: LEGAL MODALS (PRIVACY & TERMS) ----------------- */}
      {legalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade-in" id="modal-legal">
          <div className="relative w-full max-w-xl bg-zinc-950 border border-white/5 rounded-2xl p-8 sm:p-12 animate-zoom-in text-left">
            <button 
              onClick={() => setLegalModal(null)}
              className="absolute top-6 right-6 p-1.5 text-gray-500 hover:text-white hover:bg-white/5 rounded-lg cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="space-y-6">
              <div>
                <span className="font-mono text-[9px] uppercase tracking-widest text-cyan-400">Legal Agreement</span>
                <h3 className="font-display text-2xl font-bold text-white tracking-tight uppercase mt-1">
                  {legalModal === 'privacy' ? 'Privacy Policy' : 'Terms of Service'}
                </h3>
              </div>

              <div className="max-h-[300px] overflow-y-auto pr-2 space-y-4 text-xs text-gray-400 leading-relaxed font-light">
                {legalModal === 'privacy' ? (
                  <>
                    <p className="font-bold text-white">1. Data Storage Transmission</p>
                    <p>All transmitted files, including photographic government identity documents, selfie biometric files, and company capitalization worksheets are stored in private database volumes. All transmissions leverage TLS 1.3 and military-grade AES-256 data envelope configurations.</p>
                    <p className="font-bold text-white">2. Third-Party Disclosures</p>
                    <p>Under no circumstances are company financial telemetry files or personal identification keys shared or sold to marketing entities. Disclosures are performed exclusively in compliance with anti-money laundering (AML) and Counter-Terrorism Financing (CTF) state verification structures.</p>
                    <p className="font-bold text-white">3. Cookies & Session Handlers</p>
                    <p>We use localized JSON Web Tokens (JWT) inside standard secure browser structures strictly to authenticate administrative or borrowing sessions. No cross-site ad cookies are integrated.</p>
                  </>
                ) : (
                  <>
                    <p className="font-bold text-white">1. Capital Terms Warranties</p>
                    <p>By executing simulation parameters or transmitting financial files, users certify all entries are correct. False corporate revenue representations trigger legal exclusion and prosecution coordinates.</p>
                    <p className="font-bold text-white">2. Repayment Default Clauses</p>
                    <p>Defaults are handled in strict compliance with state and protocol guidelines. Collateral locks or treasury reclamation flows are executed as designated inside final amortized agreements.</p>
                    <p className="font-bold text-white">3. System Limitations</p>
                    <p>Elon Capital Loan is an institutional credit interface. Simulation parameters generated do not constitute formal binding commitments until formal sign-off from a clearing capital officer.</p>
                  </>
                )}
              </div>

              <button
                type="button"
                onClick={() => setLegalModal(null)}
                className="w-full py-3 bg-white hover:bg-cyan-400 text-black font-mono text-[10px] uppercase tracking-widest font-bold transition-colors rounded-lg cursor-pointer"
              >
                Acknowledge Protocol Guidelines
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ----------------- OVERLAY 4: FAQ MODAL ----------------- */}
      <FAQ isOpen={faqOpen} onClose={() => setFaqOpen(false)} />

    </div>
  );
}
