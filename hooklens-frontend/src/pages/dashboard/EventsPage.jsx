import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { eventApi } from '../../api/eventApi.js';
import LoadingState from '../../components/common/LoadingState.jsx';
import ErrorState from '../../components/common/ErrorState.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';
import StatusBadge from '../../components/common/StatusBadge.jsx';
import { formatDate, formatDuration } from '../../utils/formatters.js';
import { Search, RefreshCw } from 'lucide-react';

export const EventsPage = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [search, setSearch] = useState('');
  const [provider, setProvider] = useState('');
  const [status, setStatus] = useState('');

  const fetchEvents = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await eventApi.getEvents({ search, provider, status });
      setEvents(data);
    } catch (err) {
      setError(err.message || 'Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [search, provider, status]);

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-3 border-b border-[var(--border-subtle)]">
        <div>
          <h2 className="text-xl font-bold font-mono text-[var(--text-primary)]">Webhook Events</h2>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5">
            Live telemetry stream of ingested payloads and delivery statuses
          </p>
        </div>
        <button
          onClick={fetchEvents}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-mono text-[var(--text-primary)] bg-[var(--bg-app)] hover:bg-[var(--bg-elevated)] rounded-xl border border-[var(--border-subtle)] transition-colors self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Developer Filter Bar */}
      <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl p-4 flex flex-col md:flex-row gap-3 shadow-sm font-mono text-xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[var(--text-muted)] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by event type (e.g. payment.captured) or ID..."
            className="w-full pl-9 pr-3.5 py-2.5 bg-[var(--bg-app)] border border-[var(--border-subtle)] rounded-xl text-xs font-mono text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>

        <div className="flex items-center gap-3">
          <select
            value={provider}
            onChange={(e) => setProvider(e.target.value)}
            className="px-3 py-2.5 bg-[var(--bg-app)] border border-[var(--border-subtle)] rounded-xl text-xs font-mono text-[var(--text-primary)] focus:outline-none focus:border-blue-500"
          >
            <option value="">All Providers</option>
            <option value="Razorpay">Razorpay</option>
            <option value="Stripe">Stripe</option>
            <option value="WhatsApp">WhatsApp</option>
            <option value="Custom">Custom</option>
          </select>

          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="px-3 py-2.5 bg-[var(--bg-app)] border border-[var(--border-subtle)] rounded-xl text-xs font-mono text-[var(--text-primary)] focus:outline-none focus:border-blue-500"
          >
            <option value="">All Statuses</option>
            <option value="SUCCESS">SUCCESS</option>
            <option value="FAILED">FAILED</option>
            <option value="RETRYING">RETRYING</option>
            <option value="QUEUED">QUEUED</option>
            <option value="DEAD_LETTERED">DEAD_LETTERED</option>
          </select>
        </div>
      </div>

      {/* Events Stream Table */}
      {loading ? (
        <LoadingState message="Filtering webhook event telemetry stream..." />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchEvents} />
      ) : events.length === 0 ? (
        <EmptyState
          title="No webhook events found"
          description="Send your first webhook to your HookLens endpoint to start observing events."
        />
      ) : (
        <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl overflow-hidden shadow-sm font-mono text-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[var(--border-subtle)] text-[10px] text-[var(--text-muted)] uppercase tracking-wider bg-[var(--bg-app)]">
                  <th className="py-3 px-4">Event Type</th>
                  <th className="py-3 px-4">Provider</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">HTTP</th>
                  <th className="py-3 px-4">Attempts</th>
                  <th className="py-3 px-4">Latency</th>
                  <th className="py-3 px-4">Received At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-subtle)] text-xs">
                {events.map((evt) => (
                  <tr key={evt.id} className="hover:bg-[var(--bg-elevated)] transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-[var(--text-primary)]">
                      <Link to={`/dashboard/events/${evt.id}`} className="hover:text-blue-500 font-mono">
                        {evt.eventType}
                      </Link>
                      <div className="text-[11px] text-[var(--text-muted)] font-normal">{evt.id}</div>
                    </td>
                    <td className="py-3.5 px-4 text-[var(--text-secondary)]">{evt.provider}</td>
                    <td className="py-3.5 px-4"><StatusBadge status={evt.status} /></td>
                    <td className="py-3.5 px-4 font-semibold text-[var(--text-primary)]">{evt.httpStatus ? `HTTP ${evt.httpStatus}` : 'N/A'}</td>
                    <td className="py-3.5 px-4 text-[var(--text-secondary)]">{evt.attempts} / {evt.maxAttempts || 5}</td>
                    <td className="py-3.5 px-4 text-[var(--text-secondary)]">{formatDuration(evt.latency)}</td>
                    <td className="py-3.5 px-4 text-[var(--text-muted)]">{formatDate(evt.receivedAt)}</td>
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

export default EventsPage;
