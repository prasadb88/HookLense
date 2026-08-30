import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { endpointApi } from '../../api/endpointApi.js';
import { getSocket } from '../../socket/socketClient.js';
import LoadingState from '../../components/common/LoadingState.jsx';
import ErrorState from '../../components/common/ErrorState.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';
import StatusBadge from '../../components/common/StatusBadge.jsx';
import Modal from '../../components/common/Modal.jsx';
import { formatDate } from '../../utils/formatters.js';
import { Plus, Webhook, ExternalLink, Copy, Check, Trash2, Power, AlertTriangle } from 'lucide-react';

export const EndpointsPage = () => {
  const [endpoints, setEndpoints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const [deleteEndpointTarget, setDeleteEndpointTarget] = useState(null);

  const navigate = useNavigate();

  const fetchEndpoints = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await endpointApi.getEndpoints();
      setEndpoints(data);
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Failed to load endpoints');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEndpoints();
  }, []);

  // Socket.IO real-time listener for updating endpoint metrics dynamically
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const handleUpdate = () => {
      endpointApi.getEndpoints().then(setEndpoints).catch(() => {});
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
  }, []);

  const handleCopy = (text, id) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
    }
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const confirmDeleteEndpoint = async () => {
    if (!deleteEndpointTarget) return;
    try {
      await endpointApi.deleteEndpoint(deleteEndpointTarget.id);
      setEndpoints((prev) => prev.filter((ep) => ep.id !== deleteEndpointTarget.id));
    } catch (err) {
      alert(err?.response?.data?.message || err?.message || 'Failed to delete endpoint');
    } finally {
      setDeleteEndpointTarget(null);
    }
  };

  const handleToggleStatus = async (ep) => {
    const currentIsActive = ep.isActive !== false && ep.status === 'ACTIVE';
    const nextIsActive = !currentIsActive;
    const nextStatus = nextIsActive ? 'ACTIVE' : 'INACTIVE';

    setEndpoints((prev) =>
      prev.map((item) =>
        item.id === ep.id ? { ...item, isActive: nextIsActive, status: nextStatus } : item
      )
    );

    try {
      await endpointApi.updateEndpoint(ep.id, { isActive: nextIsActive, status: nextStatus });
      fetchEndpoints();
    } catch (err) {
      alert(err?.response?.data?.message || err?.message || 'Failed to update endpoint status');
      fetchEndpoints();
    }
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
                        aria-label="Copy HookLens URL"
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
                    <div className="text-xs font-semibold text-[var(--text-primary)] mt-0.5">{ep.totalEvents?.toLocaleString() || '0'}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-[var(--text-muted)] uppercase">Success</div>
                    <div className="text-xs font-semibold text-emerald-500 mt-0.5">{ep.successRate || 0}%</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-[var(--text-muted)] uppercase">Avg Latency</div>
                    <div className="text-xs font-semibold text-[var(--text-primary)] mt-0.5">{ep.avgLatency !== undefined ? `${ep.avgLatency}ms` : '--'}</div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 mt-2 font-mono">
                <span className="text-[11px] text-[var(--text-muted)]">Created {formatDate(ep.createdAt)}</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggleStatus(ep)}
                    aria-label={ep.status === 'ACTIVE' ? 'Pause Endpoint' : 'Activate Endpoint'}
                    title={ep.status === 'ACTIVE' ? 'Pause Endpoint' : 'Activate Endpoint'}
                    className="p-1.5 text-[var(--text-muted)] hover:text-amber-500 rounded-lg bg-[var(--bg-app)] border border-[var(--border-subtle)] hover:bg-[var(--bg-elevated)] transition-colors"
                  >
                    <Power className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setDeleteEndpointTarget(ep)}
                    aria-label="Delete Endpoint"
                    title="Delete Endpoint"
                    className="p-1.5 text-[var(--text-muted)] hover:text-red-500 rounded-lg bg-[var(--bg-app)] border border-[var(--border-subtle)] hover:bg-[var(--bg-elevated)] transition-colors"
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

      {/* Styled Delete Confirmation Dialog */}
      {deleteEndpointTarget && (
        <Modal
          isOpen={!!deleteEndpointTarget}
          onClose={() => setDeleteEndpointTarget(null)}
          title="Delete Webhook Endpoint"
        >
          <div className="space-y-4 font-mono text-xs">
            <div className="flex items-start gap-3 p-3.5 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500">
              <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-xs font-sans">Confirm Permanent Deletion</h4>
                <p className="text-[11px] font-sans opacity-90 mt-0.5">
                  Are you sure you want to delete <strong className="font-mono text-red-600 dark:text-red-400">{deleteEndpointTarget.name}</strong>? Incoming webhooks for this endpoint will no longer be ingested.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[var(--border-subtle)]">
              <button
                onClick={() => setDeleteEndpointTarget(null)}
                className="px-3.5 py-2 text-xs font-mono text-[var(--text-secondary)] hover:text-[var(--text-primary)] bg-[var(--bg-app)] rounded-lg border border-[var(--border-subtle)] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteEndpoint}
                className="px-4 py-2 text-xs font-mono font-semibold text-white bg-red-600 hover:bg-red-500 rounded-lg border border-red-500 transition-colors shadow-sm"
              >
                Delete Endpoint
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default EndpointsPage;
