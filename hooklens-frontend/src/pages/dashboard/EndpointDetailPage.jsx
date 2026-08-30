import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { endpointApi } from '../../api/endpointApi.js';
import { eventApi } from '../../api/eventApi.js';
import { getSocket } from '../../socket/socketClient.js';
import LoadingState from '../../components/common/LoadingState.jsx';
import ErrorState from '../../components/common/ErrorState.jsx';
import StatusBadge from '../../components/common/StatusBadge.jsx';
import MetricCard from '../../components/common/MetricCard.jsx';
import { formatDate, formatDuration, maskSecret } from '../../utils/formatters.js';
import { Copy, Check, ArrowLeft, Play, Eye, EyeOff, Activity } from 'lucide-react';

export const EndpointDetailPage = () => {
  const { endpointId } = useParams();
  const [endpoint, setEndpoint] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const [showSecret, setShowSecret] = useState(false);
  const [testResult, setTestResult] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [epData, eventsData] = await Promise.all([
        endpointApi.getEndpointById(endpointId),
        eventApi.getEvents({ endpointId }),
      ]);
      setEndpoint(epData);
      setEvents(eventsData);
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Failed to load endpoint details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [endpointId]);

  // Real-time Socket.IO update listener for endpoint telemetry and event history
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const handleUpdate = () => {
      endpointApi.getEndpointById(endpointId).then(setEndpoint).catch(() => {});
      eventApi.getEvents({ endpointId }).then(setEvents).catch(() => {});
    };

    socket.on('webhook.received', handleUpdate);
    socket.on('delivery.succeeded', handleUpdate);
    socket.on('delivery.failed', handleUpdate);
    socket.on('replay.completed', handleUpdate);

    return () => {
      socket.off('webhook.received', handleUpdate);
      socket.off('delivery.succeeded', handleUpdate);
      socket.off('delivery.failed', handleUpdate);
      socket.off('replay.completed', handleUpdate);
    };
  }, [endpointId]);

  const handleCopy = (text) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleTest = async () => {
    try {
      const res = await endpointApi.testEndpoint(endpointId);
      setTestResult(res?.message || 'Test webhook queued successfully');
    } catch (err) {
      setTestResult(err?.response?.data?.message || err?.message || 'Failed to trigger test webhook');
    }
  };

  if (loading) return <LoadingState message="Fetching endpoint telemetry..." />;
  if (error) return <ErrorState message={error} />;
  if (!endpoint) return <ErrorState message="Endpoint not found" />;

  return (
    <div className="space-y-6 font-sans">
      <div className="flex items-center gap-3 pb-3 border-b border-[var(--border-subtle)]">
        <Link
          to="/dashboard/endpoints"
          className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] p-2 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)]"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold font-mono text-[var(--text-primary)]">{endpoint.name}</h2>
            <StatusBadge status={endpoint.status} />
          </div>
          <p className="text-xs text-[var(--text-muted)] font-mono mt-0.5">{endpoint.provider} Provider • {endpoint.id}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono">
        <MetricCard title="Total Events" value={endpoint.totalEvents?.toLocaleString() || '0'} icon={Activity} />
        <MetricCard title="Success Rate" value={`${endpoint.successRate || 0}%`} />
        <MetricCard title="Avg Latency" value={endpoint.avgLatency !== undefined ? `${endpoint.avgLatency}ms` : '--'} />
      </div>

      <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl p-6 shadow-sm space-y-4">
        <h3 className="text-sm font-semibold text-[var(--text-primary)] font-mono uppercase tracking-wider">
          Configuration & Routing
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs">
          <div>
            <span className="text-[var(--text-muted)] block text-[10px] uppercase font-semibold">HOOKLENS INGESTION URL</span>
            <div className="flex items-center justify-between gap-2 p-2.5 bg-[var(--bg-app)] border border-[var(--border-subtle)] rounded-xl text-blue-600 dark:text-blue-400 mt-1">
              <span className="truncate select-all">{endpoint.hooklensUrl}</span>
              <button onClick={() => handleCopy(endpoint.hooklensUrl)} className="text-[var(--text-muted)] hover:text-[var(--text-primary)] p-1 shrink-0">
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          <div>
            <span className="text-[var(--text-muted)] block text-[10px] uppercase font-semibold">TARGET BACKEND URL</span>
            <div className="p-2.5 bg-[var(--bg-app)] border border-[var(--border-subtle)] rounded-xl text-[var(--text-secondary)] truncate mt-1">
              {endpoint.targetUrl}
            </div>
          </div>
        </div>

        <div className="font-mono text-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[var(--text-muted)] block text-[10px] uppercase font-semibold">
              WEBHOOK SIGNING SECRET (OUTBOUND X-HOOKLENS-SIGNATURE)
            </span>
            <span className="text-[10px] text-amber-600 dark:text-amber-400 font-sans">Configured</span>
          </div>
          <div className="flex items-center justify-between gap-2 p-2.5 bg-[var(--bg-app)] border border-[var(--border-subtle)] rounded-xl text-[var(--text-muted)]">
            <span className="tracking-widest font-mono text-xs">••••••••••••••••••••</span>
          </div>
          <p className="text-[11px] text-[var(--text-muted)] font-sans mt-1">
            Outbound signing secret was displayed once during endpoint creation. For security, it cannot be revealed here.
          </p>
        </div>

        {testResult && (
          <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl text-xs font-mono text-blue-500">
            ℹ️ {testResult}
          </div>
        )}

        <div className="pt-2 border-t border-[var(--border-subtle)] flex justify-end">
          <button
            onClick={handleTest}
            className="btn-primary inline-flex items-center gap-1.5 px-4 py-2 text-xs font-mono font-semibold rounded-xl border border-blue-500 shadow-sm"
          >
            <Play className="w-3.5 h-3.5 text-emerald-300" />
            <span>Send Test Webhook</span>
          </button>
        </div>
      </div>

      {/* Endpoint Event Logs Table */}
      <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl overflow-hidden shadow-sm font-mono text-xs">
        <div className="p-4 border-b border-[var(--border-subtle)] bg-[var(--bg-app)]">
          <h3 className="text-sm font-semibold text-[var(--text-primary)]">Event Log History</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[var(--border-subtle)] text-[10px] text-[var(--text-muted)] uppercase tracking-wider bg-[var(--bg-app)]">
                <th className="py-3 px-4">Event Type</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">HTTP</th>
                <th className="py-3 px-4">Attempts</th>
                <th className="py-3 px-4">Latency</th>
                <th className="py-3 px-4">Received At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-subtle)] text-xs">
              {events.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-[var(--text-muted)] font-mono">
                    No webhook events recorded for this endpoint yet.
                  </td>
                </tr>
              ) : (
                events.map((evt) => (
                  <tr key={evt.id} className="hover:bg-[var(--bg-elevated)] transition-colors">
                    <td className="py-3 px-4 font-semibold text-[var(--text-primary)]">
                      <Link to={`/dashboard/events/${evt.id}`} className="hover:text-blue-500">
                        {evt.eventType}
                      </Link>
                    </td>
                    <td className="py-3 px-4"><StatusBadge status={evt.status} /></td>
                    <td className="py-3 px-4 text-[var(--text-secondary)]">{evt.httpStatus ? `HTTP ${evt.httpStatus}` : 'N/A'}</td>
                    <td className="py-3 px-4 text-[var(--text-secondary)]">{evt.attempts}</td>
                    <td className="py-3 px-4 text-[var(--text-secondary)]">{formatDuration(evt.latency)}</td>
                    <td className="py-3 px-4 text-[var(--text-muted)]">{formatDate(evt.receivedAt)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default EndpointDetailPage;
