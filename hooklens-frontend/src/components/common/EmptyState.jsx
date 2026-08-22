import React from 'react';
import { Inbox } from 'lucide-react';

export const EmptyState = ({ title = 'No data available', description, actionLabel, onAction }) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center bg-[#0F1117] border border-[#1E232F] rounded-lg my-4">
      <div className="w-12 h-12 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-4 text-zinc-400">
        <Inbox className="w-6 h-6" />
      </div>
      <h3 className="text-sm font-semibold text-white tracking-tight">{title}</h3>
      {description && <p className="mt-1 text-xs text-zinc-400 max-w-sm">{description}</p>}
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="mt-4 px-3 py-1.5 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded border border-indigo-500 transition-colors"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
