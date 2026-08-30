import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import ThemeToggle from '../components/layout/ThemeToggle.jsx';
import StatusBadge from '../components/common/StatusBadge.jsx';
import Logo from '../components/common/Logo.jsx';
import {
  RotateCcw,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Lock,
  RefreshCw,
  Check,
  Sliders,
  ShieldAlert,
  Copy,
  Terminal,
  Activity,
  Zap,
  Shield,
  Layers,
  Server,
} from 'lucide-react';

export const LandingPage = () => {
  const [copiedUrl, setCopiedUrl] = useState(false);

  const handleCopyUrl = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText('https://api.hooklens.dev/wh/abc123_endpoint');
    }
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[var(--bg-app)] text-[var(--text-primary)] font-sans selection:bg-blue-600/20 overflow-x-hidden transition-colors relative">
      
      {/* Background Hero Ambient Glow Effect */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[650px] h-[360px] bg-blue-500/10 dark:bg-blue-600/10 rounded-full blur-3xl pointer-events-none animate-hero-orb" />

      {/* ==================================================
          NAVBAR
      ================================================== */}
      <nav className="border-b border-[var(--border-subtle)] bg-[var(--bg-app)]/90 backdrop-blur-md sticky top-0 z-50 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-18 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 py-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-lg">
            <Logo className="w-[150px] sm:w-[175px] lg:w-[210px] h-auto object-contain shrink-0 transition-opacity" />
          </Link>

          <div className="hidden md:flex items-center gap-8 text-xs font-mono text-[var(--text-secondary)]">
            <a href="#product" className="hover:text-[var(--text-primary)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded px-1">Product</a>
            <a href="#features" className="hover:text-[var(--text-primary)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded px-1">Capabilities</a>
            <Link to="/developer" className="hover:text-[var(--text-primary)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded px-1">Developers</Link>
            <Link to="/pricing" className="hover:text-[var(--text-primary)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded px-1">Pricing</Link>
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link
              to="/login"
              className="hidden sm:inline-flex px-3.5 py-1.5 text-xs font-mono font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-lg"
            >
              Sign In
            </Link>
            <Link
              to="/signup"
              className="btn-primary px-4 py-2 text-xs font-mono font-medium rounded-xl border border-blue-500 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              Get Started Free
            </Link>
          </div>
        </div>
      </nav>

      {/* ==================================================
          HERO SECTION
      ================================================== */}
      <section className="relative pt-12 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto bg-tech-grid">
        <div className="text-center max-w-4xl mx-auto mb-12 relative z-10 space-y-5 sm:space-y-6">
          
          {/* Main Hero Headline */}
          <h1 className="animate-hero-headline text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight font-mono leading-[1.15] text-[var(--text-primary)]">
            Stop Debugging <span className="text-blue-600 dark:text-blue-400 font-extrabold underline decoration-blue-500/30">Webhooks</span> in the Dark.
          </h1>

          {/* Subtitle & Description */}
          <div className="animate-hero-desc space-y-2.5">
            <p className="text-base sm:text-lg lg:text-xl font-semibold font-sans text-[var(--text-primary)] tracking-tight">
              See what failed. Understand why. <span className="text-blue-600 dark:text-blue-400">Recover it safely.</span>
            </p>

            <p className="text-xs sm:text-sm lg:text-base text-[var(--text-secondary)] max-w-2xl mx-auto leading-relaxed font-sans font-normal">
              HookLens sits between your third-party providers and backend API, delivering real-time observability, HMAC verification, automatic retries, and instant replay.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="animate-hero-cta pt-1 flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <Link
              to="/signup"
              className="group btn-primary w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 text-xs sm:text-sm font-mono font-semibold rounded-xl border border-blue-500 shadow-lg shadow-blue-500/25 transition-all duration-200 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              <span>Start Monitoring Free</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
            </Link>
            <Link
              to="/developer"
              className="group w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 text-xs sm:text-sm font-mono font-medium text-[var(--text-primary)] bg-[var(--bg-surface)] hover:bg-[var(--bg-elevated)] rounded-xl border border-[var(--border-subtle)] hover:border-[var(--border-strong)] transition-all duration-200 hover:-translate-y-0.5 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              <Terminal className="w-4 h-4 text-blue-500" />
              <span>Read API Docs</span>
            </Link>
          </div>
        </div>

        {/* Live Pipeline Flow Card */}
        <div className="animate-telemetry-panel max-w-4xl mx-auto bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl p-5 sm:p-7 shadow-xl relative overflow-hidden font-mono text-xs">
          
          {/* Signal Pulse Line Overlay */}
          <div className="absolute top-0 left-0 right-0 h-0.5 animate-signal-flow opacity-80" />

          <div className="flex items-center justify-between pb-4 border-b border-[var(--border-subtle)] mb-5">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <Activity className="w-4 h-4 text-blue-500" />
              <span className="font-semibold text-[var(--text-primary)] text-xs sm:text-sm">Live Webhook Ingestion & Delivery Telemetry</span>
            </div>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 shrink-0">
              Active Ingress Gateway
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3.5 text-center">
            <div className="p-3.5 bg-[var(--bg-app)] border border-[var(--border-subtle)] rounded-xl space-y-1.5 transition-colors hover:border-[var(--border-strong)]">
              <span className="text-[11px] text-[var(--text-muted)] uppercase font-semibold tracking-wider font-mono">1. Origin</span>
              <div className="font-semibold text-[var(--text-primary)] text-xs">Razorpay / Stripe</div>
              <div className="text-[11px] text-[var(--text-secondary)] font-medium font-mono">HTTPS POST</div>
            </div>

            <div className="p-3.5 bg-blue-500/10 border border-blue-500/30 rounded-xl space-y-1.5 text-blue-600 dark:text-blue-400 transition-colors">
              <span className="text-[11px] uppercase font-semibold tracking-wider font-mono">2. HookLens Ingress</span>
              <div className="font-bold text-xs">HMAC Signature ✓</div>
              <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold font-mono">SSRF Filtered</div>
            </div>

            <div className="p-3.5 bg-[var(--bg-app)] border border-[var(--border-subtle)] rounded-xl space-y-1.5 transition-colors hover:border-[var(--border-strong)]">
              <span className="text-[11px] text-[var(--text-muted)] uppercase font-semibold tracking-wider font-mono">3. BullMQ Worker</span>
              <div className="font-semibold text-[var(--text-primary)] text-xs">Queue Processing</div>
              <div className="text-[11px] text-blue-600 dark:text-blue-400 font-semibold font-mono">Exponential Backoff</div>
            </div>

            <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl space-y-1.5 text-emerald-600 dark:text-emerald-400 transition-colors">
              <span className="text-[11px] uppercase font-semibold tracking-wider font-mono">4. Your Backend</span>
              <div className="font-bold text-xs">HTTP 200 OK</div>
              <div className="text-[11px] font-semibold font-mono">Delivered in 42ms</div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================================================
          PRODUCT CAPABILITIES GRID
      ================================================== */}
      <section id="features" className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-[var(--border-subtle)]">
        <div className="text-center max-w-3xl mx-auto mb-14 space-y-2.5">
          <h2 className="text-2xl sm:text-4xl font-bold font-mono text-[var(--text-primary)] tracking-tight">
            Built for developers handling mission-critical webhooks.
          </h2>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] font-sans">
            Complete visibility, security controls, and recovery workflows out of the box.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="animate-card-stagger-1 feature-card bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl p-6 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold font-mono text-[var(--text-primary)]">Real-Time Telemetry</h3>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed font-sans font-normal">
              Watch incoming webhooks stream live into your dashboard using Socket.IO without manual page refreshes.
            </p>
          </div>

          <div className="animate-card-stagger-2 feature-card bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl p-6 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-500">
              <RotateCcw className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold font-mono text-[var(--text-primary)]">One-Click Replays</h3>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed font-sans font-normal">
              Replay any historical payload directly to your backend endpoint with original headers intact.
            </p>
          </div>

          <div className="animate-card-stagger-3 feature-card bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl p-6 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500">
              <Shield className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold font-mono text-[var(--text-primary)]">HMAC & SSRF Security</h3>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed font-sans font-normal">
              Cryptographically verify signature headers and automatically block private IP egress SSRF vectors.
            </p>
          </div>
        </div>
      </section>

      {/* ==================================================
          FOOTER
      ================================================== */}
      <footer className="py-8 text-center font-mono text-[11px] text-[var(--text-muted)] border-t border-[var(--border-subtle)]">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Logo className="h-6 w-auto object-contain" />
            <span className="font-semibold text-[var(--text-primary)]">HookLens Infrastructure</span>
          </div>
          <div className="flex gap-6">
            <Link to="/developer" className="hover:text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded px-1">Developer Docs</Link>
            <Link to="/pricing" className="hover:text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded px-1">Pricing</Link>
            <Link to="/login" className="hover:text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded px-1">Sign In</Link>
            <Link to="/signup" className="hover:text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded px-1">Get Started</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
