import React from 'react';
import { Card } from '../ui/Card';
import { Layers, TestTube2, PlayCircle, CheckCircle2, AlertOctagon, Percent } from 'lucide-react';

interface Props {
  totalSuites: number;
  totalCases: number;
  activeRuns: number;
  passedCount: number;
  failedCount: number;
  blockedCount: number;
  totalExecutions: number;
}

export const QASummaryCards: React.FC<Props> = ({
  totalSuites,
  totalCases,
  activeRuns,
  passedCount,
  failedCount,
  blockedCount,
  totalExecutions,
}) => {
  const passRate = totalExecutions > 0 ? Math.round((passedCount / totalExecutions) * 100) : 0;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
      <Card className="p-4">
        <div className="flex items-center gap-2 text-slate-400 mb-1 text-xs">
          <Layers className="w-4 h-4 text-indigo-400" />
          <span>Test Suites</span>
        </div>
        <div className="text-2xl font-bold text-slate-100">{totalSuites}</div>
      </Card>

      <Card className="p-4">
        <div className="flex items-center gap-2 text-slate-400 mb-1 text-xs">
          <TestTube2 className="w-4 h-4 text-sky-400" />
          <span>Test Cases</span>
        </div>
        <div className="text-2xl font-bold text-slate-100">{totalCases}</div>
      </Card>

      <Card className="p-4">
        <div className="flex items-center gap-2 text-slate-400 mb-1 text-xs">
          <PlayCircle className="w-4 h-4 text-indigo-400" />
          <span>Active Runs</span>
        </div>
        <div className="text-2xl font-bold text-slate-100">{activeRuns}</div>
      </Card>

      <Card className="p-4">
        <div className="flex items-center gap-2 text-slate-400 mb-1 text-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>Passed / Failed</span>
        </div>
        <div className="flex items-baseline gap-1.5 text-2xl font-bold">
          <span className="text-emerald-400">{passedCount}</span>
          <span className="text-slate-600 text-lg">/</span>
          <span className="text-rose-400">{failedCount}</span>
        </div>
      </Card>

      <Card className="p-4">
        <div className="flex items-center gap-2 text-slate-400 mb-1 text-xs">
          <AlertOctagon className="w-4 h-4 text-amber-400" />
          <span>Blocked</span>
        </div>
        <div className="text-2xl font-bold text-amber-400">{blockedCount}</div>
      </Card>

      <Card className="p-4">
        <div className="flex items-center gap-2 text-slate-400 mb-1 text-xs">
          <Percent className="w-4 h-4 text-violet-400" />
          <span>Pass Rate</span>
        </div>
        <div className="text-2xl font-bold text-indigo-400">{passRate}%</div>
      </Card>
    </div>
  );
};
