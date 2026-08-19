import React from 'react';
import type { TestCaseStatus } from '../../types/qa';

interface Props {
  status: TestCaseStatus;
  size?: 'sm' | 'md';
}

export const TestCaseStatusBadge: React.FC<Props> = ({ status, size = 'md' }) => {
  const styles: Record<TestCaseStatus, { label: string; class: string }> = {
    draft: { label: 'Draft', class: 'bg-amber-500/10 border-amber-500/30 text-amber-400' },
    ready: { label: 'Ready', class: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' },
    deprecated: { label: 'Deprecated', class: 'bg-slate-500/10 border-slate-500/30 text-slate-400' },
  };

  const current = styles[status] || styles.draft;
  const padding = size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs';

  return (
    <span className={`inline-flex items-center font-semibold border rounded-md uppercase tracking-wider ${padding} ${current.class}`}>
      {current.label}
    </span>
  );
};
