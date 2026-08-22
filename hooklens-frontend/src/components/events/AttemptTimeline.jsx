import React, { useState } from 'react';
import { StatusBadge } from '../common/StatusBadge.jsx';
import { ChevronDown, ChevronRight, Clock, Server } from 'lucide-react';
import { formatDate, formatDuration } from '../../utils/formatters.js';

export const AttemptTimeline = ({ attempts = [] }) => {
  const [expandedIndex, setExpandedIndex] = useState(0);

  if (!attempts || attempts.length === 0) {
    return <div className="text-xs text-zinc-500 font-mono py-4">No delivery attempt logs recorded yet.</div>;
  }

  return (
    <div className="space-y-3">
      {attempts.map((attempt, index) => {
        const isExpanded = expandedIndex === index;
        const isReplay = attempt.type === 'REPLAY';

        return (
          <div
            key={index}
            className="bg-[#0F1117] border border-[#1E232F] rounded-lg overflow-hidden transition-all"
          >
            <button
              onClick={() => setExpandedIndex(isExpanded ? null : index)}
              className="w-full flex items-center justify-between p-3.5 hover:bg-zinc-900/50 transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                {isExpanded ? (
                  <ChevronDown className="w-4 h-4 text-zinc-400" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-zinc-400" />
                )}
                <span className="text-xs font-mono font-semibold text-white">
                  Attempt #{attempt.attemptNumber}
                </span>
                {isReplay && (
                  <span className="px-1.5 py-0.5 text-[10px] font-mono font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded">
                    REPLAY
                  </span>
                )}
                <StatusBadge status={attempt.status} />
              </div>

              <div className="flex items-center gap-4 text-xs font-mono text-zinc-400">
                <span className="flex items-center gap-1">
                  <Server className="w-3.5 h-3.5 text-zinc-500" />
                  HTTP {attempt.httpStatus || 'N/A'}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-zinc-500" />
                  {formatDuration(attempt.latency)}
                </span>
                <span className="hidden sm:inline text-zinc-500">{formatDate(attempt.timestamp)}</span>
              </div>
            </button>

            {isExpanded && (
              <div className="p-4 border-t border-[#1E232F] bg-black/40 space-y-4 font-mono text-xs">
                {attempt.error && (
                  <div className="p-2.5 bg-red-950/20 border border-red-900/30 rounded text-red-300 text-xs">
                    <span className="font-semibold text-red-400">Error: </span>
                    {attempt.error}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h5 className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                      Request Headers
                    </h5>
                    <pre className="p-3 bg-[#08090C] border border-[#1E232F] rounded text-zinc-300 overflow-x-auto text-[11px] max-h-40">
                      {JSON.stringify(attempt.requestHeaders || {}, null, 2)}
                    </pre>
                  </div>
                  <div>
                    <h5 className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                      Response Headers
                    </h5>
                    <pre className="p-3 bg-[#08090C] border border-[#1E232F] rounded text-zinc-300 overflow-x-auto text-[11px] max-h-40">
                      {JSON.stringify(attempt.responseHeaders || {}, null, 2)}
                    </pre>
                  </div>
                </div>

                {attempt.responseBody && (
                  <div>
                    <h5 className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                      Response Body
                    </h5>
                    <pre className="p-3 bg-[#08090C] border border-[#1E232F] rounded text-emerald-400/90 overflow-x-auto text-[11px] max-h-48">
                      {typeof attempt.responseBody === 'object'
                        ? JSON.stringify(attempt.responseBody, null, 2)
                        : attempt.responseBody}
                    </pre>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default AttemptTimeline;
