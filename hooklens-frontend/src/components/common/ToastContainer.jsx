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
            className={`pointer-events-auto flex items-start gap-3 p-3 rounded-lg border shadow-xl backdrop-blur-md transition-all animate-slide-up ${
              isSuccess
                ? 'bg-emerald-950/90 border-emerald-800/50 text-emerald-100'
                : isError
                ? 'bg-red-950/90 border-red-800/50 text-red-100'
                : 'bg-zinc-900/90 border-zinc-800 text-zinc-100'
            }`}
          >
            {isSuccess ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            ) : isError ? (
              <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            ) : (
              <Info className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
            )}
            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-semibold">{toast.title}</h4>
              <p className="text-[11px] opacity-80 truncate font-mono mt-0.5">{toast.description}</p>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-zinc-400 hover:text-white shrink-0 p-0.5"
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
