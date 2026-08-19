import React from 'react';
import type { ExecutionStatus } from '../../types/qa';
import { CheckCircle2, XCircle, AlertOctagon, FastForward, CircleDot } from 'lucide-react';

interface Props {
  status: ExecutionStatus;
  size?: 'sm' | 'md';
}

export const ExecutionStatusBadge: React.FC<Props> = ({ status, size = 'md' }) => {
  const styles: Record<ExecutionStatus, { label: string; class: string; icon: React.FC<{ className?: string }> }> = {
    not_run: { label: 'Not Run', class: 'bg-slate-800/80 border-slate-700 text-slate-400', icon: CircleDot },
    passed: { label: 'Passed', class: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400', icon: CheckCircle2 },
    failed: { label: 'Failed', class: 'bg-rose-500/10 border-rose-500/30 text-rose-400', icon: XCircle },
    blocked: { label: 'Blocked', class: 'bg-amber-500/10 border-amber-500/30 text-amber-400', icon: AlertOctagon },
    skipped: { label: 'Skipped', class: 'bg-violet-500/10 border-violet-500/30 text-violet-400', icon: FastForward },
  };

  const current = styles[status] || styles.not_run;
  const Icon = current.icon;
  const padding = size === 'sm' ? 'px-2 py-0.5 text-[10px] gap-1' : 'px-2.5 py-1 text-xs gap-1.5';
  const iconSize = size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5';

  return (
    <span className={`inline-flex items-center font-semibold border rounded-md uppercase tracking-wider ${padding} ${current.class}`}>
      <Icon className={iconSize} />
      <span>{current.label}</span>
    </span>
  );
};
