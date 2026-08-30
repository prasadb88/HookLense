import React from 'react';
import { Link } from 'react-router-dom';
import ThemeToggle from '../components/layout/ThemeToggle.jsx';
import Logo from '../components/common/Logo.jsx';
import { Check, ArrowRight, Zap, Shield, Activity, Layers } from 'lucide-react';

export const PricingPage = () => {
  const tiers = [
    {
      name: 'Developer Community',
      price: '$0',
      period: 'forever free',
      description: 'Essential webhook monitoring and delivery telemetry for side projects.',
      features: [
        'Up to 10,000 events / month',
        '1 Webhook Endpoint',
        '24-hour event payload log retention',
        'Standard exponential retries',
        'Real-time Socket.IO telemetry',
        'HMAC signature verification',
      ],
      cta: 'Start Free',
      ctaLink: '/signup',
      highlighted: false,
    },
    {
      name: 'Pro Infrastructure',
      price: '$29',
      period: 'per month',
      description: 'Full-fledged webhook gateway with manual replay and DLQ for growing apps.',
      features: [
        'Up to 250,000 events / month',
        'Unlimited Webhook Endpoints',
        '30-day event payload log retention',
        'Instant manual event replays',
        'Dead Letter Queue (DLQ) & AI diagnosis',
        'SSRF Private IP egress protection',
        'Priority WebSocket concurrency',
      ],
      cta: 'Get Started',
      ctaLink: '/signup',
      highlighted: true,
    },
    {
      name: 'Enterprise Gateway',
      price: 'Custom',
      period: 'tailored SLA',
      description: 'Dedicated infrastructure with high-volume throughput and custom isolation.',
      features: [
        'Unlimited event throughput',
        'Custom payload log retention',
        'Dedicated BullMQ worker cluster',
        'Custom SSO & RBAC security',
        'Dedicated customer support & SLA',
        'Custom IP egress whitelisting',
      ],
      cta: 'Contact Sales',
      ctaLink: 'mailto:support@hooklens.dev',
      highlighted: false,
    },
  ];

  return (
    <div className="min-h-screen bg-[var(--bg-app)] text-[var(--text-primary)] font-sans flex flex-col justify-between selection:bg-blue-600/20 transition-colors">
      {/* Header */}
      <header className="border-b border-[var(--border-subtle)] bg-[var(--bg-app)]/90 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-18 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 py-1">
            <Logo className="w-[150px] sm:w-[175px] lg:w-[210px] h-auto object-contain shrink-0 transition-opacity" />
          </Link>

          <div className="hidden md:flex items-center gap-8 text-xs font-mono text-[var(--text-secondary)]">
            <Link to="/" className="hover:text-[var(--text-primary)] transition-colors">Product</Link>
            <Link to="/developer" className="hover:text-[var(--text-primary)] transition-colors">Developers</Link>
            <Link to="/pricing" className="text-[var(--text-primary)] font-semibold border-b border-blue-500 pb-0.5">Pricing</Link>
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
      </header>

      {/* Main Content */}
      <main className="flex-1 py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 text-xs font-mono">
            <Zap className="w-3.5 h-3.5" />
            <span>TRANSPARENT DEVELOPER PRICING</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-bold font-mono text-[var(--text-primary)] tracking-tight">
            Simple, predictable pricing for your webhook infrastructure.
          </h1>
          <p className="text-sm sm:text-base text-[var(--text-secondary)] font-sans">
            Start for free on local dev or side projects. Upgrade as your webhook ingestion volume scales.
          </p>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {tiers.map((tier) => (
            <div
              key={tier.name}
              className={`bg-[var(--bg-surface)] border rounded-2xl p-8 flex flex-col justify-between transition-all ${
                tier.highlighted
                  ? 'border-blue-500 shadow-xl ring-2 ring-blue-500/20 relative'
                  : 'border-[var(--border-subtle)] shadow-sm hover:border-[var(--border-strong)]'
              }`}
            >
              {tier.highlighted && (
                <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 bg-blue-600 text-white font-mono text-[10px] uppercase font-bold rounded-full shadow-sm">
                  Most Popular
                </span>
              )}

              <div>
                <h2 className="text-lg font-bold font-mono text-[var(--text-primary)]">{tier.name}</h2>
                <p className="text-xs text-[var(--text-secondary)] mt-1 min-h-[36px]">{tier.description}</p>

                <div className="my-6 pt-4 border-t border-[var(--border-subtle)] font-mono">
                  <span className="text-4xl font-bold text-[var(--text-primary)]">{tier.price}</span>
                  <span className="text-xs text-[var(--text-muted)] ml-2">/ {tier.period}</span>
                </div>

                <ul className="space-y-3 font-sans text-xs text-[var(--text-secondary)]">
                  {tier.features.map((feat) => (
                    <li key={feat} className="flex items-start gap-2.5">
                      <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-8 mt-6 border-t border-[var(--border-subtle)]">
                {tier.ctaLink.startsWith('mailto:') ? (
                  <a
                    href={tier.ctaLink}
                    className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-mono font-semibold bg-[var(--bg-app)] hover:bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-[var(--text-primary)] transition-colors"
                  >
                    <span>{tier.cta}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </a>
                ) : (
                  <Link
                    to={tier.ctaLink}
                    className={`w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-mono font-semibold transition-all ${
                      tier.highlighted
                        ? 'btn-primary border border-blue-500 shadow-sm'
                        : 'bg-[var(--bg-app)] hover:bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-[var(--text-primary)]'
                    }`}
                  >
                    <span>{tier.cta}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 text-center font-mono text-[11px] text-[var(--text-muted)] border-t border-[var(--border-subtle)]">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>© 2026 HookLens</span>
          <div className="flex gap-4">
            <Link to="/developer" className="hover:text-[var(--text-primary)]">Developer Docs</Link>
            <Link to="/developer" className="hover:text-[var(--text-primary)]">API Reference</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PricingPage;
