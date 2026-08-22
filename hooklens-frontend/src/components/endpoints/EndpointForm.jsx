import React, { useState } from 'react';
import { Webhook, ChevronDown, ChevronUp, Lock, ShieldCheck, AlertCircle, Loader2, CheckCircle2 } from 'lucide-react';

export const EndpointForm = ({ onSubmit, loading = false, initialData = {} }) => {
  const [name, setName] = useState(initialData.name || '');
  const [provider, setProvider] = useState(initialData.provider || 'Razorpay');
  const [targetUrl, setTargetUrl] = useState(initialData.targetUrl || '');
  
  // Advanced Settings Toggle & State
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [timeout, setTimeoutVal] = useState(initialData.timeout || 10);
  const [maxRetries, setMaxRetries] = useState(initialData.maxRetries || 5);
  const [retryPolicy, setRetryPolicy] = useState(initialData.retryPolicy || 'EXPONENTIAL_JITTER');
  const [signatureVerification, setSignatureVerification] = useState(
    initialData.signatureVerification !== undefined ? initialData.signatureVerification : true
  );
  const [piiRedaction, setPiiRedaction] = useState(
    initialData.piiRedaction !== undefined ? initialData.piiRedaction : true
  );

  const [urlWarning, setUrlWarning] = useState('');

  const handleTargetUrlChange = (val) => {
    setTargetUrl(val);
    if (val && val.startsWith('http://') && !val.includes('localhost') && !val.includes('127.0.0.1')) {
      setUrlWarning('HTTPS is recommended for production webhook endpoints.');
    } else {
      setUrlWarning('');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      name: name || `${provider} Webhooks`,
      provider,
      targetUrl,
      timeout: Number(timeout),
      maxRetries: Number(maxRetries),
      retryPolicy,
      signatureVerification,
      piiRedaction,
    });
  };

  const providersList = [
    {
      id: 'Razorpay',
      name: 'Razorpay',
      desc: 'Payments, refunds and orders',
      color: 'text-blue-500',
    },
    {
      id: 'Stripe',
      name: 'Stripe',
      desc: 'Payments, invoices and subscriptions',
      color: 'text-violet-500',
    },
    {
      id: 'WhatsApp',
      name: 'WhatsApp Cloud API',
      desc: 'Messages and business events',
      color: 'text-emerald-500',
    },
    {
      id: 'Custom',
      name: 'Custom',
      desc: 'Any HTTP webhook provider',
      color: 'text-amber-500',
    },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6 font-sans">
      
      {/* Endpoint Name */}
      <div>
        <label htmlFor="endpointName" className="block text-xs font-mono font-medium text-[var(--text-secondary)] mb-1.5">
          Endpoint Name
        </label>
        <input
          id="endpointName"
          type="text"
          required
          autoComplete="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Payment Webhooks"
          className="w-full px-3.5 py-2.5 bg-[var(--bg-app)] border border-[var(--border-subtle)] rounded-xl text-xs font-mono text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-blue-500 transition-colors"
        />
      </div>

      {/* Provider Selection Cards */}
      <div>
        <label className="block text-xs font-mono font-medium text-[var(--text-secondary)] mb-2">
          Webhook Provider
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {providersList.map((p) => {
            const isSelected = provider === p.id;
            return (
              <div
                key={p.id}
                onClick={() => setProvider(p.id)}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all select-none ${
                  isSelected
                    ? 'bg-blue-500/10 border-blue-500 shadow-sm'
                    : 'bg-[var(--bg-app)] border-[var(--border-subtle)] hover:border-[var(--border-strong)]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`font-mono text-xs font-bold ${p.color}`}>{p.name}</span>
                  {isSelected && <CheckCircle2 className="w-4 h-4 text-blue-500" />}
                </div>
                <p className="text-[11px] text-[var(--text-muted)] font-sans mt-1">
                  {p.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Target URL */}
      <div>
        <label htmlFor="targetUrl" className="block text-xs font-mono font-medium text-[var(--text-secondary)] mb-1.5">
          Target URL
        </label>
        <input
          id="targetUrl"
          type="url"
          required
          value={targetUrl}
          onChange={(e) => handleTargetUrlChange(e.target.value)}
          placeholder="https://api.yourapp.com/webhooks/payment"
          className="w-full px-3.5 py-2.5 bg-[var(--bg-app)] border border-[var(--border-subtle)] rounded-xl text-xs font-mono text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-blue-500 transition-colors"
        />
        <p className="text-[11px] text-[var(--text-muted)] mt-1.5 font-sans">
          HookLens will securely forward received webhooks to this URL.
        </p>

        {urlWarning && (
          <div className="mt-2 p-2.5 bg-amber-500/10 border border-amber-500/20 rounded-lg text-xs font-mono text-amber-600 dark:text-amber-400 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{urlWarning}</span>
          </div>
        )}
      </div>

      {/* Advanced Settings Expandable Accordion */}
      <div className="border border-[var(--border-subtle)] rounded-xl overflow-hidden bg-[var(--bg-app)]">
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="w-full px-4 py-3 flex items-center justify-between text-xs font-mono text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors select-none"
        >
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-blue-500" />
            <span>Advanced settings</span>
          </div>
          {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {showAdvanced && (
          <div className="p-4 border-t border-[var(--border-subtle)] space-y-4 font-mono text-xs bg-[var(--bg-surface)]">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] text-[var(--text-muted)] mb-1">
                  Timeout (seconds)
                </label>
                <input
                  type="number"
                  min="1"
                  max="60"
                  value={timeout}
                  onChange={(e) => setTimeoutVal(e.target.value)}
                  className="w-full px-3 py-2 bg-[var(--bg-app)] border border-[var(--border-subtle)] rounded-lg text-xs text-[var(--text-primary)] focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-[11px] text-[var(--text-muted)] mb-1">
                  Maximum retries
                </label>
                <input
                  type="number"
                  min="0"
                  max="10"
                  value={maxRetries}
                  onChange={(e) => setMaxRetries(e.target.value)}
                  className="w-full px-3 py-2 bg-[var(--bg-app)] border border-[var(--border-subtle)] rounded-lg text-xs text-[var(--text-primary)] focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] text-[var(--text-muted)] mb-1">
                Retry policy
              </label>
              <select
                value={retryPolicy}
                onChange={(e) => setRetryPolicy(e.target.value)}
                className="w-full px-3 py-2 bg-[var(--bg-app)] border border-[var(--border-subtle)] rounded-lg text-xs text-[var(--text-primary)] focus:outline-none focus:border-blue-500"
              >
                <option value="EXPONENTIAL_JITTER">Exponential backoff + jitter (Recommended)</option>
                <option value="FIXED_INTERVAL">Fixed 5-minute interval</option>
                <option value="IMMEDIATE">Immediate retry</option>
              </select>
            </div>

            <div className="pt-2 border-t border-[var(--border-subtle)] space-y-2">
              <label className="flex items-center justify-between cursor-pointer select-none">
                <span className="text-xs text-[var(--text-secondary)]">Signature verification</span>
                <input
                  type="checkbox"
                  checked={signatureVerification}
                  onChange={(e) => setSignatureVerification(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-0 cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer select-none">
                <span className="text-xs text-[var(--text-secondary)]">PII redaction</span>
                <input
                  type="checkbox"
                  checked={piiRedaction}
                  onChange={(e) => setPiiRedaction(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-0 cursor-pointer"
                />
              </label>
            </div>
          </div>
        )}
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading}
        className="btn-primary w-full py-3 px-4 rounded-xl text-xs font-mono font-semibold flex items-center justify-center gap-2 border border-blue-500 shadow-sm transition-all disabled:opacity-60"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin text-white" />
            <span>Creating endpoint...</span>
          </>
        ) : (
          <>
            <Webhook className="w-4 h-4" />
            <span>Create endpoint</span>
          </>
        )}
      </button>
    </form>
  );
};

export default EndpointForm;
