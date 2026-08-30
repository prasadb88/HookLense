import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { eventApi } from '../../api/eventApi.js';
import { getSocket } from '../../socket/socketClient.js';
import SkeletonLoader from '../../components/common/SkeletonLoader.jsx';
import ErrorState from '../../components/common/ErrorState.jsx';
import StatusBadge from '../../components/common/StatusBadge.jsx';
import JsonViewer from '../../components/common/JsonViewer.jsx';
import AttemptTimeline from '../../components/events/AttemptTimeline.jsx';
import AIInsightCard from '../../components/events/AIInsightCard.jsx';
import ReplayModal from '../../components/replay/ReplayModal.jsx';
import { formatDate, formatDuration, formatBytes } from '../../utils/formatters.js';
import {
  ArrowLeft,
  RotateCcw,
  Copy,
  Check,
  ShieldCheck,
} from 'lucide-react';

export const EventDetailPage = () => {
  const { eventId } = useParams();
  const [event, setEvent] = useState(null);
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('Overview');
  const [isReplayOpen, setIsReplayOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const evtData = await eventApi.getEventById(eventId);
      if (!evtData) {
        setError('Event not found');
        setLoading(false);
        return;
      }
      setEvent(evtData);
      setAttempts(evtData.attempts || []);
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Failed to load event details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [eventId]);

  // Real-time socket listener for active event details & delivery attempts
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const handleDeliveryUpdate = (data) => {
      if (data.eventId === eventId || data.id === eventId) {
        fetchData();
      }
    };

    socket.on('delivery.succeeded', handleDeliveryUpdate);
    socket.on('delivery.failed', handleDeliveryUpdate);
    socket.on('delivery.retry', handleDeliveryUpdate);
    socket.on('replay.completed', handleDeliveryUpdate);

    return () => {
      socket.off('delivery.succeeded', handleDeliveryUpdate);
      socket.off('delivery.failed', handleDeliveryUpdate);
      socket.off('delivery.retry', handleDeliveryUpdate);
      socket.off('replay.completed', handleDeliveryUpdate);
    };
  }, [eventId]);

  const handleCopyId = () => {
    if (event?.id) {
      navigator.clipboard.writeText(event.id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <SkeletonLoader variant="title" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <SkeletonLoader variant="card" count={2} />
          </div>
          <SkeletonLoader variant="card" />
        </div>
      </div>
    );
  }

  if (error) return <ErrorState message={error} onRetry={fetchData} />;
  if (!event) return <ErrorState message="Event not found" />;

  const tabs = ['Overview', 'Attempts', 'Payload', 'Headers', 'Security'];

  const isSuccess = event.status === 'SUCCESS' || event.status === 'SUCCEEDED';
  const isFailed = event.status === 'FAILED' || event.status === 'DEAD_LETTERED';

  const verticalTimeline = [
    { label: 'Received Payload', time: event.receivedAt, detail: 'Ingestion Gateway', status: 'complete' },
    { label: 'HMAC Signature Verified', time: event.receivedAt, detail: 'Freshness window valid', status: 'complete' },
    { label: 'Queued in BullMQ', time: event.receivedAt, detail: 'Redis persistent stream', status: 'complete' },
    { label: 'Delivering to Target', time: event.receivedAt, detail: 'Egress Guard pass', status: 'complete' },
    {
      label: isSuccess
        ? 'Delivered Successfully'
        : isFailed
        ? 'Moved to DLQ / Failed'
        : 'Delivery In Progress',
      time: event.receivedAt,
      detail: event.httpStatus ? `HTTP ${event.httpStatus}` : (isSuccess ? 'HTTP 200' : 'Queued'),
      status: isSuccess ? 'complete' : isFailed ? 'failed' : 'pending',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-[var(--border-subtle)]">
        <div className="flex items-center gap-3">
          <Link
            to="/dashboard/events"
            className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] p-1.5 rounded bg-[var(--bg-elevated)] border border-[var(--border-subtle)]"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold font-mono text-[var(--text-primary)]">{event.eventType || 'webhook.event'}</h2>
              <StatusBadge status={event.status} />
            </div>
            <div className="flex items-center gap-3 text-xs font-mono text-[var(--text-muted)] mt-1">
              <span>{event.id}</span>
              <span>•</span>
              <span className="text-indigo-500 font-semibold">{event.provider || 'CUSTOM'}</span>
              <span>•</span>
              <span>{event.endpointName || 'Webhook Endpoint'}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyId}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-mono text-[var(--text-secondary)] hover:text-[var(--text-primary)] bg-[var(--bg-elevated)] hover:bg-[var(--border-subtle)] rounded-lg border border-[var(--border-subtle)] transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied!' : 'Copy Event ID'}</span>
          </button>
          <button
            onClick={() => setIsReplayOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-mono font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg border border-indigo-500 transition-colors shadow-sm"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Replay Webhook</span>
          </button>
        </div>
      </div>

      {/* Main Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Tabs & Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center gap-1 border-b border-[var(--border-subtle)]">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 text-xs font-mono font-medium transition-colors border-b-2 -mb-px ${
                  activeTab === tab
                    ? 'border-indigo-500 text-[var(--text-primary)] font-semibold'
                    : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* OVERVIEW TAB */}
          {activeTab === 'Overview' && (
            <div className="space-y-6">
              {/* Vertical Timeline */}
              <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl p-5 shadow-sm">
                <h3 className="text-xs font-semibold text-[var(--text-muted)] font-mono uppercase tracking-wider mb-4">
                  Vertical Audit Timeline
                </h3>

                <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-[var(--border-subtle)]">
                  {verticalTimeline.map((item, idx) => (
                    <div key={idx} className="relative flex items-start justify-between gap-4 font-mono text-xs">
                      <span
                        className={`absolute -left-6 top-0.5 w-3 h-3 rounded-full border-2 ${
                          item.status === 'complete'
                            ? 'bg-emerald-500 border-emerald-500'
                            : item.status === 'failed'
                            ? 'bg-red-500 border-red-500'
                            : 'bg-amber-500 border-amber-500'
                        }`}
                      />
                      <div>
                        <div className="font-semibold text-[var(--text-primary)]">{item.label}</div>
                        <div className="text-[11px] text-[var(--text-muted)] mt-0.5">{item.detail}</div>
                      </div>
                      <span className="text-[11px] text-[var(--text-muted)] font-mono">{formatDate(item.time)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Metadata */}
              <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl p-5 shadow-sm space-y-4">
                <h3 className="text-xs font-semibold text-[var(--text-muted)] font-mono uppercase tracking-wider">
                  Telemetry Metadata
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 font-mono text-xs">
                  <div>
                    <span className="text-[var(--text-muted)] block text-[10px] uppercase">Provider</span>
                    <span className="text-[var(--text-primary)] font-semibold mt-0.5 block">{event.provider || 'CUSTOM'}</span>
                  </div>
                  <div>
                    <span className="text-[var(--text-muted)] block text-[10px] uppercase">Received At</span>
                    <span className="text-[var(--text-primary)] mt-0.5 block">{formatDate(event.receivedAt)}</span>
                  </div>
                  <div>
                    <span className="text-[var(--text-muted)] block text-[10px] uppercase">Payload Size</span>
                    <span className="text-[var(--text-primary)] mt-0.5 block">{formatBytes(event.payloadSize)}</span>
                  </div>
                  <div>
                    <span className="text-[var(--text-muted)] block text-[10px] uppercase">IP Address</span>
                    <span className="text-[var(--text-primary)] mt-0.5 block">{event.ipAddress || '127.0.0.1'}</span>
                  </div>
                  <div>
                    <span className="text-[var(--text-muted)] block text-[10px] uppercase">Total Delivery Attempts</span>
                    <span className="text-[var(--text-primary)] mt-0.5 block font-semibold">
                      {attempts?.length || 0} Total ({attempts?.filter(a => !a.isManualReplay)?.length || 0} Auto, {attempts?.filter(a => a.isManualReplay)?.length || 0} Replays)
                    </span>
                  </div>
                  <div>
                    <span className="text-[var(--text-muted)] block text-[10px] uppercase">Latency</span>
                    <span className="text-[var(--text-primary)] mt-0.5 block">{formatDuration(event.latency)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ATTEMPTS TAB */}
          {activeTab === 'Attempts' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between font-mono text-xs text-[var(--text-muted)] mb-2">
                <span>Delivery Attempts Log</span>
                <span>{attempts.length} Attempt(s) recorded</span>
              </div>
              <AttemptTimeline attempts={attempts} />
            </div>
          )}

          {/* PAYLOAD TAB */}
          {activeTab === 'Payload' && (
            <JsonViewer data={event.payload} title="Raw Event Payload" />
          )}

          {/* HEADERS TAB */}
          {activeTab === 'Headers' && (
            <JsonViewer data={event.headers} title="Incoming HTTP Headers" />
          )}

          {/* SECURITY TAB */}
          {activeTab === 'Security' && (
            <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl p-5 shadow-sm space-y-4 font-mono text-xs">
              <h3 className="text-xs font-semibold text-[var(--text-primary)] uppercase tracking-wider flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                Security & Verification Audit
              </h3>

              <div className="space-y-3">
                <div className="p-3 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-lg flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-[var(--text-primary)]">HMAC Cryptographic Verification</div>
                    <div className="text-[var(--text-muted)] text-[11px]">Webhook signature verification status ({event.signatureAlgorithm || 'HMAC-SHA256'})</div>
                  </div>
                  <span className={`px-2 py-0.5 text-[11px] font-mono font-bold rounded border ${
                    event.signatureVerified
                      ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30'
                      : 'bg-red-500/10 text-red-500 border-red-500/30'
                  }`}>
                    {event.signatureVerified ? 'PASSED' : 'FAILED'}
                  </span>
                </div>

                <div className="p-3 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-lg flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-[var(--text-primary)]">Freshness & Idempotency Guard</div>
                    <div className="text-[var(--text-muted)] text-[11px]">Timestamp drift check. Unique event deduplication.</div>
                  </div>
                  <span className="px-2 py-0.5 text-[11px] font-mono font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/30 rounded">
                    {event.duplicate ? 'DUPLICATE IGNORED' : 'PASSED'}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: AI Diagnosis Panel */}
        <div>
          <AIInsightCard
            diagnosis={event.aiDiagnosis}
            onReplay={() => setIsReplayOpen(true)}
            onViewAttempts={() => setActiveTab('Attempts')}
          />
        </div>
      </div>

      <ReplayModal
        isOpen={isReplayOpen}
        onClose={() => setIsReplayOpen(false)}
        event={event}
        onReplaySuccess={fetchData}
      />
    </div>
  );
};

export default EventDetailPage;
