import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import MetricCard from '../../components/common/MetricCard.jsx';
import StatusBadge from '../../components/common/StatusBadge.jsx';
import VolumeChart from '../../components/charts/VolumeChart.jsx';
import LoadingState from '../../components/common/LoadingState.jsx';
import ErrorState from '../../components/common/ErrorState.jsx';
import ReplayModal from '../../components/replay/ReplayModal.jsx';
import { analyticsApi } from '../../api/analyticsApi.js';
import { eventApi } from '../../api/eventApi.js';
import { endpointApi } from '../../api/endpointApi.js';
import { getSocket } from '../../socket/socketClient.js';
import { formatDate, formatDuration } from '../../utils/formatters.js';
import {
  Activity,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Plus,
  RotateCcw,
  ArrowRight,
  Key,
  ChevronDown,
} from 'lucide-react';

export const DashboardOverview = () => {
  const [timeRange, setTimeRange] = useState('24h');
  const [metrics, setMetrics] = useState(null);
  const [volumeSeries, setVolumeSeries] = useState([]);
  const [recentEvents, setRecentEvents] = useState([]);
  const [endpoints, setEndpoints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Replay modal state
  const [selectedEventForReplay, setSelectedEventForReplay] = useState(null);

  const navigate = useNavigate();

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [overviewData, seriesData, eventsData, endpointsData] = await Promise.all([
        analyticsApi.getOverview(timeRange),
        analyticsApi.getTimeSeries(timeRange),
        eventApi.getEvents(),
        endpointApi.getEndpoints(),
      ]);
      setMetrics(overviewData);
      setVolumeSeries(seriesData);
      setRecentEvents(eventsData.slice(0, 6));
      setEndpoints(endpointsData.slice(0, 3));
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Failed to load observability metrics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [timeRange]);

  // Real-time Socket.IO listener for live overview updates
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const handleRealtimeUpdate = () => {
      // Safely refetch metrics from backend REST API upon real-time socket events
      analyticsApi.getOverview(timeRange).then(setMetrics).catch(() => {});
      analyticsApi.getTimeSeries(timeRange).then(setVolumeSeries).catch(() => {});
      eventApi.getEvents().then((evts) => setRecentEvents(evts.slice(0, 6))).catch(() => {});
    };

    socket.on('webhook.received', handleRealtimeUpdate);
    socket.on('delivery.succeeded', handleRealtimeUpdate);
    socket.on('delivery.failed', handleRealtimeUpdate);
    socket.on('delivery.retry', handleRealtimeUpdate);
    socket.on('replay.completed', handleRealtimeUpdate);

    return () => {
      socket.off('webhook.received', handleRealtimeUpdate);
      socket.off('delivery.succeeded', handleRealtimeUpdate);
      socket.off('delivery.failed', handleRealtimeUpdate);
      socket.off('delivery.retry', handleRealtimeUpdate);
      socket.off('replay.completed', handleRealtimeUpdate);
    };
  }, [timeRange]);

  if (loading && !metrics) return <LoadingState message="Connecting to HookLens Gateway analytics engine..." />;
  if (error && !metrics) return <ErrorState message={error} onRetry={fetchData} />;

  // Filter failed events for "Needs attention" panel
  const failedEvents = recentEvents.filter(
    (e) => e.status === 'FAILED' || e.status === 'DEAD_LETTERED'
  );

  const timeRangeLabel = timeRange === '24h' ? 'Last 24 hours' : timeRange === '7d' ? 'Last 7 days' : 'Last 30 days';

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-3 border-b border-[var(--border-subtle)]">
        <div>
          <h2 className="text-xl font-bold font-mono text-[var(--text-primary)]">Overview</h2>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5 font-sans">
            Monitor your webhook delivery pipeline in real time.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Time Range Selector */}
          <div className="relative">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="appearance-none px-3 py-1.5 pr-8 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-xs font-mono text-[var(--text-primary)] cursor-pointer focus:outline-none hover:border-[var(--border-strong)] transition-colors"
            >
              <option value="24h">Last 24 hours</option>
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-[var(--text-muted)] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          <Link
            to="/dashboard/endpoints/new"
            className="btn-primary inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-mono font-semibold rounded-lg border border-blue-500 shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Endpoint</span>
          </Link>
        </div>
      </div>

      {/* Failure Alert Banner (Only rendered if failedLastHour > 0) */}
      {metrics?.failedLastHour > 0 && (
        <div className="p-3.5 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center justify-between font-mono text-xs text-amber-600 dark:text-amber-400 shadow-sm">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{metrics.failedLastHour} webhook deliver{metrics.failedLastHour === 1 ? 'y' : 'ies'} failed in the last hour.</span>
          </div>
          <Link
            to="/dashboard/events?status=FAILED"
            className="px-2.5 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-600 dark:text-amber-400 rounded text-[11px] font-semibold transition-colors shrink-0"
          >
            View failures
          </Link>
        </div>
      )}

      {/* 4 Database-Driven Summary Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Events Received"
          value={metrics ? metrics.totalEvents.toLocaleString() : '0'}
          subtext={timeRangeLabel}
          icon={Activity}
        />
        <MetricCard
          title="Delivered"
          value={metrics ? metrics.succeeded.toLocaleString() : '0'}
          subtext={metrics?.successRateNumber !== null && metrics?.successRateNumber !== undefined ? `${metrics.successRateNumber}% Success rate` : '-- Success rate'}
          icon={CheckCircle2}
        />
        <MetricCard
          title="Failed"
          value={metrics ? metrics.failed.toLocaleString() : '0'}
          subtext={metrics?.failureRateNumber !== null && metrics?.failureRateNumber !== undefined ? `${metrics.failureRateNumber}% Failure rate` : '-- Failure rate'}
          icon={AlertTriangle}
        />
        <MetricCard
          title="Avg Delivery Latency"
          value={metrics?.avgLatencyMs !== null && metrics?.avgLatencyMs !== undefined ? `${metrics.avgLatencyMs}ms` : '--'}
          subtext="Average across delivery attempts"
          icon={Clock}
        />
      </div>

      {/* Delivery Health Area Chart */}
      <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
          <div>
            <h3 className="text-sm font-semibold text-[var(--text-primary)] font-mono">Delivery health</h3>
            <p className="text-xs text-[var(--text-muted)] mt-0.5 font-sans">
              {timeRangeLabel} aggregate throughput across all active endpoints
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs font-mono">
            <span className="flex items-center gap-1.5 text-emerald-500">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Successful
            </span>
            <span className="flex items-center gap-1.5 text-red-500">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500" /> Failed
            </span>
            <span className="flex items-center gap-1.5 text-amber-500">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Retrying
            </span>
          </div>
        </div>
        <VolumeChart data={volumeSeries} />
      </div>

      {/* Needs Attention Panel (Failed Events) */}
      {failedEvents.length > 0 && (
        <div className="bg-[var(--bg-surface)] border border-red-500/20 rounded-xl p-5 shadow-sm space-y-3 font-mono text-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-500" />
              <h3 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider">
                Needs Attention
              </h3>
            </div>
            <Link to="/dashboard/events?status=FAILED" className="text-[11px] text-blue-500 hover:underline">
              View all failures →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
            {failedEvents.slice(0, 2).map((evt) => (
              <div
                key={evt.id}
                className="p-3 bg-[var(--bg-app)] border border-[var(--border-subtle)] rounded-lg space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[var(--text-primary)]">{evt.eventType}</span>
                  <StatusBadge status={evt.status} />
                </div>
                <div className="text-[11px] text-[var(--text-muted)] truncate">
                  Target: {evt.endpointName}
                </div>
                <div className="text-[11px] text-red-500 font-sans truncate">
                  Reason: {evt.errorMessage || evt.aiDiagnosis?.summary || 'Target server returned error'}
                </div>
                <div className="flex items-center justify-between pt-1 text-[11px]">
                  <span className="text-[var(--text-muted)]">{evt.attempts} attempts</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => navigate(`/dashboard/events/${evt.id}`)}
                      className="px-2 py-1 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded hover:text-[var(--text-primary)]"
                    >
                      View
                    </button>
                    <button
                      onClick={() => setSelectedEventForReplay(evt)}
                      className="px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded font-semibold flex items-center gap-1"
                    >
                      <RotateCcw className="w-3 h-3" /> Replay
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Webhook Event Stream Table */}
      <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl overflow-hidden shadow-sm font-mono text-xs">
        <div className="p-4 border-b border-[var(--border-subtle)] bg-[var(--bg-app)] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h3 className="text-sm font-semibold text-[var(--text-primary)]">Recent events</h3>
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[10px]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Live</span>
            </div>
          </div>
          <Link
            to="/dashboard/events"
            className="inline-flex items-center gap-1 text-xs text-blue-500 hover:underline font-semibold"
          >
            <span>View all</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          {recentEvents.length === 0 ? (
            <div className="p-8 text-center text-[var(--text-muted)]">No recent webhook events found for this tenant.</div>
          ) : (
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="border-b border-[var(--border-subtle)] text-[10px] text-[var(--text-muted)] uppercase tracking-wider bg-[var(--bg-app)]/50">
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Event</th>
                  <th className="py-3 px-4">Provider</th>
                  <th className="py-3 px-4">Endpoint</th>
                  <th className="py-3 px-4">HTTP</th>
                  <th className="py-3 px-4">Latency</th>
                  <th className="py-3 px-4">Attempts</th>
                  <th className="py-3 px-4">Received</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-subtle)] text-xs">
                {recentEvents.map((evt) => (
                  <tr
                    key={evt.id}
                    onClick={() => navigate(`/dashboard/events/${evt.id}`)}
                    className="hover:bg-[var(--bg-elevated)] cursor-pointer transition-colors"
                  >
                    <td className="py-3 px-4">
                      <StatusBadge status={evt.status} />
                    </td>
                    <td className="py-3 px-4 font-semibold text-[var(--text-primary)]">
                      <div>{evt.eventType}</div>
                      <div className="text-[10px] text-[var(--text-muted)] font-normal">{evt.id}</div>
                    </td>
                    <td className="py-3 px-4 text-[var(--text-secondary)]">{evt.provider}</td>
                    <td className="py-3 px-4 text-[var(--text-muted)] truncate max-w-[150px]">{evt.endpointName}</td>
                    <td className="py-3 px-4 font-semibold">
                      <span className={evt.httpStatus >= 400 ? 'text-red-500' : 'text-emerald-500'}>
                        {evt.httpStatus ? `HTTP ${evt.httpStatus}` : '—'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-[var(--text-secondary)]">{formatDuration(evt.latency)}</td>
                    <td className="py-3 px-4 text-[var(--text-secondary)]">{evt.attempts}</td>
                    <td className="py-3 px-4 text-[var(--text-muted)]">{formatDate(evt.receivedAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Endpoint Health Summary Table */}
      <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl p-5 shadow-sm font-mono text-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-[var(--text-primary)]">Endpoint health</h3>
            <p className="text-xs text-[var(--text-muted)] font-sans mt-0.5">Performance telemetry across target backend URLs</p>
          </div>
          <Link to="/dashboard/endpoints" className="text-xs text-blue-500 hover:underline">
            Manage endpoints →
          </Link>
        </div>

        {endpoints.length === 0 ? (
          <div className="p-4 text-center text-[var(--text-muted)] border border-[var(--border-subtle)] rounded-lg bg-[var(--bg-app)]">
            No endpoints configured.
          </div>
        ) : (
          <div className="space-y-2">
            {endpoints.map((ep) => (
              <div
                key={ep.id}
                onClick={() => navigate(`/dashboard/endpoints/${ep.id}`)}
                className="p-3 bg-[var(--bg-app)] border border-[var(--border-subtle)] rounded-lg flex items-center justify-between hover:border-[var(--border-strong)] cursor-pointer transition-colors"
              >
                <div>
                  <div className="font-semibold text-[var(--text-primary)]">{ep.name}</div>
                  <div className="text-[11px] text-[var(--text-muted)] truncate max-w-xs">{ep.targetUrl}</div>
                </div>
                <div className="flex items-center gap-6 text-right">
                  <div>
                    <div className="text-[10px] text-[var(--text-muted)] uppercase">Status</div>
                    <div className="font-semibold text-emerald-500 uppercase">{ep.status || 'ACTIVE'}</div>
                  </div>
                  <div className="px-2 py-0.5 bg-emerald-500/10 text-emerald-500 text-[10px] border border-emerald-500/20 rounded font-semibold">
                    Healthy
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions Panel */}
      <div className="p-4 bg-[var(--bg-tinted)] border border-[var(--border-strong)] rounded-xl font-mono text-xs">
        <div className="text-[10px] text-[var(--text-muted)] uppercase font-semibold mb-3">Quick Actions</div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Link
            to="/dashboard/endpoints/new"
            className="p-2.5 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg text-center hover:border-blue-500 transition-colors flex items-center justify-center gap-2"
          >
            <Plus className="w-3.5 h-3.5 text-blue-500" />
            <span>Create Endpoint</span>
          </Link>
          <Link
            to="/dashboard/replays"
            className="p-2.5 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg text-center hover:border-blue-500 transition-colors flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-3.5 h-3.5 text-violet-500" />
            <span>Replay Event</span>
          </Link>
          <Link
            to="/dashboard/events?status=FAILED"
            className="p-2.5 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg text-center hover:border-blue-500 transition-colors flex items-center justify-center gap-2"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-red-500" />
            <span>View Failures</span>
          </Link>
          <Link
            to="/dashboard/api-keys"
            className="p-2.5 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg text-center hover:border-blue-500 transition-colors flex items-center justify-center gap-2"
          >
            <Key className="w-3.5 h-3.5 text-amber-500" />
            <span>API Keys</span>
          </Link>
        </div>
      </div>

      {/* Replay Modal */}
      {selectedEventForReplay && (
        <ReplayModal
          event={selectedEventForReplay}
          isOpen={!!selectedEventForReplay}
          onClose={() => setSelectedEventForReplay(null)}
          onSuccess={() => {
            fetchData();
            setSelectedEventForReplay(null);
          }}
        />
      )}
    </div>
  );
};

export default DashboardOverview;
