import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import {
  User,
  Sliders,
  Shield,
  Clock,
  RotateCcw,
  Check,
  LogOut,
  AlertTriangle,
  Layers,
  ShieldCheck,
  Users,
  Bell,
  FileText,
  Sparkles,
  Globe,
} from 'lucide-react';

export const SettingsPage = () => {
  const { user, logout } = useAuth();

  // Gateway Preferences State
  const [timeout, setTimeoutVal] = useState('10000');
  const [maxRetries, setMaxRetries] = useState('5');
  const [retention, setRetention] = useState('30');
  const [saved, setSaved] = useState(false);

  // Security Toggles State
  const [hmacRequired, setHmacRequired] = useState(true);
  const [ssrfFiltering, setSsrfFiltering] = useState(true);
  const [replayAuth, setReplayAuth] = useState(true);

  const handleSavePreferences = (e) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="max-w-4xl space-y-8 font-sans">
      {/* Page Title & Intro */}
      <div className="pb-3 border-b border-[var(--border-subtle)]">
        <h2 className="text-xl font-bold font-mono text-[var(--text-primary)]">Account & Gateway Settings</h2>
        <p className="text-xs text-[var(--text-secondary)] mt-0.5">
          Configure developer profile, gateway delivery preferences, and egress security controls.
        </p>
      </div>

      {/* 1. Developer Profile */}
      <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold font-mono text-[var(--text-primary)] flex items-center gap-2">
            <User className="w-4 h-4 text-blue-500" />
            Developer Profile
          </h3>
          <span className="px-2 py-0.5 text-[10px] font-mono bg-blue-500/10 text-blue-500 border border-blue-500/20 rounded font-semibold uppercase">
            {user?.authProvider === 'google' ? 'Google Auth' : 'Password Auth'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-mono text-xs">
          <div>
            <label className="block text-[var(--text-muted)] text-[10px] uppercase font-semibold mb-1.5">Full Name</label>
            <input
              type="text"
              readOnly
              value={user?.name || ''}
              className="w-full p-2.5 bg-[var(--bg-app)] border border-[var(--border-subtle)] rounded-xl text-[var(--text-primary)] font-mono select-all"
            />
          </div>
          <div>
            <label className="block text-[var(--text-muted)] text-[10px] uppercase font-semibold mb-1.5">Work Email</label>
            <input
              type="email"
              readOnly
              value={user?.email || ''}
              className="w-full p-2.5 bg-[var(--bg-app)] border border-[var(--border-subtle)] rounded-xl text-[var(--text-primary)] font-mono select-all"
            />
          </div>
        </div>

        <div className="pt-2 flex items-center justify-between text-xs font-mono text-[var(--text-muted)] border-t border-[var(--border-subtle)]">
          <div className="flex items-center gap-2">
            <Layers className="w-3.5 h-3.5" />
            <span>Tenant Workspace ID: <code className="text-[var(--text-primary)] select-all">{user?.tenantId || 'N/A'}</code></span>
          </div>
        </div>
      </div>

      {/* 2. Gateway / Delivery Preferences */}
      <form onSubmit={handleSavePreferences} className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl p-6 shadow-sm space-y-4 font-mono text-xs">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-[var(--text-primary)] flex items-center gap-2">
            <Sliders className="w-4 h-4 text-emerald-500" />
            Gateway & Delivery Preferences
          </h3>
          {saved && (
            <span className="text-xs text-emerald-500 font-semibold flex items-center gap-1">
              <Check className="w-3.5 h-3.5" />
              Preferences Saved
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-[var(--text-muted)] text-[10px] uppercase font-semibold mb-1.5">Default Timeout</label>
            <select
              value={timeout}
              onChange={(e) => setTimeoutVal(e.target.value)}
              className="w-full p-2.5 bg-[var(--bg-app)] border border-[var(--border-subtle)] rounded-xl text-[var(--text-primary)] font-mono"
            >
              <option value="5000">5,000 ms (5s)</option>
              <option value="10000">10,000 ms (10s - Default)</option>
              <option value="15000">15,000 ms (15s)</option>
              <option value="30000">30,000 ms (30s)</option>
            </select>
          </div>

          <div>
            <label className="block text-[var(--text-muted)] text-[10px] uppercase font-semibold mb-1.5">Max Retries</label>
            <select
              value={maxRetries}
              onChange={(e) => setMaxRetries(e.target.value)}
              className="w-full p-2.5 bg-[var(--bg-app)] border border-[var(--border-subtle)] rounded-xl text-[var(--text-primary)] font-mono"
            >
              <option value="3">3 Retries</option>
              <option value="5">5 Retries (Exponential)</option>
              <option value="10">10 Retries (Aggressive)</option>
            </select>
          </div>

          <div>
            <label className="block text-[var(--text-muted)] text-[10px] uppercase font-semibold mb-1.5">Payload Retention</label>
            <select
              value={retention}
              onChange={(e) => setRetention(e.target.value)}
              className="w-full p-2.5 bg-[var(--bg-app)] border border-[var(--border-subtle)] rounded-xl text-[var(--text-primary)] font-mono"
            >
              <option value="7">7 Days Retention</option>
              <option value="30">30 Days Retention</option>
              <option value="90">90 Days Retention</option>
            </select>
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl font-mono text-xs transition-colors"
          >
            Save Gateway Preferences
          </button>
        </div>
      </form>

      {/* 3. Default Egress Security Policies */}
      <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl p-6 shadow-sm space-y-4 font-mono text-xs">
        <h3 className="text-sm font-semibold text-[var(--text-primary)] flex items-center gap-2">
          <Shield className="w-4 h-4 text-violet-500" />
          Default Egress Security Policies
        </h3>

        <div className="space-y-3 font-sans">
          <div className="flex items-center justify-between p-3.5 bg-[var(--bg-app)] border border-[var(--border-subtle)] rounded-xl">
            <div>
              <div className="text-[var(--text-primary)] font-semibold text-xs font-mono">Strict HMAC Signature Requirement</div>
              <div className="text-[11px] text-[var(--text-muted)] mt-0.5">Reject unverified webhooks before pushing to BullMQ delivery queues.</div>
            </div>
            <input
              type="checkbox"
              checked={hmacRequired}
              onChange={(e) => setHmacRequired(e.target.checked)}
              className="w-4 h-4 rounded bg-[var(--bg-app)] border-[var(--border-subtle)] text-blue-600 focus:ring-0 cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between p-3.5 bg-[var(--bg-app)] border border-[var(--border-subtle)] rounded-xl">
            <div>
              <div className="text-[var(--text-primary)] font-semibold text-xs font-mono">SSRF Egress Filtering</div>
              <div className="text-[11px] text-[var(--text-muted)] mt-0.5">Block egress deliveries targeting private local IP ranges (127.0.0.1, 10.x.x.x, 169.254.169.254).</div>
            </div>
            <input
              type="checkbox"
              checked={ssrfFiltering}
              onChange={(e) => setSsrfFiltering(e.target.checked)}
              className="w-4 h-4 rounded bg-[var(--bg-app)] border-[var(--border-subtle)] text-blue-600 focus:ring-0 cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between p-3.5 bg-[var(--bg-app)] border border-[var(--border-subtle)] rounded-xl">
            <div>
              <div className="text-[var(--text-primary)] font-semibold text-xs font-mono">Replay Confirmation Policy</div>
              <div className="text-[11px] text-[var(--text-muted)] mt-0.5">Require developer confirmation before replaying failed payloads.</div>
            </div>
            <input
              type="checkbox"
              checked={replayAuth}
              onChange={(e) => setReplayAuth(e.target.checked)}
              className="w-4 h-4 rounded bg-[var(--bg-app)] border-[var(--border-subtle)] text-blue-600 focus:ring-0 cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* 4. Upcoming Platform Capabilities */}
      <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl p-6 shadow-sm space-y-4 font-mono text-xs">
        <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
          <h3 className="text-sm font-semibold text-[var(--text-primary)] flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            Upcoming Platform Features
          </h3>
          <span className="px-2 py-0.5 text-[9px] font-mono bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded font-semibold uppercase tracking-wider">
            Roadmap
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-sans">
          {/* Team & RBAC Card */}
          <div className="p-4 bg-[var(--bg-app)] border border-[var(--border-subtle)] rounded-xl space-y-2 opacity-75 hover:opacity-100 transition-opacity">
            <div className="flex items-center justify-between">
              <Users className="w-4 h-4 text-blue-500" />
              <span className="px-2 py-0.5 text-[9px] font-mono bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded font-semibold">Coming Soon</span>
            </div>
            <div className="font-mono text-xs font-semibold text-[var(--text-primary)]">Team & Role Permissions</div>
            <p className="text-[11px] text-[var(--text-muted)] leading-relaxed">
              Invite team members, manage multi-tenant organization workspaces, and assign granular RBAC roles (Admin, Developer, Viewer).
            </p>
          </div>

          {/* Real-time Alerts Card */}
          <div className="p-4 bg-[var(--bg-app)] border border-[var(--border-subtle)] rounded-xl space-y-2 opacity-75 hover:opacity-100 transition-opacity">
            <div className="flex items-center justify-between">
              <Bell className="w-4 h-4 text-emerald-500" />
              <span className="px-2 py-0.5 text-[9px] font-mono bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded font-semibold">Coming Soon</span>
            </div>
            <div className="font-mono text-xs font-semibold text-[var(--text-primary)]">Automated Alerts & Channels</div>
            <p className="text-[11px] text-[var(--text-muted)] leading-relaxed">
              Receive real-time notifications via Slack webhooks, Discord, PagerDuty, or Email when endpoint error rates exceed threshold.
            </p>
          </div>

          {/* Compliance Audit Trail Card */}
          <div className="p-4 bg-[var(--bg-app)] border border-[var(--border-subtle)] rounded-xl space-y-2 opacity-75 hover:opacity-100 transition-opacity">
            <div className="flex items-center justify-between">
              <FileText className="w-4 h-4 text-violet-500" />
              <span className="px-2 py-0.5 text-[9px] font-mono bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded font-semibold">Coming Soon</span>
            </div>
            <div className="font-mono text-xs font-semibold text-[var(--text-primary)]">Compliance Audit Logs</div>
            <p className="text-[11px] text-[var(--text-muted)] leading-relaxed">
              Immutable audit trail recording all endpoint modifications, signing secret rotations, and developer API key access history.
            </p>
          </div>
        </div>
      </div>

      {/* 5. Danger Zone */}
      <div className="bg-[var(--bg-surface)] border border-red-500/20 rounded-2xl p-6 shadow-sm space-y-4 font-mono text-xs">
        <h3 className="text-sm font-semibold text-red-500 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" />
          Danger Zone
        </h3>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3.5 bg-red-500/5 border border-red-500/20 rounded-xl">
          <div>
            <div className="text-[var(--text-primary)] font-semibold font-mono text-xs">Revoke Current Session</div>
            <div className="text-[11px] text-[var(--text-muted)] font-sans mt-0.5">Log out of your current HookLens dashboard session.</div>
          </div>
          <button
            onClick={logout}
            className="px-3.5 py-1.5 bg-red-600 hover:bg-red-500 text-white font-semibold rounded-lg text-xs font-mono transition-colors shrink-0 flex items-center gap-1.5 self-start sm:self-auto"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Log Out Session</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
