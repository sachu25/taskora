import React from 'react';
import { AlertCircle, ShieldAlert, ShieldX, Info } from 'lucide-react';
import type { IssueSeverity } from '../../types';

interface Props {
  severity: IssueSeverity | null | undefined;
  className?: string;
}

export const IssueSeverityBadge: React.FC<Props> = ({ severity, className = '' }) => {
  if (!severity) return null;

  const config = {
    minor: { label: 'Minor', icon: Info, color: 'text-slate-300 bg-slate-800/80 border-slate-700' },
    major: { label: 'Major', icon: AlertCircle, color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
    critical: { label: 'Critical', icon: ShieldAlert, color: 'text-orange-400 bg-orange-500/10 border-orange-500/20' },
    blocker: { label: 'Blocker', icon: ShieldX, color: 'text-red-400 bg-red-500/10 border-red-500/20 font-bold' },
  };

  const { label, icon: Icon, color } = config[severity] || config.major;

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded border text-[11px] font-medium ${color} ${className}`}
      title={`Severity: ${label}`}
    >
      <Icon className="w-3 h-3 shrink-0" />
      <span>{label}</span>
    </span>
  );
};
