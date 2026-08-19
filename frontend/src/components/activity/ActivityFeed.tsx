import React from 'react';
import type { Activity } from '../../types/notification';
import { ActivityItem } from './ActivityItem';
import { Activity as ActivityIcon } from 'lucide-react';

interface ActivityFeedProps {
  activities: Activity[];
  isLoading?: boolean;
  emptyMessage?: string;
}

export const ActivityFeed: React.FC<ActivityFeedProps> = ({
  activities,
  isLoading = false,
  emptyMessage = 'No activity recorded yet.',
}) => {
  if (isLoading) {
    return <div className="p-8 text-center text-xs text-slate-400 animate-pulse">Loading activity history...</div>;
  }

  if (activities.length === 0) {
    return (
      <div className="p-12 text-center bg-slate-900/40 rounded-2xl border border-slate-800/80">
        <ActivityIcon className="w-8 h-8 text-slate-600 mx-auto mb-2" />
        <h4 className="text-xs font-semibold text-slate-300">No Activity Logs</h4>
        <p className="text-[11px] text-slate-500 mt-1">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="space-y-2.5">
      {activities.map((act) => (
        <ActivityItem key={act.id} activity={act} />
      ))}
    </div>
  );
};
