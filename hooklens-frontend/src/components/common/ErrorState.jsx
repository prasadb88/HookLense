import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

export const ErrorState = ({ title = 'Failed to load data', message, onRetry }) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center bg-red-500/10 border border-red-500/20 rounded-xl my-4 font-mono shadow-sm">
      <AlertCircle className="w-8 h-8 text-red-500 mb-2" />
      <h3 className="text-sm font-semibold text-red-500 font-sans tracking-tight">{title}</h3>
      {message && <p className="mt-1 text-xs text-red-500/90 max-w-sm font-sans">{message}</p>}
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-4 inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-mono font-medium text-red-500 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 rounded-lg transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Try Again
        </button>
      )}
    </div>
  );
};

export default ErrorState;
