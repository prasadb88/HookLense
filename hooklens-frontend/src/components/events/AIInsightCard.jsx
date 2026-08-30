import React from 'react';
import { Sparkles, CheckCircle2, RotateCcw, AlertTriangle } from 'lucide-react';

export const AIInsightCard = ({ diagnosis, onReplay, onViewAttempts }) => {
  if (!diagnosis) return null;

  return (
    <div className="bg-[var(--bg-surface)] border border-indigo-500/30 rounded-xl p-5 shadow-xl relative overflow-hidden font-sans">
      <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none" />

      <div className="flex items-center justify-between mb-4 font-mono">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          <h4 className="text-xs font-semibold text-[var(--text-primary)] tracking-wide uppercase">
            AI-Assisted Diagnosis
          </h4>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
          Confidence: {diagnosis.confidence || '94%'}
        </span>
      </div>

      <div className="mb-4">
        <h5 className="text-xs font-semibold text-[var(--text-primary)] mb-1 font-mono">Why did this fail?</h5>
        <p className="text-xs text-[var(--text-secondary)] leading-relaxed font-sans">{diagnosis.summary}</p>
      </div>

      {diagnosis.evidence && diagnosis.evidence.length > 0 && (
        <div className="mb-4">
          <h6 className="text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-2 font-mono">
            Evidence Gathered
          </h6>
          <ul className="space-y-1.5 font-mono">
            {diagnosis.evidence.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2 text-xs text-[var(--text-secondary)]">
                <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {diagnosis.recommendation && (
        <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg mb-4">
          <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 text-xs font-semibold mb-1 font-mono">
            <AlertTriangle className="w-3.5 h-3.5" />
            Recommended Action
          </div>
          <p className="text-xs text-amber-700 dark:text-amber-300 font-sans">{diagnosis.recommendation}</p>
        </div>
      )}

      <div className="flex items-center gap-2 pt-2 border-t border-[var(--border-subtle)] font-mono">
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
            className="px-3 py-2 text-xs font-mono text-[var(--text-secondary)] hover:text-[var(--text-primary)] bg-[var(--bg-app)] hover:bg-[var(--bg-elevated)] rounded-lg border border-[var(--border-subtle)] transition-colors"
          >
            View Attempts
          </button>
        )}
      </div>
    </div>
  );
};

export default AIInsightCard;
