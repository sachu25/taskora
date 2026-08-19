import React from 'react';
import type { Activity } from '../../types/notification';
import {
  FileText,
  CheckSquare,
  Play,
  Rocket,
  PlusCircle,
  Edit,
  Trash2,
  Clock,
} from 'lucide-react';

interface ActivityItemProps {
  activity: Activity;
}

export const ActivityItem: React.FC<ActivityItemProps> = ({ activity }) => {
  const getIcon = (action: string) => {
    if (action.startsWith('issue.')) return <FileText className="w-4 h-4 text-sky-400" />;
    if (action.startsWith('sprint.')) return <Play className="w-4 h-4 text-purple-400" />;
    if (action.startsWith('release.')) return <Rocket className="w-4 h-4 text-emerald-400" />;
    if (action.startsWith('qa.')) return <CheckSquare className="w-4 h-4 text-amber-400" />;
    if (action.includes('created')) return <PlusCircle className="w-4 h-4 text-emerald-400" />;
    if (action.includes('updated')) return <Edit className="w-4 h-4 text-indigo-400" />;
    if (action.includes('deleted')) return <Trash2 className="w-4 h-4 text-rose-400" />;
    return <Clock className="w-4 h-4 text-slate-400" />;
  };

  const userName = activity.user?.name ?? 'System';
  const userInitials = userName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  return (
    <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-900/50 border border-slate-800/80 hover:bg-slate-900/80 transition-all">
      <div className="p-2 rounded-lg bg-slate-800 shrink-0 mt-0.5">
        {getIcon(activity.action)}
      </div>

      <div className="space-y-1 min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <span className="w-6 h-6 rounded-full bg-slate-800 border border-slate-700/60 flex items-center justify-center text-[10px] font-semibold text-slate-300 shrink-0">
              {userInitials}
            </span>
            <span className="text-xs font-medium text-slate-200 truncate">{userName}</span>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-400 border border-slate-700/50">
              {activity.action}
            </span>
          </div>
          <span className="text-[10px] text-slate-500 font-mono shrink-0">
            {new Date(activity.created_at).toLocaleString()}
          </span>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">{activity.description}</p>
      </div>
    </div>
  );
};
