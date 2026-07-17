import React from 'react';
import { Menu, X, ArrowUpRight, ShieldCheck, Cpu, User as UserIcon, LogOut } from 'lucide-react';
import { User } from '../types';

interface NavbarProps {
  user: User | null;
  onOpenAuth: (mode: 'login' | 'register') => void;
  onLogout: () => void;
  onNavigateToDashboard: () => void;
  onNavigateToHome: () => void;
  onApplyClick: () => void;
  onSupportClick: () => void;
  onCalculatorClick: () => void;
  onHowItWorksClick: () => void;
  onEligibilityClick: () => void;
  onGovernmentWarningClick: () => void;
}

export default function Navbar({
  user,
  onOpenAuth,
  onLogout,
  onNavigateToDashboard,
  onNavigateToHome,
  onApplyClick,
  onSupportClick,
  onCalculatorClick,
  onHowItWorksClick,
  onEligibilityClick,
  onGovernmentWarningClick,
}: NavbarProps) {
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
          ? 'top-4 mx-4 md:mx-auto max-w-5xl rounded-full border border-white/10 bg-neutral-950/70 backdrop-blur-xl shadow-[0_12px_40px_rgba(34,211,238,0.08)] py-1.5' 
          : 'top-0 bg-black/80 backdrop-blur-md border-b border-white/5 py-1'
      }`}
      id="nav-container"
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div 
            onClick={onNavigateToHome} 
            className="flex items-center gap-2 cursor-pointer group" 
            id="nav-logo"
          >
            <div className="h-7 w-7 rounded-md bg-white/5 border border-white/10 flex items-center justify-center group-hover:border-cyan-400/30 transition-all duration-300">
              <Cpu className="h-3.5 w-3.5 text-white group-hover:text-cyan-400 transition-colors" />
            </div>
            <div className="flex flex-col text-left">
              <span className="font-display text-xs font-extrabold tracking-[0.15em] text-white uppercase">
                Elon <span className="text-cyan-400 font-light">Capital Loan</span>
              </span>
              <span className="text-[7px] text-gray-500 font-mono uppercase tracking-[0.15em] -mt-0.5">
                An Elon Musk Venture
              </span>
            </div>
          </div>

          {/* Center: Tagline */}
          <div className="hidden lg:flex items-center justify-center max-w-md xl:max-w-xl mx-4">
            <p className="text-[10px] text-gray-400 font-light tracking-wide text-center truncate">
              Funding entrepreneurs, startups, and growing businesses with a simple application process.
            </p>
          </div>

          {/* Desktop Nav Links: Home, Apply, Calculator, Dashboard, Support */}
          <div className="hidden md:flex items-center gap-6 font-sans text-[11px] uppercase tracking-widest" id="nav-links">
            <button 
              onClick={onNavigateToHome}
              className="font-medium text-gray-400 hover:text-white transition-colors cursor-pointer"
            >
              Home
            </button>
            <button 
              onClick={onHowItWorksClick}
              className="font-semibold text-cyan-400 hover:text-cyan-300 transition-colors cursor-pointer"
            >
              How It Works
            </button>
            <button 
              onClick={onEligibilityClick}
              className="font-semibold text-yellow-400 hover:text-yellow-300 transition-colors cursor-pointer"
            >
              Check Eligibility
            </button>
            <button 
              onClick={onApplyClick}
              className="font-medium text-gray-400 hover:text-white transition-colors cursor-pointer"
            >
              Apply
            </button>
            <button 
              onClick={onCalculatorClick}
              className="font-medium text-gray-400 hover:text-white transition-colors cursor-pointer"
            >
              Calculator
            </button>
            <button 
              onClick={onNavigateToDashboard}
              className="font-medium text-gray-400 hover:text-white transition-colors cursor-pointer"
            >
              Dashboard
            </button>
            <button 
              onClick={onSupportClick}
              className="font-medium text-gray-400 hover:text-white transition-colors cursor-pointer"
            >
              Support
            </button>
            <button 
              onClick={onGovernmentWarningClick}
              className="font-bold text-red-500 hover:text-red-400 transition-colors cursor-pointer"
            >
              ⚠️ Global Warning
            </button>
          </div>

          {/* User controls / Auth buttons: Login, Register, Logout */}
          <div className="hidden md:flex items-center gap-4 text-[11px] uppercase tracking-widest" id="nav-actions">
            {user ? (
              <div className="flex items-center gap-4">
                {user.role === 'admin' ? (
                  <span className="px-2 py-0.5 text-[8px] font-mono font-bold uppercase tracking-widest text-cyan-400 bg-cyan-950/40 border border-cyan-500/20 rounded-full flex items-center gap-1">
                    <ShieldCheck className="h-2.5 w-2.5" /> Admin
                  </span>
                ) : (
                  <span className="text-[10px] text-gray-400 tracking-wider">
                    Hi, <span className="text-white font-sans font-medium">{user.name.split(' ')[0]}</span>
                  </span>
                )}

                <button 
                  onClick={onLogout}
                  className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-white/5 rounded transition-all flex items-center gap-1 cursor-pointer"
                  title="Logout"
                  id="btn-navbar-logout"
                >
                  <LogOut className="h-3 w-3" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => onOpenAuth('login')}
                  className="px-3 py-1.5 text-gray-400 hover:text-white transition-colors font-medium cursor-pointer"
                  id="btn-navbar-login"
                >
                  Login
                </button>
                <button 
                  onClick={() => onOpenAuth('register')}
                  className="px-4 py-1.5 font-medium text-black bg-white hover:bg-cyan-400 transition-all rounded cursor-pointer"
                  id="btn-navbar-register"
                >
                  Register
                </button>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center gap-4">
            {user && (
              <button 
                onClick={onNavigateToDashboard}
                className="p-2 bg-white/5 border border-white/10 rounded-lg text-cyan-400"
                id="btn-navbar-mobile-dashboard"
              >
                <UserIcon className="h-4 w-4" />
              </button>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg"
              id="btn-navbar-mobile-toggle"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-black/95 border-b border-white/5 py-4 px-4 space-y-4" id="nav-mobile-menu">
          <div className="flex flex-col gap-4">
            <button 
              onClick={() => { setMobileMenuOpen(false); onNavigateToHome(); }}
              className="text-left text-base font-medium text-gray-400 hover:text-white transition-colors"
            >
              Home
            </button>
            <button 
              onClick={() => { setMobileMenuOpen(false); onHowItWorksClick(); }}
              className="text-left text-base font-bold text-cyan-400 hover:text-cyan-300 transition-colors"
            >
              How It Works
            </button>
            <button 
              onClick={() => { setMobileMenuOpen(false); onEligibilityClick(); }}
              className="text-left text-base font-bold text-yellow-400 hover:text-yellow-300 transition-colors"
            >
              Check Eligibility
            </button>
            <button 
              onClick={() => { setMobileMenuOpen(false); onApplyClick(); }}
              className="text-left text-base font-medium text-gray-400 hover:text-white transition-colors"
            >
              Apply
            </button>
            <button 
              onClick={() => { setMobileMenuOpen(false); onCalculatorClick(); }}
              className="text-left text-base font-medium text-gray-400 hover:text-white transition-colors"
            >
              Calculator
            </button>
            <button 
              onClick={() => { setMobileMenuOpen(false); onNavigateToDashboard(); }}
              className="text-left text-base font-medium text-gray-400 hover:text-white transition-colors"
            >
              Dashboard
            </button>
            <button 
              onClick={() => { setMobileMenuOpen(false); onSupportClick(); }}
              className="text-left text-base font-medium text-gray-400 hover:text-white transition-colors"
            >
              Support
            </button>
            <button 
              onClick={() => { setMobileMenuOpen(false); onGovernmentWarningClick(); }}
              className="text-left text-base font-bold text-red-500 hover:text-red-400 transition-colors"
            >
              ⚠️ Global Warning
            </button>
          </div>

          <hr className="border-white/5" />

          <div className="flex flex-col gap-3">
            {user ? (
              <>
                <div className="flex items-center justify-between text-xs font-mono text-gray-400 py-1">
                  <span>Logged in as: {user.name}</span>
                  {user.role === 'admin' && <span className="text-cyan-400 font-bold uppercase">ADMIN</span>}
                </div>
                <button 
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onNavigateToDashboard();
                  }}
                  className="w-full py-3 text-center text-sm font-medium text-black bg-white rounded-lg"
                >
                  Go to Dashboard
                </button>
                <button 
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onLogout();
                  }}
                  className="w-full py-3 text-center text-sm font-medium text-red-400 border border-red-500/20 bg-red-950/20 rounded-lg"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <button 
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenAuth('login');
                  }}
                  className="w-full py-3 text-center text-sm font-medium text-gray-300 border border-white/10 rounded-lg"
                >
                  Login
                </button>
                <button 
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenAuth('register');
                  }}
                  className="w-full py-3 text-center text-sm font-medium text-black bg-white rounded-lg"
                >
                  Register
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
