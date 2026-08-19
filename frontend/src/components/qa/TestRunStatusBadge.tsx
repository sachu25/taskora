import React from 'react';
import type { TestRunStatus } from '../../types/qa';

interface Props {
  status: TestRunStatus;
  size?: 'sm' | 'md';
}

export const TestRunStatusBadge: React.FC<Props> = ({ status, size = 'md' }) => {
  const styles: Record<TestRunStatus, { label: string; class: string }> = {
    planned: { label: 'Planned', class: 'bg-sky-500/10 border-sky-500/30 text-sky-400' },
    active: { label: 'Active', class: 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400' },
    completed: { label: 'Completed', class: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' },
    cancelled: { label: 'Cancelled', class: 'bg-rose-500/10 border-rose-500/30 text-rose-400' },
  };

  const current = styles[status] || styles.planned;
  const padding = size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs';

  return (
    <span className={`inline-flex items-center font-semibold border rounded-md uppercase tracking-wider ${padding} ${current.class}`}>
      {current.label}
    </span>
  );
};
