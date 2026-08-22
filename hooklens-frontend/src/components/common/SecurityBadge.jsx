import React from 'react';
import { ShieldCheck, ShieldAlert, AlertTriangle } from 'lucide-react';

export const SecurityBadge = ({ type, severity }) => {
  const getBadgeStyle = () => {
    switch (severity?.toUpperCase()) {
      case 'CRITICAL':
      case 'HIGH':
        return {
          bg: 'bg-red-500/10 text-red-400 border-red-500/20',
          icon: <ShieldAlert className="w-3.5 h-3.5 text-red-400" />,
        };
      case 'MEDIUM':
        return {
          bg: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
          icon: <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />,
        };
      default:
        return {
          bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
          icon: <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />,
        };
    }
  };

  const style = getBadgeStyle();

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-mono border ${style.bg}`}
    >
      {style.icon}
      {type}
    </span>
  );
};

export default SecurityBadge;
