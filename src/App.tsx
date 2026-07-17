import React from 'react';
import { User, HomePageContent, Announcement } from './types';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Features from './components/Features';
import EligibleBorrowers from './components/EligibleBorrowers';
import FAQ from './components/FAQ';
import Testimonials from './components/Testimonials';
import Contact from './components/Contact';
import Footer from './components/Footer';
import AuthModal from './components/AuthModal';
import UserDashboard from './components/UserDashboard';
import AdminDashboard from './components/AdminDashboard';
import LoanCalculatorPage from './components/LoanCalculatorPage';
import HowItWorksPage from './components/HowItWorksPage';
import GovernmentWarningPage from './components/GovernmentWarningPage';
import Chatbot from './components/Chatbot';
import { Megaphone, X, ShieldAlert, Cpu, Lock, Mail, ArrowUpRight, RefreshCw } from 'lucide-react';

export default function App() {
  // Authentication & Session State
  const [user, setUser] = React.useState<User | null>(null);
  const [token, setToken] = React.useState<string | null>(null);
  const [isInitializing, setIsInitializing] = React.useState(true);

  // Pre-filled loan variables from separate Calculator page
  const [prefilledLoanAmount, setPrefilledLoanAmount] = React.useState<number | undefined>(undefined);
  const [prefilledLoanTerm, setPrefilledLoanTerm] = React.useState<number | undefined>(undefined);

  // User Dashboard active tab state (for deep-linking and global controls)
  const [userDashboardTab, setUserDashboardTab] = React.useState<'overview' | 'apply' | 'loans' | 'kyc' | 'messages' | 'support' | 'settings'>('overview');

  // Router View toggles (Sync on startup with window.location.pathname)
  const [dashboardView, setDashboardView] = React.useState<'landing' | 'user' | 'admin' | 'calculator' | 'how-it-works' | 'government-warning'>(() => {
    if (typeof window !== 'undefined') {
      if (window.location.pathname === '/admin') return 'admin';
      if (window.location.pathname === '/dashboard') return 'user';
      if (window.location.pathname === '/calculator') return 'calculator';
      if (window.location.pathname === '/how-it-works') return 'how-it-works';
      if (window.location.pathname === '/government-warning') return 'government-warning';
    }
    return 'landing';
  });

  // Interactive Overlays
  const [authModalOpen, setAuthModalOpen] = React.useState(false);
  const [authModalMode, setAuthModalMode] = React.useState<'login' | 'register'>('login');

  // Dynamic Contents
  const [homePage, setHomePage] = React.useState<HomePageContent>({
    heroHeadline: 'Financing Engineered for High-Growth Ventures',
    heroSubheadline: 'Institutional liquidity solutions up to $500M. Fast, secure, and built for modern Web3, tech startups, SMEs, and digital enterprises.',
    statTotalFunded: '$1,480,240,000+',
    statActiveBorrowers: '14,820+',
    statGlobalProjects: '112'
  });
  const [announcements, setAnnouncements] = React.useState<Announcement[]>([]);
  const [activeAnnIdx, setActiveAnnIdx] = React.useState(0);
  const [showAnnBar, setShowAnnBar] = React.useState(true);

  // Path synchronize router effect
  React.useEffect(() => {
    const handleLocationChange = () => {
      const path = window.location.pathname;
      if (path === '/admin') {
        setDashboardView('admin');
      } else if (path === '/dashboard') {
        setDashboardView('user');
      } else if (path === '/calculator') {
        setDashboardView('calculator');
      } else if (path === '/how-it-works') {
        setDashboardView('how-it-works');
      } else if (path === '/') {
        setDashboardView('landing');
      }
    };

    window.addEventListener('popstate', handleLocationChange);
    return () => {
      window.removeEventListener('popstate', handleLocationChange);
    };
  }, []);

  // Check and restore existing browser session
  React.useEffect(() => {
    const restoreSession = async () => {
      const storedToken = localStorage.getItem('spaceloan_token');
      const storedUser = localStorage.getItem('spaceloan_user');

      if (storedToken && storedUser) {
        try {
          // Verify with server using compliant /api/auth/session
          const res = await fetch('/api/auth/session', {
            headers: { 'Authorization': `Bearer ${storedToken}` }
          });

          if (res.ok) {
            const data = await res.json();
            setUser(data.user);
            setToken(storedToken);
            
            // Sync dashboard view state with current URL pathname
            const path = window.location.pathname;
            if (path === '/admin') {
              setDashboardView('admin');
            } else if (path === '/dashboard') {
              if (data.user.role === 'admin') {
                window.history.replaceState({}, '', '/admin');
                setDashboardView('admin');
              } else {
                setDashboardView('user');
              }
            } else if (path === '/calculator') {
              setDashboardView('calculator');
            } else if (path === '/how-it-works') {
              setDashboardView('how-it-works');
            } else {
              setDashboardView('landing');
            }
          } else {
            // Clean expired credentials
            localStorage.removeItem('spaceloan_token');
            localStorage.removeItem('spaceloan_user');
          }
        } catch (e) {
          console.error('Session restoration failed', e);
        }
      }
      setIsInitializing(false);
    };

    restoreSession();
  }, []);

  // Fetch announcements & active homepage elements
  const fetchGlobalData = React.useCallback(async () => {
    try {
      const resHome = await fetch('/api/homepage');
      if (resHome.ok) {
        const hData = await resHome.json();
        setHomePage(hData);
      }

      const resAnn = await fetch('/api/announcements');
      if (resAnn.ok) {
        const aData = await resAnn.json();
        setAnnouncements(aData);
      }
    } catch (err) {
      console.error('Failed fetching core global parameters', err);
    }
  }, []);

  React.useEffect(() => {
    fetchGlobalData();
    // Poll updates every 10 seconds for real-time announcements
    const interval = setInterval(fetchGlobalData, 10000);
    return () => clearInterval(interval);
  }, [fetchGlobalData]);

  // Auth Callbacks
  const handleAuthSuccess = (authToken: string, authUser: User) => {
    setUser(authUser);
    setToken(authToken);
    localStorage.setItem('spaceloan_token', authToken);
    localStorage.setItem('spaceloan_user', JSON.stringify(authUser));
    setAuthModalOpen(false);

    if (authUser.role === 'admin') {
      window.history.pushState({}, '', '/admin');
      setDashboardView('admin');
    } else {
      if (prefilledLoanAmount !== undefined) {
        setUserDashboardTab('apply');
      } else {
        setUserDashboardTab('overview');
      }
      window.history.pushState({}, '', '/dashboard');
      setDashboardView('user');
    }
  };

  const handleLogout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('spaceloan_token');
    localStorage.removeItem('spaceloan_user');
    window.history.pushState({}, '', '/');
    setDashboardView('landing');
  };

  const handleOpenAuth = (mode: 'login' | 'register') => {
    setAuthModalMode(mode);
    setAuthModalOpen(true);
  };

  const handleApplyClick = () => {
    window.history.pushState({}, '', '/calculator');
    setDashboardView('calculator');
  };

  const handleCalculatorApply = (amount: number, term: number) => {
    setPrefilledLoanAmount(amount);
    setPrefilledLoanTerm(term);
    if (user) {
      setUserDashboardTab('apply');
      setDashboardView('user');
      window.history.pushState({}, '', '/dashboard');
    } else {
      handleOpenAuth('register');
    }
  };

  const handleSupportClick = () => {
    if (user) {
      setUserDashboardTab('support');
      setDashboardView('user');
      window.history.pushState({}, '', '/dashboard');
    } else {
      setTimeout(() => {
        const element = document.getElementById('contact-section');
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    }
  };

  const navigateToDashboard = () => {
    if (!user) {
      handleOpenAuth('login');
      return;
    }
    if (user.role === 'admin') {
      window.history.pushState({}, '', '/admin');
      setDashboardView('admin');
    } else {
      setUserDashboardTab('overview');
      window.history.pushState({}, '', '/dashboard');
      setDashboardView('user');
    }
  };

  const navigateToHome = () => {
    window.history.pushState({}, '', '/');
    setDashboardView('landing');
  };

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white" id="app-loading-screen">
        <Cpu className="h-10 w-10 text-cyan-400 animate-spin mb-4" />
        <span className="font-mono text-xs text-gray-500 uppercase tracking-widest">Decrypting System Parameters...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col selection:bg-cyan-500/30 selection:text-cyan-200" id="spaceloan-root-layout">
      
      {/* Main Navigation Header */}
      <Navbar 
        user={user}
        onOpenAuth={handleOpenAuth}
        onLogout={handleLogout}
        onNavigateToDashboard={navigateToDashboard}
        onNavigateToHome={navigateToHome}
        onApplyClick={handleApplyClick}
        onSupportClick={handleSupportClick}
        onCalculatorClick={() => {
          window.history.pushState({}, '', '/calculator');
          setDashboardView('calculator');
        }}
        onHowItWorksClick={() => {
          window.history.pushState({}, '', '/how-it-works');
          setDashboardView('how-it-works');
        }}
        onEligibilityClick={() => {
          window.history.pushState({}, '', '/calculator');
          setDashboardView('calculator');
        }}
        onGovernmentWarningClick={() => {
          window.history.pushState({}, '', '/government-warning');
          setDashboardView('government-warning');
        }}
      />

      {/* Routing Controller */}
      <main className="flex-grow">
        
        {/* 1. PUBLIC LANDING VIEW */}
        {dashboardView === 'landing' && (
          <div id="view-landing-page" className="animate-fade-in flex flex-col justify-center">
            <Hero 
              content={homePage}
              onApplyClick={handleApplyClick}
              onOpenAuth={handleOpenAuth}
              onNavigateToDashboard={navigateToDashboard}
              onSupportClick={handleSupportClick}
              onCalculatorClick={() => {
                window.history.pushState({}, '', '/calculator');
                setDashboardView('calculator');
              }}
              onHowItWorksClick={() => {
                window.history.pushState({}, '', '/how-it-works');
                setDashboardView('how-it-works');
              }}
              onGovernmentWarningClick={() => {
                window.history.pushState({}, '', '/government-warning');
                setDashboardView('government-warning');
              }}
            />
          </div>
        )}

        {/* 1.25 DEDICATED HOW IT WORKS PAGE */}
        {dashboardView === 'how-it-works' && (
          <div id="view-how-it-works-page" className="animate-fade-in">
            <HowItWorksPage 
              onBackToHome={navigateToHome}
              onCalculatorClick={() => {
                window.history.pushState({}, '', '/calculator');
                setDashboardView('calculator');
              }}
            />
          </div>
        )}

        {/* 1.35 DEDICATED GOVERNMENT WARNING PAGE */}
        {dashboardView === 'government-warning' && (
          <div id="view-government-warning-page" className="animate-fade-in">
            <GovernmentWarningPage 
              onBackToHome={navigateToHome}
            />
          </div>
        )}

        {/* 1.5 SEPARATE CALCULATOR PAGE */}
        {dashboardView === 'calculator' && (
          <div id="view-calculator-page" className="animate-fade-in">
            <LoanCalculatorPage 
              onBackToHome={navigateToHome}
              onApplyClick={handleCalculatorApply}
              initialAmount={prefilledLoanAmount}
              initialTerm={prefilledLoanTerm}
            />
          </div>
        )}

        {/* 2. PROTECTED BORROWER WORKSPACE */}
        {dashboardView === 'user' && user && token && (
          <div id="view-user-dashboard" className="animate-fade-in">
            <UserDashboard 
              user={user}
              token={token}
              onLogout={handleLogout}
              defaultTab={userDashboardTab}
              onTabChange={setUserDashboardTab}
              prefilledAmount={prefilledLoanAmount}
              prefilledTerm={prefilledLoanTerm}
              onClearPrefilled={() => {
                setPrefilledLoanAmount(undefined);
                setPrefilledLoanTerm(undefined);
              }}
              onUpdateUser={(updatedUser) => {
                setUser(updatedUser);
                localStorage.setItem('spaceloan_user', JSON.stringify(updatedUser));
              }}
            />
          </div>
        )}

        {/* 3. PROTECTED HIDDEN ADMIN OPS DESK */}
        {dashboardView === 'admin' && (
          <div id="view-admin-dashboard" className="animate-fade-in">
            {user && token ? (
              user.role === 'admin' ? (
                <AdminDashboard 
                  adminUser={user}
                  token={token}
                  onLogout={handleLogout}
                />
              ) : (
                <div className="max-w-md mx-auto my-20 p-8 border border-red-500/20 bg-red-950/10 rounded-2xl text-center" id="admin-forbidden-card">
                  <ShieldAlert className="h-12 w-12 text-red-500 mx-auto mb-4" />
                  <h3 className="font-display text-lg font-bold text-white mb-2">Access Restrict Violation</h3>
                  <p className="text-xs text-gray-400 leading-relaxed mb-6">This administrative protocol console is reserved exclusively for cleared security officers.</p>
                  <div className="flex flex-col gap-2 max-w-xs mx-auto">
                    <button 
                      onClick={() => {
                        window.history.pushState({}, '', '/dashboard');
                        setDashboardView('user');
                      }}
                      className="px-5 py-2.5 bg-white text-black text-xs font-semibold rounded-lg hover:bg-cyan-400 transition"
                    >
                      Return to Normal Workspace
                    </button>
                    <button 
                      onClick={handleLogout}
                      className="px-5 py-2.5 border border-white/10 text-white text-xs font-semibold rounded-lg hover:bg-white/5 transition"
                    >
                      Sign Out and Switch Account
                    </button>
                  </div>
                </div>
              )
            ) : (
              <AdminLoginSection onAuthSuccess={handleAuthSuccess} />
            )}
          </div>
        )}

      </main>

      {/* Global Brand Footer */}
      <Footer onNavigateToHome={navigateToHome} />

      {/* Modular Auth Modal Overlay */}
      {authModalOpen && (
        <AuthModal 
          isOpen={authModalOpen}
          initialMode={authModalMode}
          onClose={() => setAuthModalOpen(false)}
          onAuthSuccess={handleAuthSuccess}
        />
      )}

      {/* Globally Floating Interactive Chatbot */}
      <Chatbot user={user} token={token} />

    </div>
  );
}

interface AdminLoginSectionProps {
  onAuthSuccess: (token: string, user: User) => void;
}

function AdminLoginSection({ onAuthSuccess }: AdminLoginSectionProps) {
  const [email, setEmail] = React.useState('admin@spaceloan.space');
  const [password, setPassword] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) {
      setError('Administrative password is required.');
      return;
    }
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Access denied.');
      }

      if (data.user?.role !== 'admin') {
        throw new Error('This terminal is reserved exclusively for system administrators.');
      }

      onAuthSuccess(data.token, data.user);
    } catch (err: any) {
      setError(err.message || 'System verification failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto my-16 p-8 border border-cyan-500/10 bg-zinc-950/40 rounded-2xl shadow-[0_0_50px_rgba(6,182,212,0.05)] backdrop-blur-xl" id="admin-login-terminal">
      <div className="text-center mb-8">
        <div className="h-12 w-12 rounded-xl bg-cyan-950/50 border border-cyan-500/20 flex items-center justify-center mx-auto mb-4 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.1)]">
          <ShieldAlert className="h-6 w-6 animate-pulse" />
        </div>
        <h2 className="font-display text-lg font-bold uppercase tracking-wider text-white">Security Clearance Protocol</h2>
        <p className="font-mono text-[10px] text-gray-500 uppercase tracking-widest mt-1">Authorized Officers Only</p>
      </div>

      {error && (
        <div className="mb-6 p-4 border border-red-500/20 bg-red-950/10 text-red-400 text-xs rounded-xl flex items-start gap-2.5 font-mono" id="admin-login-error">
          <ShieldAlert className="h-4 w-4 flex-shrink-0 text-red-500" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5" id="admin-login-form">
        <div className="space-y-1.5">
          <label className="font-mono text-[10px] text-gray-400 uppercase tracking-widest block">Administrative Identifier</label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
            <input 
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:border-cyan-500/50 focus:bg-white/[0.07] outline-none transition font-sans"
              placeholder="admin@spaceloan.space"
              required
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="font-mono text-[10px] text-gray-400 uppercase tracking-widest block">Security Passphrase</label>
            <span className="text-[10px] text-cyan-400 font-mono">Demo: admin123</span>
          </div>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
            <input 
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:border-cyan-500/50 focus:bg-white/[0.07] outline-none transition font-mono tracking-widest"
              placeholder="••••••••"
              required
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-bold uppercase tracking-widest rounded-xl transition flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(6,182,212,0.25)] hover:shadow-[0_0_30px_rgba(6,182,212,0.45)] cursor-pointer disabled:opacity-50"
        >
          {loading ? (
            <RefreshCw className="h-4 w-4 animate-spin" />
          ) : (
            <>
              Decrypt Node <ArrowUpRight className="h-4 w-4" />
            </>
          )}
        </button>

        <div className="text-center pt-2">
          <button
            type="button"
            onClick={() => {
              window.history.pushState({}, '', '/');
              // Trigger simple routing event
              window.dispatchEvent(new PopStateEvent('popstate'));
            }}
            className="text-[10px] font-mono uppercase tracking-widest text-gray-500 hover:text-cyan-400 transition"
          >
            ← Terminate Console
          </button>
        </div>
      </form>
    </div>
  );
}
