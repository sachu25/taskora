import React from 'react';
import type { SprintStatus } from '../../types';

interface SprintStatusBadgeProps {
  status: SprintStatus;
  className?: string;
}

export const SprintStatusBadge: React.FC<SprintStatusBadgeProps> = ({
  status,
  className = '',
}) => {
  const configs: Record<SprintStatus, { label: string; styles: string }> = {
    planned: {
      label: 'Planned',
      styles: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
    },
    active: {
      label: 'Active',
      styles: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-sm shadow-emerald-500/10',
    },
    completed: {
      label: 'Completed',
      styles: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    },
    cancelled: {
      label: 'Cancelled',
      styles: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    },
  };

  const config = configs[status] || configs.planned;

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${config.styles} ${className}`}
    >
      {config.label}
    </span>
  );
};
