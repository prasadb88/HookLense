import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import ThemeToggle from '../components/layout/ThemeToggle.jsx';
import logoImg from '../assets/logo.png';
import {
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Check,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

export const SignupPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);

  // Form states: 'idle' | 'submitting' | 'success'
  const [submitState, setSubmitState] = useState('idle');
  const [googleState, setGoogleState] = useState('idle');
  const [error, setError] = useState('');

  const { signup, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  // Password requirements state
  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const isPasswordValid = hasMinLength && hasUppercase && hasNumber;

  const validateEmail = (val) => {
    return /\S+@\S+\.\S+/.test(val);
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Please enter your name.');
      return;
    }
    if (!email.trim() || !validateEmail(email)) {
      setError('Please enter a valid email address.');
      return;
    }
    if (!isPasswordValid) {
      setError('Password does not meet the requirements.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (!agreeTerms) {
      setError('Please accept the Terms of Service and Privacy Policy.');
      return;
    }

    setSubmitState('submitting');

    try {
      await signup({ name, email, password });
      setSubmitState('success');
      setTimeout(() => {
        navigate('/dashboard/onboarding');
      }, 500);
    } catch (err) {
      setError(err?.message || 'Unable to connect to HookLens. Please try again.');
      setSubmitState('idle');
    }
  };

  const handleGoogleSignup = async () => {
    if (googleState === 'submitting') return;
    setError('');
    setGoogleState('submitting');

    try {
      await loginWithGoogle();
      setTimeout(() => {
        navigate('/dashboard/onboarding');
      }, 500);
    } catch {
      setError('Google sign-in was unsuccessful. Please try again.');
      setGoogleState('idle');
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-app)] text-[var(--text-primary)] font-sans flex flex-col justify-between selection:bg-blue-600/20 transition-colors">
      
      {/* Top Bar with Minimal Navigation & Theme Switcher */}
      <header className="px-6 py-4 flex items-center justify-between z-20">
        <Link to="/" className="flex items-center gap-2.5">
          <img src={logoImg} alt="HookLens Logo" className="h-7 w-auto object-contain" />
          <span className="font-bold text-[var(--text-primary)] font-mono text-base tracking-tight">
            HookLens
          </span>
        </Link>
        
        <div className="flex items-center gap-4 text-xs font-mono">
          <span className="hidden sm:inline text-[var(--text-secondary)]">Already have an account?</span>
          <Link to="/login" className="text-blue-600 dark:text-blue-400 hover:underline font-semibold">
            Sign in
          </Link>
          <ThemeToggle />
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-8">
        <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* ==================================================
              LEFT SIDE: PRODUCT VISUALIZATION (DESKTOP ONLY)
          ================================================== */}
          <div className="hidden lg:flex lg:col-span-5 flex-col justify-between space-y-8 pr-4">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 text-xs font-mono">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>DEVELOPER INFRASTRUCTURE PLATFORM</span>
              </div>
              <h2 className="text-2xl font-bold font-mono text-[var(--text-primary)] leading-tight">
                Webhook observability, security and recovery for developers.
              </h2>
              <p className="text-sm text-[var(--text-secondary)] font-sans leading-relaxed">
                See what failed. Understand why. Recover it safely.
              </p>
            </div>

            {/* HookLens Architecture Flow Diagram */}
            <div className="p-6 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl font-mono text-xs space-y-3 shadow-sm">
              <div className="text-[10px] text-[var(--text-muted)] uppercase font-semibold">
                Live Webhook Delivery Pipeline
              </div>

              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between p-2.5 bg-[var(--bg-app)] border border-[var(--border-subtle)] rounded-lg">
                  <span className="text-[var(--text-primary)] font-semibold">Razorpay / Stripe / Custom</span>
                  <span className="text-[10px] text-[var(--text-muted)]">Origin</span>
                </div>

                <div className="flex items-center justify-between p-2.5 bg-blue-500/5 border border-blue-500/20 rounded-lg text-blue-600 dark:text-blue-400">
                  <span className="font-semibold">HookLens Gateway</span>
                  <span className="text-[10px] text-emerald-500 font-semibold">Signature ✓</span>
                </div>

                <div className="flex items-center justify-between p-2.5 bg-[var(--bg-app)] border border-[var(--border-subtle)] rounded-lg">
                  <span className="text-[var(--text-primary)]">Redis / BullMQ</span>
                  <span className="text-[10px] text-blue-500">Queue State</span>
                </div>

                <div className="flex items-center justify-between p-2.5 bg-[var(--bg-app)] border border-[var(--border-subtle)] rounded-lg">
                  <span className="text-[var(--text-primary)]">Delivery Worker</span>
                  <span className="text-[10px] text-emerald-500 font-semibold">200 Delivered</span>
                </div>
              </div>
            </div>
          </div>

          {/* ==================================================
              RIGHT SIDE: SIGNUP FORM (MAX-WIDTH 420px)
          ================================================== */}
          <div className="lg:col-span-7 flex justify-center">
            <div className="w-full max-w-[420px] bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl p-6 sm:p-8 shadow-xl">
              
              {/* Form Header & Official Logo */}
              <div className="text-center mb-6">
                <img src={logoImg} alt="HookLens Logo" className="h-9 w-auto mx-auto mb-4 object-contain" />
                <h1 className="text-2xl font-bold font-mono text-[var(--text-primary)] tracking-tight">
                  Create your HookLens account
                </h1>
                <p className="text-xs text-[var(--text-secondary)] font-sans mt-1">
                  Start monitoring and recovering your webhooks in minutes.
                </p>
              </div>

              {/* Google OAuth Signup Button */}
              <button
                type="button"
                onClick={handleGoogleSignup}
                disabled={googleState === 'submitting'}
                className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-app)] hover:bg-[var(--bg-elevated)] text-xs font-mono font-medium text-[var(--text-primary)] transition-all shadow-sm mb-5 disabled:opacity-60"
              >
                {googleState === 'submitting' ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-[var(--text-secondary)]" />
                    <span>Connecting to Google...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                    </svg>
                    <span>Continue with Google</span>
                  </>
                )}
              </button>

              {/* Divider */}
              <div className="relative flex items-center justify-center my-5">
                <div className="w-full border-t border-[var(--border-subtle)]" />
                <span className="absolute px-3 bg-[var(--bg-surface)] font-mono text-[11px] text-[var(--text-muted)] uppercase tracking-wider">
                  OR
                </span>
              </div>

              {/* Inline Error Display */}
              {error && (
                <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-xs font-mono text-red-500">
                  {error}
                </div>
              )}

              {/* Form Fields */}
              <form onSubmit={handleSignup} className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-xs font-mono font-medium text-[var(--text-secondary)] mb-1.5">
                    Full Name
                  </label>
                  <input
                    id="name"
                    type="text"
                    required
                    autoComplete="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full px-3.5 py-2.5 bg-[var(--bg-app)] border border-[var(--border-subtle)] rounded-xl text-xs font-mono text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-xs font-mono font-medium text-[var(--text-secondary)] mb-1.5">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="w-full px-3.5 py-2.5 bg-[var(--bg-app)] border border-[var(--border-subtle)] rounded-xl text-xs font-mono text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>

                <div>
                  <label htmlFor="password" className="block text-xs font-mono font-medium text-[var(--text-secondary)] mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      autoComplete="new-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Create a password"
                      className="w-full px-3.5 py-2.5 pr-10 bg-[var(--bg-app)] border border-[var(--border-subtle)] rounded-xl text-xs font-mono text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-blue-500 transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors p-1"
                      title={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Password Requirements Indicator */}
                  {password.length > 0 && (
                    <div className="mt-2.5 p-2.5 bg-[var(--bg-app)] border border-[var(--border-subtle)] rounded-lg font-mono text-[11px] space-y-1">
                      <div className="text-[var(--text-muted)] font-semibold mb-1">Password must contain:</div>
                      <div className={`flex items-center gap-1.5 ${hasMinLength ? 'text-emerald-500 font-semibold' : 'text-[var(--text-muted)]'}`}>
                        <Check className="w-3 h-3" /> At least 8 characters
                      </div>
                      <div className={`flex items-center gap-1.5 ${hasUppercase ? 'text-emerald-500 font-semibold' : 'text-[var(--text-muted)]'}`}>
                        <Check className="w-3 h-3" /> One uppercase letter
                      </div>
                      <div className={`flex items-center gap-1.5 ${hasNumber ? 'text-emerald-500 font-semibold' : 'text-[var(--text-muted)]'}`}>
                        <Check className="w-3 h-3" /> One number
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-xs font-mono font-medium text-[var(--text-secondary)] mb-1.5">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      autoComplete="new-password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm your password"
                      className="w-full px-3.5 py-2.5 pr-10 bg-[var(--bg-app)] border border-[var(--border-subtle)] rounded-xl text-xs font-mono text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-blue-500 transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors p-1"
                      title={showConfirmPassword ? 'Hide password' : 'Show password'}
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Terms and Privacy Agreement */}
                <div className="pt-1">
                  <label className="flex items-start gap-2.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={agreeTerms}
                      onChange={(e) => setAgreeTerms(e.target.checked)}
                      className="w-3.5 h-3.5 mt-0.5 rounded bg-[var(--bg-app)] border-[var(--border-subtle)] text-blue-600 focus:ring-0 cursor-pointer"
                    />
                    <span className="text-xs font-mono text-[var(--text-secondary)] leading-relaxed">
                      I agree to the{' '}
                      <a href="#terms" className="text-blue-600 dark:text-blue-400 hover:underline">
                        Terms of Service
                      </a>{' '}
                      and{' '}
                      <a href="#privacy" className="text-blue-600 dark:text-blue-400 hover:underline">
                        Privacy Policy
                      </a>
                      .
                    </span>
                  </label>
                </div>

                {/* Submit Primary Button */}
                <button
                  type="submit"
                  disabled={submitState === 'submitting'}
                  className="btn-primary w-full py-3 px-4 rounded-xl text-xs font-mono font-semibold flex items-center justify-center gap-2 border border-blue-500 shadow-sm transition-all disabled:opacity-60 mt-2"
                >
                  {submitState === 'submitting' && (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                      <span>Creating account...</span>
                    </>
                  )}
                  {submitState === 'success' && (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                      <span>Account created ✓</span>
                    </>
                  )}
                  {submitState === 'idle' && (
                    <>
                      <span>Create account</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              {/* Existing Account Footer Link */}
              <div className="mt-6 pt-5 border-t border-[var(--border-subtle)] text-center text-xs font-mono text-[var(--text-secondary)]">
                Already have an account?{' '}
                <Link to="/login" className="text-blue-600 dark:text-blue-400 hover:underline font-semibold">
                  Sign in
                </Link>
              </div>

              {/* Security Footnote */}
              <div className="mt-5 flex items-center justify-center gap-1.5 text-[11px] font-mono text-[var(--text-muted)] text-center">
                <Lock className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>Your account credentials are securely handled by HookLens.</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 text-center font-mono text-[11px] text-[var(--text-muted)] border-t border-[var(--border-subtle)]">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>© 2026 HookLens</span>
          <div className="flex gap-4">
            <a href="#privacy" className="hover:text-[var(--text-primary)]">Privacy</a>
            <a href="#terms" className="hover:text-[var(--text-primary)]">Terms</a>
            <a href="https://docs.hooklens.dev" target="_blank" rel="noreferrer" className="hover:text-[var(--text-primary)]">Documentation</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default SignupPage;
