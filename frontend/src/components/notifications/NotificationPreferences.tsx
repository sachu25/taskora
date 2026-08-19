import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Bell, RefreshCcw } from 'lucide-react';
import { notificationService } from '../../services/notificationService';
import { Button } from '../ui/Button';

const PREFERENCE_LABELS: Record<string, { title: string; description: string }> = {
  issue_assigned: {
    title: 'Issue Assigned',
    description: 'Receive notifications when issues are assigned to you.',
  },
  issue_commented: {
    title: 'Issue Comments',
    description: 'Receive notifications when comments are added to issues you watch or report.',
  },
  issue_status_changed: {
    title: 'Issue Status Changes',
    description: 'Receive notifications when issue workflow statuses are updated.',
  },
  issue_mentioned: {
    title: 'User Mentions',
    description: 'Receive notifications when you are @mentioned in issue descriptions or comments.',
  },
  issue_watched: {
    title: 'Watched Issues',
    description: 'Receive notifications for updates on issues you are watching.',
  },
  sprint_started: {
    title: 'Sprint Started',
    description: 'Receive notifications when a sprint starts in your project.',
  },
  sprint_completed: {
    title: 'Sprint Completed',
    description: 'Receive notifications when a sprint completes.',
  },
  sprint_cancelled: {
    title: 'Sprint Cancelled',
    description: 'Receive notifications when a sprint is cancelled.',
  },
  release_started: {
    title: 'Release Started',
    description: 'Receive notifications when a release enters in progress status.',
  },
  release_completed: {
    title: 'Release Completed',
    description: 'Receive notifications when a release is published.',
  },
  release_cancelled: {
    title: 'Release Cancelled',
    description: 'Receive notifications when a release is cancelled.',
  },
  qa_execution_failed: {
    title: 'QA Execution Failures',
    description: 'Receive urgent notifications when test run executions fail.',
  },
  qa_execution_completed: {
    title: 'QA Execution Completed',
    description: 'Receive notifications when automated/manual test runs complete.',
  },
};

export const NotificationPreferences: React.FC = () => {
  const queryClient = useQueryClient();

  const { data: prefData, isLoading } = useQuery({
    queryKey: ['notification-preferences'],
    queryFn: () => notificationService.getPreferences(),
  });

  const toggleMutation = useMutation({
    mutationFn: ({ key, enabled }: { key: string; enabled: boolean }) =>
      notificationService.updatePreference(key, enabled),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-preferences'] });
    },
  });

  const resetMutation = useMutation({
    mutationFn: () => notificationService.resetPreferences(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-preferences'] });
    },
  });

  const preferences = prefData?.data ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-slate-900/80 p-5 rounded-2xl border border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
            <Bell className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-100">Notification Preferences</h3>
            <p className="text-xs text-slate-400 mt-0.5">Customize which events trigger in-app notifications.</p>
          </div>
        </div>

        <Button
          variant="secondary"
          size="sm"
          onClick={() => resetMutation.mutate()}
          isLoading={resetMutation.isPending}
        >
          <RefreshCcw className="w-3.5 h-3.5 mr-1.5" /> Reset to Defaults
        </Button>
      </div>

      {isLoading ? (
        <div className="p-8 text-center text-xs text-slate-400 animate-pulse">Loading preferences...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {preferences.map((pref) => {
            const meta = PREFERENCE_LABELS[pref.preference_key] || {
              title: pref.preference_key,
              description: 'Notification event preference setting.',
            };

            return (
              <div
                key={pref.id}
                className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 flex items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <h4 className="text-xs font-semibold text-slate-200">{meta.title}</h4>
                  <p className="text-[11px] text-slate-400 leading-normal">{meta.description}</p>
                </div>

                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    checked={pref.enabled}
                    onChange={(e) =>
                      toggleMutation.mutate({ key: pref.preference_key, enabled: e.target.checked })
                    }
                    className="sr-only peer"
                    disabled={toggleMutation.isPending}
                  />
                  <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                </label>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
