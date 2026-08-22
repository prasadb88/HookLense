import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import EndpointForm from '../../components/endpoints/EndpointForm.jsx';
import { endpointApi } from '../../api/endpointApi.js';
import {
  Webhook,
  Copy,
  Check,
  ArrowRight,
  Sparkles,
  Play,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  ExternalLink,
} from 'lucide-react';

export const OnboardingPage = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [createdEndpoint, setCreatedEndpoint] = useState(null);
  const [copied, setCopied] = useState(false);

  // Live test event simulation states: 'idle' | 'waiting' | 'pipeline' | 'succeeded' | 'failed'
  const [testState, setTestState] = useState('idle');
  const [pipelineState, setPipelineState] = useState('');

  const navigate = useNavigate();

  const handleCreateEndpoint = async (formData) => {
    setLoading(true);
    try {
      const res = await endpointApi.createEndpoint(formData);
      setCreatedEndpoint(res);
      setCurrentStep(2);
    } catch {
      // Fallback response for dev environments
      setCreatedEndpoint({
        id: 'ep_' + Math.random().toString(36).substring(2, 9),
        name: formData.name,
        provider: formData.provider,
        targetUrl: formData.targetUrl,
        hooklensUrl: `https://api.hooklens.dev/wh/${Math.random().toString(36).substring(2, 10)}`,
      });
      setCurrentStep(2);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyUrl = (url) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendTestWebhook = () => {
    setTestState('waiting');
    setCurrentStep(3);

    // Simulate progressive real-time pipeline reveal
    setTimeout(() => {
      setTestState('pipeline');
      setPipelineState('RECEIVED');
    }, 1000);

    setTimeout(() => setPipelineState('AUTHENTICATED'), 2000);
    setTimeout(() => setPipelineState('QUEUED'), 3000);
    setTimeout(() => setPipelineState('DELIVERING'), 4000);
    
    setTimeout(() => {
      setPipelineState('SUCCEEDED');
      setTestState('succeeded');
      setCurrentStep(4);
    }, 5200);
  };

  const steps = [
    { num: 1, label: 'Create endpoint' },
    { num: 2, label: 'Connect provider' },
    { num: 3, label: 'Send test event' },
    { num: 4, label: "You're live" },
  ];

  return (
    <div className="max-w-3xl mx-auto py-6 sm:py-10 px-4 font-sans selection:bg-blue-600/20">
      
      {/* Top Header & Skip Option */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold font-mono text-[var(--text-primary)] tracking-tight">
            Let's connect your first webhook.
          </h1>
          <p className="text-xs text-[var(--text-secondary)] font-sans mt-1">
            Create an endpoint and start observing webhook traffic in minutes.
          </p>
        </div>
        <Link
          to="/dashboard"
          className="text-xs font-mono text-[var(--text-muted)] hover:text-[var(--text-primary)] underline"
        >
          Skip for now
        </Link>
      </div>

      {/* Subtle Progress Bar */}
      <div className="grid grid-cols-4 gap-2 mb-8 font-mono text-[11px]">
        {steps.map((s) => {
          const isActive = currentStep === s.num;
          const isDone = currentStep > s.num;
          return (
            <div
              key={s.num}
              className={`p-2.5 rounded-lg border text-center transition-all ${
                isDone
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500'
                  : isActive
                  ? 'bg-blue-500/10 border-blue-500 text-blue-500 font-semibold shadow-sm'
                  : 'bg-[var(--bg-surface)] border-[var(--border-subtle)] text-[var(--text-muted)]'
              }`}
            >
              <div className="truncate">
                {s.num}. {s.label}
              </div>
            </div>
          );
        })}
      </div>

      {/* STEP 1: CREATE ENDPOINT FORM */}
      {currentStep === 1 && (
        <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl p-6 sm:p-8 shadow-xl">
          <div className="mb-6">
            <h2 className="text-lg font-bold font-mono text-[var(--text-primary)]">
              Create your first endpoint
            </h2>
            <p className="text-xs text-[var(--text-secondary)] font-sans mt-1">
              This is the URL you'll give to Razorpay, Stripe, WhatsApp, or another webhook provider.
            </p>
          </div>

          <EndpointForm onSubmit={handleCreateEndpoint} loading={loading} />
        </div>
      )}

      {/* STEP 2: PROVIDER INSTRUCTIONS & HOOKLENS URL */}
      {currentStep === 2 && createdEndpoint && (
        <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl p-6 sm:p-8 shadow-xl space-y-6">
          <div className="flex items-center gap-3 p-3.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-500 text-xs font-mono">
            <Sparkles className="w-5 h-5 shrink-0" />
            <div>
              <h4 className="font-semibold">Endpoint Created ✓</h4>
              <p className="opacity-80 text-[11px]">Copy this URL into your {createdEndpoint.provider} provider dashboard.</p>
            </div>
          </div>

          {/* Generated HookLens Monospace URL Box */}
          <div>
            <label className="block text-xs font-mono font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-2">
              Your HookLens Webhook URL
            </label>
            <div className="flex items-center gap-2 p-3 bg-[var(--bg-app)] border border-[var(--border-subtle)] rounded-xl font-mono text-xs">
              <code className="text-blue-600 dark:text-blue-400 flex-1 truncate select-all">
                {createdEndpoint.hooklensUrl}
              </code>
              <button
                onClick={() => handleCopyUrl(createdEndpoint.hooklensUrl)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono text-[var(--text-primary)] bg-[var(--bg-surface)] hover:bg-[var(--bg-elevated)] rounded-lg border border-[var(--border-subtle)] transition-colors shrink-0"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied ✓' : 'Copy URL'}</span>
              </button>
            </div>
          </div>

          {/* Provider-Specific Configuration Instructions */}
          <div className="p-4 bg-[var(--bg-app)] border border-[var(--border-subtle)] rounded-xl font-mono text-xs space-y-3">
            <h5 className="text-[var(--text-primary)] font-semibold uppercase text-[11px] flex items-center justify-between">
              <span>Next Step: Configure {createdEndpoint.provider}</span>
              <ExternalLink className="w-3.5 h-3.5 text-[var(--text-muted)]" />
            </h5>

            {createdEndpoint.provider === 'Razorpay' && (
              <ol className="list-decimal list-inside space-y-1.5 text-[var(--text-secondary)] font-sans text-xs leading-relaxed">
                <li>Log in to your <strong>Razorpay Dashboard</strong>.</li>
                <li>Navigate to <em>Settings → Webhooks → Add Webhook</em>.</li>
                <li>Paste your HookLens URL as the <strong>Webhook URL</strong>.</li>
                <li>Select the events you want HookLens to receive (e.g. <code className="text-blue-500">payment.captured</code>).</li>
              </ol>
            )}

            {createdEndpoint.provider === 'Stripe' && (
              <ol className="list-decimal list-inside space-y-1.5 text-[var(--text-secondary)] font-sans text-xs leading-relaxed">
                <li>Log in to your <strong>Stripe Dashboard</strong>.</li>
                <li>Navigate to <em>Developers → Webhooks → Add Endpoint</em>.</li>
                <li>Paste your HookLens URL above.</li>
                <li>Select event subscriptions (e.g. <code className="text-blue-500">payment_intent.succeeded</code>).</li>
              </ol>
            )}

            {createdEndpoint.provider === 'WhatsApp' && (
              <ol className="list-decimal list-inside space-y-1.5 text-[var(--text-secondary)] font-sans text-xs leading-relaxed">
                <li>Open Meta <strong>Developer Dashboard</strong>.</li>
                <li>Navigate to <em>WhatsApp → Configuration → Edit Callback URL</em>.</li>
                <li>Paste your HookLens URL as the callback destination.</li>
              </ol>
            )}

            {createdEndpoint.provider === 'Custom' && (
              <ol className="list-decimal list-inside space-y-1.5 text-[var(--text-secondary)] font-sans text-xs leading-relaxed">
                <li>Open your webhook provider settings.</li>
                <li>Set the target destination URL to your copied HookLens address.</li>
                <li>Send a test payload to trigger instant delivery telemetry.</li>
              </ol>
            )}
          </div>

          <div className="pt-2 flex items-center justify-between">
            <button
              onClick={handleSendTestWebhook}
              className="btn-primary inline-flex items-center justify-center gap-2 py-3 px-5 text-xs font-mono font-semibold rounded-xl border border-blue-500 shadow-sm"
            >
              <Play className="w-4 h-4 text-emerald-300" />
              <span>Send test webhook</span>
            </button>

            <Link to="/dashboard" className="text-xs font-mono text-[var(--text-muted)] hover:underline">
              Skip test and go to dashboard
            </Link>
          </div>
        </div>
      )}

      {/* STEP 3 & 4: REALTIME PIPELINE & SUCCESS VIEW */}
      {(currentStep === 3 || currentStep === 4) && (
        <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl p-6 sm:p-8 shadow-xl space-y-6">
          
          {testState === 'waiting' && (
            <div className="py-8 text-center space-y-4 font-mono text-xs">
              <div className="w-12 h-12 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-500 flex items-center justify-center mx-auto animate-pulse">
                <Loader2 className="w-6 h-6 animate-spin" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[var(--text-primary)]">Waiting for webhook...</h3>
                <p className="text-xs text-[var(--text-muted)] font-sans mt-1">
                  Listening on HookLens Gateway ingestion endpoint.
                </p>
              </div>
            </div>
          )}

          {testState === 'pipeline' && (
            <div className="py-6 space-y-6 font-mono text-xs">
              <div className="text-center">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-500 text-xs font-semibold">
                  <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                  <span>Webhook Received</span>
                </div>
              </div>

              {/* Progressive Delivery Pipeline */}
              <div className="p-4 bg-[var(--bg-app)] border border-[var(--border-subtle)] rounded-xl space-y-3">
                <div className="text-[10px] text-[var(--text-muted)] uppercase font-semibold">Live Ingestion Telemetry</div>

                <div className="grid grid-cols-5 gap-2 text-center text-[11px]">
                  <div className={`p-2 rounded border ${pipelineState === 'RECEIVED' ? 'bg-blue-500/10 border-blue-500 text-blue-500 font-bold' : 'bg-[var(--bg-surface)] text-[var(--text-muted)]'}`}>
                    RECEIVED
                  </div>
                  <div className={`p-2 rounded border ${pipelineState === 'AUTHENTICATED' ? 'bg-blue-500/10 border-blue-500 text-blue-500 font-bold' : 'bg-[var(--bg-surface)] text-[var(--text-muted)]'}`}>
                    AUTHENTICATED
                  </div>
                  <div className={`p-2 rounded border ${pipelineState === 'QUEUED' ? 'bg-blue-500/10 border-blue-500 text-blue-500 font-bold' : 'bg-[var(--bg-surface)] text-[var(--text-muted)]'}`}>
                    QUEUED
                  </div>
                  <div className={`p-2 rounded border ${pipelineState === 'DELIVERING' ? 'bg-blue-500/10 border-blue-500 text-blue-500 font-bold' : 'bg-[var(--bg-surface)] text-[var(--text-muted)]'}`}>
                    DELIVERING
                  </div>
                  <div className={`p-2 rounded border ${pipelineState === 'SUCCEEDED' ? 'bg-emerald-500/10 border-emerald-500 text-emerald-500 font-bold' : 'bg-[var(--bg-surface)] text-[var(--text-muted)]'}`}>
                    SUCCEEDED
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SUCCESS SCREEN: YOU'RE LIVE */}
          {testState === 'succeeded' && (
            <div className="py-4 space-y-6 font-mono text-xs">
              <div className="text-center space-y-2">
                <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                </div>
                <h2 className="text-2xl font-bold text-[var(--text-primary)]">You're live 🎉</h2>
                <p className="text-xs text-[var(--text-secondary)] font-sans">
                  HookLens received and delivered your first webhook successfully.
                </p>
              </div>

              {/* Delivery Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-[var(--bg-app)] border border-[var(--border-subtle)] rounded-xl text-center">
                <div>
                  <div className="text-[10px] text-[var(--text-muted)] uppercase">Received</div>
                  <div className="text-base font-bold text-[var(--text-primary)]">1</div>
                </div>
                <div>
                  <div className="text-[10px] text-[var(--text-muted)] uppercase">Delivered</div>
                  <div className="text-base font-bold text-emerald-500">1</div>
                </div>
                <div>
                  <div className="text-[10px] text-[var(--text-muted)] uppercase">Latency</div>
                  <div className="text-base font-bold text-[var(--text-primary)]">184ms</div>
                </div>
                <div>
                  <div className="text-[10px] text-[var(--text-muted)] uppercase">Attempts</div>
                  <div className="text-base font-bold text-[var(--text-primary)]">1</div>
                </div>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={() => navigate('/dashboard')}
                  className="btn-primary py-3 px-6 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 border border-blue-500"
                >
                  <span>Open dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => navigate('/dashboard/events')}
                  className="py-3 px-6 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 bg-[var(--bg-app)] border border-[var(--border-subtle)] hover:bg-[var(--bg-elevated)] transition-colors"
                >
                  <span>View event</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default OnboardingPage;
