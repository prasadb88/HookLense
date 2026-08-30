import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import ThemeToggle from '../components/layout/ThemeToggle.jsx';
import Logo from '../components/common/Logo.jsx';
import GoogleAuthButton from '../components/auth/GoogleAuthButton.jsx';
import {
  Eye,
  EyeOff,
  Loader2,
  Lock,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
} from 'lucide-react';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Auth button states: 'idle' | 'submitting' | 'success'
  const [submitState, setSubmitState] = useState('idle');
  const [googleState, setGoogleState] = useState('idle');
  const [error, setError] = useState('');

  const { isAuthenticated, login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleBack = () => {
    if (window.history.state && window.history.state.idx > 0) {
      navigate(-1);
    } else {
      navigate('/');
    }
  };

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
      
      {/* Top Bar with Back Navigation & Theme Switcher */}
      <header className="px-6 py-4 flex items-center justify-between z-20">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleBack}
            aria-label="Go back"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] bg-[var(--bg-surface)] hover:bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-xl transition-colors shadow-sm"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back</span>
          </button>
          <Link to="/" className="flex items-center gap-2.5">
            <Logo className="w-[150px] sm:w-[175px] lg:w-[210px] h-auto object-contain shrink-0 transition-opacity" />
          </Link>
        </div>
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
                <Logo className="w-[160px] sm:w-[190px] h-auto mx-auto mb-4 object-contain" />
                <h1 className="text-2xl font-bold font-mono text-[var(--text-primary)] tracking-tight">
                  Welcome back
                </h1>
                <p className="text-xs text-[var(--text-secondary)] font-sans mt-1">
                  Sign in to your HookLens workspace.
                </p>
              </div>

              {/* Google OAuth Login Button */}
              <div className="mb-5">
                <GoogleAuthButton
                  onSuccess={() => navigate('/dashboard')}
                  onError={(errMsg) => setError(errMsg)}
                />
              </div>

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
            <Link to="/developer" className="hover:text-[var(--text-primary)]">Documentation</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LoginPage;
