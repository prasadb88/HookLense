import React from 'react';
import { Loader2 } from 'lucide-react';

export const LoadingState = ({ message = 'Loading observability metrics...' }) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center my-4">
      <Loader2 className="w-6 h-6 text-blue-500 animate-spin mb-3" />
      <span className="text-xs text-[var(--text-muted)] font-mono">{message}</span>
    </div>
  );
};

export default LoadingState;
