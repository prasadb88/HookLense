import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { endpointApi } from '../../api/endpointApi.js';
import LoadingState from '../../components/common/LoadingState.jsx';
import ErrorState from '../../components/common/ErrorState.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';
import StatusBadge from '../../components/common/StatusBadge.jsx';
import { formatDate } from '../../utils/formatters.js';
import { Plus, Webhook, ExternalLink, Copy, Check, Trash2, Power } from 'lucide-react';

export const EndpointsPage = () => {
  const [endpoints, setEndpoints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  const navigate = useNavigate();

  const fetchEndpoints = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await endpointApi.getEndpoints();
      setEndpoints(data);
    } catch (err) {
      setError(err.message || 'Failed to load endpoints');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEndpoints();
  }, []);

  const handleCopy = (text, id) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
    }
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this webhook endpoint?')) {
      await endpointApi.deleteEndpoint(id);
      setEndpoints((prev) => prev.filter((ep) => ep.id !== id));
    }
  };

  const handleToggleStatus = async (ep) => {
    const nextStatus = ep.status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE';
    await endpointApi.updateEndpoint(ep.id, { status: nextStatus });
    setEndpoints((prev) =>
      prev.map((item) => (item.id === ep.id ? { ...item, status: nextStatus } : item))
    );
  };

  if (loading) return <LoadingState message="Fetching configured webhook endpoints..." />;
  if (error) return <ErrorState message={error} onRetry={fetchEndpoints} />;

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-3 border-b border-[var(--border-subtle)]">
        <div>
          <h2 className="text-xl font-bold font-mono text-[var(--text-primary)]">Webhook Endpoints</h2>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5">
            Configured destinations receiving third-party webhook payloads
          </p>
        </div>
        <Link
          to="/dashboard/endpoints/new"
          className="btn-primary inline-flex items-center gap-1.5 px-4 py-2 text-xs font-mono font-semibold rounded-xl border border-blue-500 shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Endpoint</span>
        </Link>
      </div>

      {endpoints.length === 0 ? (
        <EmptyState
          title="No webhook endpoints configured"
          description="Connect your first webhook provider like Stripe or Razorpay to start monitoring events."
          actionLabel="Create Endpoint"
          onAction={() => navigate('/dashboard/endpoints/new')}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {endpoints.map((ep) => (
            <div
              key={ep.id}
              className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl p-5 shadow-sm flex flex-col justify-between hover:border-[var(--border-strong)] transition-all"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500 shrink-0">
                      <Webhook className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-[var(--text-primary)] font-mono">{ep.name}</h3>
                      <span className="text-[11px] text-[var(--text-muted)] font-mono">{ep.provider}</span>
                    </div>
                  </div>
                  <StatusBadge status={ep.status} />
                </div>

                <div className="space-y-3 text-xs font-mono mb-4">
                  <div>
                    <span className="text-[var(--text-muted)] block text-[10px] uppercase font-semibold">HookLens Ingestion URL</span>
                    <div className="flex items-center justify-between gap-2 p-2.5 bg-[var(--bg-app)] border border-[var(--border-subtle)] rounded-xl text-blue-600 dark:text-blue-400 mt-1">
                      <span className="truncate select-all">{ep.hooklensUrl}</span>
                      <button
                        onClick={() => handleCopy(ep.hooklensUrl, ep.id + '_hl')}
                        className="text-[var(--text-muted)] hover:text-[var(--text-primary)] p-1 shrink-0"
                        title="Copy HookLens URL"
                      >
                        {copiedId === ep.id + '_hl' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <span className="text-[var(--text-muted)] block text-[10px] uppercase font-semibold">Target Backend URL</span>
                    <div className="p-2.5 bg-[var(--bg-app)] border border-[var(--border-subtle)] rounded-xl text-[var(--text-secondary)] truncate mt-1">
                      {ep.targetUrl}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 py-3 border-y border-[var(--border-subtle)] text-center font-mono">
                  <div>
                    <div className="text-[10px] text-[var(--text-muted)] uppercase">Events</div>
                    <div className="text-xs font-semibold text-[var(--text-primary)] mt-0.5">{ep.totalEvents?.toLocaleString() || '1,240'}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-[var(--text-muted)] uppercase">Success</div>
                    <div className="text-xs font-semibold text-emerald-500 mt-0.5">{ep.successRate}%</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-[var(--text-muted)] uppercase">Avg Latency</div>
                    <div className="text-xs font-semibold text-[var(--text-primary)] mt-0.5">{ep.avgLatency}ms</div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 mt-2 font-mono">
                <span className="text-[11px] text-[var(--text-muted)]">Created {formatDate(ep.createdAt)}</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggleStatus(ep)}
                    title={ep.status === 'ACTIVE' ? 'Pause Endpoint' : 'Activate Endpoint'}
                    className="p-1.5 text-[var(--text-muted)] hover:text-amber-500 p-1.5 rounded-lg bg-[var(--bg-app)] border border-[var(--border-subtle)] hover:bg-[var(--bg-elevated)] transition-colors"
                  >
                    <Power className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(ep.id)}
                    title="Delete Endpoint"
                    className="p-1.5 text-[var(--text-muted)] hover:text-red-500 p-1.5 rounded-lg bg-[var(--bg-app)] border border-[var(--border-subtle)] hover:bg-[var(--bg-elevated)] transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                  <Link
                    to={`/dashboard/endpoints/${ep.id}`}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-mono font-medium text-[var(--text-primary)] bg-[var(--bg-app)] hover:bg-[var(--bg-elevated)] rounded-lg border border-[var(--border-subtle)] transition-colors"
                  >
                    <span>View</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EndpointsPage;
