import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Activity as ActivityIcon, Filter, RefreshCw } from 'lucide-react';
import { activityService } from '../services/activityService';
import { ActivityFeed } from '../components/activity/ActivityFeed';
import { Button } from '../components/ui/Button';

export const ActivityPage: React.FC = () => {
  const [page, setPage] = useState(1);
  const [actionFilter, setActionFilter] = useState<string>('all');

  const { data: actData, isLoading, refetch } = useQuery({
    queryKey: ['activity', 'organization', page, actionFilter],
    queryFn: () =>
      activityService.getOrganizationActivity({
        page,
        per_page: 25,
        action: actionFilter === 'all' ? undefined : actionFilter,
      }),
  });

  const activities = actData?.data?.items ?? [];
  const pagination = actData?.data?.pagination;

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 p-6 rounded-2xl border border-slate-800 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
            <ActivityIcon className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-100">Activity Log</h1>
            <p className="text-xs text-slate-400 mt-1">Audit log of all actions across your organization.</p>
          </div>
        </div>

        <button
          onClick={() => refetch()}
          className="p-2 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800 transition-colors"
          title="Refresh"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex items-center gap-3 p-4 bg-slate-900/40 rounded-xl border border-slate-800">
        <Filter className="w-4 h-4 text-slate-500 shrink-0" />
        <select
          value={actionFilter}
          onChange={(e) => {
            setActionFilter(e.target.value);
            setPage(1);
          }}
          className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
        >
          <option value="all">All Actions</option>
          <option value="issue.created">Issue Created</option>
          <option value="issue.updated">Issue Updated</option>
          <option value="issue.deleted">Issue Deleted</option>
          <option value="sprint.started">Sprint Started</option>
          <option value="release.started">Release Started</option>
        </select>
      </div>

      {/* Feed */}
      <ActivityFeed activities={activities} isLoading={isLoading} />

      {/* Pagination */}
      {pagination && pagination.last_page > 1 && (
        <div className="flex items-center justify-between pt-4 border-t border-slate-800 text-xs text-slate-400">
          <span>
            Page {pagination.current_page} of {pagination.last_page} ({pagination.total} total)
          </span>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              disabled={page === 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Previous
            </Button>
            <Button
              variant="secondary"
              size="sm"
              disabled={page === pagination.last_page}
              onClick={() => setPage((p) => Math.min(pagination.last_page, p + 1))}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
