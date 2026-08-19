import React from 'react';
import { Bug, CheckSquare, BookOpen, Sparkles, AlertTriangle } from 'lucide-react';
import type { IssueType } from '../../types';

interface Props {
  type: IssueType;
  showLabel?: boolean;
  className?: string;
}

export const IssueTypeBadge: React.FC<Props> = ({ type, showLabel = true, className = '' }) => {
  const config = {
    bug: { label: 'Bug', icon: Bug, color: 'text-red-400 bg-red-500/10 border-red-500/20' },
    task: { label: 'Task', icon: CheckSquare, color: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
    story: { label: 'Story', icon: BookOpen, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
    feature: { label: 'Feature', icon: Sparkles, color: 'text-purple-400 bg-purple-500/10 border-purple-500/20' },
    improvement: { label: 'Improvement', icon: AlertTriangle, color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
  };

  const { label, icon: Icon, color } = config[type] || config.task;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md border text-[11px] font-medium transition-colors ${color} ${className}`}
      title={`Issue Type: ${label}`}
    >
      <Icon className="w-3 h-3 shrink-0" />
      {showLabel && <span>{label}</span>}
    </span>
  );
};
