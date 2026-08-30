import React from 'react';
import { useRealtime } from '../../context/RealtimeContext.jsx';
import { X, CheckCircle2, AlertTriangle, Info } from 'lucide-react';

export const ToastContainer = () => {
  const { toasts, removeToast } = useRealtime();

  if (!toasts.length) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        const isSuccess = toast.type === 'success';
        const isError = toast.type === 'error';

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-3 rounded-xl border shadow-lg backdrop-blur-md transition-all font-mono text-xs ${
              isSuccess
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
                : isError
                ? 'bg-red-500/10 border-red-500/30 text-red-600 dark:text-red-400'
                : 'bg-[var(--bg-surface)] border-[var(--border-subtle)] text-[var(--text-primary)]'
            }`}
          >
            {isSuccess ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
            ) : isError ? (
              <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
            ) : (
              <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
            )}
            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-semibold font-sans tracking-tight">{toast.title}</h4>
              <p className="text-[11px] opacity-90 truncate font-mono mt-0.5">{toast.description}</p>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              aria-label="Close notification"
              className="text-[var(--text-muted)] hover:text-[var(--text-primary)] shrink-0 p-0.5 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};

export default ToastContainer;
