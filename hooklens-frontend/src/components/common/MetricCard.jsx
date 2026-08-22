import React from 'react';

export const MetricCard = ({ title, value, subtext, icon: Icon, trend }) => {
  return (
    <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl p-4 relative overflow-hidden transition-all hover:border-[var(--border-strong)] shadow-sm">
      <div className="flex items-center justify-between">
        <span className="text-[11px] text-[var(--text-muted)] font-mono font-medium tracking-wide uppercase">{title}</span>
        {Icon && <Icon className="w-4 h-4 text-[var(--text-muted)]" />}
      </div>
      <div className="mt-2 flex items-baseline gap-2">
        <span className="text-2xl font-semibold font-mono tracking-tight text-[var(--text-primary)]">{value}</span>
        {trend && (
          <span
            className={`text-xs font-mono font-medium ${
              trend.startsWith('+') ? 'text-emerald-500' : 'text-red-500'
            }`}
          >
            {trend}
          </span>
        )}
      </div>
      {subtext && <p className="mt-1 text-xs text-[var(--text-muted)] font-mono">{subtext}</p>}
    </div>
  );
};

export default MetricCard;
