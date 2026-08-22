import React, { useEffect, useState } from 'react';
import { replayApi } from '../../api/replayApi.js';
import LoadingState from '../../components/common/LoadingState.jsx';
import ErrorState from '../../components/common/ErrorState.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';
import StatusBadge from '../../components/common/StatusBadge.jsx';
import { formatDate, formatDuration } from '../../utils/formatters.js';
import { RotateCcw, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';

export const ReplaysPage = () => {
  const [replays, setReplays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchReplays = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await replayApi.getReplays();
      setReplays(data);
    } catch (err) {
      setError(err.message || 'Failed to load replays');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReplays();
  }, []);

  if (loading) return <LoadingState message="Fetching replay history logs..." />;
  if (error) return <ErrorState message={error} onRetry={fetchReplays} />;

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-3 border-b border-[var(--border-subtle)]">
        <div>
          <h2 className="text-xl font-bold font-mono text-[var(--text-primary)]">Manual & Automated Replays</h2>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5 font-sans">
            Audit log of all manual and programmatically replayed webhook events
          </p>
        </div>
        <button
          onClick={fetchReplays}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-mono text-[var(--text-primary)] bg-[var(--bg-app)] hover:bg-[var(--bg-elevated)] rounded-xl border border-[var(--border-subtle)] transition-colors self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh</span>
        </button>
      </div>

      {replays.length === 0 ? (
        <EmptyState
          title="No replay history recorded"
          description="When you replay a failed webhook event, the audit entry will appear here."
        />
      ) : (
        <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl overflow-hidden shadow-sm font-mono text-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[var(--border-subtle)] text-[10px] text-[var(--text-muted)] uppercase tracking-wider bg-[var(--bg-app)]">
                  <th className="py-3 px-4">Replay ID / Event ID</th>
                  <th className="py-3 px-4">Endpoint</th>
                  <th className="py-3 px-4">Triggered By</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">HTTP</th>
                  <th className="py-3 px-4">Latency</th>
                  <th className="py-3 px-4">Replayed At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-subtle)] text-xs">
                {replays.map((rpl) => (
                  <tr key={rpl.replayId} className="hover:bg-[var(--bg-elevated)] transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-[var(--text-primary)]">
                      <span>{rpl.replayId}</span>
                      <div className="text-[11px] text-[var(--text-muted)] font-normal">
                        Target Event:{' '}
                        <Link to={`/dashboard/events/${rpl.eventId}`} className="text-blue-600 dark:text-blue-400 hover:underline">
                          {rpl.eventId}
                        </Link>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-[var(--text-secondary)]">{rpl.endpointName}</td>
                    <td className="py-3.5 px-4 text-[var(--text-muted)]">{rpl.triggeredBy}</td>
                    <td className="py-3.5 px-4"><StatusBadge status={rpl.status} /></td>
                    <td className="py-3.5 px-4 text-[var(--text-secondary)] font-semibold">{rpl.httpStatus ? `HTTP ${rpl.httpStatus}` : 'N/A'}</td>
                    <td className="py-3.5 px-4 text-[var(--text-secondary)]">{formatDuration(rpl.latency)}</td>
                    <td className="py-3.5 px-4 text-[var(--text-muted)]">{formatDate(rpl.timestamp)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReplaysPage;
