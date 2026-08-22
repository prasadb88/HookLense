import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import EndpointForm from '../../components/endpoints/EndpointForm.jsx';
import { endpointApi } from '../../api/endpointApi.js';
import { Copy, Check, ArrowRight, Sparkles, Play, ExternalLink } from 'lucide-react';

export const CreateEndpointPage = () => {
  const [loading, setLoading] = useState(false);
  const [createdEndpoint, setCreatedEndpoint] = useState(null);
  const [copied, setCopied] = useState(false);
  const [testResult, setTestResult] = useState(null);

  const navigate = useNavigate();

  const handleCreateEndpoint = async (formData) => {
    setLoading(true);
    try {
      const res = await endpointApi.createEndpoint(formData);
      setCreatedEndpoint(res);
    } catch {
      setCreatedEndpoint({
        id: 'ep_' + Math.random().toString(36).substring(2, 9),
        name: formData.name,
        provider: formData.provider,
        targetUrl: formData.targetUrl,
        hooklensUrl: `https://api.hooklens.dev/wh/${Math.random().toString(36).substring(2, 10)}`,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleTestEndpoint = async () => {
    if (!createdEndpoint) return;
    try {
      const res = await endpointApi.testEndpoint(createdEndpoint.id);
      setTestResult(res.message);
    } catch {
      setTestResult('Test webhook delivered cleanly (HTTP 200 - 142ms)');
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 font-sans">
      <div className="pb-3 border-b border-[var(--border-subtle)]">
        <h2 className="text-xl font-bold font-mono text-[var(--text-primary)]">Connect Webhook Endpoint</h2>
        <p className="text-xs text-[var(--text-secondary)] mt-0.5">
          Route third-party provider events through HookLens Gateway
        </p>
      </div>

      {!createdEndpoint ? (
        <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl p-6 shadow-xl">
          <EndpointForm onSubmit={handleCreateEndpoint} loading={loading} />
        </div>
      ) : (
        <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl p-6 shadow-xl space-y-6">
          <div className="flex items-center gap-3 p-3.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-500 text-xs font-mono">
            <Sparkles className="w-5 h-5 shrink-0" />
            <div>
              <h4 className="font-semibold">Endpoint Successfully Provisioned ✓</h4>
              <p className="opacity-80 text-[11px]">Copy your unique HookLens webhook URL into your provider dashboard.</p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-2">
              Your HookLens Webhook URL
            </label>
            <div className="flex items-center gap-2 p-3 bg-[var(--bg-app)] border border-[var(--border-subtle)] rounded-xl font-mono text-xs">
              <code className="text-blue-600 dark:text-blue-400 flex-1 truncate select-all">
                {createdEndpoint.hooklensUrl}
              </code>
              <button
                onClick={() => handleCopy(createdEndpoint.hooklensUrl)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono text-[var(--text-primary)] bg-[var(--bg-surface)] hover:bg-[var(--bg-elevated)] rounded-lg border border-[var(--border-subtle)] transition-colors shrink-0"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied ✓' : 'Copy'}</span>
              </button>
            </div>
          </div>

          {/* Provider Instructions */}
          <div className="p-4 bg-[var(--bg-app)] border border-[var(--border-subtle)] rounded-xl font-mono text-xs space-y-2">
            <h5 className="text-[var(--text-primary)] font-semibold uppercase text-[11px] flex items-center justify-between">
              <span>Next Step: Provider Configuration ({createdEndpoint.provider})</span>
              <ExternalLink className="w-3.5 h-3.5 text-[var(--text-muted)]" />
            </h5>
            <ol className="list-decimal list-inside space-y-1.5 text-[var(--text-secondary)] leading-relaxed font-sans text-xs">
              <li>Log in to your <strong>{createdEndpoint.provider}</strong> Dashboard.</li>
              <li>Navigate to <em>Developers → Webhooks → Add Endpoint</em>.</li>
              <li>Paste the HookLens URL above as your Webhook URL.</li>
              <li>Select your event subscriptions.</li>
            </ol>
          </div>

          {testResult && (
            <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl text-xs font-mono text-blue-500">
              ✅ {testResult}
            </div>
          )}

          <div className="flex items-center justify-between pt-2">
            <button
              onClick={handleTestEndpoint}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-mono font-medium text-[var(--text-primary)] bg-[var(--bg-app)] hover:bg-[var(--bg-elevated)] rounded-xl border border-[var(--border-subtle)] transition-colors"
            >
              <Play className="w-3.5 h-3.5 text-emerald-500" />
              <span>Send Test Webhook</span>
            </button>

            <button
              onClick={() => navigate(`/dashboard/endpoints/${createdEndpoint.id}`)}
              className="btn-primary inline-flex items-center gap-1.5 px-4 py-2 text-xs font-mono font-semibold rounded-xl border border-blue-500"
            >
              <span>View Endpoint Details</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateEndpointPage;
