import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { authApi } from '../api/authApi.js';
import ThemeToggle from '../components/layout/ThemeToggle.jsx';
import logoImg from '../assets/logo.png';
import {
  Loader2,
  ArrowLeft,
  MailCheck,
  Lock,
  RotateCcw,
} from 'lucide-react';

export const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  // Resend cooldown timer (30 seconds)
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    let timer;
    if (cooldown > 0) {
      timer = setInterval(() => {
        setCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [cooldown]);

  const maskEmail = (str) => {
    if (!str || !str.includes('@')) return str;
    const [name, domain] = str.split('@');
    if (name.length <= 2) return `${name}***@${domain}`;
    return `${name[0]}***${name[name.length - 1]}@${domain}`;
  };

  const validateEmail = (val) => {
    return /\S+@\S+\.\S+/.test(val);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Please enter your email.');
      return;
    }
    if (!validateEmail(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    setLoading(true);

    try {
      await authApi.requestPasswordReset(email);
      setSubmitted(true);
      setCooldown(30);
    } catch {
      // Show identical success message for security / enumeration defense
      setSubmitted(true);
      setCooldown(30);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (cooldown > 0 || loading) return;
    setLoading(true);
    try {
      await authApi.requestPasswordReset(email);
      setCooldown(30);
    } catch {
      setCooldown(30);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-app)] text-[var(--text-primary)] font-sans flex flex-col justify-between selection:bg-blue-600/20 transition-colors">
      
      {/* Top Header */}
      <header className="px-6 py-4 flex items-center justify-between z-20">
        <Link to="/" className="flex items-center gap-2.5">
          <img src={logoImg} alt="HookLens Logo" className="h-7 w-auto object-contain" />
          <span className="font-bold text-[var(--text-primary)] font-mono text-base tracking-tight">
            HookLens
          </span>
        </Link>
        <ThemeToggle />
      </header>

      {/* Main Form Container */}
      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-8">
        <div className="w-full max-w-[420px] bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl p-6 sm:p-8 shadow-xl">
          
          {/* Official Logo */}
          <div className="text-center mb-6">
            <img src={logoImg} alt="HookLens Logo" className="h-9 w-auto mx-auto mb-4 object-contain" />
            
            {!submitted ? (
              <>
                <h1 className="text-2xl font-bold font-mono text-[var(--text-primary)] tracking-tight">
                  Forgot your password?
                </h1>
                <p className="text-xs text-[var(--text-secondary)] font-sans mt-2 leading-relaxed">
                  Enter the email associated with your HookLens account and we'll send you a secure password reset link.
                </p>
              </>
            ) : (
              <>
                <div className="w-12 h-12 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-500 flex items-center justify-center mx-auto mb-3">
                  <MailCheck className="w-6 h-6" />
                </div>
                <h1 className="text-2xl font-bold font-mono text-[var(--text-primary)] tracking-tight">
                  Check your email
                </h1>
                <p className="text-xs text-[var(--text-secondary)] font-sans mt-2 leading-relaxed">
                  If an account exists for <span className="font-mono text-blue-600 dark:text-blue-400 font-semibold">{maskEmail(email)}</span>, you'll receive a password reset link shortly.
                </p>
              </>
            )}
          </div>

          {!submitted ? (
            /* Forgot Password Form */
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-xs font-mono text-red-500">
                  {error}
                </div>
              )}

              <div>
                <label htmlFor="email" className="block text-xs font-mono font-medium text-[var(--text-secondary)] mb-1.5">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  autoComplete="email"
                  disabled={loading}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full px-3.5 py-2.5 bg-[var(--bg-app)] border border-[var(--border-subtle)] rounded-xl text-xs font-mono text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-blue-500 transition-colors disabled:opacity-60"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full py-3 px-4 rounded-xl text-xs font-mono font-semibold flex items-center justify-center gap-2 border border-blue-500 shadow-sm transition-all disabled:opacity-60 mt-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>Sending...</span>
                  </>
                ) : (
                  <span>Send reset link</span>
                )}
              </button>

              <div className="mt-6 pt-5 border-t border-[var(--border-subtle)] text-center text-xs font-mono text-[var(--text-secondary)]">
                Remember your password?{' '}
                <Link to="/login" className="text-blue-600 dark:text-blue-400 hover:underline font-semibold inline-flex items-center gap-1">
                  <ArrowLeft className="w-3 h-3" />
                  <span>Back to sign in</span>
                </Link>
              </div>
            </form>
          ) : (
            /* Success View & Resend Countdown */
            <div className="space-y-5">
              <Link
                to="/login"
                className="btn-primary w-full py-3 px-4 rounded-xl text-xs font-mono font-semibold flex items-center justify-center gap-2 border border-blue-500 shadow-sm text-center"
              >
                <span>Back to sign in</span>
              </Link>

              <div className="text-center pt-3 border-t border-[var(--border-subtle)] font-mono text-xs text-[var(--text-secondary)]">
                <span>Didn't receive the email? </span>
                {cooldown > 0 ? (
                  <span className="text-[var(--text-muted)]">Resend in {cooldown}s</span>
                ) : (
                  <button
                    onClick={handleResend}
                    disabled={loading}
                    className="text-blue-600 dark:text-blue-400 hover:underline font-semibold"
                  >
                    Resend reset link
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Security Footnote */}
          <div className="mt-6 flex items-center justify-center gap-1.5 text-[11px] font-mono text-[var(--text-muted)] text-center">
            <Lock className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            <span>Protected with HookLens security controls.</span>
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

export default ForgotPasswordPage;
