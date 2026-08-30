import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, Webhook, Activity, ArrowRight, CornerDownLeft, Loader2 } from 'lucide-react';
import { eventApi } from '../../api/eventApi.js';
import { endpointApi } from '../../api/endpointApi.js';
import StatusBadge from './StatusBadge.jsx';

export const SearchModal = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [events, setEvents] = useState([]);
  const [endpoints, setEndpoints] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isOpen) return;
    const loadRealData = async () => {
      setLoading(true);
      try {
        const [evts, eps] = await Promise.all([
          eventApi.getEvents().catch(() => []),
          endpointApi.getEndpoints().catch(() => []),
        ]);
        setEvents(evts || []);
        setEndpoints(eps || []);
      } finally {
        setLoading(false);
      }
    };
    loadRealData();
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) {
          onClose();
        }
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filteredEvents = query.trim()
    ? events.filter(
        (e) =>
          (e.eventType || e.event || '').toLowerCase().includes(query.toLowerCase()) ||
          (e.id || '').toLowerCase().includes(query.toLowerCase()) ||
          (e.provider || '').toLowerCase().includes(query.toLowerCase()) ||
          (e.endpointName || e.endpoint || '').toLowerCase().includes(query.toLowerCase()) ||
          (e.httpStatus && e.httpStatus.toString().includes(query))
      )
    : events.slice(0, 4);

  const filteredEndpoints = query.trim()
    ? endpoints.filter(
        (ep) =>
          (ep.name || '').toLowerCase().includes(query.toLowerCase()) ||
          (ep.targetUrl || '').toLowerCase().includes(query.toLowerCase()) ||
          (ep.provider || '').toLowerCase().includes(query.toLowerCase())
      )
    : endpoints.slice(0, 3);

  const handleSelectEvent = (eventId) => {
    onClose();
    navigate(`/dashboard/events/${eventId}`);
  };

  const handleSelectEndpoint = (endpointId) => {
    onClose();
    navigate(`/dashboard/endpoints/${endpointId}`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-black/60 backdrop-blur-sm animate-reveal">
      <div
        className="fixed inset-0"
        onClick={onClose}
      />

      <div className="relative w-full max-w-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl shadow-2xl overflow-hidden z-10 font-sans">
        
        {/* Search Input Header */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-[var(--border-subtle)] bg-[var(--bg-app)]">
          <Search className="w-5 h-5 text-[var(--text-muted)] shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search events, IDs, endpoints, status codes... (e.g. payment.captured, 500)"
            className="w-full bg-transparent text-sm font-mono text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none"
          />
          {loading && <Loader2 className="w-4 h-4 text-blue-500 animate-spin shrink-0" />}
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-mono text-[var(--text-muted)] bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded">
            ESC to close
          </span>
        </div>

        {/* Search Results List */}
        <div className="max-h-[380px] overflow-y-auto p-4 space-y-4 font-mono text-xs">
          
          {/* Events Section */}
          <div>
            <div className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider font-semibold mb-2 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5" />
              <span>Events ({filteredEvents.length})</span>
            </div>

            {filteredEvents.length === 0 ? (
              <div className="text-center py-4 text-[var(--text-muted)] font-sans text-xs">
                {loading ? 'Searching...' : `No matching events found for "${query}"`}
              </div>
            ) : (
              <div className="space-y-1">
                {filteredEvents.map((evt) => (
                  <div
                    key={evt.id}
                    onClick={() => handleSelectEvent(evt.id)}
                    className="flex items-center justify-between p-2.5 rounded-lg hover:bg-[var(--bg-elevated)] cursor-pointer transition-colors group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <StatusBadge status={evt.status} />
                      <div className="min-w-0">
                        <div className="font-semibold text-[var(--text-primary)] group-hover:text-blue-500 transition-colors truncate">
                          {evt.eventType || evt.event}
                        </div>
                        <div className="text-[11px] text-[var(--text-muted)] truncate">
                          {evt.id} • {evt.provider} • {evt.endpointName || 'Endpoint'}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 text-[11px]">
                      {evt.httpStatus && (
                        <span className={evt.httpStatus >= 400 ? 'text-red-500 font-semibold' : 'text-emerald-500 font-semibold'}>
                          HTTP {evt.httpStatus}
                        </span>
                      )}
                      <ArrowRight className="w-4 h-4 text-[var(--text-muted)] group-hover:text-blue-500 transition-colors" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Endpoints Section */}
          <div className="pt-2 border-t border-[var(--border-subtle)]">
            <div className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider font-semibold mb-2 flex items-center gap-1.5">
              <Webhook className="w-3.5 h-3.5" />
              <span>Endpoints ({filteredEndpoints.length})</span>
            </div>

            {filteredEndpoints.length === 0 ? (
              <div className="text-center py-2 text-[var(--text-muted)] font-sans text-xs">
                {loading ? 'Searching...' : 'No matching endpoints found'}
              </div>
            ) : (
              <div className="space-y-1">
                {filteredEndpoints.map((ep) => (
                  <div
                    key={ep.id}
                    onClick={() => handleSelectEndpoint(ep.id)}
                    className="flex items-center justify-between p-2.5 rounded-lg hover:bg-[var(--bg-elevated)] cursor-pointer transition-colors group"
                  >
                    <div className="min-w-0">
                      <div className="font-semibold text-[var(--text-primary)] group-hover:text-blue-500 transition-colors truncate">
                        {ep.name}
                      </div>
                      <div className="text-[11px] text-[var(--text-muted)] truncate">
                        {ep.targetUrl}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 text-[11px] text-emerald-500">
                      <span>{ep.successRate || 0}% Success</span>
                      <ArrowRight className="w-4 h-4 text-[var(--text-muted)] group-hover:text-blue-500 transition-colors" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-4 py-2.5 bg-[var(--bg-app)] border-t border-[var(--border-subtle)] flex items-center justify-between text-[11px] font-mono text-[var(--text-muted)]">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <CornerDownLeft className="w-3 h-3" /> Select
            </span>
            <span>↑↓ Navigate</span>
          </div>
          <span>HookLens Gateway Intelligence Search</span>
        </div>
      </div>
    </div>
  );
};

export default SearchModal;
