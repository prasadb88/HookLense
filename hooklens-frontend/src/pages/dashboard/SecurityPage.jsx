import React, { useEffect, useState } from 'react';
import { securityApi } from '../../api/securityApi.js';
import LoadingState from '../../components/common/LoadingState.jsx';
import ErrorState from '../../components/common/ErrorState.jsx';
import SecurityBadge from '../../components/common/SecurityBadge.jsx';
import { formatDate } from '../../utils/formatters.js';
import { ShieldCheck, ShieldAlert, Lock, RefreshCw, EyeOff, Terminal } from 'lucide-react';

export const SecurityPage = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSecurity = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await securityApi.getSecurityOverview();
      setStats(data);
    } catch (err) {
      setError(err.message || 'Failed to load security audit data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSecurity();
  }, []);

  if (loading) return <LoadingState message="Checking HMAC & SSRF Egress Security Telemetry..." />;
  if (error) return <ErrorState message={error} onRetry={fetchSecurity} />;

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-3 border-b border-[var(--border-subtle)]">
        <div>
          <h2 className="text-xl font-bold font-mono text-[var(--text-primary)]">Security & Egress Guard</h2>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5 font-sans">
            Automated cryptographic verification, idempotency, and SSRF threat mitigation
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 font-mono text-xs rounded-full self-start sm:self-auto">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Egress Security Guard Active</span>
        </div>
      </div>

      {/* Security Protection Modules Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 font-mono text-xs">
        <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl p-4 space-y-1 shadow-sm">
          <Lock className="w-4 h-4 text-emerald-500 mb-2" />
          <div className="font-semibold text-[var(--text-primary)]">HMAC Signatures</div>
          <div className="text-[11px] text-[var(--text-muted)] font-sans">Cryptographic Validations</div>
          <div className="text-blue-500 font-semibold pt-1">{stats.hmacVerified?.toLocaleString()} Verified</div>
        </div>

        <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl p-4 space-y-1 shadow-sm">
          <RefreshCw className="w-4 h-4 text-blue-500 mb-2" />
          <div className="font-semibold text-[var(--text-primary)]">Freshness Guard</div>
          <div className="text-[11px] text-[var(--text-muted)] font-sans">300s Timestamp Drift</div>
          <div className="text-blue-500 font-semibold pt-1">{stats.freshnessProtected?.toLocaleString()} Checked</div>
        </div>

        <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl p-4 space-y-1 shadow-sm">
          <ShieldAlert className="w-4 h-4 text-amber-500 mb-2" />
          <div className="font-semibold text-[var(--text-primary)]">Replay Protection</div>
          <div className="text-[11px] text-[var(--text-muted)] font-sans">Payload Deduplication</div>
          <div className="text-amber-500 font-semibold pt-1">{stats.replayProtected?.toLocaleString()} Deduplicated</div>
        </div>

        <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl p-4 space-y-1 shadow-sm">
          <Terminal className="w-4 h-4 text-red-500 mb-2" />
          <div className="font-semibold text-[var(--text-primary)]">SSRF Egress Guard</div>
          <div className="text-[11px] text-[var(--text-muted)] font-sans">Private IP Filter</div>
          <div className="text-red-500 font-semibold pt-1">{stats.ssrfBlocked} Blocked</div>
        </div>

        <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl p-4 space-y-1 shadow-sm">
          <EyeOff className="w-4 h-4 text-violet-500 mb-2" />
          <div className="font-semibold text-[var(--text-primary)]">PII Redaction</div>
          <div className="text-[11px] text-[var(--text-muted)] font-sans">Automated Log Masking</div>
          <div className="text-violet-500 font-semibold pt-1">{stats.piiRedacted?.toLocaleString()} Masked</div>
        </div>
      </div>

      {/* Security Events Audit Table */}
      <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl overflow-hidden shadow-sm font-mono text-xs">
        <div className="p-4 border-b border-[var(--border-subtle)] bg-[var(--bg-app)]">
          <h3 className="text-sm font-semibold text-[var(--text-primary)]">Recent Security & Egress Incidents</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[var(--border-subtle)] text-[10px] text-[var(--text-muted)] uppercase tracking-wider bg-[var(--bg-app)]">
                <th className="py-3 px-4">Event ID / Type</th>
                <th className="py-3 px-4">Severity</th>
                <th className="py-3 px-4">Provider / Endpoint</th>
                <th className="py-3 px-4">Source IP</th>
                <th className="py-3 px-4">Incident Details</th>
                <th className="py-3 px-4">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-subtle)] text-xs">
              {stats.recentSecurityEvents?.map((sec) => (
                <tr key={sec.id} className="hover:bg-[var(--bg-elevated)] transition-colors">
                  <td className="py-3.5 px-4 font-semibold text-[var(--text-primary)]">
                    <span>{sec.id}</span>
                  </td>
                  <td className="py-3.5 px-4">
                    <SecurityBadge type={sec.type} severity={sec.severity} />
                  </td>
                  <td className="py-3.5 px-4 text-[var(--text-secondary)]">
                    <div>{sec.endpoint}</div>
                    <div className="text-[11px] text-[var(--text-muted)] font-sans">{sec.provider}</div>
                  </td>
                  <td className="py-3.5 px-4 text-blue-600 dark:text-blue-400 font-semibold">{sec.ip}</td>
                  <td className="py-3.5 px-4 text-[var(--text-secondary)] max-w-sm truncate">{sec.details}</td>
                  <td className="py-3.5 px-4 text-[var(--text-muted)]">{formatDate(sec.timestamp)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SecurityPage;
