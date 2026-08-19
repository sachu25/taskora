import React from 'react';
import { ArrowDown, ArrowUp, Flame, Minus } from 'lucide-react';
import type { IssuePriority } from '../../types';

interface Props {
  priority: IssuePriority;
  showLabel?: boolean;
  className?: string;
}

export const IssuePriorityBadge: React.FC<Props> = ({ priority, showLabel = true, className = '' }) => {
  const config = {
    low: { label: 'Low', icon: ArrowDown, color: 'text-slate-400 bg-slate-800 border-slate-700' },
    medium: { label: 'Medium', icon: Minus, color: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
    high: { label: 'High', icon: ArrowUp, color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
    urgent: { label: 'Urgent', icon: Flame, color: 'text-rose-400 bg-rose-500/10 border-rose-500/20 animate-pulse' },
  };

  const { label, icon: Icon, color } = config[priority] || config.medium;

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded border text-[11px] font-semibold ${color} ${className}`}
      title={`Priority: ${label}`}
    >
      <Icon className="w-3 h-3 shrink-0" />
      {showLabel && <span>{label}</span>}
    </span>
  );
};
