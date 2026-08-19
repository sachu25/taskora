import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Kanban,
  Flag,
  ArrowLeft,
  Loader2,
  Calendar,
  AlertTriangle,
  Target,
} from 'lucide-react';
import { sprintService } from '../../services/sprintService';
import type { Sprint, SprintIssue, IssueFilterParams } from '../../types';
import { SprintStatusBadge } from '../../components/sprints/SprintStatusBadge';
import { SprintProgress } from '../../components/sprints/SprintProgress';
import { KanbanBoard } from '../../components/kanban/KanbanBoard';
import { KanbanToolbar } from '../../components/kanban/KanbanToolbar';

export const KanbanBoardPage: React.FC = () => {
  const { projectId, sprintId } = useParams<{ projectId: string; sprintId: string }>();

  const [sprint, setSprint] = useState<Sprint | null>(null);
  const [sprintIssues, setSprintIssues] = useState<SprintIssue[]>([]);
  const [filters, setFilters] = useState<IssueFilterParams>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const requestIdRef = useRef(0);

  const fetchBoardData = useCallback(async () => {
    if (!sprintId) return;

    const currentRequestId = ++requestIdRef.current;
    setIsLoading(true);
    setError(null);

    try {
      const [sprintRes, issuesRes] = await Promise.all([
        sprintService.getSprint(sprintId),
        sprintService.listSprintIssues(sprintId, {
          search: filters.search,
          priority: filters.priority,
          type: filters.type,
          per_page: 100,
        }),
      ]);

      if (currentRequestId === requestIdRef.current) {
        if (sprintRes.success) setSprint(sprintRes.data);
        if (issuesRes.success) setSprintIssues(issuesRes.data.items);
      }
    } catch (err: any) {
      if (currentRequestId === requestIdRef.current) {
        setError(err.response?.data?.message || 'Failed to load sprint board.');
      }
    } finally {
      if (currentRequestId === requestIdRef.current) {
        setIsLoading(false);
      }
    }
  }, [sprintId, filters]);

  useEffect(() => {
    fetchBoardData();
  }, [fetchBoardData]);

  if (isLoading && !sprint) {
    return (
      <div className="p-12 text-center text-slate-400 text-xs flex items-center justify-center gap-2">
        <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
        Loading sprint Kanban board...
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

  const isReadOnly = sprint.status !== 'active';

  // Metrics calculation
  const totalIssues = sprintIssues.length;
  const completedIssues = sprintIssues.filter((si) => si.issue.status === 'done').length;
  const inProgressIssues = sprintIssues.filter((si) => si.issue.status === 'in_progress').length;
  const todoIssues = sprintIssues.filter((si) => si.issue.status === 'todo' || si.issue.status === 'backlog').length;

  return (
    <div className="p-6 space-y-6">
      {/* Navigation & Breadcrumbs */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Link to={`/projects/${projectId}/sprints`} className="hover:text-slate-200">
            Sprints
          </Link>
          <span>/</span>
          <span className="text-slate-200 font-medium truncate">{sprint.name}</span>
          <span>/</span>
          <span className="text-indigo-400 font-semibold">Kanban Board</span>
        </div>

        <Link
          to={`/projects/${projectId}/sprint-planning`}
          className="px-3 py-1.5 text-xs font-semibold text-indigo-300 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 rounded-lg transition-colors flex items-center gap-2"
        >
          <Target className="w-3.5 h-3.5" />
          Sprint Planning Workspace
        </Link>
      </div>

      {/* Header Banner */}
      <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl space-y-4 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2.5">
                <Kanban className="w-5 h-5 text-indigo-400" />
                {sprint.name} Board
              </h1>
              <SprintStatusBadge status={sprint.status} />
            </div>
            {sprint.goal && (
              <p className="text-xs text-slate-400 flex items-center gap-2 pt-1">
                <Flag className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
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

      {/* Read-Only Status Notice Banner */}
      {isReadOnly && (
        <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs text-amber-300 font-medium flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
          <div>
            <span className="font-bold">Read-Only Board Mode: </span>
            This sprint is currently in <span className="uppercase font-mono">{sprint.status}</span> state. Issue status changes are only permitted on active sprints.
          </div>
        </div>
      )}

      {/* Toolbar Filter */}
      <KanbanToolbar
        filters={filters}
        onFilterChange={(newFilters) => setFilters(newFilters)}
        onClearFilters={() => setFilters({})}
        onRefresh={fetchBoardData}
        isLoading={isLoading}
      />

      {/* Interactive Kanban Board */}
      <KanbanBoard
        sprintId={sprint.id}
        projectId={projectId || ''}
        sprintIssues={sprintIssues}
        isReadOnly={isReadOnly}
        onRefresh={fetchBoardData}
      />
    </div>
  );
};
