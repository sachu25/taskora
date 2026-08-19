import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Bell, CheckCheck, Trash2, Filter, Settings, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { notificationService } from '../services/notificationService';
import { NotificationItem } from '../components/notifications/NotificationItem';
import { Button } from '../components/ui/Button';

export const NotificationsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [filterRead, setFilterRead] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [page, setPage] = useState(1);

  const { data: notifData, isLoading, refetch } = useQuery({
    queryKey: ['notifications', 'page', page, filterRead, filterType],
    queryFn: () =>
      notificationService.getNotifications({
        page,
        per_page: 20,
        read: filterRead === 'all' ? undefined : filterRead === 'read',
        type: filterType === 'all' ? undefined : filterType,
      }),
  });

  const markReadMutation = useMutation({
    mutationFn: (id: string) => notificationService.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const markUnreadMutation = useMutation({
    mutationFn: (id: string) => notificationService.markAsUnread(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => notificationService.deleteNotification(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const markAllReadMutation = useMutation({
    mutationFn: () => notificationService.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const deleteAllReadMutation = useMutation({
    mutationFn: () => notificationService.deleteAllRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const notifications = notifData?.data?.items ?? [];
  const pagination = notifData?.data?.pagination;

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 p-6 rounded-2xl border border-slate-800 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
            <Bell className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-100">Notifications</h1>
            <p className="text-xs text-slate-400 mt-1">Manage and review all your organization notifications.</p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => markAllReadMutation.mutate()}
            isLoading={markAllReadMutation.isPending}
          >
            <CheckCheck className="w-3.5 h-3.5 mr-1.5" /> Mark All Read
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => deleteAllReadMutation.mutate()}
            isLoading={deleteAllReadMutation.isPending}
          >
            <Trash2 className="w-3.5 h-3.5 mr-1.5 text-rose-400" /> Clear Read
          </Button>

          <Link to="/settings/notification-preferences">
            <Button variant="secondary" size="sm">
              <Settings className="w-3.5 h-3.5 mr-1.5" /> Preferences
            </Button>
          </Link>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 bg-slate-900/40 rounded-xl border border-slate-800">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-500 shrink-0" />
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              value={filterRead}
              onChange={(e) => {
                setFilterRead(e.target.value);
                setPage(1);
              }}
              className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="all">All Notifications</option>
              <option value="unread">Unread Only</option>
              <option value="read">Read Only</option>
            </select>

            <select
              value={filterType}
              onChange={(e) => {
                setFilterType(e.target.value);
                setPage(1);
              }}
              className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="all">All Event Types</option>
              <option value="issue.assigned">Issue Assigned</option>
              <option value="issue.commented">Issue Commented</option>
              <option value="issue.status_changed">Issue Status Changed</option>
              <option value="sprint.started">Sprint Events</option>
              <option value="release.started">Release Events</option>
            </select>
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

      {/* List */}
      {isLoading ? (
        <div className="p-12 text-center text-xs text-slate-400 animate-pulse">Loading notifications...</div>
      ) : notifications.length === 0 ? (
        <div className="p-12 text-center bg-slate-900/40 rounded-2xl border border-slate-800">
          <Bell className="w-8 h-8 text-slate-600 mx-auto mb-2" />
          <h3 className="text-sm font-semibold text-slate-200">No Notifications Found</h3>
          <p className="text-xs text-slate-400 mt-1">There are no notifications matching your selected criteria.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((notif) => (
            <NotificationItem
              key={notif.id}
              notification={notif}
              onMarkRead={(id) => markReadMutation.mutate(id)}
              onMarkUnread={(id) => markUnreadMutation.mutate(id)}
              onDelete={(id) => deleteMutation.mutate(id)}
            />
          ))}
        </div>
      )}

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
