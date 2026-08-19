import React from 'react';
import type { ReleaseStatus } from '../../types/release';

interface ReleaseStatusBadgeProps {
  status: ReleaseStatus;
  size?: 'sm' | 'md' | 'lg';
}

export const ReleaseStatusBadge: React.FC<ReleaseStatusBadgeProps> = ({ status, size = 'md' }) => {
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-[10px]',
    md: 'px-2.5 py-1 text-xs',
    lg: 'px-3 py-1.5 text-xs font-semibold',
  }[size];

  switch (status) {
    case 'planned':
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-full font-medium bg-purple-500/10 text-purple-400 border border-purple-500/20 ${sizeClasses}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
          Planned
        </span>
      );
    case 'in_progress':
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-full font-medium bg-sky-500/10 text-sky-400 border border-sky-500/20 ${sizeClasses}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" />
          In Progress
        </span>
      );
    case 'released':
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-full font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 ${sizeClasses}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          Released
        </span>
      );
    case 'cancelled':
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-full font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20 ${sizeClasses}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
          Cancelled
        </span>
      );
    default:
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-full font-medium bg-slate-800 text-slate-400 border border-slate-700 ${sizeClasses}`}>
          {status}
        </span>
      );
  }
};
