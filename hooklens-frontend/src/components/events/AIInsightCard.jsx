import React from 'react';
import { Sparkles, CheckCircle2, RotateCcw, AlertTriangle } from 'lucide-react';

export const AIInsightCard = ({ diagnosis, onReplay, onViewAttempts }) => {
  if (!diagnosis) return null;

  return (
    <div className="bg-[#0F1117] border border-indigo-500/20 rounded-xl p-5 shadow-xl relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none" />

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-indigo-400" />
          <h4 className="text-xs font-semibold text-white tracking-wide uppercase">
            AI-Assisted Diagnosis
          </h4>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
          Confidence: {diagnosis.confidence || '94%'}
        </span>
      </div>

      <div className="mb-4">
        <h5 className="text-xs font-semibold text-zinc-200 mb-1">Why did this fail?</h5>
        <p className="text-xs text-zinc-400 leading-relaxed font-sans">{diagnosis.summary}</p>
      </div>

      {diagnosis.evidence && diagnosis.evidence.length > 0 && (
        <div className="mb-4">
          <h6 className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-2">
            Evidence Gathered
          </h6>
          <ul className="space-y-1.5">
            {diagnosis.evidence.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2 text-xs text-zinc-300 font-mono">
                <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {diagnosis.recommendation && (
        <div className="p-3 bg-amber-950/20 border border-amber-900/30 rounded-lg mb-4">
          <div className="flex items-center gap-1.5 text-amber-400 text-xs font-semibold mb-1">
            <AlertTriangle className="w-3.5 h-3.5" />
            Recommended Action
          </div>
          <p className="text-xs text-amber-200/80 font-sans">{diagnosis.recommendation}</p>
        </div>
      )}

      <div className="flex items-center gap-2 pt-2 border-t border-[#1E232F]">
        {onReplay && (
          <button
            onClick={onReplay}
            className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg border border-indigo-500 transition-colors shadow-sm"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Replay Webhook
          </button>
        )}
        {onViewAttempts && (
          <button
            onClick={onViewAttempts}
            className="px-3 py-2 text-xs font-mono text-zinc-300 hover:text-white bg-zinc-900 hover:bg-zinc-800 rounded-lg border border-zinc-800 transition-colors"
          >
            View Attempts
          </button>
        )}
      </div>
    </div>
  );
};

export default AIInsightCard;
