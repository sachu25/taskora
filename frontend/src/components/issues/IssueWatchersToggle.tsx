import React from 'react';
import { Eye, EyeOff, Loader2 } from 'lucide-react';

interface Props {
  isWatching: boolean;
  watchersCount?: number;
  onToggleWatch: () => Promise<void>;
  isLoading?: boolean;
}

export const IssueWatchersToggle: React.FC<Props> = ({
  isWatching,
  watchersCount = 0,
  onToggleWatch,
  isLoading = false,
}) => {
  return (
    <button
      onClick={onToggleWatch}
      disabled={isLoading}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
        isWatching
          ? 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30 hover:bg-indigo-500/25'
          : 'bg-slate-800/80 text-slate-400 border-slate-700/80 hover:text-slate-200 hover:bg-slate-800'
      }`}
    >
      {isLoading ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
      ) : isWatching ? (
        <EyeOff className="w-3.5 h-3.5" />
      ) : (
        <Eye className="w-3.5 h-3.5" />
      )}
      <span>{isWatching ? 'Watching' : 'Watch'}</span>
      {Boolean(watchersCount) && (
        <span className="px-1.5 py-0.2 rounded bg-slate-800 text-[10px] font-mono text-slate-300">
          {watchersCount}
        </span>
      )}
    </button>
  );
};
