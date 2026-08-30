import React, { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { authApi } from '../api/authApi.js';
import ThemeToggle from '../components/layout/ThemeToggle.jsx';
import Logo from '../components/common/Logo.jsx';
import {
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Check,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
} from 'lucide-react';

export const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Form state: 'idle' | 'submitting' | 'success' | 'token_expired'
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');

  const navigate = useNavigate();

  // Password validation requirement flags
  const hasMinLength = newPassword.length >= 8;
  const hasUppercase = /[A-Z]/.test(newPassword);
  const hasNumber = /[0-9]/.test(newPassword);
  const isPasswordValid = hasMinLength && hasUppercase && hasNumber;

  useEffect(() => {
    // If token is explicitly missing or marked expired
    if (!token) {
      setStatus('token_expired');
      setError('This password reset link is no longer valid. Request a new reset link to continue.');
    }
  }, [token]);

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');

    if (!isPasswordValid) {
      setError('Password does not meet the requirements.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setStatus('submitting');

    try {
      await authApi.resetPassword(token, newPassword);
      setStatus('success');
    } catch (err) {
      if (err?.message?.includes('expired') || err?.message?.includes('valid')) {
        setStatus('token_expired');
      } else {
        setError(err?.message || 'Unable to reset password. Please try again.');
        setStatus('idle');
      }
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-app)] text-[var(--text-primary)] font-sans flex flex-col justify-between selection:bg-blue-600/20 transition-colors">
      
      {/* Top Header */}
      <header className="px-6 py-4 flex items-center justify-between z-20">
        <Link to="/" className="flex items-center gap-2.5">
          <Logo className="w-[150px] sm:w-[175px] h-auto object-contain shrink-0" />
        </Link>
        <ThemeToggle />
      </header>

      {/* Main Container */}
      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-8">
        <div className="w-full max-w-[420px] bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl p-6 sm:p-8 shadow-xl">
          
          {/* Official Logo */}
          <div className="text-center mb-6">
            <Logo className="w-[160px] sm:w-[180px] h-auto mx-auto mb-4 object-contain" />

            {status === 'idle' || status === 'submitting' ? (
              <>
                <h1 className="text-2xl font-bold font-mono text-[var(--text-primary)] tracking-tight">
                  Create a new password
                </h1>
                <p className="text-xs text-[var(--text-secondary)] font-sans mt-1">
                  Choose a strong password for your HookLens account.
                </p>
              </>
            ) : status === 'success' ? (
              <>
                <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 flex items-center justify-center mx-auto mb-3">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h1 className="text-2xl font-bold font-mono text-[var(--text-primary)] tracking-tight">
                  Password updated
                </h1>
                <p className="text-xs text-[var(--text-secondary)] font-sans mt-1">
                  Your password has been changed successfully.
                </p>
              </>
            ) : (
              <>
                <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center mx-auto mb-3">
                  <AlertCircle className="w-6 h-6" />
                </div>
                <h1 className="text-2xl font-bold font-mono text-[var(--text-primary)] tracking-tight">
                  Reset link expired
                </h1>
                <p className="text-xs text-[var(--text-secondary)] font-sans mt-1 leading-relaxed">
                  This password reset link is no longer valid. Request a new reset link to continue.
                </p>
              </>
            )}
          </div>

          {/* Reset Password Form */}
          {(status === 'idle' || status === 'submitting') && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-xs font-mono text-red-500">
                  {error}
                </div>
              )}

              <div>
                <label htmlFor="newPassword" className="block text-xs font-mono font-medium text-[var(--text-secondary)] mb-1.5">
                  New password
                </label>
                <div className="relative">
                  <input
                    id="newPassword"
                    type={showNewPassword ? 'text' : 'password'}
                    required
                    autoComplete="new-password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Create a new password"
                    className="w-full px-3.5 py-2.5 pr-10 bg-[var(--bg-app)] border border-[var(--border-subtle)] rounded-xl text-xs font-mono text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-blue-500 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors p-1"
                    title={showNewPassword ? 'Hide password' : 'Show password'}
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {/* Password Requirements Indicator */}
                {newPassword.length > 0 && (
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
                  Confirm password
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

              <button
                type="submit"
                disabled={status === 'submitting'}
                className="btn-primary w-full py-3 px-4 rounded-xl text-xs font-mono font-semibold flex items-center justify-center gap-2 border border-blue-500 shadow-sm transition-all disabled:opacity-60 mt-2"
              >
                {status === 'submitting' ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>Resetting password...</span>
                  </>
                ) : (
                  <span>Reset password</span>
                )}
              </button>
            </form>
          )}

          {/* Success State */}
          {status === 'success' && (
            <div className="space-y-4 pt-2">
              <Link
                to="/login"
                className="btn-primary w-full py-3 px-4 rounded-xl text-xs font-mono font-semibold flex items-center justify-center gap-2 border border-blue-500 shadow-sm text-center"
              >
                <span>Sign in</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}

          {/* Expired / Invalid Token State */}
          {status === 'token_expired' && (
            <div className="space-y-4 pt-2">
              <Link
                to="/forgot-password"
                className="btn-primary w-full py-3 px-4 rounded-xl text-xs font-mono font-semibold flex items-center justify-center gap-2 border border-blue-500 shadow-sm text-center"
              >
                <span>Request new reset link</span>
              </Link>
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
            <Link to="/developer" className="hover:text-[var(--text-primary)]">Documentation</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ResetPasswordPage;
