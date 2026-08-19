import React from 'react';
import type { ReleaseIssue } from '../../types/release';

interface ReleaseProgressProps {
  issues?: ReleaseIssue[];
  totalCount?: number;
  showDetails?: boolean;
}

export const ReleaseProgress: React.FC<ReleaseProgressProps> = ({
  issues = [],
  totalCount,
  showDetails = true,
}) => {
  const total = totalCount !== undefined ? totalCount : issues.length;

  if (total === 0) {
    return (
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span>Release Readiness</span>
          <span className="font-mono">0% (0 issues)</span>
        </div>
        <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
          <div className="bg-slate-700 h-full w-0" />
        </div>
      </div>
    );
  }

  const doneCount = issues.filter((i) => i.issue?.status === 'done').length;
  const inProgressCount = issues.filter((i) => i.issue?.status === 'in_progress').length;
  const todoCount = Math.max(0, total - (doneCount + inProgressCount));

  const percentage = Math.round((doneCount / total) * 100);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs">
        <span className="font-medium text-slate-300">Release Completion</span>
        <span className="font-mono font-bold text-indigo-400">{percentage}% ({doneCount}/{total} Done)</span>
      </div>

      <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden flex">
        {doneCount > 0 && (
          <div
            className="bg-emerald-500 h-full transition-all duration-300"
            style={{ width: `${(doneCount / total) * 100}%` }}
            title={`${doneCount} Done`}
          />
        )}
        {inProgressCount > 0 && (
          <div
            className="bg-sky-500 h-full transition-all duration-300"
            style={{ width: `${(inProgressCount / total) * 100}%` }}
            title={`${inProgressCount} In Progress`}
          />
        )}
        {todoCount > 0 && (
          <div
            className="bg-slate-700 h-full transition-all duration-300"
            style={{ width: `${(todoCount / total) * 100}%` }}
            title={`${todoCount} Todo`}
          />
        )}
      </div>

      {showDetails && (
        <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Done: {doneCount}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-sky-500" />
            <span>In Progress: {inProgressCount}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-slate-600" />
            <span>Todo: {todoCount}</span>
          </div>
        </div>
      )}
    </div>
  );
};
