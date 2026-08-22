import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

export const ErrorState = ({ title = 'Failed to load data', message, onRetry }) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center bg-red-950/10 border border-red-900/20 rounded-lg my-4">
      <AlertCircle className="w-8 h-8 text-red-400 mb-2" />
      <h3 className="text-sm font-semibold text-red-300">{title}</h3>
      {message && <p className="mt-1 text-xs text-red-400/80 max-w-sm">{message}</p>}
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-4 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-medium text-red-200 bg-red-900/30 hover:bg-red-900/50 border border-red-800/40 rounded transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Try Again
        </button>
      )}
    </div>
  );
};

export default ErrorState;
