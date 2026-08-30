import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ThemeToggle from '../components/layout/ThemeToggle.jsx';
import Logo from '../components/common/Logo.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import {
  Search,
  Code,
  Terminal,
  Shield,
  Key,
  Layers,
  Check,
  Copy,
  ArrowRight,
  ChevronRight,
  BookOpen,
  Activity,
  RotateCcw,
  AlertTriangle,
  Lock,
  Zap,
  Server,
  X,
  ChevronDown,
  RefreshCw,
  Cpu,
  BarChart3,
  ShieldAlert,
  HelpCircle,
  CheckCircle2,
  FileText,
  Sliders,
  Globe,
} from 'lucide-react';

export const DeveloperPage = () => {
  const { isAuthenticated } = useAuth();

  // Active language tab for code blocks
  const [activeLang, setActiveLang] = useState('nodejs');
  // Copy state per snippet
  const [copiedId, setCopiedId] = useState(null);
  // Search query & modal state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  // Active table of contents section
  const [activeSection, setActiveSection] = useState('introduction');
  // Mobile docs sidebar toggle
  const [mobileDocsNavOpen, setMobileDocsNavOpen] = useState(false);

  const handleCopy = (id, codeText) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(codeText);
    }
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Keyboard shortcut for search (Cmd+K or Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Professional SaaS Documentation Navigation Structure
  const docsSections = [
    {
      group: 'Getting Started',
      items: [
        { id: 'introduction', label: 'Introduction & Overview' },
        { id: 'how-hooklens-works', label: 'How HookLens Works' },
        { id: 'quick-start', label: 'Quick Start (5 Mins)' },
        { id: 'your-first-webhook', label: 'Your First Webhook' },
      ],
    },
    {
      group: 'Core Concepts',
      items: [
        { id: 'concepts-endpoints', label: 'Endpoints & Target URLs' },
        { id: 'concepts-webhook-urls', label: 'Webhook URLs vs Target URLs' },
        { id: 'concepts-signing-secrets', label: 'Secrets & Cryptography' },
        { id: 'concepts-delivery-status', label: 'Delivery Statuses' },
      ],
    },
    {
      group: 'Integrations',
      items: [
        { id: 'integration-razorpay', label: 'Razorpay Integration' },
        { id: 'integration-custom', label: 'Custom Webhooks' },
      ],
    },
    {
      group: 'Testing & Local Dev',
      items: [
        { id: 'testing-postman', label: 'Test with Postman' },
        { id: 'testing-razorpay', label: 'Test Razorpay Webhooks' },
        { id: 'testing-ngrok', label: 'Local Testing with ngrok' },
        { id: 'testing-failures-retries', label: 'Failure Testing & Retries' },
      ],
    },
    {
      group: 'Webhook Delivery',
      items: [
        { id: 'delivery-lifecycle', label: 'Delivery Lifecycle' },
        { id: 'delivery-retries', label: 'Exponential Retries' },
        { id: 'delivery-dlq', label: 'Dead-Letter Queue (DLQ)' },
      ],
    },
    {
      group: 'Security & Egress',
      items: [
        { id: 'security-hmac', label: 'HMAC SHA-256 Verification' },
        { id: 'security-ssrf', label: 'SSRF Egress IP Protection' },
        { id: 'security-best-practices', label: 'Security Best Practices' },
      ],
    },
    {
      group: 'API Reference',
      items: [
        { id: 'api-auth', label: 'Authentication API' },
        { id: 'api-endpoints', label: 'Endpoints API' },
        { id: 'api-ingestion', label: 'Webhook Ingestion API' },
        { id: 'api-events', label: 'Event Telemetry API' },
        { id: 'api-replays', label: 'Manual Replays API' },
      ],
    },
    {
      group: 'Reference & FAQ',
      items: [
        { id: 'env-vars-ref', label: 'Environment Variables' },
        { id: 'troubleshooting-guide', label: 'Troubleshooting Common Errors' },
        { id: 'faq-section', label: 'Frequently Asked Questions' },
      ],
    },
  ];

  // IntersectionObserver for navigation scrollSpy
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { rootMargin: '-80px 0px -55% 0px', threshold: 0.1 }
    );

    const sections = document.querySelectorAll('section[id]');
    sections.forEach((sec) => observer.observe(sec));

    return () => observer.disconnect();
  }, []);

  const scrollToSection = (id) => {
    setActiveSection(id);
    setMobileDocsNavOpen(false);
    const element = document.getElementById(id);
    if (element) {
      const yOffset = -85;
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  const codeSnippets = {
    nodejs: `// Express.js Webhook Handler with Signature Verification
import express from 'express';
import crypto from 'crypto';

const app = express();
// CRITICAL: Use raw buffer for signature calculation
app.use(express.raw({ type: 'application/json' }));

app.post('/webhooks/hooklens', (req, res) => {
  const signatureHeader = req.headers['x-hooklens-signature'];
  const secret = process.env.HOOKLENS_SIGNING_SECRET; // "whsec_..."

  if (!signatureHeader || !secret) {
    return res.status(401).send('Missing signature or secret');
  }

  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(req.body)
    .digest('hex');

  const sigBuf = Buffer.from(signatureHeader);
  const expBuf = Buffer.from(expectedSignature);

  if (sigBuf.length === expBuf.length && crypto.timingSafeEqual(sigBuf, expBuf)) {
    console.log('✓ Valid HookLens Webhook Received!');
    res.status(200).json({ received: true });
  } else {
    console.error('✕ Signature mismatch!');
    res.status(401).send('Invalid signature');
  }
});`,

    curl: `# Custom Webhook Ingestion Request via cURL
curl -X POST "http://127.0.0.1:5000/api/v1/wh/ep_abc123xyz" \\
  -H "Content-Type: application/json" \\
  -d '{
    "event": "order.created",
    "timestamp": "2026-08-25T12:00:00Z",
    "data": {
      "orderId": "ORD-10001",
      "amount": 1499,
      "currency": "INR"
    }
  }'`,

    razorpayCheckout: `<!-- Razorpay Checkout Test Modal Snippet -->
<script src="https://checkout.razorpay.com/v1/checkout.js"></script>
<script>
  const options = {
    key: "YOUR_RAZORPAY_TEST_KEY_ID", // rzp_test_...
    amount: "149900", // ₹1,499.00 (in paise)
    currency: "INR",
    name: "HookLens Test Store",
    order_id: "order_xyz123", // Order ID from Postman POST /v1/orders
    handler: function (response) {
      alert("Payment Success! Payment ID: " + response.razorpay_payment_id);
    }
  };
  const rzp = new Razorpay(options);
  rzp.open();
</script>`,

    postmanOrderBody: `{
  "amount": 149900,
  "currency": "INR",
  "receipt": "receipt_001"
}`,
  };

  const troubleshootingRows = [
    { problem: '404 NOT_FOUND', reason: 'Incorrect Webhook URL token or endpoint route missing', fix: 'Verify HookLens Webhook URL (/wh/ep_...) and target backend route path.' },
    { problem: 'INVALID_SIGNATURE', reason: 'Mismatched secret or payload modified before verification', fix: 'Check Razorpay Webhook Secret in HookLens and verify raw body parsing.' },
    { problem: 'INVALID_TARGET_URL', reason: 'Target URL points to localhost or a private IP (127.0.0.1)', fix: 'Expose local port via ngrok (ngrok http 3000) or use public domain.' },
    { problem: 'Webhook Not Received', reason: 'Target backend is not publicly reachable or tunnel died', fix: 'Verify ngrok tunnel is active or check public server URL accessibility.' },
    { problem: 'Webhook Failed (5xx)', reason: 'User backend server threw an uncaught exception', fix: 'Inspect your backend server console logs and unhandled error stack trace.' },
    { problem: 'Order Created But No Webhook', reason: 'Payment was created but not completed in Test Mode', fix: 'Complete payment in Razorpay Checkout modal to fire payment.captured.' },
    { problem: 'Event Moved to DLQ', reason: 'Max delivery retries (5 attempts) exhausted', fix: 'Fix backend server code issue and click Replay in DLQ dashboard.' },
  ];

  const allSearchableItems = docsSections.flatMap((s) => s.items);
  const filteredSearchItems = searchQuery.trim()
    ? allSearchableItems.filter((item) =>
        item.label.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : allSearchableItems;

  return (
    <div className="min-h-screen bg-[var(--bg-app)] text-[var(--text-primary)] font-sans flex flex-col justify-between selection:bg-blue-600/20 transition-colors">
      {/* Top Navbar */}
      <header className="border-b border-[var(--border-subtle)] bg-[var(--bg-app)]/90 backdrop-blur-md sticky top-0 z-50 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-3 py-1">
              <Logo className="w-[150px] sm:w-[175px] h-auto object-contain shrink-0" />
            </Link>
            <div className="hidden md:flex items-center gap-2 px-2.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 font-mono text-xs">
              <BookOpen className="w-3.5 h-3.5" />
              <span>SaaS Developer Documentation</span>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-6 text-xs font-mono text-[var(--text-secondary)]">
            <Link to="/" className="hover:text-[var(--text-primary)] transition-colors">Product</Link>
            <Link to="/developer" className="text-[var(--text-primary)] font-semibold border-b border-blue-500 pb-0.5">Documentation</Link>
            <Link to="/pricing" className="hover:text-[var(--text-primary)] transition-colors">Pricing</Link>
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            {isAuthenticated ? (
              <Link
                to="/dashboard"
                className="btn-primary px-4 py-2 text-xs font-mono font-medium rounded-xl border border-blue-500 shadow-sm"
              >
                Dashboard
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="hidden sm:inline-flex px-3.5 py-1.5 text-xs font-mono font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="btn-primary px-4 py-2 text-xs font-mono font-medium rounded-xl border border-blue-500 shadow-sm"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Docs Header */}
      <div className="border-b border-[var(--border-subtle)] bg-[var(--bg-surface)] py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 text-xs font-mono">
              <Terminal className="w-3.5 h-3.5" />
              <span>DEVELOPER INFRASTRUCTURE REFERENCE</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold font-mono text-[var(--text-primary)] tracking-tight">
              HookLens Infrastructure Docs
            </h1>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] font-sans max-w-2xl leading-relaxed">
              Complete guide to receiving, verifying, queueing, inspecting, and delivering webhooks with zero payload loss.
            </p>
          </div>

          {/* Quick Search Button */}
          <div className="w-full md:w-80 shrink-0">
            <button
              onClick={() => setSearchOpen(true)}
              className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl bg-[var(--bg-app)] border border-[var(--border-subtle)] hover:border-[var(--border-strong)] text-xs font-mono text-[var(--text-muted)] transition-colors shadow-sm"
            >
              <div className="flex items-center gap-2">
                <Search className="w-4 h-4 text-blue-500" />
                <span>Search documentation...</span>
              </div>
              <kbd className="px-2 py-0.5 text-[10px] bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded text-[var(--text-muted)] font-mono">
                ⌘ K
              </kbd>
            </button>
          </div>
        </div>
      </div>

      {/* Main Documentation Grid Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1">
        
        {/* Mobile Section Selector */}
        <div className="lg:hidden mb-6">
          <button
            onClick={() => setMobileDocsNavOpen(!mobileDocsNavOpen)}
            className="w-full flex items-center justify-between p-3 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] font-mono text-xs text-[var(--text-primary)]"
          >
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-blue-500" />
              <span>Documentation Section ({docsSections.flatMap(s=>s.items).find(i=>i.id===activeSection)?.label || 'Introduction'})</span>
            </div>
            <ChevronDown className={`w-4 h-4 transition-transform ${mobileDocsNavOpen ? 'rotate-180' : ''}`} />
          </button>

          {mobileDocsNavOpen && (
            <div className="mt-2 p-3 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-4 font-mono text-xs">
              {docsSections.map((group) => (
                <div key={group.group} className="space-y-1">
                  <div className="text-[10px] uppercase font-bold text-[var(--text-muted)] px-2">
                    {group.group}
                  </div>
                  {group.items.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => scrollToSection(item.id)}
                      className={`w-full text-left px-2 py-1.5 rounded transition-colors ${
                        activeSection === item.id
                          ? 'bg-blue-500/10 text-blue-500 font-semibold'
                          : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT SIDEBAR: DOCS NAVIGATION (DESKTOP) */}
          <aside className="hidden lg:block lg:col-span-3 sticky top-24 space-y-6 font-mono text-xs max-h-[calc(100vh-120px)] overflow-y-auto pr-2">
            {docsSections.map((group) => (
              <div key={group.group} className="space-y-1.5">
                <div className="px-2 text-[10px] uppercase font-bold text-[var(--text-muted)] tracking-wider">
                  {group.group}
                </div>
                {group.items.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => scrollToSection(item.id)}
                    className={`w-full text-left px-3 py-1.5 rounded-lg transition-colors flex items-center justify-between ${
                      activeSection === item.id
                        ? 'bg-blue-500/10 text-blue-500 border border-blue-500/20 font-semibold'
                        : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)]'
                    }`}
                  >
                    <span className="truncate">{item.label}</span>
                    {activeSection === item.id && <ChevronRight className="w-3.5 h-3.5 text-blue-500 shrink-0" />}
                  </button>
                ))}
              </div>
            ))}
          </aside>

          {/* MAIN DOCS CONTENT AREA */}
          <main className="lg:col-span-6 space-y-12 min-w-0">
            
            {/* 1. INTRODUCTION */}
            <section id="introduction" className="space-y-4 scroll-mt-24">
              <h2 className="text-xl font-bold font-mono text-[var(--text-primary)] border-b border-[var(--border-subtle)] pb-2 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-blue-500" />
                Introduction & Overview
              </h2>
              
              <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl space-y-2 text-xs font-sans">
                <div className="font-mono font-bold text-blue-600 dark:text-blue-400 text-xs uppercase tracking-wider">What is a Webhook?</div>
                <p className="text-[var(--text-secondary)] leading-relaxed">
                  A <strong>webhook</strong> is simply an automated HTTP POST request sent from one server to another when an event occurs (such as a payment succeeding on Razorpay).
                </p>
              </div>

              <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed font-sans">
                <strong>HookLens</strong> is a developer infrastructure gateway that receives webhooks from third-party providers (such as Razorpay), validates their cryptographic HMAC signatures, logs full event payloads, and reliably delivers them to your application backend.
              </p>

              <div className="p-4 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl font-mono text-xs text-center space-y-2">
                <div className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider font-semibold">High-Level Architecture Flow</div>
                <div className="flex items-center justify-center gap-2 py-2 text-xs font-semibold text-blue-500 flex-wrap">
                  <span className="px-3 py-1.5 bg-[var(--bg-app)] border border-[var(--border-subtle)] rounded-lg text-[var(--text-primary)]">Webhook Provider (Razorpay)</span>
                  <span>→</span>
                  <span className="px-3 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-lg text-blue-500">HookLens Gateway</span>
                  <span>→</span>
                  <span className="px-3 py-1.5 bg-[var(--bg-app)] border border-[var(--border-subtle)] rounded-lg text-[var(--text-primary)]">User Backend Server</span>
                </div>
              </div>

              <div className="p-4 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl space-y-2 text-xs font-mono">
                <div className="font-semibold text-[var(--text-primary)]">Why Use HookLens?</div>
                <ul className="list-disc list-inside text-[var(--text-secondary)] space-y-1 font-sans text-xs">
                  <li><strong>Zero Webhook Loss:</strong> Asynchronous BullMQ queues store webhooks safely during server downtime.</li>
                  <li><strong>HMAC Signature Verification:</strong> Blocks forged or spoofed requests automatically.</li>
                  <li><strong>SSRF IP Egress Guard:</strong> Prevents delivery to private local IPs (<code className="font-mono">127.0.0.1</code>, <code className="font-mono">10.x.x.x</code>).</li>
                  <li><strong>Automatic Retries:</strong> Retries failed deliveries with exponential backoff.</li>
                  <li><strong>Dead-Letter Queue (DLQ):</strong> Retains failed webhooks for one-click manual replay.</li>
                </ul>
              </div>
            </section>

            {/* 2. HOW HOOKLENS WORKS */}
            <section id="how-hooklens-works" className="space-y-4 scroll-mt-24">
              <h2 className="text-xl font-bold font-mono text-[var(--text-primary)] border-b border-[var(--border-subtle)] pb-2 flex items-center gap-2">
                <Cpu className="w-5 h-5 text-emerald-500" />
                How HookLens Works
              </h2>

              <div className="p-4 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl font-mono text-xs space-y-2">
                <div className="font-bold text-[var(--text-primary)] mb-2">The 7 Execution Steps:</div>
                <ol className="list-decimal list-inside text-[var(--text-secondary)] font-sans space-y-2 text-xs">
                  <li><strong>Step 1 (Provider Webhook):</strong> Razorpay sends an HTTP POST request to your HookLens URL (<code className="font-mono text-emerald-500">/wh/:token</code>).</li>
                  <li><strong>Step 2 (Ingestion & Validation):</strong> HookLens validates the provider HMAC signature (<code className="font-mono">x-razorpay-signature</code>).</li>
                  <li><strong>Step 3 (Event Storage):</strong> HookLens generates an event ID (<code className="font-mono">evt_...</code>) and stores the payload securely.</li>
                  <li><strong>Step 4 (BullMQ Queueing):</strong> The event is enqueued into a Redis-backed delivery queue.</li>
                  <li><strong>Step 5 (Outbound Forwarding):</strong> HookLens signs the payload with <code className="font-mono text-blue-500">x-hooklens-signature</code> and forwards it to your backend.</li>
                  <li><strong>Step 6 (Backend Response):</strong> Your backend processes the webhook and returns <code className="font-mono text-emerald-500">HTTP 200 OK</code>.</li>
                  <li><strong>Step 7 (Status Update):</strong> HookLens updates delivery telemetry to <strong className="text-emerald-500">DELIVERED</strong>.</li>
                </ol>
              </div>
            </section>

            {/* 3. QUICK START */}
            <section id="quick-start" className="space-y-4 scroll-mt-24">
              <h2 className="text-xl font-bold font-mono text-[var(--text-primary)] border-b border-[var(--border-subtle)] pb-2 flex items-center gap-2">
                <Zap className="w-5 h-5 text-amber-500" />
                Quick Start (5 Mins)
              </h2>

              <div className="space-y-3 font-sans text-xs">
                {[
                  { step: 1, title: 'Step 1 — Sign Up / Log In', desc: 'Register or sign into your HookLens Dashboard.' },
                  { step: 2, title: 'Step 2 — Create an Endpoint', desc: 'Click Endpoints → Create Endpoint in the sidebar.' },
                  { step: 3, title: 'Step 3 — Copy Generated Webhook URL', desc: 'Copy the unique HookLens URL (e.g., http://127.0.0.1:5000/api/v1/wh/ep_abc123xyz).' },
                  { step: 4, title: 'Step 4 — Configure Provider Settings', desc: 'Paste the URL into your provider settings (e.g. Razorpay Dashboard → Webhooks).' },
                  { step: 5, title: 'Step 5 — Send a Test Webhook', desc: 'Trigger a webhook event from the provider or send a test payload via Postman.' },
                  { step: 6, title: 'Step 6 — Inspect Delivery Telemetry', desc: 'Open Events in HookLens to view real-time logs and HTTP 200 response.' },
                ].map((s) => (
                  <div key={s.step} className="p-3.5 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl space-y-1">
                    <div className="font-bold font-mono text-[var(--text-primary)] text-xs flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-blue-500 text-white flex items-center justify-center text-[10px] font-mono shrink-0">{s.step}</span>
                      <span>{s.title}</span>
                    </div>
                    <p className="text-[var(--text-secondary)] pl-7 text-[11px]">{s.desc}</p>
                  </div>
                ))}
              </div>

              <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs font-mono text-emerald-600 dark:text-emerald-400 flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold uppercase text-[10px]">Expected Result:</span>
                  <p className="font-sans text-[11px] text-[var(--text-secondary)] mt-0.5">
                    Your event appears immediately in HookLens with a <strong className="text-emerald-500">DELIVERED</strong> status and an HTTP status <code className="font-mono">200</code> response returned from your backend.
                  </p>
                </div>
              </div>
            </section>

            {/* 4. ENDPOINTS */}
            <section id="concepts-endpoints" className="space-y-4 scroll-mt-24">
              <h2 className="text-xl font-bold font-mono text-[var(--text-primary)] border-b border-[var(--border-subtle)] pb-2 flex items-center gap-2">
                <Server className="w-5 h-5 text-blue-500" />
                Endpoints & Target URLs
              </h2>
              <p className="text-xs text-[var(--text-secondary)] font-sans leading-relaxed">
                An <strong>Endpoint</strong> is a destination configuration registered inside HookLens. It tells HookLens where to deliver webhooks and what security settings to enforce.
              </p>

              <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl overflow-hidden shadow-sm font-mono text-xs">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-[var(--border-subtle)] bg-[var(--bg-app)] text-[10px] text-[var(--text-muted)] uppercase">
                      <th className="py-2.5 px-3">Field</th>
                      <th className="py-2.5 px-3">Type</th>
                      <th className="py-2.5 px-3">Description</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border-subtle)] text-[11px]">
                    <tr>
                      <td className="py-2 px-3 font-bold text-blue-500">token</td>
                      <td className="py-2 px-3 text-[var(--text-muted)]">String</td>
                      <td className="py-2 px-3 text-[var(--text-secondary)] font-sans">Unique public token identifier (e.g. <code className="font-mono">ep_abc123xyz</code>)</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 font-bold text-blue-500">targetUrl</td>
                      <td className="py-2 px-3 text-[var(--text-muted)]">String</td>
                      <td className="py-2 px-3 text-[var(--text-secondary)] font-sans">Public HTTP/HTTPS URL of your backend server</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 font-bold text-blue-500">provider</td>
                      <td className="py-2 px-3 text-[var(--text-muted)]">Enum</td>
                      <td className="py-2 px-3 text-[var(--text-secondary)] font-sans">Provider type: <code className="font-mono">RAZORPAY</code> or <code className="font-mono">CUSTOM</code></td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 font-bold text-blue-500">secret</td>
                      <td className="py-2 px-3 text-[var(--text-muted)]">String</td>
                      <td className="py-2 px-3 text-[var(--text-secondary)] font-sans">Provider secret used by HookLens to verify incoming signatures</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 font-bold text-blue-500">signingSecret</td>
                      <td className="py-2 px-3 text-[var(--text-muted)]">String</td>
                      <td className="py-2 px-3 text-[var(--text-secondary)] font-sans">Outbound signing secret (<code className="font-mono">whsec_...</code>) used by your backend</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            {/* 5. WEBHOOK URLS VS TARGET URLS */}
            <section id="concepts-webhook-urls" className="space-y-4 scroll-mt-24">
              <h2 className="text-xl font-bold font-mono text-[var(--text-primary)] border-b border-[var(--border-subtle)] pb-2 flex items-center gap-2">
                <Globe className="w-5 h-5 text-emerald-500" />
                Webhook URLs vs Target URLs
              </h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
                <div className="p-4 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl space-y-2">
                  <div className="font-bold text-emerald-500 text-xs uppercase">1. HookLens Webhook URL (Ingestion)</div>
                  <code className="block text-[11px] p-2 bg-[var(--bg-app)] border border-[var(--border-subtle)] rounded select-all text-emerald-600 dark:text-emerald-400">
                    http://127.0.0.1:5000/api/v1/wh/ep_abc123xyz
                  </code>
                  <p className="text-[11px] text-[var(--text-secondary)] font-sans">
                    Pasted into Razorpay/Provider dashboard settings. Providers send webhooks here.
                  </p>
                </div>

                <div className="p-4 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl space-y-2">
                  <div className="font-bold text-blue-500 text-xs uppercase">2. Destination Target URL (Outbound)</div>
                  <code className="block text-[11px] p-2 bg-[var(--bg-app)] border border-[var(--border-subtle)] rounded select-all text-blue-600 dark:text-blue-400">
                    https://api.yourcompany.com/webhooks/razorpay
                  </code>
                  <p className="text-[11px] text-[var(--text-secondary)] font-sans">
                    Configured in HookLens endpoint settings. HookLens forwards webhooks here.
                  </p>
                </div>
              </div>
            </section>

            {/* 6. SIGNING SECRETS */}
            <section id="concepts-signing-secrets" className="space-y-4 scroll-mt-24">
              <h2 className="text-xl font-bold font-mono text-[var(--text-primary)] border-b border-[var(--border-subtle)] pb-2 flex items-center gap-2">
                <Lock className="w-5 h-5 text-amber-500" />
                Secrets & Cryptography
              </h2>

              <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl space-y-2 text-xs font-sans text-amber-700 dark:text-amber-300">
                <div className="font-bold font-mono text-xs flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                  <span>CRITICAL: Provider Secret vs. HookLens Signing Secret</span>
                </div>
                <ul className="list-disc list-inside space-y-1 text-[11px] text-[var(--text-secondary)] font-sans">
                  <li><strong>Provider Webhook Secret:</strong> Set in Razorpay settings. HookLens uses this secret to verify signatures from Razorpay.</li>
                  <li><strong>HookLens Outbound Signing Secret (<code className="font-mono text-amber-600 dark:text-amber-400">whsec_...</code>):</strong> Generated by HookLens. Your backend uses this secret to verify signatures from HookLens.</li>
                  <li><strong>They are two separate secrets.</strong> Never expose secrets in client-side frontend code.</li>
                </ul>
              </div>
            </section>

            {/* 7. RAZORPAY INTEGRATION */}
            <section id="integration-razorpay" className="space-y-4 scroll-mt-24">
              <h2 className="text-xl font-bold font-mono text-[var(--text-primary)] border-b border-[var(--border-subtle)] pb-2 flex items-center gap-2">
                <Shield className="w-5 h-5 text-blue-500" />
                Razorpay Webhook Integration
              </h2>

              <div className="space-y-4 text-xs font-sans">
                <div className="p-4 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl space-y-2">
                  <div className="font-bold font-mono text-[var(--text-primary)] text-xs">Step 1 — Enable Razorpay Test Mode</div>
                  <p className="text-[var(--text-secondary)] text-[11px]">
                    Log into Razorpay Dashboard and switch the header toggle to <strong>Test Mode</strong>.
                  </p>
                </div>

                <div className="p-4 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl space-y-2 font-mono">
                  <div className="font-bold text-[var(--text-primary)] text-xs">Step 2 — Create HookLens Endpoint</div>
                  <ul className="text-[11px] text-[var(--text-secondary)] font-sans space-y-1">
                    <li><strong>Provider:</strong> Razorpay</li>
                    <li><strong>Target URL:</strong> Your backend URL (e.g. <code className="font-mono">https://your-backend.com/webhooks/razorpay</code> or ngrok)</li>
                    <li><strong>Webhook Secret:</strong> Enter a custom secret string (e.g. <code className="font-mono text-blue-500">my_razorpay_secret_123</code>)</li>
                  </ul>
                  <div className="p-2.5 bg-blue-500/10 border border-blue-500/20 rounded-lg text-[10px] text-blue-600 dark:text-blue-400 font-mono">
                    NOTE: This is NOT the Razorpay API Key Secret.
                  </div>
                </div>

                <div className="p-4 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl space-y-2">
                  <div className="font-bold font-mono text-[var(--text-primary)] text-xs">Step 3 — Configure Razorpay Webhook</div>
                  <p className="text-[var(--text-secondary)] text-[11px]">
                    In Razorpay Dashboard → Settings → Webhooks → Add New Webhook. Paste HookLens Webhook URL, set Secret = <code className="font-mono text-blue-500">my_razorpay_secret_123</code>, select event <code className="font-mono text-emerald-500">payment.captured</code>, and Save.
                  </p>
                </div>
              </div>
            </section>

            {/* 8. POSTMAN TESTING */}
            <section id="testing-postman" className="space-y-4 scroll-mt-24">
              <h2 className="text-xl font-bold font-mono text-[var(--text-primary)] border-b border-[var(--border-subtle)] pb-2 flex items-center gap-2">
                <Code className="w-5 h-5 text-emerald-500" />
                Test with Postman
              </h2>
              <p className="text-xs text-[var(--text-secondary)] font-sans">
                Test your webhooks using Postman without needing a live third-party provider:
              </p>

              <div className="p-4 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl space-y-3 font-mono text-xs">
                <div className="flex items-center gap-3">
                  <span className="px-2 py-0.5 bg-blue-500/10 text-blue-500 border border-blue-500/20 rounded font-bold text-[10px]">POST</span>
                  <code className="text-[var(--text-primary)] font-bold">http://127.0.0.1:5000/api/v1/wh/ep_abc123xyz</code>
                </div>

                <div className="p-3 bg-[var(--bg-app)] border border-[var(--border-subtle)] rounded-lg text-blue-600 dark:text-blue-400 select-all overflow-x-auto">
                  <pre>{codeSnippets.curl}</pre>
                </div>
              </div>
            </section>

            {/* 9. NGROK LOCAL TESTING */}
            <section id="testing-ngrok" className="space-y-4 scroll-mt-24">
              <h2 className="text-xl font-bold font-mono text-[var(--text-primary)] border-b border-[var(--border-subtle)] pb-2 flex items-center gap-2">
                <Terminal className="w-5 h-5 text-blue-500" />
                Local Testing with ngrok
              </h2>
              <p className="text-xs text-[var(--text-secondary)] font-sans leading-relaxed">
                HookLens blocks outbound deliveries targeting <code className="font-mono text-red-500">http://localhost:3000</code> to prevent SSRF vulnerabilities.
              </p>

              <div className="p-4 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl space-y-3 font-mono text-xs">
                <div className="font-bold text-[var(--text-primary)]">Tunneling Instructions:</div>
                <div className="p-3 bg-[var(--bg-app)] border border-[var(--border-subtle)] rounded-lg space-y-2 text-[11px]">
                  <div>1. Start your local server on port 3000.</div>
                  <div>2. Run ngrok terminal command: <code className="text-emerald-500 font-bold">ngrok http 3000</code></div>
                  <div>3. Copy public HTTPS URL: <code className="text-blue-500">https://a1b2c3d4.ngrok-free.app</code></div>
                  <div>4. Set HookLens Target URL to: <code className="text-emerald-400 font-bold">https://a1b2c3d4.ngrok-free.app/webhooks/hooklens</code></div>
                </div>
              </div>
            </section>

            {/* 10. HMAC VERIFICATION */}
            <section id="security-hmac" className="space-y-4 scroll-mt-24">
              <h2 className="text-xl font-bold font-mono text-[var(--text-primary)] border-b border-[var(--border-subtle)] pb-2 flex items-center gap-2">
                <Lock className="w-5 h-5 text-violet-500" />
                HMAC SHA-256 Verification
              </h2>

              <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl overflow-hidden shadow-sm font-mono text-xs">
                <div className="px-4 py-2.5 bg-[var(--bg-app)] border-b border-[var(--border-subtle)] flex items-center justify-between">
                  <span className="font-bold text-[var(--text-primary)]">Node.js Express Verification Code</span>
                  <button
                    onClick={() => handleCopy('nodejsHmac', codeSnippets.nodejs)}
                    className="inline-flex items-center gap-1 text-[11px] text-blue-500 hover:underline"
                  >
                    {copiedId === 'nodejsHmac' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedId === 'nodejsHmac' ? 'Copied ✓' : 'Copy'}</span>
                  </button>
                </div>
                <div className="p-4 bg-[var(--bg-app)] overflow-x-auto text-blue-600 dark:text-blue-400 leading-relaxed select-all">
                  <pre>{codeSnippets.nodejs}</pre>
                </div>
              </div>
            </section>

            {/* 11. TROUBLESHOOTING */}
            <section id="troubleshooting-guide" className="space-y-4 scroll-mt-24">
              <h2 className="text-xl font-bold font-mono text-[var(--text-primary)] border-b border-[var(--border-subtle)] pb-2 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                Troubleshooting Common Errors
              </h2>

              <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left font-mono text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-[var(--border-subtle)] bg-[var(--bg-app)] text-[var(--text-muted)] text-[10px] uppercase font-semibold">
                        <th className="py-3 px-4">Problem</th>
                        <th className="py-3 px-4">Possible Reason</th>
                        <th className="py-3 px-4">What to Check / Fix</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--border-subtle)]">
                      {troubleshootingRows.map((row) => (
                        <tr key={row.problem} className="hover:bg-[var(--bg-app)]/40 transition-colors">
                          <td className="py-3.5 px-4 font-bold text-red-500 select-all">
                            {row.problem}
                          </td>
                          <td className="py-3.5 px-4 font-semibold text-[var(--text-primary)] font-sans text-[11px]">
                            {row.reason}
                          </td>
                          <td className="py-3.5 px-4 text-[var(--text-secondary)] font-sans text-[11px]">
                            {row.fix}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>

            {/* 12. FAQ */}
            <section id="faq-section" className="space-y-4 scroll-mt-24">
              <h2 className="text-xl font-bold font-mono text-[var(--text-primary)] border-b border-[var(--border-subtle)] pb-2 flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-blue-500" />
                Frequently Asked Questions
              </h2>

              <div className="space-y-3 font-sans text-xs">
                <div className="p-4 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl space-y-1">
                  <div className="font-bold font-mono text-[var(--text-primary)]">Do I need ngrok for local development?</div>
                  <p className="text-[var(--text-secondary)] text-[11px]">
                    Yes. HookLens runs as a public gateway and cannot reach <code className="font-mono">localhost:3000</code> directly. ngrok creates a secure public HTTPS tunnel. Once deployed to Render/Vercel/cloud, ngrok is no longer needed.
                  </p>
                </div>

                <div className="p-4 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl space-y-1">
                  <div className="font-bold font-mono text-[var(--text-primary)]">Is Razorpay API Key Secret the same as Webhook Secret?</div>
                  <p className="text-[var(--text-secondary)] text-[11px]">
                    <strong>No.</strong> Razorpay API Key Secret is used for API requests to Razorpay. Webhook Secret is configured specifically in Razorpay Webhook settings to sign webhook events.
                  </p>
                </div>

                <div className="p-4 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl space-y-1">
                  <div className="font-bold font-mono text-[var(--text-primary)]">Is HookLens Signing Secret the same as Provider Webhook Secret?</div>
                  <p className="text-[var(--text-secondary)] text-[11px]">
                    <strong>No.</strong> Provider Webhook Secret verifies requests from Razorpay to HookLens. HookLens Signing Secret (<code className="font-mono">whsec_...</code>) verifies requests from HookLens to your application server.
                  </p>
                </div>
              </div>
            </section>
          </main>

          {/* RIGHT SIDEBAR: TABLE OF CONTENTS */}
          <aside className="hidden lg:block lg:col-span-3 sticky top-24 space-y-4 font-mono text-xs max-h-[calc(100vh-120px)] overflow-y-auto pl-2">
            <div className="p-4 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl space-y-3">
              <div className="text-[10px] uppercase font-bold text-[var(--text-muted)] tracking-wider">
                On This Page
              </div>
              <nav className="space-y-1.5 text-[11px]">
                {docsSections.flatMap((s) => s.items).map((item) => (
                  <button
                    key={item.id}
                    onClick={() => scrollToSection(item.id)}
                    className={`block text-left transition-colors truncate w-full ${
                      activeSection === item.id
                        ? 'text-blue-500 font-bold'
                        : 'text-[var(--text-secondary)] hover:text-blue-500'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </nav>
            </div>
          </aside>
        </div>
      </div>

      {/* Docs Search Modal */}
      {searchOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-start justify-center pt-20 px-4">
          <div className="w-full max-w-lg bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl shadow-2xl overflow-hidden font-mono text-xs">
            <div className="p-3 border-b border-[var(--border-subtle)] flex items-center justify-between gap-2">
              <Search className="w-4 h-4 text-blue-500 shrink-0" />
              <input
                type="text"
                autoFocus
                placeholder="Search documentation sections..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent border-none text-[var(--text-primary)] focus:outline-none font-mono text-xs"
              />
              <button
                onClick={() => setSearchOpen(false)}
                className="text-[var(--text-muted)] hover:text-[var(--text-primary)] p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="max-h-72 overflow-y-auto p-2 divide-y divide-[var(--border-subtle)]">
              {filteredSearchItems.length === 0 ? (
                <div className="p-4 text-center text-[var(--text-muted)] font-sans text-xs">
                  No section found matching "{searchQuery}".
                </div>
              ) : (
                filteredSearchItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setSearchOpen(false);
                      scrollToSection(item.id);
                    }}
                    className="w-full text-left p-2.5 rounded-lg hover:bg-[var(--bg-app)] flex items-center justify-between text-[var(--text-primary)] transition-colors"
                  >
                    <span>{item.label}</span>
                    <ChevronRight className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="py-6 text-center font-mono text-[11px] text-[var(--text-muted)] border-t border-[var(--border-subtle)] mt-12">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>© 2026 HookLens Webhook Infrastructure</span>
          <div className="flex gap-4">
            <Link to="/pricing" className="hover:text-[var(--text-primary)]">Pricing</Link>
            <Link to="/developer" className="hover:text-[var(--text-primary)] font-semibold">Documentation</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default DeveloperPage;
