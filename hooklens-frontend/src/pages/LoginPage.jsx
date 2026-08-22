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
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

export const LoginPage = () => {
  const [email, setEmail] = useState('Prasad@devloper.io');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Auth button states: 'idle' | 'submitting' | 'success'
  const [submitState, setSubmitState] = useState('idle');
  const [googleState, setGoogleState] = useState('idle');
  const [error, setError] = useState('');

  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Please enter your email.');
      return;
    }
    if (!password.trim()) {
      setError('Please enter your password.');
      return;
    }

    setSubmitState('submitting');

    try {
      await login({ email, password });
      setSubmitState('success');
      setTimeout(() => {
        navigate('/dashboard');
      }, 500);
    } catch (err) {
      setError(err?.message || 'Invalid email or password.');
      setSubmitState('idle');
    }
  };

  const handleGoogleLogin = async () => {
    if (googleState === 'submitting') return;
    setError('');
    setGoogleState('submitting');

    try {
      await loginWithGoogle();
      setTimeout(() => {
        navigate('/dashboard');
      }, 500);
    } catch {
      setError('Google sign-in was unsuccessful. Please try again.');
      setGoogleState('idle');
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-app)] text-[var(--text-primary)] font-sans flex flex-col justify-between selection:bg-blue-600/20 transition-colors">
      
      {/* Top Bar with Theme Switcher */}
      <header className="px-6 py-4 flex items-center justify-between z-20">
        <Link to="/" className="flex items-center gap-2.5">
          <img src={logoImg} alt="HookLens Logo" className="h-7 w-auto object-contain" />
          <span className="font-bold text-[var(--text-primary)] font-mono text-base tracking-tight">
            HookLens
          </span>
        </Link>
        <ThemeToggle />
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

            {/* HookLens Flow Diagram Card */}
            <div className="p-6 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl font-mono text-xs space-y-3 shadow-sm">
              <div className="text-[10px] text-[var(--text-muted)] uppercase font-semibold">
                Live Webhook Delivery Pipeline
              </div>

              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between p-2.5 bg-[var(--bg-app)] border border-[var(--border-subtle)] rounded-lg">
                  <span className="text-[var(--text-primary)] font-semibold">Razorpay</span>
                  <span className="text-[10px] text-[var(--text-muted)]">HTTPS POST</span>
                </div>

                <div className="flex items-center justify-between p-2.5 bg-blue-500/5 border border-blue-500/20 rounded-lg text-blue-600 dark:text-blue-400">
                  <span className="font-semibold">HookLens Ingress</span>
                  <span className="text-[10px] text-emerald-500 font-semibold">Signature Verified ✓</span>
                </div>

                <div className="flex items-center justify-between p-2.5 bg-[var(--bg-app)] border border-[var(--border-subtle)] rounded-lg">
                  <span className="text-[var(--text-primary)]">BullMQ Worker</span>
                  <span className="text-[10px] text-blue-500">Enqueued</span>
                </div>

                <div className="flex items-center justify-between p-2.5 bg-[var(--bg-app)] border border-[var(--border-subtle)] rounded-lg">
                  <span className="text-[var(--text-primary)]">Developer API</span>
                  <span className="text-[10px] text-emerald-500 font-semibold">200 Delivered</span>
                </div>
              </div>
            </div>
          </div>

          {/* ==================================================
              RIGHT SIDE: LOGIN FORM (MAX-WIDTH 420px)
          ================================================== */}
          <div className="lg:col-span-7 flex justify-center">
            <div className="w-full max-w-[420px] bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl p-6 sm:p-8 shadow-xl">
              
              {/* Form Header & Official Logo */}
              <div className="text-center mb-6">
                <img src={logoImg} alt="HookLens Logo" className="h-9 w-auto mx-auto mb-4 object-contain" />
                <h1 className="text-2xl font-bold font-mono text-[var(--text-primary)] tracking-tight">
                  Welcome back
                </h1>
                <p className="text-xs text-[var(--text-secondary)] font-sans mt-1">
                  Sign in to your HookLens workspace.
                </p>
              </div>

              {/* Google OAuth Login Button */}
              <button
                type="button"
                onClick={handleGoogleLogin}
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

              {/* Inline Error Message */}
              {error && (
                <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-xs font-mono text-red-500">
                  {error}
                </div>
              )}

              {/* Email & Password Form */}
              <form onSubmit={handleLogin} className="space-y-4">
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
                  <div className="flex items-center justify-between mb-1.5">
                    <label htmlFor="password" className="block text-xs font-mono font-medium text-[var(--text-secondary)]">
                      Password
                    </label>
                    <Link
                      to="/forgot-password"
                      className="text-xs font-mono text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      autoComplete="current-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
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
                </div>

                {/* Remember Me */}
                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-3.5 h-3.5 rounded bg-[var(--bg-app)] border-[var(--border-subtle)] text-blue-600 focus:ring-0 cursor-pointer"
                    />
                    <span className="text-xs font-mono text-[var(--text-secondary)]">Remember me</span>
                  </label>
                </div>

                {/* Submit Primary Button */}
                <button
                  type="submit"
                  disabled={submitState === 'submitting'}
                  className="btn-primary w-full py-3 px-4 rounded-xl text-xs font-mono font-semibold flex items-center justify-center gap-2 border border-blue-500 shadow-sm transition-all disabled:opacity-60"
                >
                  {submitState === 'submitting' && (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                      <span>Signing in...</span>
                    </>
                  )}
                  {submitState === 'success' && (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                      <span>Signed in ✓</span>
                    </>
                  )}
                  {submitState === 'idle' && (
                    <>
                      <span>Sign in</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              {/* Sign Up Link */}
              <div className="mt-6 pt-5 border-t border-[var(--border-subtle)] text-center text-xs font-mono text-[var(--text-secondary)]">
                Don't have an account?{' '}
                <Link to="/signup" className="text-blue-600 dark:text-blue-400 hover:underline font-semibold">
                  Create an account
                </Link>
              </div>

              {/* Security Footnote */}
              <div className="mt-5 flex items-center justify-center gap-1.5 text-[11px] font-mono text-[var(--text-muted)] text-center">
                <Lock className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>Your webhook data is protected with HookLens security controls.</span>
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

export default LoginPage;
