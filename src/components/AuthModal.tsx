import React from 'react';
import { X, ShieldCheck, Mail, Lock, User as UserIcon, Phone, Globe, ArrowRight, RefreshCw, Key } from 'lucide-react';
import { User } from '../types';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  sendEmailVerification, 
  sendPasswordResetEmail,
  signInWithPopup, 
  GoogleAuthProvider,
  signOut
} from 'firebase/auth';
import { auth } from '../firebase';

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
  const [demoCodeHint, setDemoCodeHint] = React.useState(''); // Not used but kept for type compatibility

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
    setSuccess('');
    setLoading(true);

    if (regPassword !== regConfirmPassword) {
      setError('Passwords do not match.');
      setLoading(false);
      return;
    }

    try {
      // 1. Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, regEmail, regPassword);
      const firebaseUser = userCredential.user;

      // 2. Send Email Verification
      await sendEmailVerification(firebaseUser);

      // 3. Sync user profile on backend with isVerified: false
      const syncRes = await fetch('/api/auth/firebase-sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uid: firebaseUser.uid,
          email: regEmail,
          name: regName,
          phone: regPhone,
          country: regCountry,
          isVerified: false
        })
      });

      if (!syncRes.ok) {
        const syncData = await syncRes.json();
        throw new Error(syncData.error || 'Failed to sync user records.');
      }

      // Log out immediately so unverified sessions aren't kept active
      await signOut(auth);

      setSuccess('Corporate security key dispatched. Verification email sent.');
      setVerifyEmail(regEmail);
      setTimeout(() => {
        setMode('verify');
        setSuccess('');
      }, 1500);
    } catch (err: any) {
      console.error('Registration failed:', err);
      let errMsg = err.message;
      if (err.code === 'auth/email-already-in-use') {
        errMsg = 'This email address is already registered in our secure archives.';
      } else if (err.code === 'auth/weak-password') {
        errMsg = 'Security protocols require a password of at least 6 characters.';
      } else if (err.code === 'auth/invalid-email') {
        errMsg = 'The specified email address format is invalid.';
      }
      setError(errMsg || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleResendEmailVerification = async () => {
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const emailToUse = verifyEmail || loginEmail || regEmail;
      const passwordToUse = loginPassword || regPassword;

      if (!emailToUse || !passwordToUse) {
        throw new Error('Please input your secure credentials to re-issue verification.');
      }

      const userCredential = await signInWithEmailAndPassword(auth, emailToUse, passwordToUse);
      await sendEmailVerification(userCredential.user);
      await signOut(auth);
      setSuccess('Verification email resent successfully! Please check your inbox and spam/junk folder.');
    } catch (err: any) {
      console.error('Failed to resend:', err);
      let errMsg = err.message;
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password') {
        errMsg = 'Unable to re-verify due to invalid password credentials.';
      }
      setError(errMsg || 'Failed to dispatch verification email.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('Please click the confirmation link sent to your email to verify your address.');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      // 1. Authenticate with Firebase Auth
      const userCredential = await signInWithEmailAndPassword(auth, loginEmail, loginPassword);
      const firebaseUser = userCredential.user;

      // 2. Enforce email verification before proceeding
      if (!firebaseUser.emailVerified) {
        await signOut(auth);
        setVerifyEmail(loginEmail);
        setError('Your email address is not verified yet. Please check your inbox or spam folder for the activation link.');
        setMode('verify');
        return;
      }

      // 3. Synchronize with local server database
      const syncRes = await fetch('/api/auth/firebase-sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uid: firebaseUser.uid,
          email: loginEmail,
          isVerified: true
        })
      });

      const data = await syncRes.json();
      if (!syncRes.ok) {
        await signOut(auth);
        throw new Error(data.error || 'Backend synchronization failed.');
      }

      setSuccess('Access authorized.');
      setTimeout(() => {
        onAuthSuccess(data.token, data.user);
        onClose();
      }, 1000);
    } catch (err: any) {
      console.error('Login failed:', err);
      let errMsg = err.message;
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found') {
        errMsg = 'Invalid email address or corporate password.';
      }
      setError(errMsg || 'Authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      const firebaseUser = userCredential.user;

      // Google emails are automatically verified
      const syncRes = await fetch('/api/auth/firebase-sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          name: firebaseUser.displayName,
          isVerified: true
        })
      });

      const data = await syncRes.json();
      if (!syncRes.ok) {
        await signOut(auth);
        throw new Error(data.error || 'Google account synchronization failed.');
      }

      setSuccess('Google credentials verified. Access authorized.');
      setTimeout(() => {
        onAuthSuccess(data.token, data.user);
        onClose();
      }, 1000);
    } catch (err: any) {
      console.error('Google login failed:', err);
      let errMsg = err.message;
      if (err.code === 'auth/popup-closed-by-user') {
        errMsg = 'Google authentication popup closed prior to completion.';
      }
      setError(errMsg || 'Google authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await sendPasswordResetEmail(auth, forgotEmail);
      setSuccess('A password reset security link has been sent to your email address. Check your inbox and spam folder.');
    } catch (err: any) {
      console.error('Password reset failed:', err);
      let errMsg = err.message;
      if (err.code === 'auth/user-not-found') {
        errMsg = 'No registered record located for this email address.';
      }
      setError(errMsg || 'Password reset request failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('Please use the secure link sent to your email to establish your new password.');
  };

    return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-lg overflow-y-auto animate-fade-in" id="auth-modal-root">
      {/* Modal Frame with Premium 3D Glassmorphic Look matching image */}
      <div 
        className="relative w-full max-w-2xl glass-3d-card rounded-[2rem] p-8 sm:p-10 my-8 transform transition-transform duration-300"
        id="auth-modal-frame"
      >
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 text-zinc-400 hover:text-white hover:bg-white/10 p-2 rounded-full transition-all duration-150 cursor-pointer shadow-[0_2px_8px_rgba(0,0,0,0.5)] border border-white/10 relative z-50"
          id="btn-auth-close"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Brand Header */}
        <div className="text-center mb-8 relative z-10" id="auth-modal-header">
          {/* Glowing Blue 3D Badge */}
          <div className="h-16 w-16 glowing-shield-badge flex items-center justify-center mx-auto mb-4 relative z-10">
            <ShieldCheck className="h-8 w-8 text-white filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]" />
          </div>
          <h2 className="text-lg sm:text-xl font-black text-cyan-400 tracking-wider uppercase font-sans">
            Elon Musk Capital Loan
          </h2>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-wider uppercase mt-1 font-sans">
            {mode === 'login' ? 'CORPORATE ACCESS' : 'CORPORATE REGISTRATION'}
          </h1>
        </div>

        {/* Global Error/Success displays */}
        {error && (
          <div className="mb-6 p-4 bg-red-950/50 border border-red-500/30 rounded-xl text-xs font-mono text-red-400 shadow-[inset_0_2px_4px_rgba(0,0,0,0.4)] relative z-10" id="auth-error">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-6 p-4 bg-cyan-950/50 border border-cyan-500/30 rounded-xl text-xs font-mono text-cyan-400 flex items-center gap-2 shadow-[inset_0_2px_4px_rgba(0,0,0,0.4)] relative z-10" id="auth-success">
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-ping" />
            {success}
          </div>
        )}

        {/* ---------------- LOGIN MODE ---------------- */}
        {mode === 'login' && (
          <form onSubmit={handleLogin} className="space-y-6 relative z-10" id="form-login">
            {/* Quick Login Info with Classic Inset Border */}
            <div className="p-4 bg-black/60 border border-white/10 rounded-xl text-[11px] font-mono text-gray-400 space-y-1.5 shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)]">
              <span className="text-cyan-400 font-black uppercase tracking-wider">Quick Demo Login Accents:</span>
              <div className="flex justify-between border-b border-white/5 pb-1">
                <span>Borrower: borrower@spaceloan.space</span>
                <span className="text-white font-bold">borrower123</span>
              </div>
              <div className="flex justify-between pt-1">
                <span>Compliance Admin: admin@spaceloan.space</span>
                <span className="text-white font-bold">admin123</span>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-[11px] font-sans font-extrabold text-gray-400 uppercase tracking-wider mb-2 text-left">Secure Email</label>
                <div className="relative glass-3d-input flex items-center">
                  <Mail className="absolute left-4 h-4 w-4 text-zinc-500" />
                  <input 
                    type="email" 
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className="w-full pl-12 pr-4 py-3.5 bg-transparent border-0 focus:ring-0 focus:outline-none text-sm text-white font-medium"
                    placeholder="name@company.com"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-[11px] font-sans font-extrabold text-gray-400 uppercase tracking-wider text-left">Password</label>
                  <button 
                    type="button"
                    onClick={() => { setMode('forgot'); setError(''); }}
                    className="text-xs text-cyan-400 hover:text-cyan-300 font-bold hover:underline"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative glass-3d-input flex items-center">
                  <Lock className="absolute left-4 h-4 w-4 text-zinc-500" />
                  <input 
                    type="password" 
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full pl-12 pr-4 py-3.5 bg-transparent border-0 focus:ring-0 focus:outline-none text-sm text-white font-medium"
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

            {/* Tactile 3D Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 glass-3d-button flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-6"
              id="btn-login-submit"
            >
              {loading ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <span className="flex items-center gap-1.5 justify-center">
                  SIGN IN NOW <ArrowRight className="h-4 w-4" />
                </span>
              )}
            </button>

            {/* Google Sign-In Integrator */}
            <div className="relative my-6 text-center z-10">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10"></div>
              </div>
              <span className="relative px-3 bg-[#0c0c0f] text-[10px] font-mono uppercase text-zinc-500 tracking-wider">
                Or Continue With
              </span>
            </div>

            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full py-3.5 px-4 bg-white/5 hover:bg-white/10 active:scale-[0.98] border border-white/10 rounded-xl text-white font-bold tracking-wider text-xs transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 shadow-[0_4px_12px_rgba(0,0,0,0.3)]"
            >
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="h-4 w-4" alt="Google" referrerPolicy="no-referrer" />
              SIGN IN WITH GOOGLE
            </button>

            <p className="text-center text-xs text-gray-400 font-medium">
              Don't have an account?{' '}
              <button 
                type="button"
                onClick={() => { setMode('register'); setError(''); }}
                className="text-white hover:text-cyan-400 underline font-bold"
              >
                Register here
              </button>
            </p>
          </form>
        )}

        {/* ---------------- REGISTER MODE ---------------- */}
        {mode === 'register' && (
          <form onSubmit={handleRegister} className="space-y-4 relative z-10" id="form-register">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* FULL NAME */}
              <div>
                <label className="block text-[11px] font-sans font-extrabold text-gray-400 uppercase tracking-wider mb-2 text-left">Full Name</label>
                <div className="relative glass-3d-input flex items-center">
                  <UserIcon className="absolute left-4 h-4 w-4 text-zinc-500" />
                  <input 
                    type="text" 
                    required
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    className="w-full pl-12 pr-4 py-3.5 bg-transparent border-0 focus:ring-0 focus:outline-none text-sm text-white font-medium"
                    placeholder="John Doe"
                  />
                </div>
              </div>

              {/* EMAIL ADDRESS */}
              <div>
                <label className="block text-[11px] font-sans font-extrabold text-gray-400 uppercase tracking-wider mb-2 text-left">Email Address</label>
                <div className="relative glass-3d-input flex items-center">
                  <Mail className="absolute left-4 h-4 w-4 text-zinc-500" />
                  <input 
                    type="email" 
                    required
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    className="w-full pl-12 pr-4 py-3.5 bg-transparent border-0 focus:ring-0 focus:outline-none text-sm text-white font-medium"
                    placeholder="name@company.com"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* PHONE NUMBER */}
              <div>
                <label className="block text-[11px] font-sans font-extrabold text-gray-400 uppercase tracking-wider mb-2 text-left">Phone Number</label>
                <div className="relative glass-3d-input flex items-center">
                  <Phone className="absolute left-4 h-4 w-4 text-zinc-500" />
                  <input 
                    type="tel" 
                    required
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    className="w-full pl-12 pr-4 py-3.5 bg-transparent border-0 focus:ring-0 focus:outline-none text-sm text-white font-medium"
                    placeholder="+41 44 123 45 67"
                  />
                </div>
              </div>

              {/* COUNTRY */}
              <div>
                <label className="block text-[11px] font-sans font-extrabold text-gray-400 uppercase tracking-wider mb-2 text-left">Country</label>
                <div className="relative glass-3d-input flex items-center">
                  <Globe className="absolute left-4 h-4 w-4 text-zinc-500" />
                  <input 
                    type="text" 
                    required
                    value={regCountry}
                    onChange={(e) => setRegCountry(e.target.value)}
                    className="w-full pl-12 pr-4 py-3.5 bg-transparent border-0 focus:ring-0 focus:outline-none text-sm text-white font-medium"
                    placeholder="Switzerland"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* CREATE PASSWORD */}
              <div>
                <label className="block text-[11px] font-sans font-extrabold text-gray-400 uppercase tracking-wider mb-2 text-left">Create Password</label>
                <div className="relative glass-3d-input flex items-center">
                  <Lock className="absolute left-4 h-4 w-4 text-zinc-500" />
                  <input 
                    type="password" 
                    required
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    className="w-full pl-12 pr-4 py-3.5 bg-transparent border-0 focus:ring-0 focus:outline-none text-sm text-white font-medium"
                    placeholder="••••••••••••"
                  />
                </div>
              </div>

              {/* CONFIRM PASSWORD */}
              <div>
                <label className="block text-[11px] font-sans font-extrabold text-gray-400 uppercase tracking-wider mb-2 text-left">Confirm Password</label>
                <div className="relative glass-3d-input flex items-center">
                  <Lock className="absolute left-4 h-4 w-4 text-zinc-500" />
                  <input 
                    type="password" 
                    required
                    value={regConfirmPassword}
                    onChange={(e) => setRegConfirmPassword(e.target.value)}
                    className="w-full pl-12 pr-4 py-3.5 bg-transparent border-0 focus:ring-0 focus:outline-none text-sm text-white font-medium"
                    placeholder="••••••••••••"
                  />
                </div>
              </div>
            </div>

            {/* Tactile 3D Button - Register Now */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 glass-3d-button flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-6"
              id="btn-register-submit"
            >
              {loading ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <span className="flex items-center gap-1.5 justify-center">
                  REGISTER NOW <ArrowRight className="h-4 w-4" />
                </span>
              )}
            </button>

            {/* Security Notice: Spam Folder Check */}
            <div className="p-4 bg-yellow-950/15 border border-yellow-600/10 rounded-2xl text-[11px] leading-relaxed text-yellow-400 font-sans shadow-[inset_0_1px_2px_rgba(0,0,0,0.3)]">
              <span className="font-bold uppercase tracking-wider text-yellow-500 block mb-1">💡 Inbox Activation Notice</span>
              In case you do not see the activation verification email in your inbox after clicking Register, please inspect your <strong className="text-yellow-200">Spam folder, Junk folder, or Promotions folder</strong>. It should arrive within 2-3 minutes.
            </div>

            {/* Google Sign-In Integrator */}
            <div className="relative my-6 text-center z-10">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10"></div>
              </div>
              <span className="relative px-3 bg-[#0c0c0f] text-[10px] font-mono uppercase text-zinc-500 tracking-wider">
                Or Register With
              </span>
            </div>

            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full py-3.5 px-4 bg-white/5 hover:bg-white/10 active:scale-[0.98] border border-white/10 rounded-xl text-white font-bold tracking-wider text-xs transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 shadow-[0_4px_12px_rgba(0,0,0,0.3)]"
            >
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="h-4 w-4" alt="Google" referrerPolicy="no-referrer" />
              REGISTER WITH GOOGLE
            </button>

            <p className="text-center text-xs text-gray-400 font-medium">
              Already have an account?{' '}
              <button 
                type="button"
                onClick={() => { setMode('login'); setError(''); }}
                className="text-white hover:text-cyan-400 underline font-bold"
              >
                Login here
              </button>
            </p>
          </form>
        )}

        {/* ---------------- VERIFY EMAIL MODE ---------------- */}
        {mode === 'verify' && (
          <div className="space-y-6 relative z-10 text-center" id="form-verify">
            <div>
              <h3 className="font-display text-2xl font-black text-white mb-2 uppercase tracking-wide">Verification Needed</h3>
              <p className="text-sm text-gray-400 leading-relaxed font-sans">
                An activation link was successfully dispatched to:
              </p>
              <div className="my-3 px-4 py-2 bg-black/40 border border-white/5 rounded-xl inline-block">
                <span className="text-cyan-400 font-mono font-bold text-sm select-all">{verifyEmail}</span>
              </div>
              <p className="text-xs text-gray-400 leading-relaxed max-w-md mx-auto mt-2 font-sans">
                Please open your email client, open the message from <span className="text-white font-semibold">Elon Musk Capital Loan</span>, and click the confirmation link to activate your security credentials.
              </p>
            </div>

            <div className="p-5 bg-yellow-950/20 border border-yellow-600/10 rounded-2xl text-xs text-left space-y-2 leading-relaxed text-yellow-300 max-w-lg mx-auto font-sans shadow-[inset_0_1px_2px_rgba(0,0,0,0.3)]">
              <p className="font-bold uppercase tracking-wider text-[10px] text-yellow-500">
                ⚠️ Can't find the email?
              </p>
              <p>
                Secure automatic security keys can occasionally be diverted by filtering servers. 
                <strong className="text-yellow-100"> Please verify your Spam folder, Junk folder, Trash folder, or Promotions folder.</strong>
                Delivery might take 2-3 minutes.
              </p>
            </div>

            <div className="space-y-3 max-w-sm mx-auto">
              <button
                type="button"
                onClick={handleResendEmailVerification}
                disabled={loading}
                className="w-full py-4 glass-3d-button flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                id="btn-resend-verification"
              >
                {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : "Resend Activation Link"}
              </button>

              <button
                type="button"
                onClick={() => { setMode('login'); setError(''); setSuccess(''); }}
                className="w-full py-2 text-xs font-bold text-gray-400 hover:text-white transition-colors"
              >
                Return to Login Screen
              </button>
            </div>
          </div>
        )}

        {/* ---------------- FORGOT PASSWORD MODE ---------------- */}
        {mode === 'forgot' && (
          <form onSubmit={handleForgot} className="space-y-6 relative z-10" id="form-forgot">
            <div>
              <h3 className="font-display text-2xl font-black text-white mb-2 uppercase tracking-wide">Reset Key</h3>
              <p className="text-xs text-gray-400">Specify your registered email address to locate your security records.</p>
            </div>

            <div>
              <label className="block text-xs font-sans font-extrabold text-gray-400 uppercase tracking-wider mb-2 text-left">Secure Email</label>
              <div className="relative glass-3d-input flex items-center">
                <Mail className="absolute left-4 h-4 w-4 text-zinc-500" />
                <input 
                  type="email" 
                  required
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 bg-transparent border-0 focus:ring-0 focus:outline-none text-sm text-white font-medium"
                  placeholder="name@company.com"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 glass-3d-button flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-6"
              id="btn-forgot-submit"
            >
              {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : "Retrieve Account Key"}
            </button>

            <button 
              type="button"
              onClick={() => { setMode('login'); setError(''); }}
              className="w-full text-center text-xs text-gray-400 hover:text-white font-bold transition-colors"
            >
              Return to Login
            </button>
          </form>
        )}

        {/* ---------------- RESET PASSWORD MODE ---------------- */}
        {mode === 'reset' && (
          <form onSubmit={handleReset} className="space-y-6 relative z-10" id="form-reset">
            <div>
              <h3 className="font-display text-2xl font-black text-white mb-2 uppercase tracking-wide">Establish New Password</h3>
              <p className="text-xs text-gray-400 font-light">Input the temporary verification key and set your new credentials.</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-sans font-extrabold text-gray-400 uppercase tracking-wider mb-2 text-left">Establish New Password</label>
                <div className="relative glass-3d-input flex items-center">
                  <input 
                    type="password" 
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-4 py-3.5 bg-transparent border-0 focus:ring-0 focus:outline-none text-sm text-white font-medium"
                    placeholder="••••••••••••"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 glass-3d-button flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-6"
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
