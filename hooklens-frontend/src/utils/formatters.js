// Utility functions for formatting values across HookLens

export const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).format(date);
};

export const formatDuration = (ms) => {
  if (ms === undefined || ms === null) return '0ms';
  if (ms < 1000) return `${Math.round(ms)}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
};

export const formatBytes = (bytes) => {
  if (!bytes) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};

export const maskSecret = (secret) => {
  if (!secret) return 'whsec_••••••••••••';
  if (secret.length <= 8) return '••••••••••••';
  return `${secret.substring(0, 6)}••••••••••••${secret.substring(secret.length - 4)}`;
};

export const getStatusColor = (status) => {
  switch (status?.toUpperCase()) {
    case 'SUCCESS':
    case 'DELIVERED':
    case '200':
      return {
        bg: 'bg-emerald-500/10',
        text: 'text-emerald-400',
        border: 'border-emerald-500/20',
        dot: 'bg-emerald-400',
      };
    case 'FAILED':
    case 'FAILURE':
    case '500':
    case '503':
      return {
        bg: 'bg-red-500/10',
        text: 'text-red-400',
        border: 'border-red-500/20',
        dot: 'bg-red-400',
      };
    case 'RETRYING':
    case 'RETRY':
      return {
        bg: 'bg-amber-500/10',
        text: 'text-amber-400',
        border: 'border-amber-500/20',
        dot: 'bg-amber-400',
      };
    case 'QUEUED':
    case 'PENDING':
      return {
        bg: 'bg-zinc-500/10',
        text: 'text-zinc-400',
        border: 'border-zinc-500/20',
        dot: 'bg-zinc-400',
      };
    case 'DEAD_LETTERED':
    case 'DLQ':
      return {
        bg: 'bg-purple-500/10',
        text: 'text-purple-400',
        border: 'border-purple-500/20',
        dot: 'bg-purple-400',
      };
    default:
      return {
        bg: 'bg-zinc-500/10',
        text: 'text-zinc-400',
        border: 'border-zinc-500/20',
        dot: 'bg-zinc-400',
      };
  }
};
