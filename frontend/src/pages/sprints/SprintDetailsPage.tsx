import React, { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Flag,
  Calendar,
  User as UserIcon,
  Target,
  ArrowLeft,
  Loader2,
  Layers,
  Kanban,
} from 'lucide-react';
import { sprintService } from '../../services/sprintService';
import type { Sprint, SprintIssue } from '../../types';
import { SprintStatusBadge } from '../../components/sprints/SprintStatusBadge';
import { SprintProgress } from '../../components/sprints/SprintProgress';
import { IssueTypeBadge } from '../../components/issues/IssueTypeBadge';
import { IssueStatusBadge } from '../../components/issues/IssueStatusBadge';
import { IssuePriorityBadge } from '../../components/issues/IssuePriorityBadge';

export const SprintDetailsPage: React.FC = () => {
  const { projectId, sprintId } = useParams<{ projectId: string; sprintId: string }>();

  const [sprint, setSprint] = useState<Sprint | null>(null);
  const [sprintIssues, setSprintIssues] = useState<SprintIssue[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSprintData = useCallback(async () => {
    if (!sprintId) return;
    setIsLoading(true);
    setError(null);
    try {
      const [sprintRes, issuesRes] = await Promise.all([
        sprintService.getSprint(sprintId),
        sprintService.listSprintIssues(sprintId, { per_page: 100 }),
      ]);

      if (sprintRes.success) setSprint(sprintRes.data);
      if (issuesRes.success) setSprintIssues(issuesRes.data.items);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load sprint details.');
    } finally {
      setIsLoading(false);
    }
  }, [sprintId]);

  useEffect(() => {
    fetchSprintData();
  }, [fetchSprintData]);

  if (isLoading) {
    return (
      <div className="p-12 text-center text-slate-400 text-xs flex items-center justify-center gap-2">
        <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
        Loading sprint overview...
      </div>
    );
  }

  if (error || !sprint) {
    return (
      <div className="p-6 space-y-4">
        <Link
          to={`/projects/${projectId}/sprints`}
          className="inline-flex items-center gap-2 text-xs font-semibold text-indigo-400 hover:text-indigo-300"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Sprints
        </Link>
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-xs text-rose-400 font-medium">
          {error || 'Sprint not found.'}
        </div>
      </div>
    );
  }

  // Calculate metrics
  const totalIssues = sprintIssues.length;
  const completedIssues = sprintIssues.filter((si) => si.issue.status === 'done').length;
  const inProgressIssues = sprintIssues.filter((si) => si.issue.status === 'in_progress').length;
  const todoIssues = sprintIssues.filter((si) => si.issue.status === 'todo' || si.issue.status === 'backlog').length;

  return (
    <div className="p-6 space-y-6">
      {/* Breadcrumb & Navigation */}
      <div className="flex items-center justify-between">
        <Link
          to={`/projects/${projectId}/sprints`}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Sprints List
        </Link>

        <div className="flex items-center gap-3">
          <Link
            to={`/projects/${projectId}/sprints/${sprint.id}/board`}
            className="px-3 py-1.5 text-xs font-semibold text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 rounded-lg transition-colors flex items-center gap-2"
          >
            <Kanban className="w-3.5 h-3.5 text-emerald-400" />
            Open Kanban Board
          </Link>
          <Link
            to={`/projects/${projectId}/sprint-planning`}
            className="px-3 py-1.5 text-xs font-semibold text-indigo-300 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 rounded-lg transition-colors flex items-center gap-2"
          >
            <Target className="w-3.5 h-3.5" />
            Sprint Planning Workspace
          </Link>
        </div>
      </div>

      {/* Main Sprint Header */}
      <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl space-y-4 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                <Flag className="w-5 h-5 text-indigo-400" />
                {sprint.name}
              </h1>
              <SprintStatusBadge status={sprint.status} />
            </div>
            {sprint.goal && (
              <p className="text-xs text-slate-400 flex items-center gap-2 pt-1">
                <Target className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                {sprint.goal}
              </p>
            )}
          </div>

          {/* Quick Dates */}
          <div className="flex items-center gap-4 text-xs text-slate-400 bg-slate-950/60 p-3 rounded-lg border border-slate-800">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-indigo-400" />
              <span>Start:</span>
              <span className="font-mono text-slate-200 font-medium">
                {sprint.start_date || 'Unassigned'}
              </span>
            </div>
            <span className="text-slate-700">|</span>
            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-indigo-400" />
              <span>End:</span>
              <span className="font-mono text-slate-200 font-medium">
                {sprint.end_date || 'Unassigned'}
              </span>
            </div>
          </div>
        </div>

        {/* Progress Metric Bar */}
        <div className="pt-2 border-t border-slate-800/80">
          <SprintProgress
            total={totalIssues}
            completed={completedIssues}
            inProgress={inProgressIssues}
            todo={todoIssues}
          />
        </div>
      </div>

      {/* Issues Table */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-200 flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-400" />
            Sprint Issues ({sprintIssues.length})
          </h2>
        </div>

        {sprintIssues.length === 0 ? (
          <div className="p-12 text-center bg-slate-900 border border-slate-800 rounded-xl space-y-3">
            <Layers className="w-8 h-8 text-slate-600 mx-auto" />
            <div className="text-sm font-semibold text-slate-300">No issues in this sprint</div>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Add issues from your product backlog using the Sprint Planning workspace.
            </p>
            <Link
              to={`/projects/${projectId}/sprint-planning`}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors shadow-lg shadow-indigo-600/20"
            >
              <Target className="w-4 h-4" />
              Open Sprint Planning
            </Link>
          </div>
        ) : (
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-900/60 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                    <th className="py-3 px-4 w-12 text-center">Pos</th>
                    <th className="py-3 px-4">Key</th>
                    <th className="py-3 px-4">Type</th>
                    <th className="py-3 px-4">Title</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Priority</th>
                    <th className="py-3 px-4">Assignee</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {sprintIssues.map((si) => (
                    <tr key={si.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-4 text-center font-mono text-slate-500 font-semibold text-[11px]">
                        #{si.position}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-semibold text-indigo-400">
                        <Link
                          to={`/projects/${projectId}/issues/${si.issue.id}`}
                          className="hover:underline"
                        >
                          {si.issue.key}
                        </Link>
                      </td>
                      <td className="py-3.5 px-4">
                        <IssueTypeBadge type={si.issue.issue_type} />
                      </td>
                      <td className="py-3.5 px-4 font-medium text-slate-100">
                        <Link
                          to={`/projects/${projectId}/issues/${si.issue.id}`}
                          className="hover:text-indigo-400 transition-colors line-clamp-1"
                        >
                          {si.issue.title}
                        </Link>
                      </td>
                      <td className="py-3.5 px-4">
                        <IssueStatusBadge status={si.issue.status} />
                      </td>
                      <td className="py-3.5 px-4">
                        <IssuePriorityBadge priority={si.issue.priority} />
                      </td>
                      <td className="py-3.5 px-4 text-slate-400">
                        {si.issue.assignee ? (
                          <div className="flex items-center gap-1.5">
                            <UserIcon className="w-3.5 h-3.5 text-slate-500" />
                            <span>{si.issue.assignee.name}</span>
                          </div>
                        ) : (
                          <span className="text-slate-600 italic">Unassigned</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
