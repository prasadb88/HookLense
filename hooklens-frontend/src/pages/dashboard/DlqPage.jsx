import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { dlqApi } from '../../api/dlqApi.js';
import LoadingState from '../../components/common/LoadingState.jsx';
import ErrorState from '../../components/common/ErrorState.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';
import StatusBadge from '../../components/common/StatusBadge.jsx';
import ReplayModal from '../../components/replay/ReplayModal.jsx';
import { formatDate } from '../../utils/formatters.js';
import { AlertTriangle, RotateCcw, Archive, ExternalLink } from 'lucide-react';

export const DlqPage = () => {
  const [dlqEvents, setDlqEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isReplayOpen, setIsReplayOpen] = useState(false);

  const fetchDlq = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await dlqApi.getDlqEvents();
      setDlqEvents(data);
    } catch (err) {
      setError(err.message || 'Failed to load Dead Letter Queue');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDlq();
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
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-[#1E232F]">
        <div>
          <h2 className="text-xl font-bold font-mono text-white">Dead Letter Queue (DLQ)</h2>
          <p className="text-xs text-zinc-400 mt-0.5">Events that exhausted all automatic retries and require developer action</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 bg-purple-500/10 border border-purple-500/20 text-purple-300 font-mono text-xs rounded-full self-start sm:self-auto">
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
        <div className="bg-[#0F1117] border border-[#1E232F] rounded-xl overflow-hidden shadow-lg">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#1E232F] text-[11px] font-mono text-zinc-400 uppercase tracking-wider bg-[#08090C]/50">
                  <th className="py-3 px-4">Event Type / ID</th>
                  <th className="py-3 px-4">Provider</th>
                  <th className="py-3 px-4">Attempts</th>
                  <th className="py-3 px-4">Last Error</th>
                  <th className="py-3 px-4">Last Attempt</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1E232F] text-xs font-mono">
                {dlqEvents.map((evt) => (
                  <tr key={evt.id} className="hover:bg-zinc-900/40 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-white">
                      <Link to={`/dashboard/events/${evt.id}`} className="hover:text-indigo-400">
                        {evt.eventType}
                      </Link>
                      <div className="text-[11px] text-zinc-500 font-normal">{evt.id}</div>
                    </td>
                    <td className="py-3.5 px-4 text-zinc-300">{evt.provider}</td>
                    <td className="py-3.5 px-4 text-amber-400 font-semibold">{evt.attempts} / {evt.maxAttempts || 5}</td>
                    <td className="py-3.5 px-4 text-red-300 max-w-xs truncate">
                      {evt.aiDiagnosis?.summary || `HTTP ${evt.httpStatus || 500} Exhausted Retries`}
                    </td>
                    <td className="py-3.5 px-4 text-zinc-500">{formatDate(evt.receivedAt)}</td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/dashboard/events/${evt.id}`}
                          title="Inspect Event"
                          className="p-1.5 text-zinc-400 hover:text-white bg-zinc-900 hover:bg-zinc-800 rounded border border-zinc-800 transition-colors"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Link>
                        <button
                          onClick={() => handleOpenReplay(evt)}
                          title="Replay Event"
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded border border-indigo-500 transition-colors"
                        >
                          <RotateCcw className="w-3 h-3" />
                          <span>Replay</span>
                        </button>
                        <button
                          onClick={() => handleArchive(evt.id)}
                          title="Archive DLQ Item"
                          className="p-1.5 text-zinc-400 hover:text-zinc-200 bg-zinc-900 hover:bg-zinc-800 rounded border border-zinc-800 transition-colors"
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
          onReplaySuccess={() => fetchDlq()}
        />
      )}
    </div>
  );
};

export default DlqPage;
