import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import ThemeToggle from '../components/layout/ThemeToggle.jsx';
import StatusBadge from '../components/common/StatusBadge.jsx';
import logoImg from '../assets/logo.png';
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
} from 'lucide-react';

export const LandingPage = () => {
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [replayState, setReplayState] = useState('idle');

  const handleCopyUrl = () => {
    navigator.clipboard.writeText('https://api.hooklens.dev/wh/abc123');
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[var(--bg-app)] text-[var(--text-primary)] font-sans selection:bg-blue-600/20 overflow-x-hidden transition-colors">
      
      {/* ==================================================
          NAVBAR
      ================================================== */}
      <nav className="border-b border-[var(--border-subtle)] bg-[var(--bg-app)]/90 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-3">
              <img src={logoImg} alt="HookLens Logo" className="h-8 w-auto object-contain shrink-0" />
              <span className="font-bold text-[var(--text-primary)] tracking-tight text-lg font-mono">
                HookLens
              </span>
            </Link>
          </div>

          <div className="hidden md:flex items-center gap-8 text-xs font-mono text-[var(--text-secondary)]">
            <a href="#product" className="hover:text-[var(--text-primary)] transition-colors">Product</a>
            <a href="#security" className="hover:text-[var(--text-primary)] transition-colors">Security</a>
            <a href="#architecture" className="hover:text-[var(--text-primary)] transition-colors">Developers</a>
            <a href="#docs" className="hover:text-[var(--text-primary)] transition-colors">Docs</a>
            <a href="#pricing" className="hover:text-[var(--text-primary)] transition-colors">Pricing</a>
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link
              to="/login"
              className="hidden sm:inline-flex px-3.5 py-1.5 text-xs font-mono font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
            >
              Sign In
            </Link>
            <Link
              to="/signup"
              className="btn-primary px-4 py-2 text-xs font-mono font-medium rounded-lg border border-blue-500 shadow-sm"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* ==================================================
          HERO SECTION
      ================================================== */}
      <section className="relative pt-16 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto bg-tech-grid">
        <div className="text-center max-w-4xl mx-auto mb-14 relative z-10">
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight font-mono leading-[1.1] text-[var(--text-primary)]">
            Stop Debugging <span className="text-blue-600 dark:text-blue-400 underline decoration-blue-500/30">Webhooks</span> in the Dark.
          </h1>

          <p className="mt-6 text-lg sm:text-xl font-semibold font-sans text-[var(--text-primary)]">
            See what failed. Understand why. <span className="text-blue-600 dark:text-blue-400">Recover it safely.</span>
          </p>

          <p className="mt-4 text-sm sm:text-base text-[var(--text-secondary)] max-w-2xl mx-auto leading-relaxed font-sans">
            HookLens sits between your webhook providers and backend, giving you real-time visibility, secure delivery, automatic retries, and safe replay when things go wrong.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/signup"
              className="btn-primary w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 text-sm font-mono font-semibold rounded-lg border border-blue-500"
            >
              <span>Start Monitoring Free</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/dashboard"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 text-sm font-mono font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] bg-[var(--bg-surface)] hover:bg-[var(--bg-elevated)] rounded-lg border border-[var(--border-subtle)] transition-colors shadow-sm"
            >
              <span>View Live Demo</span>
            </Link>
          </div>
        </div>

        {/* Webhook Flow Visualizer */}
        <div className="mt-12 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl p-6 sm:p-8 shadow-sm max-w-5xl mx-auto font-mono text-xs relative z-10">
          <div className="text-center text-[var(--text-muted)] font-semibold uppercase tracking-wider mb-6 text-[11px]">
            Live Webhook Delivery Pipeline
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center text-center">
            {/* Origin Providers */}
            <div className="p-4 bg-[var(--bg-app)] border border-[var(--border-subtle)] rounded-lg space-y-2">
              <div className="text-[10px] text-[var(--text-muted)] uppercase">01. Origin</div>
              <div className="font-semibold text-[var(--text-primary)]">Providers</div>
              <div className="flex flex-wrap justify-center gap-1.5 pt-1">
                <span className="px-2 py-0.5 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded text-[10px]">Razorpay</span>
                <span className="px-2 py-0.5 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded text-[10px]">Stripe</span>
                <span className="px-2 py-0.5 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded text-[10px]">WhatsApp</span>
              </div>
            </div>

            {/* Connection 1 */}
            <div className="hidden md:flex flex-col items-center relative py-4">
              <span className="text-[10px] text-[var(--text-muted)] mb-1">HTTPS POST</span>
              <div className="w-full h-0.5 bg-[var(--border-subtle)]" />
            </div>

            {/* HookLens Security Ingress */}
            <div className="p-4 bg-blue-500/5 border border-blue-500/20 rounded-lg space-y-2">
              <div className="text-[10px] text-blue-500 font-semibold uppercase">02. HookLens Ingress</div>
              <div className="font-bold text-[var(--text-primary)]">Security Check</div>
              <div className="space-y-1 text-[11px] text-emerald-600 dark:text-emerald-400">
                <div>HMAC Verification ✓</div>
                <div>Freshness Guard ✓</div>
                <div>Idempotency Check ✓</div>
              </div>
            </div>

            {/* Connection 2 */}
            <div className="hidden md:flex flex-col items-center relative py-4">
              <span className="text-[10px] text-[var(--text-muted)] mb-1">BullMQ Worker</span>
              <div className="w-full h-0.5 bg-[var(--border-subtle)]" />
            </div>

            {/* Developer Target API */}
            <div className="p-4 bg-[var(--bg-app)] border border-[var(--border-subtle)] rounded-lg space-y-2">
              <div className="text-[10px] text-[var(--text-muted)] uppercase">03. Destination</div>
              <div className="font-semibold text-[var(--text-primary)]">Developer API</div>
              <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                Verified Delivery
              </div>
            </div>
          </div>

          {/* Product Dashboard Card */}
          <div className="mt-8 pt-6 border-t border-[var(--border-subtle)]">
            <div className="flex items-center justify-between p-3 bg-[var(--bg-app)] border border-[var(--border-subtle)] rounded-lg">
              <div className="flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="font-semibold text-[var(--text-primary)]">payment.captured</span>
                <span className="text-[var(--text-muted)]">•</span>
                <span className="text-[var(--text-secondary)]">Razorpay</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[var(--text-muted)]">Status:</span>
                <StatusBadge status="SUCCESS" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================================================
          PROVIDER INTEGRATIONS
      ================================================== */}
      <section className="py-12 border-y border-[var(--border-subtle)] bg-[var(--bg-secondary)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-xs font-mono uppercase tracking-widest text-[var(--text-muted)] mb-6">
            Works with the webhook providers you already use.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 font-mono text-xs">
            <div className="px-4 py-2 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="font-semibold text-[var(--text-primary)]">Razorpay</span>
            </div>

            <div className="px-4 py-2 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="font-semibold text-[var(--text-primary)]">Stripe</span>
            </div>

            <div className="px-4 py-2 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="font-semibold text-[var(--text-primary)]">WhatsApp Cloud API</span>
            </div>

            <div className="px-4 py-2 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="font-semibold text-[var(--text-primary)]">Custom Webhooks</span>
            </div>

            <div className="px-4 py-2 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg flex items-center gap-2 opacity-60">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <span className="text-[var(--text-secondary)]">GitHub</span>
              <span className="text-[10px] px-1.5 py-0.2 bg-amber-500/10 text-amber-500 rounded border border-amber-500/20">Coming soon</span>
            </div>

            <div className="px-4 py-2 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg flex items-center gap-2 opacity-60">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <span className="text-[var(--text-secondary)]">Shopify</span>
              <span className="text-[10px] px-1.5 py-0.2 bg-amber-500/10 text-amber-500 rounded border border-amber-500/20">Coming soon</span>
            </div>
          </div>
        </div>
      </section>

      {/* ==================================================
          PROBLEM SECTION
      ================================================== */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-xs font-mono uppercase tracking-widest text-blue-600 dark:text-blue-400 mb-2">The Problem</h2>
          <h3 className="text-2xl sm:text-4xl font-bold font-mono text-[var(--text-primary)] tracking-tight">
            Webhooks fail. Your logs shouldn't be the crime scene.
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-14">
          <div className="feature-card bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl p-6 shadow-sm space-y-3">
            <div className="w-8 h-8 rounded bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 font-mono text-xs font-bold">
              01
            </div>
            <h4 className="text-base font-semibold font-mono text-[var(--text-primary)]">Silent Failures</h4>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed font-sans">
              "Your provider says the event was sent. Your backend says it never arrived."
            </p>
          </div>

          <div className="feature-card bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl p-6 shadow-sm space-y-3">
            <div className="w-8 h-8 rounded bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 font-mono text-xs font-bold">
              02
            </div>
            <h4 className="text-base font-semibold font-mono text-[var(--text-primary)]">Duplicate Events</h4>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed font-sans">
              "Retries and manual recovery can create duplicate processing and side effects."
            </p>
          </div>

          <div className="feature-card bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl p-6 shadow-sm space-y-3">
            <div className="w-8 h-8 rounded bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500 font-mono text-xs font-bold">
              03
            </div>
            <h4 className="text-base font-semibold font-mono text-[var(--text-primary)]">Slow Debugging</h4>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed font-sans">
              "Developers waste hours searching logs to understand what actually happened."
            </p>
          </div>
        </div>

        <div className="p-6 bg-[var(--bg-tinted)] border border-[var(--border-strong)] rounded-xl text-center font-mono text-xs max-w-4xl mx-auto shadow-sm">
          <div className="flex flex-wrap items-center justify-center gap-3 text-[var(--text-muted)] mb-3">
            <span>Provider</span>
            <span>→</span>
            <span>Webhook</span>
            <span>→</span>
            <span className="text-red-500 font-semibold">500 / Timeout</span>
            <span>→</span>
            <span className="text-amber-500 font-semibold">???</span>
          </div>
          <div className="text-sm font-semibold text-blue-600 dark:text-blue-400 font-mono">
            HookLens turns every webhook into a complete delivery timeline.
          </div>
        </div>
      </section>

      {/* ==================================================
          MAIN PRODUCT SECTION (ARCHITECTURE)
      ================================================== */}
      <section id="product" className="py-20 border-t border-[var(--border-subtle)] bg-[var(--bg-tinted)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-mono uppercase tracking-widest text-blue-600 dark:text-blue-400 mb-2">Core Architecture</h2>
            <h3 className="text-2xl sm:text-4xl font-bold font-mono text-[var(--text-primary)] tracking-tight">
              Everything between the webhook and your backend.
            </h3>
          </div>

          <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl p-8 shadow-sm max-w-5xl mx-auto mb-12">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-mono text-xs items-center text-center md:text-left">
              <div className="p-5 bg-[var(--bg-app)] border border-[var(--border-subtle)] rounded-lg space-y-3">
                <div className="text-[11px] text-[var(--text-muted)] uppercase font-semibold">Webhook Providers</div>
                <div className="space-y-1.5 font-semibold text-[var(--text-primary)]">
                  <div className="p-2 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded">Razorpay</div>
                  <div className="p-2 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded">Stripe</div>
                  <div className="p-2 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded">WhatsApp</div>
                  <div className="p-2 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded">Custom</div>
                </div>
              </div>

              <div className="p-5 bg-blue-500/5 border border-blue-500/20 rounded-lg space-y-2 text-center">
                <div className="text-[11px] text-blue-500 uppercase font-bold tracking-wider">HOOKLENS</div>
                <ol className="text-[11px] space-y-1 text-[var(--text-secondary)] font-semibold">
                  <li>1. Receive</li>
                  <li>2. Verify</li>
                  <li>3. Persist</li>
                  <li>4. Queue</li>
                  <li>5. Deliver</li>
                  <li>6. Observe</li>
                  <li>7. Recover</li>
                </ol>
              </div>

              <div className="p-5 bg-[var(--bg-app)] border border-[var(--border-subtle)] rounded-lg space-y-3">
                <div className="text-[11px] text-[var(--text-muted)] uppercase font-semibold">Developer Backend</div>
                <div className="p-4 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded space-y-2">
                  <div className="font-semibold text-emerald-500">Target Endpoint API</div>
                  <div className="text-[11px] text-[var(--text-muted)]">Verified HTTP Delivery</div>
                  <div className="text-[10px] text-blue-500">SSRF Egress Guarded</div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="feature-card bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl p-6">
              <Lock className="w-5 h-5 text-blue-500 mb-3" />
              <h4 className="text-xs font-semibold font-mono text-[var(--text-primary)] uppercase tracking-wider mb-2">SECURE INGESTION</h4>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed font-sans">
                Verify provider signatures and freshness before accepting events into your pipeline.
              </p>
            </div>

            <div className="feature-card bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl p-6">
              <RefreshCw className="w-5 h-5 text-emerald-500 mb-3" />
              <h4 className="text-xs font-semibold font-mono text-[var(--text-primary)] uppercase tracking-wider mb-2">RELIABLE DELIVERY</h4>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed font-sans">
                Queue events and deliver them asynchronously with retries and exponential backoff.
              </p>
            </div>

            <div className="feature-card bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl p-6">
              <RotateCcw className="w-5 h-5 text-violet-500 mb-3" />
              <h4 className="text-xs font-semibold font-mono text-[var(--text-primary)] uppercase tracking-wider mb-2">SAFE RECOVERY</h4>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed font-sans">
                Inspect failed attempts and replay events cleanly without rewriting historical records.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ==================================================
          OBSERVABILITY SECTION
      ================================================== */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-xs font-mono uppercase tracking-widest text-blue-600 dark:text-blue-400 mb-2">Observability</h2>
          <h3 className="text-2xl sm:text-4xl font-bold font-mono text-[var(--text-primary)] tracking-tight">
            Every webhook. Every attempt. One timeline.
          </h3>
        </div>

        <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl overflow-hidden shadow-md max-w-5xl mx-auto font-mono text-xs">
          <div className="px-5 py-3 bg-[var(--bg-app)] border-b border-[var(--border-subtle)] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="font-semibold text-[var(--text-primary)]">payment.captured</span>
              <span className="text-[var(--text-muted)]">•</span>
              <span className="text-[var(--text-secondary)]">evt_8f2a91</span>
            </div>
            <StatusBadge status="FAILED" />
          </div>

          <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-4">
              <div className="p-3 bg-[var(--bg-app)] border border-[var(--border-subtle)] rounded-lg">
                <div className="text-[10px] text-[var(--text-muted)] uppercase">Provider</div>
                <div className="text-xs font-semibold text-[var(--text-primary)] mt-0.5">Razorpay</div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-[var(--bg-app)] border border-[var(--border-subtle)] rounded-lg">
                  <div className="text-[10px] text-[var(--text-muted)] uppercase">HTTP Code</div>
                  <div className="text-xs font-semibold text-red-500 mt-0.5">503</div>
                </div>
                <div className="p-3 bg-[var(--bg-app)] border border-[var(--border-subtle)] rounded-lg">
                  <div className="text-[10px] text-[var(--text-muted)] uppercase">Latency</div>
                  <div className="text-xs font-semibold text-[var(--text-primary)] mt-0.5">1.06s</div>
                </div>
              </div>

              <div className="p-3 bg-[var(--bg-app)] border border-[var(--border-subtle)] rounded-lg">
                <div className="text-[10px] text-[var(--text-muted)] uppercase">Attempts</div>
                <div className="text-xs font-semibold text-amber-500 mt-0.5">3 / 5</div>
              </div>
            </div>

            {/* Timeline Items */}
            <div className="md:col-span-2 p-4 bg-[var(--bg-app)] border border-[var(--border-subtle)] rounded-lg space-y-2 text-[11px]">
              <div className="text-[11px] font-semibold text-[var(--text-muted)] uppercase mb-2">Delivery Timeline Audit Log</div>
              
              {[
                { time: '14:21:03', title: 'Received', status: 'Gateway OK', color: 'text-emerald-500' },
                { time: '14:21:03', title: 'Signature Verified', status: 'HMAC Pass', color: 'text-emerald-500' },
                { time: '14:21:03', title: 'Queued', status: 'BullMQ Enqueued', color: 'text-blue-500' },
                { time: '14:21:04', title: 'Attempt #1', status: 'HTTP 503', color: 'text-red-500' },
                { time: '14:21:06', title: 'Retry Scheduled', status: 'Backoff Active', color: 'text-amber-500' },
                { time: '14:21:09', title: 'Attempt #2', status: 'HTTP 503', color: 'text-red-500' },
                { time: '14:21:19', title: 'Attempt #3', status: 'Timeout 10s', color: 'text-red-500' },
                { time: '14:21:19', title: 'Dead Lettered', status: 'DLQ Enqueued', color: 'text-purple-500 font-semibold' },
              ].map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded"
                >
                  <span>{item.time} • {item.title}</span>
                  <span className={item.color}>{item.status}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ==================================================
          STATIC AI DIAGNOSIS
      ================================================== */}
      <section className="py-20 border-t border-[var(--border-subtle)] bg-[var(--bg-secondary)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-mono uppercase tracking-widest text-blue-600 dark:text-blue-400 mb-2">Intelligence Layer</h2>
            <h3 className="text-2xl sm:text-4xl font-bold font-mono text-[var(--text-primary)] tracking-tight">
              Don't just see the failure. Understand it.
            </h3>
          </div>

          <div className="bg-[var(--bg-surface)] border border-blue-500/20 rounded-xl p-6 sm:p-8 shadow-sm max-w-4xl mx-auto font-mono text-xs">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-[var(--border-subtle)]">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-500" />
                <span className="font-bold text-[var(--text-primary)] uppercase tracking-wider text-xs">AI-ASSISTED DIAGNOSIS</span>
              </div>
              <span className="px-2.5 py-0.5 rounded bg-blue-500/10 text-blue-500 text-[10px] border border-blue-500/20">
                Confidence: 96%
              </span>
            </div>

            <div className="space-y-4">
              <div>
                <div className="text-[11px] text-[var(--text-muted)] uppercase mb-1">Likely Cause</div>
                <div className="text-sm font-semibold text-red-500 font-sans">
                  "Downstream API degradation"
                </div>
              </div>

              <div>
                <div className="text-[11px] text-[var(--text-muted)] uppercase mb-2">Evidence Gathered</div>
                <ul className="space-y-1.5 text-[var(--text-secondary)]">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-500" /> 3 consecutive delivery failures
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-500" /> Target returned HTTP 503 Service Unavailable
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-500" /> Latency increased from 120ms to 8.4s
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-500" /> DNS resolution succeeded
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-500" /> TCP connection was established
                  </li>
                </ul>
              </div>

              <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg text-amber-600 dark:text-amber-400">
                <div className="font-semibold text-xs mb-1">Recommended Action</div>
                <div className="text-xs font-sans">Check target API/database health, then replay affected events.</div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-[var(--border-subtle)]">
                <span className="text-[10px] text-[var(--text-muted)] font-sans">
                  * AI-assisted diagnosis provides probabilistic root cause insights based on response headers and telemetry logs.
                </span>
                <div className="flex gap-2">
                  <Link to="/dashboard/events/evt_991823" className="px-3 py-1.5 bg-[var(--bg-app)] border border-[var(--border-subtle)] rounded text-[11px] hover:text-[var(--text-primary)]">
                    View Attempts
                  </Link>
                  <Link to="/dashboard/events/evt_991823" className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded text-[11px] font-semibold">
                    Replay Webhook
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================================================
          SECURITY SECTION
      ================================================== */}
      <section id="security" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-xs font-mono uppercase tracking-widest text-blue-600 dark:text-blue-400 mb-2">Security Boundary</h2>
          <h3 className="text-2xl sm:text-4xl font-bold font-mono text-[var(--text-primary)] tracking-tight">
            Your webhook pipeline needs a security boundary.
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <div className="feature-card bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl p-6 shadow-sm">
            <Lock className="w-5 h-5 text-blue-500 mb-3" />
            <h4 className="text-xs font-bold font-mono text-[var(--text-primary)] uppercase mb-2">HMAC SIGNATURE VERIFICATION</h4>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed font-sans">
              Reject unauthenticated webhook requests before they reach your application servers.
            </p>
          </div>

          <div className="feature-card bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl p-6 shadow-sm">
            <RefreshCw className="w-5 h-5 text-emerald-500 mb-3" />
            <h4 className="text-xs font-bold font-mono text-[var(--text-primary)] uppercase mb-2">REPLAY PROTECTION</h4>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed font-sans">
              Track provider event IDs and freshness to reduce duplicate and replay abuse.
            </p>
          </div>

          <div className="feature-card bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl p-6 shadow-sm">
            <ShieldAlert className="w-5 h-5 text-red-500 mb-3" />
            <h4 className="text-xs font-bold font-mono text-[var(--text-primary)] uppercase mb-2">SSRF PROTECTION</h4>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed font-sans">
              Protect outbound delivery from private, loopback, link-local and cloud metadata destinations.
            </p>
          </div>

          <div className="feature-card bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl p-6 shadow-sm">
            <Sliders className="w-5 h-5 text-violet-500 mb-3" />
            <h4 className="text-xs font-bold font-mono text-[var(--text-primary)] uppercase mb-2">PII / SECRET REDACTION</h4>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed font-sans">
              Redact sensitive information before persisting or exposing data to observability layers.
            </p>
          </div>
        </div>

        <div className="p-4 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl font-mono text-xs text-center max-w-4xl mx-auto shadow-sm">
          <div className="flex flex-wrap items-center justify-center gap-3">
            <span className="text-[var(--text-muted)]">Incoming Webhook</span>
            <span>→</span>
            <span className="text-emerald-500">Signature ✓</span>
            <span>→</span>
            <span className="text-emerald-500">Freshness ✓</span>
            <span>→</span>
            <span className="text-emerald-500">Idempotency ✓</span>
            <span>→</span>
            <span className="text-blue-500">Sanitized Event</span>
            <span>→</span>
            <span className="text-emerald-500 font-semibold">Safe Delivery</span>
          </div>
        </div>
      </section>

      {/* ==================================================
          DARK PRODUCTION SECTION
      ================================================== */}
      <section className="py-20 border-t border-[var(--border-subtle)] bg-[#090B10] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-mono uppercase tracking-widest text-blue-400 mb-2">Infrastructure Grade</h2>
            <h3 className="text-2xl sm:text-4xl font-bold font-mono text-white tracking-tight">
              Built for the moments when your backend isn't.
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center max-w-5xl mx-auto">
            <div className="space-y-4 font-mono text-xs">
              <div className="flex items-center gap-3 p-3.5 bg-[#11141A] border border-[#252B36] rounded-lg">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Automatic retries with exponential backoff & jitter</span>
              </div>
              <div className="flex items-center gap-3 p-3.5 bg-[#11141A] border border-[#252B36] rounded-lg">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Custom timeout handling & circuit breakers</span>
              </div>
              <div className="flex items-center gap-3 p-3.5 bg-[#11141A] border border-[#252B36] rounded-lg">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Persistent Dead Letter Queue (DLQ) for failed events</span>
              </div>
              <div className="flex items-center gap-3 p-3.5 bg-[#11141A] border border-[#252B36] rounded-lg">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>At-least-once delivery guarantee semantics</span>
              </div>
            </div>

            <div className="p-5 bg-[#11141A] border border-[#252B36] rounded-xl font-mono text-xs space-y-4 shadow-md">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-[var(--text-muted)] uppercase font-semibold">Delivery Telemetry Graph</span>
                <div className="flex items-center gap-3 text-[10px]">
                  <span className="text-emerald-400 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Delivered</span>
                  <span className="text-amber-400 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-amber-400" /> Retrying</span>
                  <span className="text-red-400 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-red-400" /> Failed</span>
                </div>
              </div>

              {/* Static SVG Telemetry Graph */}
              <div className="h-28 w-full relative flex items-end pt-2">
                <svg className="w-full h-full overflow-visible" viewBox="0 0 300 80">
                  <path
                    d="M0 60 Q 30 20, 60 50 T 120 30 T 180 55 T 240 15 T 300 40"
                    fill="none"
                    stroke="#3B82F6"
                    strokeWidth="2"
                  />
                </svg>
              </div>

              <div className="p-2.5 bg-[#090B10] border border-[#252B36] rounded flex justify-between">
                <span>Attempt #1 (14:21:04)</span>
                <span className="text-red-400">HTTP 503</span>
              </div>
              <div className="p-2.5 bg-amber-500/10 border border-amber-500/20 rounded flex justify-between text-amber-400">
                <span>Retry Scheduled (Backoff Active)</span>
                <span>In 15s</span>
              </div>
              <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded flex justify-between text-emerald-400">
                <span>Attempt #3 (14:21:34)</span>
                <span>HTTP 200 OK</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================================================
          REPLAY SECTION
      ================================================== */}
      <section className="py-20 border-t border-[var(--border-subtle)] bg-[var(--bg-secondary)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-mono uppercase tracking-widest text-blue-600 dark:text-blue-400 mb-2">Replay & Recovery</h2>
            <h3 className="text-2xl sm:text-4xl font-bold font-mono text-[var(--text-primary)] tracking-tight">
              Recover failed events without rewriting history.
            </h3>
          </div>

          <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl p-6 sm:p-8 shadow-sm max-w-3xl mx-auto font-mono text-xs space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-[var(--border-subtle)]">
              <div>
                <div className="text-[10px] text-[var(--text-muted)] uppercase">Original Event</div>
                <div className="text-sm font-bold text-[var(--text-primary)] mt-0.5">payment.captured</div>
                <div className="text-[11px] text-[var(--text-muted)]">evt_8f2a91</div>
              </div>
              <div className="text-right">
                <div className="text-[10px] text-[var(--text-muted)] uppercase">Previous Attempts</div>
                <div className="text-xs font-semibold text-amber-500 mt-0.5">3 Attempts (Last HTTP 503)</div>
              </div>
            </div>

            {replayState === 'idle' && (
              <div className="text-center py-4">
                <button
                  onClick={() => setReplayState('confirming')}
                  className="btn-primary inline-flex items-center gap-2 px-6 py-3 text-xs font-mono font-semibold rounded-lg border border-blue-500"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Replay Webhook</span>
                </button>
              </div>
            )}

            {replayState === 'confirming' && (
              <div className="p-4 bg-[var(--bg-app)] border border-[var(--border-subtle)] rounded-lg space-y-4">
                <div className="font-semibold text-sm text-[var(--text-primary)]">Replay this webhook?</div>
                <p className="text-xs text-[var(--text-secondary)] font-sans leading-relaxed">
                  Replay creates a new delivery attempt to <span className="font-mono text-blue-500">https://api.devcorp.io/webhooks/razorpay</span>. Original event history remains unchanged.
                </p>
                <div className="flex justify-end gap-3 pt-2">
                  <button
                    onClick={() => setReplayState('idle')}
                    className="px-3 py-1.5 text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] bg-[var(--bg-elevated)] rounded border border-[var(--border-subtle)]"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => setReplayState('queued')}
                    className="px-4 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded border border-blue-500"
                  >
                    Confirm Replay
                  </button>
                </div>
              </div>
            )}

            {replayState === 'queued' && (
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-center space-y-2">
                <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center mx-auto">
                  <Check className="w-4 h-4" />
                </div>
                <div className="font-semibold text-xs text-emerald-600 dark:text-emerald-400">Replay Queued</div>
                <div className="text-[11px] text-[var(--text-muted)]">Replay ID: rep_92ab31</div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ==================================================
          DEVELOPER WORKFLOW
      ================================================== */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-xs font-mono uppercase tracking-widest text-blue-600 dark:text-blue-400 mb-2">Developer Experience</h2>
          <h3 className="text-2xl sm:text-4xl font-bold font-mono text-[var(--text-primary)] tracking-tight">
            From webhook provider to production in minutes.
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="feature-card bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl p-6 shadow-sm space-y-3 font-mono">
            <div className="text-xs font-bold text-blue-500 uppercase">STEP 01</div>
            <h4 className="text-base font-semibold text-[var(--text-primary)]">Create an Endpoint</h4>
            <p className="text-xs text-[var(--text-secondary)] font-sans leading-relaxed">
              Add your target backend URL and provider signing secret.
            </p>
          </div>

          <div className="feature-card bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl p-6 shadow-sm space-y-3 font-mono">
            <div className="text-xs font-bold text-blue-500 uppercase">STEP 02</div>
            <h4 className="text-base font-semibold text-[var(--text-primary)]">Point Your Provider</h4>
            <div className="flex items-center justify-between p-2 bg-[var(--bg-app)] border border-[var(--border-subtle)] rounded text-[11px] text-blue-500">
              <span className="truncate">https://api.hooklens.dev/wh/abc123</span>
              <button onClick={handleCopyUrl} className="p-1 hover:text-[var(--text-primary)]">
                {copiedUrl ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          <div className="feature-card bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl p-6 shadow-sm space-y-3 font-mono">
            <div className="text-xs font-bold text-blue-500 uppercase">STEP 03</div>
            <h4 className="text-base font-semibold text-[var(--text-primary)]">Monitor & Recover</h4>
            <p className="text-xs text-[var(--text-secondary)] font-sans leading-relaxed">
              Watch deliveries in real time, inspect failures, and replay when needed.
            </p>
          </div>
        </div>
      </section>

      {/* ==================================================
          TECH STACK SECTION
      ================================================== */}
      <section className="py-16 border-t border-[var(--border-subtle)] bg-[var(--bg-secondary)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-xs font-mono uppercase tracking-widest text-[var(--text-muted)] mb-6">
            Built with familiar developer infrastructure
          </h2>

          <div className="flex flex-wrap items-center justify-center gap-4 font-mono text-xs text-[var(--text-secondary)]">
            <span className="px-3 py-1.5 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded">Node.js</span>
            <span className="px-3 py-1.5 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded">Express</span>
            <span className="px-3 py-1.5 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded">MongoDB</span>
            <span className="px-3 py-1.5 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded">Redis</span>
            <span className="px-3 py-1.5 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded">BullMQ</span>
            <span className="px-3 py-1.5 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded">React</span>
            <span className="px-3 py-1.5 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded">Socket.io</span>
          </div>
        </div>
      </section>

      {/* ==================================================
          PERSONAS
      ================================================== */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-xs font-mono uppercase tracking-widest text-blue-600 dark:text-blue-400 mb-2">Designed For Engineers</h2>
          <h3 className="text-2xl sm:text-4xl font-bold font-mono text-[var(--text-primary)] tracking-tight">
            Built for developers who own production webhooks.
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="feature-card bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl p-6 shadow-sm space-y-3">
            <h4 className="text-sm font-semibold font-mono text-[var(--text-primary)]">Backend Engineers</h4>
            <p className="text-xs text-[var(--text-secondary)] font-sans leading-relaxed">
              "Understand webhook failures instantly without digging through scattered server logs or APM traces."
            </p>
          </div>

          <div className="feature-card bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl p-6 shadow-sm space-y-3">
            <h4 className="text-sm font-semibold font-mono text-[var(--text-primary)]">Startup Teams</h4>
            <p className="text-xs text-[var(--text-secondary)] font-sans leading-relaxed">
              "Keep critical payment and subscription event pipelines observable during backend degradation or deployments."
            </p>
          </div>

          <div className="feature-card bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl p-6 shadow-sm space-y-3">
            <h4 className="text-sm font-semibold font-mono text-[var(--text-primary)]">API Developers</h4>
            <p className="text-xs text-[var(--text-secondary)] font-sans leading-relaxed">
              "Inspect incoming payloads, verify cryptographic signatures, and replay webhook events safely."
            </p>
          </div>
        </div>
      </section>

      {/* ==================================================
          GET STARTED CTA
      ================================================== */}
      <section className="py-20 border-t border-[var(--border-subtle)] bg-[var(--bg-secondary)] text-center">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl sm:text-5xl font-bold font-mono text-[var(--text-primary)] tracking-tight">
            Start seeing your webhooks differently.
          </h2>
          <p className="mt-4 text-sm sm:text-base text-[var(--text-secondary)] font-sans max-w-xl mx-auto">
            Connect your first endpoint and get visibility into every delivery attempt.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/signup"
              className="btn-primary w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 text-sm font-mono font-semibold rounded-lg border border-blue-500 shadow-sm"
            >
              <span>Start Monitoring Free</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <a
              href="https://docs.hooklens.dev"
              target="_blank"
              rel="noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-4 text-sm font-mono font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] bg-[var(--bg-surface)] hover:bg-[var(--bg-elevated)] rounded-lg border border-[var(--border-subtle)] transition-colors"
            >
              <span>Read Documentation</span>
            </a>
          </div>
        </div>
      </section>

      {/* ==================================================
          FOOTER WITH OFFICIAL LOGO
      ================================================== */}
      <footer className="border-t border-[var(--border-subtle)] py-12 bg-[var(--bg-app)] font-mono text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-5 gap-8">
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2.5">
              <img src={logoImg} alt="HookLens Logo" className="h-6 w-auto object-contain shrink-0" />
              <span className="font-bold text-[var(--text-primary)] text-sm">HookLens</span>
            </div>
            <p className="text-xs text-[var(--text-muted)] font-sans max-w-sm">
              Webhook observability, security and recovery platform for developers.
            </p>
          </div>

          <div>
            <div className="font-semibold text-[var(--text-primary)] uppercase text-[11px] mb-3">Product</div>
            <ul className="space-y-2 text-[var(--text-secondary)]">
              <li><Link to="/dashboard" className="hover:text-[var(--text-primary)]">Overview</Link></li>
              <li><Link to="/dashboard/events" className="hover:text-[var(--text-primary)]">Events Inspector</Link></li>
              <li><Link to="/dashboard/replays" className="hover:text-[var(--text-primary)]">Safe Replay</Link></li>
              <li><Link to="/dashboard/security" className="hover:text-[var(--text-primary)]">Egress Security</Link></li>
            </ul>
          </div>

          <div>
            <div className="font-semibold text-[var(--text-primary)] uppercase text-[11px] mb-3">Developers</div>
            <ul className="space-y-2 text-[var(--text-secondary)]">
              <li><a href="https://docs.hooklens.dev" className="hover:text-[var(--text-primary)]">Documentation</a></li>
              <li><a href="https://docs.hooklens.dev/api" className="hover:text-[var(--text-primary)]">API Reference</a></li>
              <li><a href="https://github.com" className="hover:text-[var(--text-primary)]">GitHub Repository</a></li>
            </ul>
          </div>

          <div>
            <div className="font-semibold text-[var(--text-primary)] uppercase text-[11px] mb-3">Company</div>
            <ul className="space-y-2 text-[var(--text-secondary)]">
              <li><a href="#about" className="hover:text-[var(--text-primary)]">About HookLens</a></li>
              <li><a href="#privacy" className="hover:text-[var(--text-primary)]">Privacy Policy</a></li>
              <li><a href="#terms" className="hover:text-[var(--text-primary)]">Terms of Service</a></li>
            </ul>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 pt-6 border-t border-[var(--border-subtle)] text-center text-[var(--text-muted)]">
          HookLens Platform © 2026. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
