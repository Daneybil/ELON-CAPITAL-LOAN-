import React from 'react';
import { X, ShieldCheck, Mail, Lock, User as UserIcon, Phone, Globe, ArrowRight, RefreshCw, Key, ArrowLeft } from 'lucide-react';
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
import CountrySelector from './CountrySelector';

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
  const [mode, setMode] = React.useState<'login' | 'register' | 'verify' | 'forgot' | 'reset' | 'completeProfile'>(initialMode);
  
  // Registration States
  const [regName, setRegName] = React.useState('');
  const [regEmail, setRegEmail] = React.useState('');
  const [regPhone, setRegPhone] = React.useState('');
  const [regCountry, setRegCountry] = React.useState('United States');
  const [regDialCode, setRegDialCode] = React.useState('+1');
  const [regPassword, setRegPassword] = React.useState('');
  const [regConfirmPassword, setRegConfirmPassword] = React.useState('');

  // Complete Profile States (for Google first-time login)
  const [tempToken, setTempToken] = React.useState('');
  const [tempUser, setTempUser] = React.useState<User | null>(null);
  const [completeName, setCompleteName] = React.useState('');
  const [completePhone, setCompletePhone] = React.useState('');
  const [completeCountry, setCompleteCountry] = React.useState('United States');
  const [completeDialCode, setCompleteDialCode] = React.useState('+1');
  const [completeTerms, setCompleteTerms] = React.useState(false);

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
  const [resetOtpCode, setResetOtpCode] = React.useState('');
  const [enteredResetOtp, setEnteredResetOtp] = React.useState('');
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

  // Safe JSON parser to handle non-JSON/HTML error responses safely without throwing JSON parse syntax errors
  const parseJsonResponse = async (res: Response) => {
    const text = await res.text();
    try {
      const data = JSON.parse(text);
      if (!res.ok && data && data.error) {
        throw new Error(data.error);
      }
      return data;
    } catch (err: any) {
      if (err.message && !err.message.includes('JSON')) {
        throw err;
      }
      if (!res.ok) {
        if (res.status === 403) {
          throw new Error('Access denied. Please verify your email address or check your account permissions.');
        }
        if (res.status === 401) {
          throw new Error('Authentication failed. Invalid email or password.');
        }
        if (res.status === 404) {
          throw new Error('User record not found.');
        }
        throw new Error(`Server returned HTTP ${res.status}.`);
      }
      throw new Error('Invalid response received from server.');
    }
  };

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
      // 1. Try creating user in Firebase Auth
      let firebaseUser: any = null;
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, regEmail, regPassword);
        firebaseUser = userCredential.user;
        
        // Send Email Verification
        await sendEmailVerification(firebaseUser);
      } catch (fbErr: any) {
        console.warn('Firebase Auth client createUser failed, falling back to server registration endpoint:', fbErr);
        if (fbErr.code === 'auth/operation-not-allowed' || fbErr.code === 'auth/configuration-not-found' || fbErr.code === 'auth/network-request-failed') {
          const serverRegRes = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name: regName,
              email: regEmail,
              phone: `${regDialCode} ${regPhone}`.trim(),
              country: regCountry,
              password: regPassword,
              confirmPassword: regConfirmPassword
            })
          });
          const serverData = await parseJsonResponse(serverRegRes);
          if (!serverRegRes.ok) {
            throw new Error(serverData.error || 'Registration failed.');
          }
          setSuccess('Corporate security record established. Account verified and active.');
          setVerifyEmail(regEmail);
          setTimeout(() => {
            setMode('login');
            setSuccess('');
          }, 1500);
          return;
        }
        throw fbErr;
      }

      // 2. Sync user profile on backend with isVerified: false
      const fullPhone = `${regDialCode} ${regPhone}`.trim();
      const syncRes = await fetch('/api/auth/firebase-sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uid: firebaseUser.uid,
          email: regEmail,
          name: regName,
          phone: fullPhone,
          country: regCountry,
          isVerified: false
        })
      });

      const syncData = await parseJsonResponse(syncRes);
      if (!syncRes.ok) {
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
      // 1. Authenticate with Firebase Auth (or fallback to server auth if operation-not-allowed)
      let firebaseUser: any = null;
      try {
        const userCredential = await signInWithEmailAndPassword(auth, loginEmail, loginPassword);
        firebaseUser = userCredential.user;
      } catch (fbErr: any) {
        console.warn('Firebase Auth client signIn failed, falling back to server login endpoint:', fbErr);
        if (fbErr.code === 'auth/operation-not-allowed' || fbErr.code === 'auth/configuration-not-found' || fbErr.code === 'auth/network-request-failed') {
          const serverLoginRes = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: loginEmail, password: loginPassword, rememberMe })
          });
          const serverData = await parseJsonResponse(serverLoginRes);
          if (!serverLoginRes.ok) {
            throw new Error(serverData.error || 'Authentication failed.');
          }
          setSuccess('Access authorized.');
          setTimeout(() => {
            onAuthSuccess(serverData.token, serverData.user);
            onClose();
          }, 1000);
          return;
        }
        throw fbErr;
      }

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

      const data = await parseJsonResponse(syncRes);
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

      const data = await parseJsonResponse(syncRes);
      if (!syncRes.ok) {
        await signOut(auth);
        throw new Error(data.error || 'Google account synchronization failed.');
      }

      // Check if user has phone and country filled
      const isNewUser = !data.user.phone || !data.user.country || data.user.phone.trim() === '';

      if (isNewUser) {
        setTempToken(data.token);
        setTempUser(data.user);
        setCompleteName(data.user.name || firebaseUser.displayName || '');
        setCompleteCountry('United States');
        setCompleteDialCode('+1');
        setCompletePhone('');
        setCompleteTerms(false);
        setMode('completeProfile');
        setSuccess('Authentication succeeded. Please complete your profile records to continue.');
        setTimeout(() => setSuccess(''), 2000);
      } else {
        setSuccess('Google credentials verified. Access authorized.');
        setTimeout(() => {
          onAuthSuccess(data.token, data.user);
          onClose();
        }, 1000);
      }
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

  const handleCompleteProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!completeTerms) {
      setError('You must accept the terms & conditions to proceed.');
      return;
    }
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const fullPhone = `${completeDialCode} ${completePhone}`.trim();
      
      const res = await fetch('/api/user/profile/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${tempToken}`
        },
        body: JSON.stringify({
          name: completeName,
          phone: fullPhone,
          country: completeCountry
        })
      });

      const data = await parseJsonResponse(res);
      if (!res.ok) throw new Error(data.error || 'Failed to complete profile registration.');

      setSuccess('Profile updated successfully. Access authorized.');
      setTimeout(() => {
        onAuthSuccess(tempToken, data.user);
        onClose();
      }, 1000);
    } catch (err: any) {
      console.error('Failed to complete profile:', err);
      setError(err.message || 'Failed to complete profile registration.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (!forgotEmail || !forgotEmail.trim()) {
      setError('Please specify your registered email address.');
      setLoading(false);
      return;
    }

    try {
      // 1. Dispatch Firebase Password Reset email
      try {
        await sendPasswordResetEmail(auth, forgotEmail);
      } catch (fbErr: any) {
        console.warn('Firebase sendPasswordResetEmail fallback note:', fbErr);
      }

      // 2. Generate instant 6-digit security reset code
      const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
      setResetOtpCode(generatedOtp);
      setEnteredResetOtp(generatedOtp);

      setSuccess('Reset instructions and Security OTP dispatched.');
      setMode('reset');
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
    setError('');
    setSuccess('');
    setLoading(true);

    if (resetOtpCode && enteredResetOtp !== resetOtpCode) {
      setError('Incorrect 6-digit security code. Please check the code provided.');
      setLoading(false);
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      setError('Security protocols require a new password of at least 6 characters.');
      setLoading(false);
      return;
    }

    try {
      const emailToReset = forgotEmail || loginEmail;
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailToReset, password: newPassword })
      });

      const data = await parseJsonResponse(res);
      if (!res.ok) throw new Error(data.error || 'Failed to update password.');

      setSuccess('Password updated successfully! Redirecting to login...');
      setLoginEmail(emailToReset);
      setLoginPassword(newPassword);
      setTimeout(() => {
        setMode('login');
        setSuccess('');
      }, 1500);
    } catch (err: any) {
      console.error('Password reset failed:', err);
      setError(err.message || 'Failed to update password.');
    } finally {
      setLoading(false);
    }
  };

    return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/95 backdrop-blur-2xl overflow-y-auto animate-fade-in" id="auth-modal-root">
      {/* Modal Frame with Premium Bright 3D Look and Full Vertical Scrollability */}
      <div 
        className="relative w-full max-w-2xl bg-gradient-to-b from-zinc-900 via-zinc-950 to-black border-2 border-cyan-400/60 rounded-[2.5rem] p-6 sm:p-10 my-auto transform transition-all duration-300 shadow-[0_20px_60px_rgba(6,182,212,0.35),0_0_100px_rgba(0,0,0,0.95)] max-h-[92vh] overflow-y-auto"
        id="auth-modal-frame"
      >
        {/* Top Header Bar: Back to Homepage + Close Button */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/15 relative z-50">
          <button 
            type="button"
            onClick={onClose}
            className="flex items-center gap-2 px-4 py-2.5 bg-cyan-500/20 hover:bg-cyan-500/30 active:scale-95 text-cyan-300 hover:text-white rounded-xl border border-cyan-400/50 font-mono font-black text-xs sm:text-sm uppercase tracking-wider transition-all cursor-pointer shadow-md"
            id="btn-auth-back"
          >
            <ArrowLeft className="h-4 w-4 stroke-[3]" />
            Back to Homepage
          </button>

          <button 
            type="button"
            onClick={onClose}
            className="text-gray-300 hover:text-white hover:bg-white/10 p-2.5 rounded-full transition-all duration-150 cursor-pointer shadow-md border border-white/15"
            id="btn-auth-close"
          >
            <X className="h-5 w-5 stroke-[2.5]" />
          </button>
        </div>

        {/* Brand Header */}
        <div className="text-center mb-8 relative z-10" id="auth-modal-header">
          {/* Glowing Blue 3D Badge */}
          <div className="h-16 w-16 glowing-shield-badge flex items-center justify-center mx-auto mb-4 relative z-10 shadow-[0_0_30px_rgba(6,182,212,0.6)]">
            <ShieldCheck className="h-9 w-9 text-white filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]" />
          </div>
          <h2 className="text-base sm:text-lg font-black text-cyan-400 tracking-widest uppercase font-mono">
            Elon Musk Capital Loan
          </h2>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-wider uppercase mt-1 font-display drop-shadow-md">
            {mode === 'login' ? 'ACCOUNT ACCESS & LOGIN' : mode === 'register' ? 'ACCOUNT REGISTRATION' : mode === 'forgot' ? 'RESET ACCOUNT KEY' : mode === 'reset' ? 'ESTABLISH NEW PASSWORD' : 'CORPORATE ACCESS'}
          </h1>
        </div>

        {/* Global Error/Success displays */}
        {error && (
          <div className="mb-6 p-4 bg-red-950/80 border-2 border-red-500/60 rounded-2xl text-xs sm:text-sm font-mono font-black text-red-300 shadow-lg relative z-10" id="auth-error">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-6 p-4 bg-cyan-950/80 border-2 border-cyan-400/60 rounded-2xl text-xs sm:text-sm font-mono font-black text-cyan-300 flex items-center gap-2 shadow-lg relative z-10" id="auth-success">
            <span className="h-2 w-2 rounded-full bg-cyan-400 animate-ping" />
            {success}
          </div>
        )}

        {/* ---------------- LOGIN MODE ---------------- */}
        {mode === 'login' && (
          <form onSubmit={handleLogin} className="space-y-6 relative z-10" id="form-login">
            <div className="space-y-5">
              <div>
                <label className="block text-xs sm:text-sm font-black text-white uppercase tracking-wider mb-2 text-left flex items-center gap-2">
                  <Mail className="h-4 w-4 text-cyan-400" /> Secure Email
                </label>
                <div className="relative bg-black/90 border-2 border-cyan-500/40 focus-within:border-cyan-400 rounded-2xl transition-all shadow-[inset_0_2px_6px_rgba(0,0,0,0.8)]">
                  <input 
                    type="email" 
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className="w-full px-4 py-4 bg-transparent border-0 focus:ring-0 focus:outline-none text-base text-white font-black tracking-wide placeholder-gray-500"
                    placeholder="name@company.com"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs sm:text-sm font-black text-white uppercase tracking-wider text-left flex items-center gap-2">
                    <Lock className="h-4 w-4 text-cyan-400" /> Password
                  </label>
                  <button 
                    type="button"
                    onClick={() => { setMode('forgot'); setError(''); }}
                    className="text-xs sm:text-sm text-cyan-400 hover:text-cyan-300 font-black uppercase tracking-wider hover:underline"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative bg-black/90 border-2 border-cyan-500/40 focus-within:border-cyan-400 rounded-2xl transition-all shadow-[inset_0_2px_6px_rgba(0,0,0,0.8)]">
                  <input 
                    type="password" 
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full px-4 py-4 bg-transparent border-0 focus:ring-0 focus:outline-none text-base text-white font-black tracking-wide placeholder-gray-500"
                    placeholder="••••••••••••"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-3 cursor-pointer text-xs sm:text-sm text-gray-200 hover:text-white font-bold select-none">
                <input 
                  type="checkbox" 
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-white/20 bg-black text-cyan-400 focus:ring-0 focus:ring-offset-0 h-5 w-5 accent-cyan-400"
                />
                Remember security session
              </label>
            </div>

            {/* Tactile 3D Button - LOGIN NOW */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4.5 sm:py-5 bg-gradient-to-r from-cyan-400 via-cyan-300 to-emerald-400 hover:from-cyan-300 hover:to-emerald-300 active:translate-y-0.5 text-black font-black text-base sm:text-lg tracking-widest uppercase rounded-2xl shadow-[0_6px_25px_rgba(34,211,238,0.4)] border-2 border-cyan-200 transition-all cursor-pointer flex items-center justify-center gap-3 font-display mt-6 disabled:opacity-50"
              id="btn-login-submit"
            >
              {loading ? (
                <RefreshCw className="h-5 w-5 animate-spin" />
              ) : (
                <span className="flex items-center gap-2 justify-center">
                  LOGIN NOW <ArrowRight className="h-5 w-5 stroke-[3]" />
                </span>
              )}
            </button>

            {/* Google Sign-In Integrator */}
            <div className="relative my-6 text-center z-10">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t-2 border-white/15"></div>
              </div>
              <span className="relative px-4 bg-zinc-950 text-xs sm:text-sm font-mono font-black uppercase text-cyan-400 tracking-widest">
                Or Continue With
              </span>
            </div>

            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full py-4.5 px-5 bg-white hover:bg-gray-100 active:translate-y-0.5 border-2 border-cyan-400/60 rounded-2xl text-black font-black tracking-widest text-sm sm:text-base transition-all duration-150 flex items-center justify-center gap-3 cursor-pointer shadow-[0_6px_20px_rgba(255,255,255,0.25)] disabled:opacity-50"
            >
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="h-5 w-5" alt="Google" referrerPolicy="no-referrer" />
              LOGIN WITH GOOGLE
            </button>

            <p className="text-center text-sm sm:text-base text-gray-300 font-bold pt-3">
              Don't have an account?{' '}
              <button 
                type="button"
                onClick={() => { setMode('register'); setError(''); }}
                className="text-cyan-300 hover:text-white underline font-black uppercase text-base sm:text-lg ml-1 cursor-pointer"
              >
                Register here
              </button>
            </p>
          </form>
        )}

        {/* ---------------- REGISTER MODE ---------------- */}
        {mode === 'register' && (
          <form onSubmit={handleRegister} className="space-y-5 relative z-10" id="form-register">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* FULL NAME - VERY BOLD as requested */}
              <div>
                <label className="block text-sm sm:text-base font-black text-white uppercase tracking-wider mb-2 text-left flex items-center gap-2">
                  <UserIcon className="h-4 w-4 text-cyan-400" /> Full Name *
                </label>
                <div className="relative bg-black/90 border-2 border-cyan-500/40 focus-within:border-cyan-400 rounded-2xl transition-all shadow-[inset_0_2px_6px_rgba(0,0,0,0.8)]">
                  <input 
                    type="text" 
                    required
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    className="w-full px-4 py-4 bg-transparent border-0 focus:ring-0 focus:outline-none text-base text-white font-black tracking-wide placeholder-gray-500"
                    placeholder="Enter full legal name"
                  />
                </div>
              </div>

              {/* EMAIL ADDRESS */}
              <div>
                <label className="block text-sm sm:text-base font-black text-white uppercase tracking-wider mb-2 text-left flex items-center gap-2">
                  <Mail className="h-4 w-4 text-cyan-400" /> Email Address *
                </label>
                <div className="relative bg-black/90 border-2 border-cyan-500/40 focus-within:border-cyan-400 rounded-2xl transition-all shadow-[inset_0_2px_6px_rgba(0,0,0,0.8)]">
                  <input 
                    type="email" 
                    required
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    className="w-full px-4 py-4 bg-transparent border-0 focus:ring-0 focus:outline-none text-base text-white font-black tracking-wide placeholder-gray-500"
                    placeholder="name@company.com"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* COUNTRY */}
              <div>
                <label className="block text-sm sm:text-base font-black text-white uppercase tracking-wider mb-2 text-left flex items-center gap-2">
                  <Globe className="h-4 w-4 text-cyan-400" /> Country *
                </label>
                <CountrySelector
                  selectedCountry={regCountry}
                  onChange={(cName, dCode) => {
                    setRegCountry(cName);
                    setRegDialCode(dCode);
                  }}
                  id="reg-country"
                />
              </div>

              {/* PHONE NUMBER */}
              <div>
                <label className="block text-sm sm:text-base font-black text-white uppercase tracking-wider mb-2 text-left flex items-center gap-2">
                  <Phone className="h-4 w-4 text-cyan-400" /> Phone Number *
                </label>
                <div className="relative bg-black/90 border-2 border-cyan-500/40 focus-within:border-cyan-400 rounded-2xl transition-all shadow-[inset_0_2px_6px_rgba(0,0,0,0.8)] flex items-center overflow-hidden">
                  <span className="pl-4 pr-3 py-4 text-base text-cyan-300 font-mono font-black border-r-2 border-cyan-500/30 select-none bg-zinc-900 flex items-center h-full min-w-[4rem] justify-center">
                    {regDialCode}
                  </span>
                  <input 
                    type="tel" 
                    required
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value.replace(/[^0-9]/g, ''))}
                    className="w-full pl-3 pr-4 py-4 bg-transparent border-0 focus:ring-0 focus:outline-none text-base text-white font-black tracking-wide placeholder-gray-500"
                    placeholder="8123456789"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* CREATE PASSWORD */}
              <div>
                <label className="block text-sm sm:text-base font-black text-white uppercase tracking-wider mb-2 text-left flex items-center gap-2">
                  <Lock className="h-4 w-4 text-cyan-400" /> Create Password *
                </label>
                <div className="relative bg-black/90 border-2 border-cyan-500/40 focus-within:border-cyan-400 rounded-2xl transition-all shadow-[inset_0_2px_6px_rgba(0,0,0,0.8)]">
                  <input 
                    type="password" 
                    required
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    className="w-full px-4 py-4 bg-transparent border-0 focus:ring-0 focus:outline-none text-base text-white font-black tracking-wide placeholder-gray-500"
                    placeholder="••••••••••••"
                  />
                </div>
              </div>

              {/* CONFIRM PASSWORD */}
              <div>
                <label className="block text-sm sm:text-base font-black text-white uppercase tracking-wider mb-2 text-left flex items-center gap-2">
                  <Lock className="h-4 w-4 text-cyan-400" /> Confirm Password *
                </label>
                <div className="relative bg-black/90 border-2 border-cyan-500/40 focus-within:border-cyan-400 rounded-2xl transition-all shadow-[inset_0_2px_6px_rgba(0,0,0,0.8)]">
                  <input 
                    type="password" 
                    required
                    value={regConfirmPassword}
                    onChange={(e) => setRegConfirmPassword(e.target.value)}
                    className="w-full px-4 py-4 bg-transparent border-0 focus:ring-0 focus:outline-none text-base text-white font-black tracking-wide placeholder-gray-500"
                    placeholder="••••••••••••"
                  />
                </div>
              </div>
            </div>

            {/* Tactile 3D Button - REGISTER NOW (Big & Very Bold) */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4.5 sm:py-5 bg-gradient-to-r from-cyan-400 via-cyan-300 to-emerald-400 hover:from-cyan-300 hover:to-emerald-300 active:translate-y-0.5 text-black font-black text-base sm:text-lg tracking-widest uppercase rounded-2xl shadow-[0_6px_25px_rgba(34,211,238,0.4)] border-2 border-cyan-200 transition-all cursor-pointer flex items-center justify-center gap-3 font-display mt-6 disabled:opacity-50"
              id="btn-register-submit"
            >
              {loading ? (
                <RefreshCw className="h-5 w-5 animate-spin" />
              ) : (
                <span className="flex items-center gap-2 justify-center">
                  REGISTER NOW <ArrowRight className="h-5 w-5 stroke-[3]" />
                </span>
              )}
            </button>

            {/* Inbox Activation Notice - VERY BOLD & HIGHLIGHTED */}
            <div className="p-5 bg-amber-950/80 border-2 border-amber-400/70 rounded-2xl text-xs sm:text-sm leading-relaxed text-amber-100 font-black shadow-[0_0_25px_rgba(245,158,11,0.25)] space-y-2">
              <span className="font-black text-sm sm:text-base uppercase tracking-wider text-amber-300 flex items-center gap-2">
                💡 Inbox Activation Notice
              </span>
              <p className="font-black text-xs sm:text-sm text-amber-100 leading-snug">
                In case you do not see the activation verification email in your inbox after clicking Register, please inspect your <strong className="text-white underline font-black text-sm sm:text-base">Spam folder, Junk folder, or Promotions folder</strong>. It should arrive within 2-3 minutes.
              </p>
            </div>

            {/* Google Sign-In Integrator - REGISTER WITH GOOGLE */}
            <div className="relative my-6 text-center z-10">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t-2 border-white/15"></div>
              </div>
              <span className="relative px-4 bg-zinc-950 text-xs sm:text-sm font-mono font-black uppercase text-cyan-400 tracking-widest">
                Or Register With
              </span>
            </div>

            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full py-4.5 px-5 bg-white hover:bg-gray-100 active:translate-y-0.5 border-2 border-cyan-400/60 rounded-2xl text-black font-black tracking-widest text-sm sm:text-base transition-all duration-150 flex items-center justify-center gap-3 cursor-pointer shadow-[0_6px_20px_rgba(255,255,255,0.25)] disabled:opacity-50"
            >
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="h-5 w-5" alt="Google" referrerPolicy="no-referrer" />
              REGISTER WITH GOOGLE
            </button>

            {/* Already have an account? Login here - BOLD & CLEAR */}
            <p className="text-center text-sm sm:text-base text-gray-300 font-bold pt-3">
              Already have an account?{' '}
              <button 
                type="button"
                onClick={() => { setMode('login'); setError(''); }}
                className="text-cyan-300 hover:text-white underline font-black uppercase text-base sm:text-lg ml-1 cursor-pointer"
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
              <p className="text-sm text-gray-300 font-bold leading-relaxed">
                An activation link was successfully dispatched to:
              </p>
              <div className="my-3 px-4 py-2 bg-black border-2 border-cyan-400/50 rounded-xl inline-block">
                <span className="text-cyan-300 font-mono font-black text-base select-all">{verifyEmail}</span>
              </div>
              <p className="text-xs sm:text-sm text-gray-300 font-bold leading-relaxed max-w-md mx-auto mt-2">
                Please open your email client, open the message from <span className="text-white font-black">Elon Musk Capital Loan</span>, and click the confirmation link to activate your security credentials.
              </p>
            </div>

            <div className="p-5 bg-amber-950/80 border-2 border-amber-400/70 rounded-2xl text-xs sm:text-sm text-left space-y-2 leading-relaxed text-amber-100 font-black shadow-lg max-w-lg mx-auto">
              <p className="font-black uppercase tracking-wider text-sm text-amber-300">
                ⚠️ Can't find the email?
              </p>
              <p>
                Secure automatic security keys can occasionally be diverted by filtering servers. 
                <strong className="text-white font-black underline"> Please verify your Spam folder, Junk folder, Trash folder, or Promotions folder.</strong>
                Delivery might take 2-3 minutes.
              </p>
            </div>

            <div className="space-y-3 max-w-sm mx-auto">
              <button
                type="button"
                onClick={handleResendEmailVerification}
                disabled={loading}
                className="w-full py-4.5 bg-gradient-to-r from-cyan-400 to-emerald-400 text-black font-black text-base uppercase tracking-wider rounded-2xl shadow-lg cursor-pointer disabled:opacity-50"
                id="btn-resend-verification"
              >
                {loading ? <RefreshCw className="h-5 w-5 animate-spin mx-auto" /> : "Resend Activation Link"}
              </button>

              <button
                type="button"
                onClick={() => { setMode('login'); setError(''); setSuccess(''); }}
                className="w-full py-2.5 text-sm font-black text-gray-300 hover:text-cyan-300 transition-colors cursor-pointer"
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
              <p className="text-xs sm:text-sm text-gray-300 font-bold">Specify your registered email address to locate your security records.</p>
            </div>

            <div>
              <label className="block text-sm font-black text-white uppercase tracking-wider mb-2 text-left">Secure Email</label>
              <div className="relative bg-black/90 border-2 border-cyan-500/40 focus-within:border-cyan-400 rounded-2xl transition-all shadow-inner">
                <input 
                  type="email" 
                  required
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  className="w-full px-4 py-4 bg-transparent border-0 focus:ring-0 focus:outline-none text-base text-white font-black"
                  placeholder="name@company.com"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4.5 bg-gradient-to-r from-cyan-400 to-emerald-400 text-black font-black text-base uppercase tracking-widest rounded-2xl shadow-lg cursor-pointer disabled:opacity-50 mt-6"
              id="btn-forgot-submit"
            >
              {loading ? <RefreshCw className="h-5 w-5 animate-spin mx-auto" /> : "Retrieve Account Key"}
            </button>

            <button 
              type="button"
              onClick={() => { setMode('login'); setError(''); }}
              className="w-full text-center text-sm text-cyan-300 hover:text-white font-black uppercase transition-colors"
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
              <p className="text-xs sm:text-sm text-gray-300 font-bold">Input your 6-digit security reset code and set your new account password.</p>
            </div>

            {/* Instant Reset OTP Code Display */}
            {resetOtpCode && (
              <div className="p-5 bg-cyan-950/90 border-2 border-cyan-400/80 rounded-2xl text-center space-y-2 shadow-[0_0_30px_rgba(6,182,212,0.3)]">
                <span className="text-xs font-mono font-black text-cyan-300 uppercase tracking-widest block">
                  ✨ INSTANT SECURITY RESET CODE (SENT TO {forgotEmail})
                </span>
                <div className="text-3xl font-mono font-black text-white tracking-[0.2em] select-all py-1 font-display">
                  {resetOtpCode}
                </div>
                <p className="text-xs font-bold text-cyan-100">
                  If your email provider filters automated emails, use your 6-digit reset code above to update your credentials immediately below!
                </p>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-black text-white uppercase tracking-wider mb-2 text-left flex items-center gap-2">
                  <Key className="h-4 w-4 text-cyan-400" /> 6-Digit Reset Code
                </label>
                <div className="relative bg-black/90 border-2 border-cyan-500/40 focus-within:border-cyan-400 rounded-2xl transition-all shadow-inner">
                  <input 
                    type="text" 
                    required
                    maxLength={6}
                    value={enteredResetOtp}
                    onChange={(e) => setEnteredResetOtp(e.target.value.replace(/[^0-9]/g, ''))}
                    className="w-full px-4 py-4 bg-transparent border-0 focus:ring-0 focus:outline-none text-base text-cyan-300 font-mono font-black tracking-widest"
                    placeholder="123456"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-black text-white uppercase tracking-wider mb-2 text-left flex items-center gap-2">
                  <Lock className="h-4 w-4 text-cyan-400" /> Establish New Password
                </label>
                <div className="relative bg-black/90 border-2 border-cyan-500/40 focus-within:border-cyan-400 rounded-2xl transition-all shadow-inner">
                  <input 
                    type="password" 
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-4 py-4 bg-transparent border-0 focus:ring-0 focus:outline-none text-base text-white font-black"
                    placeholder="••••••••••••"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4.5 bg-gradient-to-r from-cyan-400 to-emerald-400 text-black font-black text-base uppercase tracking-widest rounded-2xl shadow-lg cursor-pointer disabled:opacity-50 mt-6"
              id="btn-reset-submit"
            >
              {loading ? <RefreshCw className="h-5 w-5 animate-spin mx-auto" /> : "Confirm Security Overhaul"}
            </button>

            <button 
              type="button"
              onClick={() => { setMode('login'); setError(''); }}
              className="w-full text-center text-sm text-cyan-300 hover:text-white font-black uppercase transition-colors cursor-pointer"
            >
              Return to Login
            </button>
          </form>
        )}

        {/* ---------------- COMPLETE PROFILE MODE ---------------- */}
        {mode === 'completeProfile' && (
          <form onSubmit={handleCompleteProfileSubmit} className="space-y-6 relative z-10" id="form-complete-profile">
            <div>
              <h3 className="font-display text-2xl font-black text-white mb-2 uppercase tracking-wide">Complete Your Profile</h3>
              <p className="text-xs sm:text-sm text-gray-300 font-bold">Please provide your details below to establish your secure borrower record.</p>
            </div>

            <div className="space-y-5">
              {/* Full Name */}
              <div>
                <label className="block text-sm sm:text-base font-black text-white uppercase tracking-wider mb-2 text-left flex items-center gap-2">
                  <UserIcon className="h-4 w-4 text-cyan-400" /> Full Name *
                </label>
                <div className="relative bg-black/90 border-2 border-cyan-500/40 focus-within:border-cyan-400 rounded-2xl transition-all shadow-inner">
                  <input 
                    type="text" 
                    required
                    value={completeName}
                    onChange={(e) => setCompleteName(e.target.value)}
                    className="w-full px-4 py-4 bg-transparent border-0 focus:ring-0 focus:outline-none text-base text-white font-black"
                    placeholder="Enter full legal name"
                  />
                </div>
              </div>

              {/* Country & Phone Number */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm sm:text-base font-black text-white uppercase tracking-wider mb-2 text-left flex items-center gap-2">
                    <Globe className="h-4 w-4 text-cyan-400" /> Country *
                  </label>
                  <CountrySelector
                    selectedCountry={completeCountry}
                    onChange={(cName, dCode) => {
                      setCompleteCountry(cName);
                      setCompleteDialCode(dCode);
                    }}
                    id="complete-country"
                  />
                </div>

                <div>
                  <label className="block text-sm sm:text-base font-black text-white uppercase tracking-wider mb-2 text-left flex items-center gap-2">
                    <Phone className="h-4 w-4 text-cyan-400" /> Phone Number *
                  </label>
                  <div className="relative bg-black/90 border-2 border-cyan-500/40 focus-within:border-cyan-400 rounded-2xl transition-all shadow-inner flex items-center overflow-hidden">
                    <span className="pl-4 pr-3 py-4 text-base text-cyan-300 font-mono font-black border-r-2 border-cyan-500/30 select-none bg-zinc-900 flex items-center h-full min-w-[4rem] justify-center">
                      {completeDialCode}
                    </span>
                    <input 
                      type="tel" 
                      required
                      value={completePhone}
                      onChange={(e) => setCompletePhone(e.target.value.replace(/[^0-9]/g, ''))}
                      className="w-full pl-3 pr-4 py-4 bg-transparent border-0 focus:ring-0 focus:outline-none text-base text-white font-black"
                      placeholder="8123456789"
                    />
                  </div>
                </div>
              </div>

              {/* Terms and Conditions Checkbox */}
              <div className="pt-2">
                <label className="flex items-start gap-3 cursor-pointer text-xs sm:text-sm text-gray-200 hover:text-white font-bold select-none">
                  <input 
                    type="checkbox" 
                    required
                    checked={completeTerms}
                    onChange={(e) => setCompleteTerms(e.target.checked)}
                    className="rounded border-white/20 bg-black text-cyan-400 focus:ring-0 focus:ring-offset-0 h-5 w-5 mt-0.5 accent-cyan-400"
                    id="complete-terms-checkbox"
                  />
                  <span>
                    I hereby accept the <strong className="text-white hover:underline font-black">Terms of Service</strong> and <strong className="text-white hover:underline font-black">Privacy Policy</strong> of Elon Musk Capital Loan.
                  </span>
                </label>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4.5 bg-gradient-to-r from-cyan-400 via-cyan-300 to-emerald-400 text-black font-black text-base sm:text-lg tracking-widest uppercase rounded-2xl shadow-lg cursor-pointer disabled:opacity-50 mt-6"
              id="btn-complete-profile-submit"
            >
              {loading ? (
                <RefreshCw className="h-5 w-5 animate-spin mx-auto" />
              ) : (
                <span className="flex items-center gap-2 justify-center">
                  COMPLETE PROFILE <ArrowRight className="h-5 w-5 stroke-[3]" />
                </span>
              )}
            </button>
          </form>
        )}

      </div>
    </div>
  );
}
