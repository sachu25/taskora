import React from 'react';

interface Props {
  passed: number;
  failed: number;
  blocked: number;
  skipped: number;
  notRun: number;
  showLabels?: boolean;
}

export const QAProgress: React.FC<Props> = ({
  passed,
  failed,
  blocked,
  skipped,
  notRun,
  showLabels = true,
}) => {
  const total = passed + failed + blocked + skipped + notRun;

  if (total === 0) {
    return (
      <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
        <div className="bg-slate-700 h-full w-full" />
      </div>
    );
  }

  const pPassed = (passed / total) * 100;
  const pFailed = (failed / total) * 100;
  const pBlocked = (blocked / total) * 100;
  const pSkipped = (skipped / total) * 100;
  const pNotRun = (notRun / total) * 100;

  return (
    <div className="space-y-2">
      <div className="w-full bg-slate-800 rounded-full h-2.5 flex overflow-hidden">
        {pPassed > 0 && <div style={{ width: `${pPassed}%` }} className="bg-emerald-500 transition-all duration-300" title={`Passed: ${passed}`} />}
        {pFailed > 0 && <div style={{ width: `${pFailed}%` }} className="bg-rose-500 transition-all duration-300" title={`Failed: ${failed}`} />}
        {pBlocked > 0 && <div style={{ width: `${pBlocked}%` }} className="bg-amber-500 transition-all duration-300" title={`Blocked: ${blocked}`} />}
        {pSkipped > 0 && <div style={{ width: `${pSkipped}%` }} className="bg-violet-500 transition-all duration-300" title={`Skipped: ${skipped}`} />}
        {pNotRun > 0 && <div style={{ width: `${pNotRun}%` }} className="bg-slate-700 transition-all duration-300" title={`Not Run: ${notRun}`} />}
      </div>

      {showLabels && (
        <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-400 gap-2 font-medium">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Passed: {passed}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            <span>Failed: {failed}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <span>Blocked: {blocked}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-violet-500" />
            <span>Skipped: {skipped}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-slate-700" />
            <span>Not Run: {notRun}</span>
          </div>
        </div>
      )}
    </div>
  );
};
