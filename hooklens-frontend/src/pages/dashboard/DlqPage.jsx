import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { dlqApi } from '../../api/dlqApi.js';
import { getSocket } from '../../socket/socketClient.js';
import LoadingState from '../../components/common/LoadingState.jsx';
import ErrorState from '../../components/common/ErrorState.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';
import ReplayModal from '../../components/replay/ReplayModal.jsx';
import { formatDate } from '../../utils/formatters.js';
import { AlertTriangle, RotateCcw, Archive, ExternalLink } from 'lucide-react';

export const DlqPage = () => {
  const [dlqEvents, setDlqEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isReplayOpen, setIsReplayOpen] = useState(false);

  const fetchDlq = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    setError(null);
    try {
      const data = await dlqApi.getDlqEvents();
      setDlqEvents(data);
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Failed to load Dead Letter Queue');
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  useEffect(() => {
    fetchDlq(true);
  }, []);

  // Socket.IO listener for real-time DLQ updates on delivery or replay events
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const handleDlqUpdate = () => {
      fetchDlq(false);
    };

    socket.on('replay.completed', handleDlqUpdate);
    socket.on('delivery.failed', handleDlqUpdate);
    socket.on('delivery.succeeded', handleDlqUpdate);

    return () => {
      socket.off('replay.completed', handleDlqUpdate);
      socket.off('delivery.failed', handleDlqUpdate);
      socket.off('delivery.succeeded', handleDlqUpdate);
    };
  }, []);

  const handleArchive = async (id) => {
    await dlqApi.archiveDlqEvent(id);
    setDlqEvents((prev) => prev.filter((e) => e.id !== id));
  };

  const handleOpenReplay = (evt) => {
    setSelectedEvent(evt);
    setIsReplayOpen(true);
  };

  if (loading) return <LoadingState message="Fetching Dead Letter Queue events..." />;
  if (error) return <ErrorState message={error} onRetry={fetchDlq} />;

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-[var(--border-subtle)]">
        <div>
          <h2 className="text-xl font-bold font-mono text-[var(--text-primary)]">Dead Letter Queue (DLQ)</h2>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5 font-sans">Events that exhausted all automatic retries and require developer action</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 bg-purple-500/10 border border-purple-500/20 text-purple-600 dark:text-purple-400 font-mono text-xs rounded-full self-start sm:self-auto">
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>{dlqEvents.length} Item(s) Pending Review</span>
        </div>
      </div>

      {dlqEvents.length === 0 ? (
        <EmptyState
          title="Dead Letter Queue is clear!"
          description="All webhook deliveries are succeeding cleanly or active in background retry loops."
        />
      ) : (
        <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[var(--border-subtle)] text-[11px] font-mono text-[var(--text-muted)] uppercase tracking-wider bg-[var(--bg-app)]/50">
                  <th className="py-3 px-4">Event Type / ID</th>
                  <th className="py-3 px-4">Provider</th>
                  <th className="py-3 px-4">Attempts</th>
                  <th className="py-3 px-4">Last Error</th>
                  <th className="py-3 px-4">Last Attempt</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-subtle)] text-xs font-mono">
                {dlqEvents.map((evt) => (
                  <tr key={evt.id} className="hover:bg-[var(--bg-elevated)] transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-[var(--text-primary)]">
                      <Link to={`/dashboard/events/${evt.id}`} className="hover:text-blue-500">
                        {evt.eventType}
                      </Link>
                      <div className="text-[11px] text-[var(--text-muted)] font-normal">{evt.id}</div>
                    </td>
                    <td className="py-3.5 px-4 text-[var(--text-secondary)]">{evt.provider}</td>
                    <td className="py-3.5 px-4 text-amber-500 font-semibold">
                      <span>{evt.initialAttempts || evt.attempts} / {evt.maxAttempts || 5}</span>
                      {evt.manualReplays > 0 && (
                        <div className="text-[10px] text-indigo-400 font-normal mt-0.5">
                          +{evt.manualReplays} manual replay{evt.manualReplays > 1 ? 's' : ''}
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-red-500 max-w-xs truncate" title={evt.lastError || evt.aiDiagnosis?.summary || `HTTP ${evt.httpStatus || 500} Exhausted Retries`}>
                      {evt.lastError || evt.aiDiagnosis?.summary || (evt.httpStatus ? `HTTP ${evt.httpStatus}` : 'Exhausted Retries')}
                    </td>
                    <td className="py-3.5 px-4 text-[var(--text-muted)]">{formatDate(evt.lastAttemptAt || evt.receivedAt)}</td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/dashboard/events/${evt.id}`}
                          title="Inspect Event"
                          className="p-1.5 text-[var(--text-secondary)] hover:text-[var(--text-primary)] bg-[var(--bg-app)] hover:bg-[var(--bg-elevated)] rounded-lg border border-[var(--border-subtle)] transition-colors"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Link>
                        <button
                          onClick={() => handleOpenReplay(evt)}
                          title="Replay Event"
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg border border-indigo-500 transition-colors"
                        >
                          <RotateCcw className="w-3 h-3" />
                          <span>Replay</span>
                        </button>
                        <button
                          onClick={() => handleArchive(evt.id)}
                          title="Archive DLQ Item"
                          className="p-1.5 text-[var(--text-secondary)] hover:text-[var(--text-primary)] bg-[var(--bg-app)] hover:bg-[var(--bg-elevated)] rounded-lg border border-[var(--border-subtle)] transition-colors"
                        >
                          <Archive className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {selectedEvent && (
        <ReplayModal
          isOpen={isReplayOpen}
          onClose={() => {
            setIsReplayOpen(false);
            setSelectedEvent(null);
          }}
          event={selectedEvent}
          onReplaySuccess={() => {
            fetchDlq(false);
            setTimeout(() => fetchDlq(false), 500);
          }}
        />
      )}
    </div>
  );
};

export default DlqPage;
