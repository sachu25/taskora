import React, { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Target,
  Flag,
  Plus,
  ArrowRight,
  ArrowUp,
  ArrowDown,
  X,
  Loader2,
  FolderKanban,
  Layers,
  Search,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { sprintService } from '../../services/sprintService';
import type { Sprint, SprintIssue, Issue } from '../../types';
import { SprintSelector } from '../../components/sprints/SprintSelector';
import { SprintStatusBadge } from '../../components/sprints/SprintStatusBadge';
import { IssueTypeBadge } from '../../components/issues/IssueTypeBadge';
import { IssueStatusBadge } from '../../components/issues/IssueStatusBadge';
import { IssuePriorityBadge } from '../../components/issues/IssuePriorityBadge';
import { SprintFormModal } from '../../components/sprints/SprintFormModal';

export const SprintPlanningPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();

  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [selectedSprint, setSelectedSprint] = useState<Sprint | null>(null);
  const [sprintIssues, setSprintIssues] = useState<SprintIssue[]>([]);
  const [backlogIssues, setBacklogIssues] = useState<Issue[]>([]);

  const [isLoadingSprintIssues, setIsLoadingSprintIssues] = useState(false);
  const [isLoadingBacklog, setIsLoadingLoadingBacklog] = useState(false);

  const [backlogSearch, setBacklogSearch] = useState('');
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [processingIssueId, setProcessingIssueId] = useState<string | null>(null);

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);

  // 1. Fetch Project Sprints
  const fetchSprints = useCallback(async () => {
    if (!projectId) return;
    try {
      const res = await sprintService.listSprints(projectId);
      if (res.success) {
        setSprints(res.data.items);
        // Default select active or first planned sprint
        const active = res.data.items.find((s) => s.status === 'active');
        const planned = res.data.items.find((s) => s.status === 'planned');
        setSelectedSprint(active || planned || res.data.items[0] || null);
      }
    } catch (err: any) {
      setActionError('Failed to load sprints for sprint planning.');
    }
  }, [projectId]);

  // 2. Fetch Backlog Issues
  const fetchBacklog = useCallback(async () => {
    if (!projectId) return;
    setIsLoadingLoadingBacklog(true);
    try {
      const res = await sprintService.getProjectBacklog(projectId, {
        search: backlogSearch.trim() || undefined,
        per_page: 50,
      });
      if (res.success) {
        setBacklogIssues(res.data.items);
      }
    } catch (err: any) {
      setActionError('Failed to load backlog issues.');
    } finally {
      setIsLoadingLoadingBacklog(false);
    }
  }, [projectId, backlogSearch]);

  // 3. Fetch Sprint Issues for Selected Sprint
  const fetchSprintIssues = useCallback(async () => {
    if (!selectedSprint) {
      setSprintIssues([]);
      return;
    }
    setIsLoadingSprintIssues(true);
    try {
      const res = await sprintService.listSprintIssues(selectedSprint.id, { per_page: 100 });
      if (res.success) {
        setSprintIssues(res.data.items);
      }
    } catch (err: any) {
      setActionError('Failed to load sprint issues.');
    } finally {
      setIsLoadingSprintIssues(false);
    }
  }, [selectedSprint]);

  useEffect(() => {
    fetchSprints();
  }, [fetchSprints]);

  useEffect(() => {
    fetchBacklog();
  }, [fetchBacklog]);

  useEffect(() => {
    fetchSprintIssues();
  }, [fetchSprintIssues]);

  // Add issue to current sprint
  const handleAddIssueToSprint = async (issueId: string) => {
    if (!selectedSprint) return;
    setProcessingIssueId(issueId);
    setActionError(null);
    setActionSuccess(null);

    try {
      await sprintService.addIssueToSprint(selectedSprint.id, issueId);
      setActionSuccess('Issue added to sprint successfully.');
      await Promise.all([fetchSprintIssues(), fetchBacklog(), fetchSprints()]);
    } catch (err: any) {
      setActionError(err.response?.data?.message || 'Failed to add issue to sprint.');
    } finally {
      setProcessingIssueId(null);
    }
  };

  // Remove issue from current sprint
  const handleRemoveIssueFromSprint = async (issueId: string) => {
    if (!selectedSprint) return;
    setProcessingIssueId(issueId);
    setActionError(null);
    setActionSuccess(null);

    try {
      await sprintService.removeIssueFromSprint(selectedSprint.id, issueId);
      setActionSuccess('Issue removed from sprint.');
      await Promise.all([fetchSprintIssues(), fetchBacklog(), fetchSprints()]);
    } catch (err: any) {
      setActionError(err.response?.data?.message || 'Failed to remove issue from sprint.');
    } finally {
      setProcessingIssueId(null);
    }
  };

  // Move issue position up or down
  const handleReorderSprintIssue = async (issueId: string, currentPos: number, direction: 'up' | 'down') => {
    if (!selectedSprint) return;
    const newPos = direction === 'up' ? Math.max(1, currentPos - 1) : currentPos + 1;
    setProcessingIssueId(issueId);
    setActionError(null);

    try {
      await sprintService.reorderSprintIssue(selectedSprint.id, issueId, newPos);
      await fetchSprintIssues();
    } catch (err: any) {
      setActionError(err.response?.data?.message || 'Failed to reorder issue.');
    } finally {
      setProcessingIssueId(null);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
            <FolderKanban className="w-3.5 h-3.5 text-indigo-400" />
            <span>Projects</span>
            <span>/</span>
            <span className="text-slate-200 font-medium">Sprint Planning</span>
          </div>
          <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2.5">
            <Target className="w-5 h-5 text-indigo-400" />
            Sprint Planning Workspace
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsFormModalOpen(true)}
            className="px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors flex items-center gap-2 shadow-lg shadow-indigo-600/20"
          >
            <Plus className="w-4 h-4" />
            Create Sprint
          </button>
        </div>
      </div>

      {/* Notifications */}
      {actionError && (
        <div className="p-3.5 text-xs rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 font-medium flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{actionError}</span>
          </div>
          <button onClick={() => setActionError(null)} className="p-1 hover:bg-rose-500/20 rounded">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {actionSuccess && (
        <div className="p-3.5 text-xs rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-medium flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{actionSuccess}</span>
          </div>
          <button onClick={() => setActionSuccess(null)} className="p-1 hover:bg-emerald-500/20 rounded">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Split-Pane Planning Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LEFT COLUMN: PRODUCT BACKLOG */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 flex flex-col h-[700px] shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-400" />
              <h2 className="text-sm font-bold text-slate-100">Product Backlog</h2>
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-mono font-semibold">
                {backlogIssues.length}
              </span>
            </div>

            <Link
              to={`/projects/${projectId}/backlog`}
              className="text-[11px] font-semibold text-indigo-400 hover:text-indigo-300"
            >
              Full Backlog Page &rarr;
            </Link>
          </div>

          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={backlogSearch}
              onChange={(e) => setBacklogSearch(e.target.value)}
              placeholder="Search backlog issues..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          {/* Backlog List Container */}
          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {isLoadingBacklog ? (
              <div className="p-8 text-center text-slate-400 text-xs flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
                Loading backlog...
              </div>
            ) : backlogIssues.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-xs italic">
                No backlog issues available to schedule.
              </div>
            ) : (
              backlogIssues.map((issue) => (
                <div
                  key={issue.id}
                  className="p-3 bg-slate-950/60 border border-slate-800/80 rounded-lg hover:border-slate-700 transition-all flex items-center justify-between gap-3 group"
                >
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-semibold text-indigo-400">
                        {issue.key}
                      </span>
                      <IssueTypeBadge type={issue.issue_type} />
                      <IssuePriorityBadge priority={issue.priority} />
                    </div>
                    <div className="text-xs font-medium text-slate-200 truncate">
                      {issue.title}
                    </div>
                  </div>

                  <button
                    onClick={() => handleAddIssueToSprint(issue.id)}
                    disabled={!selectedSprint || processingIssueId === issue.id}
                    className="px-2.5 py-1 text-xs font-semibold text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 rounded-lg transition-colors flex items-center gap-1.5 shrink-0 disabled:opacity-40"
                    title="Add to selected sprint"
                  >
                    {processingIssueId === issue.id ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <>
                        <span>Add</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: SPRINT WORKSPACE */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 flex flex-col h-[700px] shadow-xl">
          {/* Header & Sprint Switcher */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Flag className="w-4 h-4 text-emerald-400" />
              <h2 className="text-sm font-bold text-slate-100">Sprint Backlog</h2>
            </div>

            <SprintSelector
              sprints={sprints}
              selectedSprintId={selectedSprint?.id || null}
              onSelectSprint={(sprint) => setSelectedSprint(sprint)}
              className="w-full sm:w-64"
            />
          </div>

          {/* Selected Sprint Header Banner */}
          {selectedSprint ? (
            <div className="p-3.5 bg-slate-950/80 border border-slate-800 rounded-lg space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-slate-100">{selectedSprint.name}</span>
                  <SprintStatusBadge status={selectedSprint.status} />
                </div>
                <span className="text-xs font-mono text-slate-400">
                  {sprintIssues.length} issues
                </span>
              </div>
              {selectedSprint.goal && (
                <p className="text-xs text-slate-400 italic line-clamp-1">
                  Goal: {selectedSprint.goal}
                </p>
              )}
            </div>
          ) : (
            <div className="p-4 text-center text-xs text-slate-500 italic bg-slate-950/40 rounded-lg border border-slate-800">
              No sprint selected. Create or select a sprint to manage issues.
            </div>
          )}

          {/* Sprint Issue List Container */}
          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {!selectedSprint ? (
              <div className="p-8 text-center text-slate-500 text-xs italic">
                Select a sprint above to begin planning work.
              </div>
            ) : isLoadingSprintIssues ? (
              <div className="p-8 text-center text-slate-400 text-xs flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
                Loading sprint issues...
              </div>
            ) : sprintIssues.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-xs italic">
                This sprint has no issues yet. Click &quot;Add&quot; on backlog issues to assign work.
              </div>
            ) : (
              sprintIssues.map((si, idx) => (
                <div
                  key={si.id}
                  className="p-3 bg-slate-950/60 border border-slate-800/80 rounded-lg hover:border-slate-700 transition-all flex items-center justify-between gap-3 group"
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <span className="font-mono text-xs text-slate-500 font-bold w-5 text-center shrink-0">
                      #{si.position}
                    </span>
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-semibold text-indigo-400">
                          {si.issue.key}
                        </span>
                        <IssueTypeBadge type={si.issue.issue_type} />
                        <IssueStatusBadge status={si.issue.status} />
                      </div>
                      <div className="text-xs font-medium text-slate-200 truncate">
                        {si.issue.title}
                      </div>
                    </div>
                  </div>

                  {/* Ordering & Remove Controls */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => handleReorderSprintIssue(si.issue.id, si.position, 'up')}
                      disabled={idx === 0 || processingIssueId === si.issue.id}
                      className="p-1 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded disabled:opacity-30 transition-colors"
                      title="Move Up"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleReorderSprintIssue(si.issue.id, si.position, 'down')}
                      disabled={idx === sprintIssues.length - 1 || processingIssueId === si.issue.id}
                      className="p-1 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded disabled:opacity-30 transition-colors"
                      title="Move Down"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleRemoveIssueFromSprint(si.issue.id)}
                      disabled={processingIssueId === si.issue.id}
                      className="p-1 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded transition-colors ml-1"
                      title="Remove from Sprint"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Form Modal for Quick Sprint Creation */}
      <SprintFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSubmit={async (payload) => {
          if (!projectId) return;
          await sprintService.createSprint(projectId, payload as any);
          fetchSprints();
        }}
      />
    </div>
  );
};
