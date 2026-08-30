import React, { useState } from 'react';
import Modal from '../common/Modal.jsx';
import { RotateCcw, Loader2, AlertCircle } from 'lucide-react';
import { replayApi } from '../../api/replayApi.js';
import { useRealtime } from '../../context/RealtimeContext.jsx';

export const ReplayModal = ({ isOpen, onClose, event, onReplaySuccess, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  let addToast = null;
  try {
    const realtime = useRealtime();
    addToast = realtime?.addToast;
  } catch {
    // RealtimeContext fallback if outside provider
  }

  const handleConfirmReplay = async () => {
    if (!event || loading) return;
    setLoading(true);
    setError(null);
    try {
      const res = await replayApi.replayEvent(event.id || event._id);
      if (addToast) {
        addToast('Replay Queued', res.message || 'Webhook event successfully enqueued for replay.', 'success');
      }
      const callback = onReplaySuccess || onSuccess;
      if (callback) callback(res);
    } catch (err) {
      const errMsg = err?.response?.data?.message || err?.message || 'Failed to trigger replay.';
      setError(errMsg);
      if (addToast) {
        addToast('Replay Failed', errMsg, 'error');
      }
    } finally {
      setLoading(false);
      setError(null);
      onClose();
    }
  };

  const handleClose = () => {
    if (loading) return;
    setError(null);
    onClose();
  };

  if (!event) return null;

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Replay Webhook Confirmation">
      <div className="space-y-4 font-sans">
        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-xs font-mono text-red-500 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="flex items-start gap-3 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl">
          <RotateCcw className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-xs font-semibold text-amber-700 dark:text-amber-300 font-mono">Replay this webhook?</h4>
            <p className="text-xs text-[var(--text-secondary)] mt-1 leading-relaxed">
              This will send the original payload for <span className="font-mono font-semibold text-[var(--text-primary)]">{event.eventType || event.providerEventId}</span> (<span className="font-mono text-[var(--text-muted)]">{event.id || event._id}</span>) to target endpoint.
            </p>
          </div>
        </div>

        <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
          Replay creates a new delivery attempt and does not modify historical event records.
        </p>

        <div className="flex justify-end gap-3 pt-4 border-t border-[var(--border-subtle)] font-mono">
          <button
            onClick={handleClose}
            disabled={loading}
            className="px-4 py-2 text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] bg-[var(--bg-app)] hover:bg-[var(--bg-elevated)] rounded-lg border border-[var(--border-subtle)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirmReplay}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg border border-indigo-500 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Queueing Replay...
              </>
            ) : (
              <>
                <RotateCcw className="w-3.5 h-3.5" />
                Confirm & Replay
              </>
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ReplayModal;
