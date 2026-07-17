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
  Instagram,
  Rocket
} from 'lucide-react';
import { HomePageContent } from '../types';
import Testimonials from './Testimonials';
import FAQ from './FAQ';
import HelloSection from './HelloSection';
import GovernmentWarning from './GovernmentWarning';

interface HeroProps {
  content: HomePageContent;
  onApplyClick: () => void;
  onOpenAuth?: (mode: 'login' | 'register') => void;
  onNavigateToDashboard?: () => void;
  onSupportClick?: () => void;
  onCalculatorClick?: () => void;
  onHowItWorksClick?: () => void;
  onGovernmentWarningClick?: () => void;
}

export default function Hero({ 
  content, 
  onApplyClick, 
  onOpenAuth, 
  onNavigateToDashboard,
  onSupportClick,
  onCalculatorClick,
  onHowItWorksClick,
  onGovernmentWarningClick
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
      <div className="max-w-7xl mx-auto px-6 pt-24 pb-16 lg:pt-32 lg:pb-20 select-none animate-fade-in">
        
        {/* NEW ERA HAS BEGUN. BRING YOUR DREAM TO LIFE - BOLD, VERY BIG, CAPITAL SUBHEADING RIGHT UP */}
        <div className="text-center mb-16" id="hero-subheading-top">
          <span className="text-cyan-400 font-black text-2xl sm:text-4xl lg:text-5xl tracking-[0.18em] uppercase block leading-tight drop-shadow-[0_4px_20px_rgba(34,211,238,0.25)] font-display">
            NEW ERA HAS BEGUN.
          </span>
          <span className="text-white font-black text-xl sm:text-3xl lg:text-4xl tracking-[0.18em] uppercase block mt-3 font-display">
            BRING YOUR DREAM TO LIFE.
          </span>
          <div className="h-[2px] w-32 bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent mx-auto mt-6" />
        </div>

        {/* 2-Column Grid Layout: Text on Left, Astronaut Image on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center mb-16 lg:mb-20">
          
          {/* Left Column: Headlines */}
          <div className="lg:col-span-6 flex flex-col justify-center text-left space-y-6">
            <h1 className="font-display text-5xl sm:text-7xl lg:text-[85px] font-black tracking-tight text-white uppercase leading-[0.95]" id="hero-title">
              <span className="block drop-shadow-[0_4px_20px_rgba(255,255,255,0.05)]">Build Bigger.</span>
              <span className="block drop-shadow-[0_4px_20px_rgba(255,255,255,0.05)]">Grow Faster.</span>
              <span className="text-cyan-400 block drop-shadow-[0_4px_25px_rgba(34,211,238,0.15)] text-3xl sm:text-5xl lg:text-[64px] tracking-tight leading-[0.95] font-black mt-4">
                Borrow from $1,000 to $500,000,000
              </span>
            </h1>
          </div>

          {/* Right Column: Astronaut Image facing right */}
          <div className="lg:col-span-6 relative w-full flex justify-center lg:justify-end">
            <div className="relative w-full rounded-2xl border border-white/20 overflow-hidden bg-zinc-950 p-2 shadow-[0_30px_80px_rgba(0,0,0,0.95)] group hover:border-cyan-400/40 transition-all duration-500 w-full">
              {/* Ambient cyan backdrop shadow */}
              <div className="absolute -inset-3 bg-gradient-to-r from-cyan-500/15 to-transparent rounded-2xl blur-2xl opacity-75 pointer-events-none" />
              
              <img 
                src="/Advancing_Human_Spaceflight_Mobile_af242fde31.jpg" 
                alt="Astronaut Exploration facing right"
                referrerPolicy="no-referrer"
                className="w-full h-[550px] sm:h-[750px] lg:h-[900px] object-cover rounded-xl transition-all duration-700 scale-100 group-hover:scale-[1.015]"
              />
            </div>
          </div>

        </div>

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
            onClick={onHowItWorksClick || (() => scrollToSection('how-it-works-section'))}
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

          {/* Button 4.5: Global Government Warning */}
          <button
            onClick={onGovernmentWarningClick}
            className="relative group rounded-2xl bg-red-900 p-[1.5px] transition-transform duration-200 active:scale-95 cursor-pointer"
            id="btn-hero-gov-warning"
          >
            <span className="absolute inset-0 rounded-2xl bg-red-950 translate-y-2 block"></span>
            <span className="relative flex items-center justify-center gap-2 px-12 py-6 rounded-2xl bg-red-600 text-white hover:text-red-300 text-xs sm:text-sm font-black uppercase tracking-widest -translate-y-2 group-hover:-translate-y-1 group-active:translate-y-0 transition-all duration-150 shadow-[0_8px_30px_rgba(239,68,68,0.35)] border border-red-500 font-display">
              ⚠️ Global Warning
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
          <div className="flex flex-wrap justify-center items-center gap-6 max-w-2xl mx-auto mb-20">
            {/* Twitter / X */}
            <a 
              href="https://x.com/elonmusk" 
              target="_blank" 
              rel="noopener noreferrer"
              className="relative group block rounded-2xl bg-zinc-800/80 p-[1px] transition-transform duration-200 active:scale-95 cursor-pointer shrink-0"
              title="X"
            >
              <span className="absolute inset-0 rounded-2xl bg-cyan-900 translate-y-1.5 block"></span>
              <span className="relative flex items-center justify-center gap-3 px-10 py-5 rounded-2xl bg-zinc-950 border border-white/10 text-sm font-mono uppercase tracking-wider text-gray-300 group-hover:text-cyan-400 -translate-y-1.5 group-hover:-translate-y-0.5 group-active:translate-y-0 transition-all duration-150 shadow-[0_4px_15px_rgba(34,211,238,0.15)]">
                <svg className="h-5 w-5 fill-current text-cyan-400 shrink-0" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
                <span className="font-bold">X</span>
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

            {/* SpaceX Website */}
            <a 
              href="https://www.spacex.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="relative group block rounded-2xl bg-zinc-800/80 p-[1px] transition-transform duration-200 active:scale-95 cursor-pointer shrink-0"
              title="SpaceX"
            >
              <span className="absolute inset-0 rounded-2xl bg-cyan-900 translate-y-1.5 block"></span>
              <span className="relative flex items-center justify-center gap-3 px-10 py-5 rounded-2xl bg-zinc-950 border border-white/10 text-sm font-mono uppercase tracking-wider text-gray-300 group-hover:text-cyan-400 -translate-y-1.5 group-hover:-translate-y-0.5 group-active:translate-y-0 transition-all duration-150 shadow-[0_4px_15px_rgba(34,211,238,0.15)]">
                <Rocket className="h-5 w-5 text-cyan-400 shrink-0 animate-pulse" />
                <span className="font-bold">SpaceX</span>
              </span>
            </a>
          </div>
        </div>

        {/* ----------------- 1.8 HUGE SPACEX HERO IMAGE SECTION ----------------- */}
        <div className="w-full max-w-5xl mx-auto px-4 mb-24" id="huge-spacex-hero-image">
          <div className="relative rounded-2xl border border-white/10 overflow-hidden bg-zinc-950 p-2 sm:p-3 shadow-[0_30px_80px_rgba(0,0,0,0.95)] group hover:border-cyan-400/30 transition-all duration-500">
            {/* Ambient background glow */}
            <div className="absolute -inset-2 bg-gradient-to-r from-cyan-500/10 to-transparent rounded-2xl blur-2xl opacity-60 pointer-events-none" />
            
            <img 
              src="/image.jpg" 
              alt="SpaceX Exploration"
              referrerPolicy="no-referrer"
              className="w-full h-[500px] sm:h-[750px] lg:h-[950px] object-cover rounded-xl transition-all duration-700 scale-100 group-hover:scale-[1.01]"
            />
            {/* Absolute overlay badge inside image */}
            <div className="absolute bottom-6 left-6 sm:bottom-10 sm:left-10 bg-black/85 backdrop-blur-md border border-white/10 rounded-xl px-6 py-4 flex items-center justify-center shadow-2xl">
              <span className="text-xs sm:text-sm font-extrabold text-white uppercase tracking-widest font-mono">
                SpaceX / Tesla / Neuralink
              </span>
            </div>
          </div>
        </div>

        {/* ----------------- 2. RESTORED HELLO SECTION (WITH IMAGE) ----------------- */}
        <HelloSection onApplyClick={onApplyClick} />

        {/* ----------------- 3. HOW IT WORKS SECTION (REPLACED PREMIUM SECTION) ----------------- */}
        <div className="relative w-full bg-black py-24 sm:py-32 border-t border-b border-white/5 overflow-hidden mb-16 sm:mb-24" id="how-it-works-section">
          {/* Animated Background Layer 1: Always Sunny */}
          <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden select-none bg-black">
            {/* Soft, extremely minimal vignetting to protect text legibility while keeping the image incredibly bright and clear */}
            <div className="absolute inset-0 bg-black/10 z-10" />
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/40 z-10" />
            <img 
              src="/Always_Sunny_v4_d8b76550ae-1.jpg" 
              alt="Always Sunny Background" 
              referrerPolicy="no-referrer"
              className="absolute inset-0 w-full h-full object-cover animate-ken-burns opacity-100 z-0"
            />
          </div>

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
            
            {/* Section Header */}
            <div className="text-center max-w-3xl mx-auto mb-20">
              <span className="font-mono text-xs uppercase tracking-widest text-blue-400 font-black block mb-3">
                Application & Funding Workflow
              </span>
              <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl font-black text-white uppercase tracking-tight leading-tight">
                How ELON CAPITAL LOAN Works
              </h2>
              <p className="text-zinc-200 mt-4 text-base sm:text-xl font-extrabold uppercase tracking-wide">
                A simple, transparent process from application to funding.
              </p>
            </div>

            {/* Vertical Numbered Process Flow / Timeline */}
            <div className="relative border-l border-zinc-800 ml-4 sm:ml-12 pl-8 sm:pl-16 space-y-8 max-w-4xl mx-auto text-left">
              
              {/* Step 1 */}
              <div className="relative group/step bg-black border border-white/10 rounded-2xl p-6 sm:p-8 shadow-[0_12px_40px_rgba(0,0,0,0.85)] transition-all duration-300 hover:border-blue-500/30">
                {/* Timeline Dot with Glow */}
                <div className="absolute -left-[41px] sm:-left-[73px] top-1/2 -translate-y-1/2 h-5 w-5 rounded-full bg-black border-2 border-blue-500 flex items-center justify-center z-10 transition-all duration-300 group-hover/step:border-blue-400 group-hover/step:shadow-[0_0_15px_rgba(59,130,246,0.8)]">
                  <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                </div>
                
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-8">
                  <span className="font-sans font-black text-5xl sm:text-6xl text-blue-500 tracking-tighter leading-none shrink-0 select-none">
                    01
                  </span>
                  <div className="space-y-1.5">
                    <h3 className="text-xl sm:text-2xl font-black text-white tracking-wide uppercase font-display">
                      Create Your Account
                    </h3>
                    <p className="text-base sm:text-lg text-zinc-100 font-bold sm:font-extrabold leading-relaxed">
                      Register using your email address and complete your personal or business profile.
                    </p>
                  </div>
                </div>
              </div>

              {/* Step 2 */}
              <div className="relative group/step bg-black border border-white/10 rounded-2xl p-6 sm:p-8 shadow-[0_12px_40px_rgba(0,0,0,0.85)] transition-all duration-300 hover:border-blue-500/30">
                {/* Timeline Dot with Glow */}
                <div className="absolute -left-[41px] sm:-left-[73px] top-1/2 -translate-y-1/2 h-5 w-5 rounded-full bg-black border-2 border-blue-500 flex items-center justify-center z-10 transition-all duration-300 group-hover/step:border-blue-400 group-hover/step:shadow-[0_0_15px_rgba(59,130,246,0.8)]">
                  <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                </div>
                
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-8">
                  <span className="font-sans font-black text-5xl sm:text-6xl text-blue-500 tracking-tighter leading-none shrink-0 select-none">
                    02
                  </span>
                  <div className="space-y-1.5">
                    <h3 className="text-xl sm:text-2xl font-black text-white tracking-wide uppercase font-display">
                      Complete Identity Verification
                    </h3>
                    <p className="text-base sm:text-lg text-zinc-100 font-bold sm:font-extrabold leading-relaxed">
                      Upload the required identification documents for review.
                    </p>
                  </div>
                </div>
              </div>

              {/* Step 3 */}
              <div className="relative group/step bg-black border border-white/10 rounded-2xl p-6 sm:p-8 shadow-[0_12px_40px_rgba(0,0,0,0.85)] transition-all duration-300 hover:border-blue-500/30">
                {/* Timeline Dot with Glow */}
                <div className="absolute -left-[41px] sm:-left-[73px] top-1/2 -translate-y-1/2 h-5 w-5 rounded-full bg-black border-2 border-blue-500 flex items-center justify-center z-10 transition-all duration-300 group-hover/step:border-blue-400 group-hover/step:shadow-[0_0_15px_rgba(59,130,246,0.8)]">
                  <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                </div>
                
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-8">
                  <span className="font-sans font-black text-5xl sm:text-6xl text-blue-500 tracking-tighter leading-none shrink-0 select-none">
                    03
                  </span>
                  <div className="space-y-1.5">
                    <h3 className="text-xl sm:text-2xl font-black text-white tracking-wide uppercase font-display">
                      Submit Your Funding Request
                    </h3>
                    <p className="text-base sm:text-lg text-zinc-100 font-bold sm:font-extrabold leading-relaxed">
                      Choose the amount you need and provide details about your business, project, or funding purpose.
                    </p>
                  </div>
                </div>
              </div>

              {/* Step 4 */}
              <div className="relative group/step bg-black border border-white/10 rounded-2xl p-6 sm:p-8 shadow-[0_12px_40px_rgba(0,0,0,0.85)] transition-all duration-300 hover:border-blue-500/30">
                {/* Timeline Dot with Glow */}
                <div className="absolute -left-[41px] sm:-left-[73px] top-1/2 -translate-y-1/2 h-5 w-5 rounded-full bg-black border-2 border-blue-500 flex items-center justify-center z-10 transition-all duration-300 group-hover/step:border-blue-400 group-hover/step:shadow-[0_0_15px_rgba(59,130,246,0.8)]">
                  <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                </div>
                
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-8">
                  <span className="font-sans font-black text-5xl sm:text-6xl text-blue-500 tracking-tighter leading-none shrink-0 select-none">
                    04
                  </span>
                  <div className="space-y-1.5">
                    <h3 className="text-xl sm:text-2xl font-black text-white tracking-wide uppercase font-display">
                      Application Review
                    </h3>
                    <p className="text-base sm:text-lg text-zinc-100 font-bold sm:font-extrabold leading-relaxed">
                      Our team reviews the application and may request additional supporting documents when necessary.
                    </p>
                  </div>
                </div>
              </div>

              {/* Step 5 */}
              <div className="relative group/step bg-black border border-white/10 rounded-2xl p-6 sm:p-8 shadow-[0_12px_40px_rgba(0,0,0,0.85)] transition-all duration-300 hover:border-blue-500/30">
                {/* Timeline Dot with Glow */}
                <div className="absolute -left-[41px] sm:-left-[73px] top-1/2 -translate-y-1/2 h-5 w-5 rounded-full bg-black border-2 border-blue-500 flex items-center justify-center z-10 transition-all duration-300 group-hover/step:border-blue-400 group-hover/step:shadow-[0_0_15px_rgba(59,130,246,0.8)]">
                  <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                </div>
                
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-8">
                  <span className="font-sans font-black text-5xl sm:text-6xl text-blue-500 tracking-tighter leading-none shrink-0 select-none">
                    05
                  </span>
                  <div className="space-y-1.5">
                    <h3 className="text-xl sm:text-2xl font-black text-white tracking-wide uppercase font-display">
                      Funding Decision
                    </h3>
                    <p className="text-base sm:text-lg text-zinc-100 font-bold sm:font-extrabold leading-relaxed">
                      Once approved, you will receive a notification in your dashboard with the next steps.
                    </p>
                  </div>
                </div>
              </div>

              {/* Step 6 */}
              <div className="relative group/step bg-black border border-white/10 rounded-2xl p-6 sm:p-8 shadow-[0_12px_40px_rgba(0,0,0,0.85)] transition-all duration-300 hover:border-blue-500/30">
                {/* Timeline Dot with Glow */}
                <div className="absolute -left-[41px] sm:-left-[73px] top-1/2 -translate-y-1/2 h-5 w-5 rounded-full bg-black border-2 border-blue-500 flex items-center justify-center z-10 transition-all duration-300 group-hover/step:border-blue-400 group-hover/step:shadow-[0_0_15px_rgba(59,130,246,0.8)]">
                  <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                </div>
                
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-8">
                  <span className="font-sans font-black text-5xl sm:text-6xl text-blue-500 tracking-tighter leading-none shrink-0 select-none">
                    06
                  </span>
                  <div className="space-y-1.5">
                    <h3 className="text-xl sm:text-2xl font-black text-white tracking-wide uppercase font-display">
                      Receive Your Funds
                    </h3>
                    <p className="text-base sm:text-lg text-zinc-100 font-bold sm:font-extrabold leading-relaxed">
                      After all required verification and agreement steps are completed, approved funds become available through your account.
                    </p>
                  </div>
                </div>
              </div>

            </div>

            {/* Separate Premium Information Card */}
            <div className="max-w-4xl mx-auto mt-24 px-4">
              <div className="relative rounded-2xl border border-blue-500/30 bg-zinc-950/60 p-8 sm:p-10 shadow-[0_25px_60px_rgba(0,0,0,0.85)] overflow-hidden group hover:border-blue-500/50 transition-all duration-500">
                {/* Soft background blue glow */}
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

            {/* Why Businesses Choose ELON CAPITAL LOAN */}
            <div className="max-w-5xl mx-auto mt-28 px-4">
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
            <div className="flex justify-center mt-20">
              <button
                onClick={onCalculatorClick}
                className="relative group rounded-2xl bg-blue-800 p-[1.5px] transition-transform duration-200 active:scale-95 cursor-pointer block"
                id="btn-howitworks-eligibility"
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

        {/* ----------------- 4. TESTIMONIALS SECTION ----------------- */}
        <div className="relative w-full mb-10 overflow-hidden rounded-3xl border border-white/10 py-16 px-4 sm:px-6 lg:px-8 bg-black" id="testimonials-section-anchor">
          {/* Animated Background Layer 2: Revolutionizing Space Tech */}
          <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden select-none">
            {/* Soft, extremely minimal vignetting to protect text legibility while keeping the image incredibly bright and clear */}
            <div className="absolute inset-0 bg-black/10 z-10" />
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/40 z-10" />
            <img 
              src="/Revolutionizing_Space_Tech_Mobile_45093b17b7-1.jpg" 
              alt="Space Tech Background" 
              referrerPolicy="no-referrer"
              className="absolute inset-0 w-full h-full object-cover animate-ken-burns opacity-100 z-0"
            />
          </div>

          <div className="relative z-10">
            <Testimonials />
          </div>
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
                    onClick={() => { setMenuOpen(false); onHowItWorksClick?.(); }}
                    className="text-left text-cyan-400 hover:text-cyan-300 transition-colors py-1.5 border-b border-white/[0.02] font-semibold"
                  >
                    How It Works
                  </button>
                  <button 
                    onClick={() => { setMenuOpen(false); onCalculatorClick?.(); }}
                    className="text-left text-yellow-400 hover:text-yellow-300 transition-colors py-1.5 border-b border-white/[0.02] font-semibold"
                  >
                    Check Eligibility
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
                    onClick={() => { setMenuOpen(false); onGovernmentWarningClick?.(); }}
                    className="text-left text-red-400 hover:text-red-300 transition-colors py-1.5 border-b border-white/[0.02] font-semibold"
                  >
                    ⚠️ Global Warning
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
