import React from 'react';
import { Circle, Clock, CheckCircle2, Archive } from 'lucide-react';
import type { IssueStatus } from '../../types';

interface Props {
  status: IssueStatus;
  className?: string;
}

export const IssueStatusBadge: React.FC<Props> = ({ status, className = '' }) => {
  const config = {
    backlog: { label: 'Backlog', icon: Archive, color: 'text-slate-400 bg-slate-800/80 border-slate-700' },
    todo: { label: 'To Do', icon: Circle, color: 'text-sky-400 bg-sky-500/10 border-sky-500/20' },
    in_progress: { label: 'In Progress', icon: Clock, color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
    done: { label: 'Done', icon: CheckCircle2, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
  };

  const { label, icon: Icon, color } = config[status] || config.todo;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-xs font-semibold uppercase tracking-wider ${color} ${className}`}
    >
      <Icon className="w-3 h-3 shrink-0" />
      <span>{label}</span>
    </span>
  );
};
