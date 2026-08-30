import React from 'react';
import { Inbox } from 'lucide-react';

export const EmptyState = ({ title = 'No data available', description, actionLabel, onAction }) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl my-4 shadow-sm font-mono">
      <div className="w-12 h-12 rounded-full bg-[var(--bg-app)] border border-[var(--border-subtle)] flex items-center justify-center mb-4 text-[var(--text-muted)]">
        <Inbox className="w-6 h-6" />
      </div>
      <h3 className="text-sm font-semibold text-[var(--text-primary)] tracking-tight font-sans">{title}</h3>
      {description && <p className="mt-1 text-xs text-[var(--text-muted)] max-w-sm font-sans">{description}</p>}
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="mt-4 px-3 py-1.5 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg border border-indigo-500 transition-colors shadow-sm font-mono"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
