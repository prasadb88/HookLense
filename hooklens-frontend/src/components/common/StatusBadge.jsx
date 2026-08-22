import React from 'react';

export const StatusBadge = ({ status, className = '' }) => {
  const getStyles = () => {
    switch (status?.toUpperCase()) {
      case 'SUCCESS':
      case 'DELIVERED':
      case '200':
        return {
          bg: 'bg-emerald-500/10 dark:bg-emerald-500/15',
          text: 'text-emerald-600 dark:text-emerald-400',
          border: 'border-emerald-500/30',
          dot: 'bg-emerald-500',
        };
      case 'FAILED':
      case 'FAILURE':
      case '500':
      case '503':
      case '404':
        return {
          bg: 'bg-red-500/10 dark:bg-red-500/15',
          text: 'text-red-600 dark:text-red-400',
          border: 'border-red-500/30',
          dot: 'bg-red-500',
        };
      case 'RETRYING':
      case 'RETRY':
        return {
          bg: 'bg-amber-500/10 dark:bg-amber-500/15',
          text: 'text-amber-600 dark:text-amber-400',
          border: 'border-amber-500/30',
          dot: 'bg-amber-500',
        };
      case 'QUEUED':
      case 'PENDING':
        return {
          bg: 'bg-blue-500/10 dark:bg-blue-500/15',
          text: 'text-blue-600 dark:text-blue-400',
          border: 'border-blue-500/30',
          dot: 'bg-blue-500',
        };
      case 'DEAD_LETTERED':
      case 'DLQ':
        return {
          bg: 'bg-purple-500/10 dark:bg-purple-500/15',
          text: 'text-purple-600 dark:text-purple-400',
          border: 'border-purple-500/30',
          dot: 'bg-purple-500',
        };
      default:
        return {
          bg: 'bg-zinc-500/10 dark:bg-zinc-500/15',
          text: 'text-zinc-600 dark:text-zinc-400',
          border: 'border-zinc-500/30',
          dot: 'bg-zinc-500',
        };
    }
  };

  const style = getStyles();

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-mono font-medium border ${style.bg} ${style.text} ${style.border} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${style.dot} animate-pulse`} />
      {status || 'UNKNOWN'}
    </span>
  );
};

export default StatusBadge;
