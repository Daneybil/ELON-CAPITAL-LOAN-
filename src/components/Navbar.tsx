import React from 'react';
import { Menu, X, ArrowUpRight, ShieldCheck, User as UserIcon, LogOut, Smartphone, Download, Share2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { User } from '../types';
import logoImg from '../assets/images/elon_capital_logo_1785585548636.jpg';
import LanguageSelector from './LanguageSelector';

interface NavbarProps {
  user: User | null;
  onOpenAuth: (mode: 'login' | 'register') => void;
  onLogout: () => void;
  onNavigateToDashboard: () => void;
  onNavigateToAdmin: () => void;
  onNavigateToHome: () => void;
  onApplyClick: () => void;
  onSupportClick: () => void;
  onCalculatorClick: () => void;
  onHowItWorksClick: () => void;
  onEligibilityClick: () => void;
  onGovernmentWarningClick: () => void;
  onLoanTransparencyClick?: () => void;
  onOpenDownloadApp?: () => void;
  onOpenReferrals?: () => void;
}

export default function Navbar({
  user,
  onOpenAuth,
  onLogout,
  onNavigateToDashboard,
  onNavigateToAdmin,
  onNavigateToHome,
  onApplyClick,
  onSupportClick,
  onCalculatorClick,
  onHowItWorksClick,
  onEligibilityClick,
  onGovernmentWarningClick,
  onLoanTransparencyClick,
  onOpenDownloadApp,
  onOpenReferrals,
}: NavbarProps) {
  const { t } = useTranslation();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [isVisible, setIsVisible] = React.useState(true);
  const [lastScrollY, setLastScrollY] = React.useState(0);
  const [isScrolled, setIsScrolled] = React.useState(false);

  React.useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }

      // Hide on scroll down, show on scroll up (or if at the absolute top)
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  return (
    <nav 
      className={`fixed left-0 right-0 z-50 select-none transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
        isVisible ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0 pointer-events-none'
      } ${
        isScrolled 
          ? 'top-11 sm:top-12 mx-4 md:mx-auto max-w-5xl rounded-full border border-stone-300/80 bg-[#fbf9f4]/95 backdrop-blur-xl shadow-lg py-1.5' 
          : 'top-[34px] sm:top-[36px] bg-[#fbf9f4]/95 backdrop-blur-md border-b border-stone-300/60 py-1'
      }`}
      id="nav-container"
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div 
            onClick={onNavigateToHome} 
            className="flex items-center gap-2.5 cursor-pointer group" 
            id="nav-logo"
          >
            <div className="h-9 w-9 rounded-lg bg-zinc-900 border-2 border-cyan-500/50 overflow-hidden flex items-center justify-center shrink-0 group-hover:border-cyan-600 transition-all duration-300 shadow-sm">
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
            <div className="flex flex-col text-left">
              <span className="font-display text-xs sm:text-sm font-black tracking-[0.15em] text-zinc-900 uppercase">
                Elon <span className="text-cyan-700 font-bold">Capital Loan</span>
              </span>
              <span className="text-[8px] text-zinc-500 font-mono uppercase tracking-[0.15em] font-bold -mt-0.5">
                An Elon Musk Venture
              </span>
            </div>
          </div>

          {/* Center: Tagline */}
          <div className="hidden lg:flex items-center justify-center max-w-md xl:max-w-xl mx-4">
            <p className="text-[10px] text-zinc-600 font-bold tracking-wide text-center truncate">
              {t('nav.tagline')}
            </p>
          </div>

          {/* Desktop Nav Links: Home, Apply, Calculator, Dashboard, Support */}
          <div className="hidden md:flex items-center gap-6 font-sans text-[11px] uppercase tracking-widest" id="nav-links">
            <button 
              onClick={onNavigateToHome}
              className="font-bold text-zinc-700 hover:text-zinc-950 transition-colors cursor-pointer"
            >
              {t('nav.home')}
            </button>
            <button 
              onClick={onHowItWorksClick}
              className="font-bold text-cyan-700 hover:text-cyan-900 transition-colors cursor-pointer"
            >
              {t('nav.howItWorks')}
            </button>
            <button 
              onClick={onLoanTransparencyClick}
              className="font-bold text-emerald-700 hover:text-emerald-900 transition-colors cursor-pointer"
              id="btn-nav-transparency"
            >
              {t('nav.transparency')}
            </button>
            <button 
              onClick={onEligibilityClick}
              className="font-bold text-amber-700 hover:text-amber-900 transition-colors cursor-pointer"
            >
              {t('nav.eligibility')}
            </button>
            <button 
              onClick={onApplyClick}
              className="font-bold text-zinc-700 hover:text-zinc-950 transition-colors cursor-pointer"
            >
              {t('nav.apply')}
            </button>
            <button 
              onClick={onCalculatorClick}
              className="font-bold text-zinc-700 hover:text-zinc-950 transition-colors cursor-pointer"
            >
              {t('nav.calculator')}
            </button>
            <button 
              onClick={onNavigateToDashboard}
              className="font-bold text-zinc-700 hover:text-zinc-950 transition-colors cursor-pointer"
            >
              {t('nav.dashboard')}
            </button>
            <button 
              onClick={onSupportClick}
              className="font-bold text-zinc-700 hover:text-zinc-950 transition-colors cursor-pointer"
            >
              {t('nav.support')}
            </button>
            <button 
              onClick={onGovernmentWarningClick}
              className="font-black text-red-600 hover:text-red-700 transition-colors cursor-pointer"
            >
              {t('nav.globalWarning')}
            </button>
          </div>

          {/* User controls / Auth buttons: Login, Register, Logout */}
          <div className="hidden md:flex items-center gap-3 text-[11px] uppercase tracking-widest" id="nav-actions">
            <button
              type="button"
              onClick={onOpenDownloadApp}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold text-zinc-900 bg-cyan-500/10 hover:bg-cyan-600 hover:text-white border border-cyan-500/30 transition-all cursor-pointer shadow-sm group"
              title="Download & Install Mobile App (iPhone & Android)"
              id="btn-nav-download-app"
            >
              <Smartphone className="h-3.5 w-3.5 text-cyan-600 group-hover:text-white transition-colors" />
              <span>App</span>
            </button>
            {onOpenReferrals && (
              <button
                type="button"
                onClick={onOpenReferrals}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold text-amber-900 bg-amber-500/15 hover:bg-amber-500 hover:text-black border border-amber-500/40 transition-all cursor-pointer shadow-sm group"
                title="Referral & Affiliate Program"
                id="btn-nav-referral"
              >
                <Share2 className="h-3.5 w-3.5 text-amber-700 group-hover:text-black transition-colors" />
                <span>Earn</span>
              </button>
            )}
            <LanguageSelector />
            {user ? (
              <div className="flex items-center gap-3">
                {user.role === 'admin' ? (
                  <span className="px-2 py-0.5 text-[8px] font-mono font-bold uppercase tracking-widest text-cyan-800 bg-cyan-100 border border-cyan-300 rounded-full flex items-center gap-1">
                    <ShieldCheck className="h-2.5 w-2.5" /> Admin
                  </span>
                ) : (
                  <span className="text-[10px] text-zinc-600 font-bold tracking-wider">
                    {t('nav.hi')}, <span className="text-zinc-900 font-black">{user.name.split(' ')[0]}</span>
                  </span>
                )}

                <button 
                  onClick={onLogout}
                  className="p-1.5 text-zinc-600 hover:text-red-600 hover:bg-stone-200/60 rounded transition-all flex items-center gap-1 cursor-pointer"
                  title={t('nav.logout')}
                  id="btn-navbar-logout"
                >
                  <LogOut className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => onOpenAuth('login')}
                  className="px-3.5 py-1.5 text-zinc-700 hover:text-zinc-950 transition-colors font-bold cursor-pointer"
                  id="btn-navbar-login"
                >
                  {t('nav.login')}
                </button>
                <button 
                  onClick={() => onOpenAuth('register')}
                  className="px-4 py-1.5 font-bold text-white bg-zinc-900 hover:bg-cyan-600 transition-all rounded cursor-pointer shadow-sm"
                  id="btn-navbar-register"
                >
                  {t('nav.register')}
                </button>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center gap-2 sm:gap-4">
            <LanguageSelector />
            {user && (
              <button 
                onClick={onNavigateToDashboard}
                className="p-2 bg-stone-200/70 border border-stone-300 rounded-lg text-cyan-700"
                id="btn-navbar-mobile-dashboard"
              >
                <UserIcon className="h-4 w-4" />
              </button>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-zinc-700 hover:text-zinc-900 hover:bg-stone-200/60 rounded-lg"
              id="btn-navbar-mobile-toggle"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#fbf9f4] border-b border-stone-300 py-4 px-4 space-y-4 shadow-xl" id="nav-mobile-menu">
          <div className="flex flex-col gap-4">
            <button 
              onClick={() => { setMobileMenuOpen(false); onNavigateToHome(); }}
              className="text-left text-base font-bold text-zinc-700 hover:text-zinc-950 transition-colors"
            >
              {t('nav.home')}
            </button>
            <button 
              onClick={() => { setMobileMenuOpen(false); onHowItWorksClick(); }}
              className="text-left text-base font-bold text-cyan-700 hover:text-cyan-900 transition-colors"
            >
              {t('nav.howItWorks')}
            </button>
            <button 
              onClick={() => { setMobileMenuOpen(false); onLoanTransparencyClick?.(); }}
              className="text-left text-base font-bold text-emerald-700 hover:text-emerald-900 transition-colors"
            >
              {t('nav.transparency')}
            </button>
            <button 
              onClick={() => { setMobileMenuOpen(false); onEligibilityClick(); }}
              className="text-left text-base font-bold text-amber-700 hover:text-amber-900 transition-colors"
            >
              {t('nav.eligibility')}
            </button>
            <button 
              onClick={() => { setMobileMenuOpen(false); onApplyClick(); }}
              className="text-left text-base font-bold text-zinc-700 hover:text-zinc-950 transition-colors"
            >
              {t('nav.apply')}
            </button>
            <button 
              onClick={() => { setMobileMenuOpen(false); onCalculatorClick(); }}
              className="text-left text-base font-bold text-zinc-700 hover:text-zinc-950 transition-colors"
            >
              {t('nav.calculator')}
            </button>
            <button 
              onClick={() => { setMobileMenuOpen(false); onNavigateToDashboard(); }}
              className="text-left text-base font-bold text-zinc-700 hover:text-zinc-950 transition-colors"
            >
              {t('nav.dashboard')}
            </button>
            <button 
              onClick={() => { setMobileMenuOpen(false); onSupportClick(); }}
              className="text-left text-base font-bold text-zinc-700 hover:text-zinc-950 transition-colors"
            >
              {t('nav.support')}
            </button>
            <button 
              onClick={() => { setMobileMenuOpen(false); onGovernmentWarningClick(); }}
              className="text-left text-base font-black text-red-600 hover:text-red-700 transition-colors"
            >
              {t('nav.globalWarning')}
            </button>
          </div>

          <hr className="border-stone-300" />

          {/* Download Mobile App Button (iOS & Android) */}
          <button 
            type="button"
            onClick={() => {
              setMobileMenuOpen(false);
              onOpenDownloadApp?.();
            }}
            className="w-full py-3 px-4 text-center text-sm font-bold text-cyan-950 border border-cyan-500/40 bg-cyan-500/10 hover:bg-cyan-500/20 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer"
            id="btn-mobile-download-app"
          >
            <Smartphone className="h-4 w-4 text-cyan-700" />
            <span>Download Mobile App (iPhone & Android)</span>
          </button>

          {/* Referral & Affiliate Program */}
          {onOpenReferrals && (
            <button 
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenReferrals();
              }}
              className="w-full py-3 px-4 text-center text-sm font-bold text-amber-950 border border-amber-500/40 bg-amber-500/10 hover:bg-amber-500/20 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer"
              id="btn-mobile-referral"
            >
              <Share2 className="h-4 w-4 text-amber-700" />
              <span>Referral & Affiliates Program</span>
            </button>
          )}

          <div className="flex flex-col gap-3">
            {user ? (
              <>
                <div className="flex items-center justify-between text-xs font-mono text-zinc-600 font-bold py-1">
                  <span>{t('nav.loggedInAs')}: {user.name}</span>
                  {user.role === 'admin' && <span className="text-cyan-700 font-bold uppercase">ADMIN</span>}
                </div>
                <button 
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onNavigateToDashboard();
                  }}
                  className="w-full py-3 text-center text-sm font-bold text-white bg-zinc-900 rounded-lg shadow"
                >
                  {t('nav.goToDashboard')}
                </button>
                <button 
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onLogout();
                  }}
                  className="w-full py-3 text-center text-sm font-bold text-red-700 border border-red-300 bg-red-50 rounded-lg"
                >
                  {t('nav.logout')}
                </button>
              </>
            ) : (
              <>
                <button 
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenAuth('login');
                  }}
                  className="w-full py-3 text-center text-sm font-bold text-zinc-800 border border-stone-300 rounded-lg hover:bg-stone-100"
                >
                  {t('nav.login')}
                </button>
                <button 
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenAuth('register');
                  }}
                  className="w-full py-3 text-center text-sm font-bold text-white bg-zinc-900 hover:bg-cyan-600 rounded-lg shadow"
                >
                  {t('nav.register')}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
