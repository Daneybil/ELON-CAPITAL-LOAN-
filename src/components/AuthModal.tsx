import React from 'react';
import { X, ShieldCheck, Mail, Lock, User as UserIcon, Phone, Globe, ArrowRight, RefreshCw, Key } from 'lucide-react';
import { User } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  initialMode: 'login' | 'register';
  onClose: () => void;
  onAuthSuccess: (token: string, user: User) => void;
}

export default function AuthModal({
  isOpen,
  initialMode,
  onClose,
  onAuthSuccess,
}: AuthModalProps) {
  const [mode, setMode] = React.useState<'login' | 'register' | 'verify' | 'forgot' | 'reset'>(initialMode);
  
  // Registration States
  const [regName, setRegName] = React.useState('');
  const [regEmail, setRegEmail] = React.useState('');
  const [regPhone, setRegPhone] = React.useState('');
  const [regCountry, setRegCountry] = React.useState('');
  const [regPassword, setRegPassword] = React.useState('');
  const [regConfirmPassword, setRegConfirmPassword] = React.useState('');

  // Login States
  const [loginEmail, setLoginEmail] = React.useState('');
  const [loginPassword, setLoginPassword] = React.useState('');
  const [rememberMe, setRememberMe] = React.useState(false);

  // Verification State
  const [verifyEmail, setVerifyEmail] = React.useState('');
  const [verifyCode, setVerifyCode] = React.useState('');
  const [demoCodeHint, setDemoCodeHint] = React.useState(''); // Used to show code directly in testing UI!

  // Forgot / Reset States
  const [forgotEmail, setForgotEmail] = React.useState('');
  const [resetCode, setResetCode] = React.useState('');
  const [newPassword, setNewPassword] = React.useState('');

  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  const [success, setSuccess] = React.useState('');

  React.useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setError('');
      setSuccess('');
    }
  }, [isOpen, initialMode]);

  if (!isOpen) return null;

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (regPassword !== regConfirmPassword) {
      setError('Passwords do not match.');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: regName,
          email: regEmail,
          phone: regPhone,
          country: regCountry,
          password: regPassword,
          confirmPassword: regConfirmPassword
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      setSuccess('Verification code sent.');
      setVerifyEmail(regEmail);
      setDemoCodeHint(data.verificationCode); // Store code hint for testing comfort
      setTimeout(() => {
        setMode('verify');
        setSuccess('');
      }, 1200);
    } catch (err: any) {
      setError(err.message || 'Server connection error');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: verifyEmail,
          code: verifyCode
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Verification failed');
      }

      setSuccess('Email verified successfully!');
      setTimeout(() => {
        onAuthSuccess(data.token, data.user);
        onClose();
      }, 1000);
    } catch (err: any) {
      setError(err.message || 'Invalid code');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: loginEmail,
          password: loginPassword,
          rememberMe
        })
      });

      const data = await res.json();
      if (!res.ok) {
        if (data.notVerified) {
          setError('Email is not verified yet.');
          setVerifyEmail(data.email);
          setDemoCodeHint(data.verificationCode);
          setTimeout(() => {
            setMode('verify');
            setError('');
          }, 1500);
          return;
        }
        throw new Error(data.error || 'Login credentials invalid');
      }

      setSuccess('Access authorized.');
      setTimeout(() => {
        onAuthSuccess(data.token, data.user);
        onClose();
      }, 1000);
    } catch (err: any) {
      setError(err.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Forgot password failed');

      setSuccess('Reset code generated.');
      if (data.resetCode) {
        setDemoCodeHint(data.resetCode);
      }
      setTimeout(() => {
        setMode('reset');
        setSuccess('');
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: forgotEmail || verifyEmail,
          code: resetCode,
          newPassword
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Reset password failed');

      setSuccess('Password updated successfully!');
      setTimeout(() => {
        setMode('login');
        setSuccess('');
        setError('');
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Invalid parameters');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto" id="auth-modal-root">
      {/* Modal Frame */}
      <div 
        className="relative w-full max-w-lg bg-black border border-white/10 rounded-2xl p-8 shadow-[0_0_50px_rgba(6,182,212,0.15)] my-8"
        id="auth-modal-frame"
      >
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 text-gray-500 hover:text-white hover:bg-white/5 p-1.5 rounded-lg transition-colors cursor-pointer"
          id="btn-auth-close"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Brand Header */}
        <div className="text-center mb-8" id="auth-modal-header">
          <div className="h-10 w-10 rounded-lg bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center mx-auto shadow-md mb-3">
            <ShieldCheck className="h-5 w-5 text-white" />
          </div>
          <span className="font-mono text-[9px] text-cyan-400 tracking-widest uppercase">SpaceLoan Crypto-Security Desk</span>
        </div>

        {/* Global Error/Success displays */}
        {error && (
          <div className="mb-6 p-4 bg-red-950/40 border border-red-500/20 rounded-xl text-xs font-mono text-red-400" id="auth-error">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-6 p-4 bg-cyan-950/40 border border-cyan-500/20 rounded-xl text-xs font-mono text-cyan-400 flex items-center gap-2" id="auth-success">
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-ping" />
            {success}
          </div>
        )}

        {/* ---------------- LOGIN MODE ---------------- */}
        {mode === 'login' && (
          <form onSubmit={handleLogin} className="space-y-6" id="form-login">
            <div>
              <h3 className="font-display text-2xl font-bold text-white mb-2">Access Credentials</h3>
              <p className="text-xs text-gray-400">Enter your secure SpaceLoan dashboard credentials.</p>
            </div>

            {/* Quick Login Info */}
            <div className="p-3 bg-white/[0.02] border border-white/5 rounded-lg text-[10px] font-mono text-gray-400 space-y-1">
              <span className="text-cyan-400 font-semibold uppercase">Quick Demo Login Accents:</span>
              <div className="flex justify-between">
                <span>Borrower: borrower@spaceloan.space</span>
                <span className="text-white">borrower123</span>
              </div>
              <div className="flex justify-between">
                <span>Compliance Admin: admin@spaceloan.space</span>
                <span className="text-white">admin123</span>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-gray-500 uppercase mb-2">Secure Email</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-gray-500" />
                  <input 
                    type="email" 
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className="w-full pl-11 pr-4 py-3.5 bg-black border border-white/5 hover:border-white/10 focus:border-cyan-500/50 rounded-xl text-sm text-white focus:outline-none transition-all"
                    placeholder="e.g. name@company.com"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-mono text-gray-500 uppercase">Password</label>
                  <button 
                    type="button"
                    onClick={() => { setMode('forgot'); setError(''); }}
                    className="text-xs text-cyan-400 hover:underline"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-gray-500" />
                  <input 
                    type="password" 
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full pl-11 pr-4 py-3.5 bg-black border border-white/5 hover:border-white/10 focus:border-cyan-500/50 rounded-xl text-sm text-white focus:outline-none transition-all"
                    placeholder="••••••••••••"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer text-xs text-gray-400 hover:text-white select-none">
                <input 
                  type="checkbox" 
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-white/10 bg-black text-cyan-500 focus:ring-0 focus:ring-offset-0 h-4 w-4"
                />
                Remember security session
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 text-sm font-medium text-black bg-white rounded-xl hover:bg-cyan-400 transition-all duration-300 flex items-center justify-center gap-2 group disabled:opacity-55 cursor-pointer"
              id="btn-login-submit"
            >
              {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : "Authorize Entry"}
              <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
            </button>

            <p className="text-center text-xs text-gray-500">
              Don't have an account?{' '}
              <button 
                type="button"
                onClick={() => { setMode('register'); setError(''); }}
                className="text-white hover:text-cyan-400 underline font-medium"
              >
                Register here
              </button>
            </p>
          </form>
        )}

        {/* ---------------- REGISTER MODE ---------------- */}
        {mode === 'register' && (
          <form onSubmit={handleRegister} className="space-y-4" id="form-register">
            <div>
              <h3 className="font-display text-2xl font-bold text-white mb-1">Corporate Registration</h3>
              <p className="text-xs text-gray-400">Launch your liquidity dashboard securely.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-mono text-gray-500 uppercase mb-1">Full Name</label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-3 h-3.5 w-3.5 text-gray-500" />
                  <input 
                    type="text" 
                    required
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-black border border-white/5 hover:border-white/10 focus:border-cyan-500/50 rounded-lg text-xs text-white focus:outline-none transition-all"
                    placeholder="John Doe"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-mono text-gray-500 uppercase mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-3.5 w-3.5 text-gray-500" />
                  <input 
                    type="email" 
                    required
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-black border border-white/5 hover:border-white/10 focus:border-cyan-500/50 rounded-lg text-xs text-white focus:outline-none transition-all"
                    placeholder="name@company.com"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-mono text-gray-500 uppercase mb-1">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-3.5 w-3.5 text-gray-500" />
                  <input 
                    type="tel" 
                    required
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-black border border-white/5 hover:border-white/10 focus:border-cyan-500/50 rounded-lg text-xs text-white focus:outline-none transition-all"
                    placeholder="+41 44 123 45 67"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-mono text-gray-500 uppercase mb-1">Country</label>
                <div className="relative">
                  <Globe className="absolute left-3 top-3 h-3.5 w-3.5 text-gray-500" />
                  <input 
                    type="text" 
                    required
                    value={regCountry}
                    onChange={(e) => setRegCountry(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-black border border-white/5 hover:border-white/10 focus:border-cyan-500/50 rounded-lg text-xs text-white focus:outline-none transition-all"
                    placeholder="Switzerland"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-mono text-gray-500 uppercase mb-1">Create Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-3.5 w-3.5 text-gray-500" />
                  <input 
                    type="password" 
                    required
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-black border border-white/5 hover:border-white/10 focus:border-cyan-500/50 rounded-lg text-xs text-white focus:outline-none transition-all"
                    placeholder="••••••••••••"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-mono text-gray-500 uppercase mb-1">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-3.5 w-3.5 text-gray-500" />
                  <input 
                    type="password" 
                    required
                    value={regConfirmPassword}
                    onChange={(e) => setRegConfirmPassword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-black border border-white/5 hover:border-white/10 focus:border-cyan-500/50 rounded-lg text-xs text-white focus:outline-none transition-all"
                    placeholder="••••••••••••"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 text-xs font-medium text-black bg-white rounded-xl hover:bg-cyan-400 transition-all duration-300 flex items-center justify-center gap-2 group disabled:opacity-55 cursor-pointer mt-2"
              id="btn-register-submit"
            >
              {loading ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : "Verify Identity Channels"}
              <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
            </button>

            <p className="text-center text-xs text-gray-500">
              Already have an account?{' '}
              <button 
                type="button"
                onClick={() => { setMode('login'); setError(''); }}
                className="text-white hover:text-cyan-400 underline font-medium"
              >
                Login here
              </button>
            </p>
          </form>
        )}

        {/* ---------------- VERIFY EMAIL MODE ---------------- */}
        {mode === 'verify' && (
          <form onSubmit={handleVerifyEmail} className="space-y-6" id="form-verify">
            <div>
              <h3 className="font-display text-2xl font-bold text-white mb-2">Security Verification</h3>
              <p className="text-xs text-gray-400">An authorization code was dispatched to <span className="text-white font-semibold">{verifyEmail}</span>.</p>
            </div>

            {demoCodeHint && (
              <div className="p-4 bg-cyan-950/40 border border-cyan-500/30 rounded-xl text-xs font-mono text-center space-y-1">
                <span className="text-cyan-400 uppercase font-bold">Simulated Transmission Success:</span>
                <p>Use code: <span className="text-white text-lg font-bold select-all tracking-widest">{demoCodeHint}</span></p>
              </div>
            )}

            <div>
              <label className="block text-xs font-mono text-gray-500 uppercase mb-3 text-center">6-Digit Verification Token</label>
              <div className="relative max-w-xs mx-auto">
                <Key className="absolute left-3.5 top-3.5 h-4 w-4 text-gray-500" />
                <input 
                  type="text" 
                  maxLength={6}
                  required
                  value={verifyCode}
                  onChange={(e) => setVerifyCode(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-black border border-white/5 hover:border-white/10 focus:border-cyan-500/50 rounded-xl text-center text-lg font-mono tracking-widest text-white focus:outline-none transition-all"
                  placeholder="000000"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 text-sm font-medium text-black bg-white rounded-xl hover:bg-cyan-400 transition-all duration-300 flex items-center justify-center gap-2 group disabled:opacity-55 cursor-pointer"
              id="btn-verify-submit"
            >
              {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : "Verify & Activate Dashboard"}
            </button>
          </form>
        )}

        {/* ---------------- FORGOT PASSWORD MODE ---------------- */}
        {mode === 'forgot' && (
          <form onSubmit={handleForgot} className="space-y-6" id="form-forgot">
            <div>
              <h3 className="font-display text-2xl font-bold text-white mb-2">Reset Key</h3>
              <p className="text-xs text-gray-400">Specify your registered email address to locate your security records.</p>
            </div>

            <div>
              <label className="block text-xs font-mono text-gray-500 uppercase mb-2">Secure Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-gray-500" />
                <input 
                  type="email" 
                  required
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3.5 bg-black border border-white/5 hover:border-white/10 focus:border-cyan-500/50 rounded-xl text-sm text-white focus:outline-none transition-all"
                  placeholder="name@company.com"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 text-sm font-medium text-black bg-white rounded-xl hover:bg-cyan-400 transition-all duration-300 flex items-center justify-center gap-2 group disabled:opacity-55 cursor-pointer"
              id="btn-forgot-submit"
            >
              {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : "Retrieve Account Key"}
            </button>

            <button 
              type="button"
              onClick={() => { setMode('login'); setError(''); }}
              className="w-full text-center text-xs text-gray-400 hover:text-white"
            >
              Return to Login
            </button>
          </form>
        )}

        {/* ---------------- RESET PASSWORD MODE ---------------- */}
        {mode === 'reset' && (
          <form onSubmit={handleReset} className="space-y-6" id="form-reset">
            <div>
              <h3 className="font-display text-2xl font-bold text-white mb-2">Establish New Password</h3>
              <p className="text-xs text-gray-400 font-light">Input the temporary verification key and set your new credentials.</p>
            </div>

            {demoCodeHint && (
              <div className="p-4 bg-cyan-950/40 border border-cyan-500/30 rounded-xl text-xs font-mono text-center space-y-1">
                <span className="text-cyan-400 uppercase font-bold">Simulated Reset Code:</span>
                <p>Use code: <span className="text-white text-lg font-bold select-all tracking-widest">{demoCodeHint}</span></p>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-gray-500 uppercase mb-2">Reset Code</label>
                <input 
                  type="text" 
                  required
                  value={resetCode}
                  onChange={(e) => setResetCode(e.target.value)}
                  className="w-full px-4 py-3 bg-black border border-white/5 hover:border-white/10 focus:border-cyan-500/50 rounded-xl text-sm font-mono text-white focus:outline-none transition-all"
                  placeholder="e.g. 123456"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-gray-500 uppercase mb-2">Establish New Password</label>
                <input 
                  type="password" 
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-black border border-white/5 hover:border-white/10 focus:border-cyan-500/50 rounded-xl text-sm text-white focus:outline-none transition-all"
                  placeholder="••••••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 text-sm font-medium text-black bg-white rounded-xl hover:bg-cyan-400 transition-all duration-300 flex items-center justify-center gap-2 group disabled:opacity-55 cursor-pointer"
              id="btn-reset-submit"
            >
              {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : "Confirm Security Overhaul"}
            </button>
          </form>
        )}

      </div>
    </div>
  );
}
