import React from 'react';

interface SprintProgressProps {
  total: number;
  completed: number;
  inProgress?: number;
  todo?: number;
  className?: string;
}

export const SprintProgress: React.FC<SprintProgressProps> = ({
  total,
  completed,
  inProgress = 0,
  todo = 0,
  className = '',
}) => {
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center justify-between text-xs">
        <span className="font-semibold text-slate-300">Sprint Progress</span>
        <span className="font-mono text-emerald-400 font-bold">{percentage}%</span>
      </div>

      <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden flex">
        {total > 0 && (
          <>
            <div
              style={{ width: `${(completed / total) * 100}%` }}
              className="h-full bg-emerald-500 transition-all duration-300"
              title={`Completed: ${completed}`}
            />
            <div
              style={{ width: `${(inProgress / total) * 100}%` }}
              className="h-full bg-amber-500 transition-all duration-300"
              title={`In Progress: ${inProgress}`}
            />
            <div
              style={{ width: `${(todo / total) * 100}%` }}
              className="h-full bg-slate-700 transition-all duration-300"
              title={`Todo: ${todo}`}
            />
          </>
        )}
      </div>

      <div className="flex items-center justify-between text-[11px] text-slate-400 pt-0.5">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          {completed} Done
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-amber-500" />
          {inProgress} In Progress
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-slate-700" />
          {todo} Todo
        </span>
      </div>
    </div>
  );
};
