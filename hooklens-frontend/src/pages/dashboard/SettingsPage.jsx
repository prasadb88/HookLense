import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { maskSecret } from '../../utils/formatters.js';
import { Key, Eye, EyeOff, Copy, Check, Shield, User, RefreshCw, Trash2 } from 'lucide-react';

export const SettingsPage = () => {
  const { user } = useAuth();
  const [showKey, setShowKey] = useState(false);
  const [copied, setCopied] = useState(false);

  const apiKey = user?.apiKey || 'hk_live_9a8b7c6d5e4f3a2b1c0d';

  const handleCopy = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(apiKey);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-3xl space-y-8 font-sans">
      <div className="pb-3 border-b border-[var(--border-subtle)]">
        <h2 className="text-xl font-bold font-mono text-[var(--text-primary)]">Account & Gateway Settings</h2>
        <p className="text-xs text-[var(--text-secondary)] mt-0.5">
          Manage API credentials, workspace settings, and security preferences
        </p>
      </div>

      {/* Account Profile Settings */}
      <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl p-6 shadow-sm space-y-4">
        <h3 className="text-sm font-semibold font-mono text-[var(--text-primary)] flex items-center gap-2">
          <User className="w-4 h-4 text-blue-500" />
          Developer Profile
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-mono text-xs">
          <div>
            <label className="block text-[var(--text-muted)] text-[10px] uppercase font-semibold mb-1.5">Full Name</label>
            <input
              type="text"
              readOnly
              value={user?.name || 'Alex Rivera'}
              className="w-full p-2.5 bg-[var(--bg-app)] border border-[var(--border-subtle)] rounded-xl text-[var(--text-primary)]"
            />
          </div>
          <div>
            <label className="block text-[var(--text-muted)] text-[10px] uppercase font-semibold mb-1.5">Work Email</label>
            <input
              type="email"
              readOnly
              value={user?.email || 'alex@devcorp.io'}
              className="w-full p-2.5 bg-[var(--bg-app)] border border-[var(--border-subtle)] rounded-xl text-[var(--text-primary)]"
            />
          </div>
        </div>
      </div>

      {/* API Keys Management */}
      <div id="apikeys" className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl p-6 shadow-sm space-y-4 font-mono text-xs">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-[var(--text-primary)] flex items-center gap-2">
            <Key className="w-4 h-4 text-emerald-500" />
            Gateway API Credentials
          </h3>
          <span className="px-2 py-0.5 text-[10px] bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded font-semibold">
            Live Key
          </span>
        </div>

        <p className="text-[var(--text-secondary)] text-xs font-sans">
          Use this API Key to authenticate programmatic calls to HookLens Management APIs.
        </p>

        <div>
          <label className="block text-[var(--text-muted)] text-[10px] uppercase font-semibold mb-1.5">LIVE API KEY</label>
          <div className="flex items-center gap-2 p-3 bg-[var(--bg-app)] border border-[var(--border-subtle)] rounded-xl">
            <span className="flex-1 text-[var(--text-primary)] font-mono select-all">
              {showKey ? apiKey : maskSecret(apiKey)}
            </span>
            <button
              onClick={() => setShowKey(!showKey)}
              className="text-[var(--text-muted)] hover:text-[var(--text-primary)] p-1 shrink-0"
              title={showKey ? 'Hide key' : 'Show key'}
            >
              {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs text-[var(--text-primary)] bg-[var(--bg-surface)] hover:bg-[var(--bg-elevated)] rounded-lg border border-[var(--border-subtle)] transition-colors shrink-0"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied ✓' : 'Copy'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Security Policies */}
      <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl p-6 shadow-sm space-y-4 font-mono text-xs">
        <h3 className="text-sm font-semibold text-[var(--text-primary)] flex items-center gap-2">
          <Shield className="w-4 h-4 text-violet-500" />
          Default Egress Security Policies
        </h3>

        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-[var(--bg-app)] border border-[var(--border-subtle)] rounded-xl">
            <div>
              <div className="text-[var(--text-primary)] font-semibold">Strict HMAC Signature Requirement</div>
              <div className="text-[11px] text-[var(--text-muted)] font-sans">Reject unverified webhooks before pushing to delivery queue</div>
            </div>
            <input type="checkbox" defaultChecked className="rounded bg-[var(--bg-app)] border-[var(--border-subtle)] text-blue-600 focus:ring-0" />
          </div>

          <div className="flex items-center justify-between p-3 bg-[var(--bg-app)] border border-[var(--border-subtle)] rounded-xl">
            <div>
              <div className="text-[var(--text-primary)] font-semibold">SSRF Egress Filtering</div>
              <div className="text-[11px] text-[var(--text-muted)] font-sans">Block egress deliveries targeting private local IP ranges (127.0.0.1, 10.x.x.x, 169.254.169.254)</div>
            </div>
            <input type="checkbox" defaultChecked className="rounded bg-[var(--bg-app)] border-[var(--border-subtle)] text-blue-600 focus:ring-0" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
