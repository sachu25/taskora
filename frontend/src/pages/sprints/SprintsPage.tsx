import React, { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Flag,
  Plus,
  Play,
  CheckCircle2,
  XCircle,
  Pencil,
  Trash2,
  Eye,
  Loader2,
  Calendar,
  AlertTriangle,
  FolderKanban,
  Target,
  Kanban,
} from 'lucide-react';
import { sprintService } from '../../services/sprintService';
import type { Sprint, CreateSprintPayload, UpdateSprintPayload } from '../../types';
import { SprintStatusBadge } from '../../components/sprints/SprintStatusBadge';
import { SprintFormModal } from '../../components/sprints/SprintFormModal';

export const SprintsPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();

  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modal states
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingSprint, setEditingSprint] = useState<Sprint | null>(null);

  // Lifecycle confirm states
  const [confirmAction, setConfirmAction] = useState<{
    type: 'start' | 'complete' | 'cancel' | 'delete' | 'restore';
    sprint: Sprint;
  } | null>(null);
  const [isProcessingAction, setIsProcessingAction] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const fetchSprints = useCallback(async () => {
    if (!projectId) return;
    setIsLoading(true);
    setError(null);
    try {
      const params: any = {};
      if (statusFilter !== 'all') params.status = statusFilter;
      if (searchQuery.trim()) params.search = searchQuery.trim();

      const response = await sprintService.listSprints(projectId, params);
      if (response.success) {
        setSprints(response.data.items);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load sprints for this project.');
    } finally {
      setIsLoading(false);
    }
  }, [projectId, statusFilter, searchQuery]);

  useEffect(() => {
    fetchSprints();
  }, [fetchSprints]);

  const handleCreateOrUpdate = async (payload: CreateSprintPayload | UpdateSprintPayload) => {
    if (!projectId) return;
    if (editingSprint) {
      await sprintService.updateSprint(editingSprint.id, payload);
    } else {
      await sprintService.createSprint(projectId, payload as CreateSprintPayload);
    }
    fetchSprints();
  };

  const handleExecuteAction = async () => {
    if (!confirmAction) return;
    setIsProcessingAction(true);
    setActionError(null);

    try {
      const { type, sprint } = confirmAction;
      if (type === 'start') {
        await sprintService.startSprint(sprint.id);
      } else if (type === 'complete') {
        await sprintService.completeSprint(sprint.id);
      } else if (type === 'cancel') {
        await sprintService.cancelSprint(sprint.id);
      } else if (type === 'delete') {
        await sprintService.deleteSprint(sprint.id);
      } else if (type === 'restore') {
        await sprintService.restoreSprint(sprint.id);
      }
      setConfirmAction(null);
      fetchSprints();
    } catch (err: any) {
      const msg =
        err.response?.data?.message ||
        (confirmAction.type === 'start'
          ? 'Unable to start sprint. This project may already have an active sprint.'
          : 'Operation failed. Please try again.');
      setActionError(msg);
    } finally {
      setIsProcessingAction(false);
    }
  };

  // Summary Metrics
  const activeSprint = sprints.find((s) => s.status === 'active');
  const plannedCount = sprints.filter((s) => s.status === 'planned').length;
  const completedCount = sprints.filter((s) => s.status === 'completed').length;
  const totalCount = sprints.length;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
            <FolderKanban className="w-3.5 h-3.5 text-indigo-400" />
            <span>Projects</span>
            <span>/</span>
            <span className="text-slate-200 font-medium">Sprint Management</span>
          </div>
          <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2.5">
            <Flag className="w-5 h-5 text-indigo-400" />
            Agile Sprints
          </h1>
        </div>

        <div className="flex items-center gap-3">
          {activeSprint && (
            <Link
              to={`/projects/${projectId}/sprints/${activeSprint.id}/board`}
              className="px-3 py-2 text-xs font-semibold text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 rounded-lg transition-colors flex items-center gap-2 shadow-lg shadow-emerald-500/10"
            >
              <Kanban className="w-4 h-4 text-emerald-400" />
              Active Sprint Board
            </Link>
          )}
          <Link
            to={`/projects/${projectId}/sprint-planning`}
            className="px-3 py-2 text-xs font-semibold text-indigo-300 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 rounded-lg transition-colors flex items-center gap-2"
          >
            <Target className="w-4 h-4" />
            Sprint Planning Workspace
          </Link>
          <button
            onClick={() => {
              setEditingSprint(null);
              setIsFormModalOpen(true);
            }}
            className="px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors flex items-center gap-2 shadow-lg shadow-indigo-600/20"
          >
            <Plus className="w-4 h-4" />
            Create Sprint
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
            Active Sprint
          </div>
          <div className="text-lg font-bold text-emerald-400 truncate">
            {activeSprint ? activeSprint.name : 'None Active'}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            {activeSprint ? `${activeSprint.issues_count || 0} issues assigned` : 'No sprint in progress'}
          </div>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
            Planned Sprints
          </div>
          <div className="text-2xl font-bold text-slate-200">{plannedCount}</div>
          <div className="text-[11px] text-slate-500 mt-1">Ready for sprint start</div>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
            Completed Sprints
          </div>
          <div className="text-2xl font-bold text-blue-400">{completedCount}</div>
          <div className="text-[11px] text-slate-500 mt-1">Archived sprint cycles</div>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
            Total Sprints
          </div>
          <div className="text-2xl font-bold text-indigo-400">{totalCount}</div>
          <div className="text-[11px] text-slate-500 mt-1">All project sprint records</div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-slate-900 border border-slate-800 rounded-xl">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          {['all', 'active', 'planned', 'completed', 'cancelled'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg capitalize transition-colors ${
                statusFilter === st
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search sprints by name or goal..."
          className="w-full sm:w-64 px-3 py-1.5 text-xs bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors"
        />
      </div>

      {/* Sprint Table / Cards */}
      {isLoading ? (
        <div className="p-12 text-center text-slate-400 text-xs flex items-center justify-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
          Loading project sprints...
        </div>
      ) : error ? (
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-xs text-rose-400 font-medium">
          {error}
        </div>
      ) : sprints.length === 0 ? (
        <div className="p-12 text-center bg-slate-900 border border-slate-800 rounded-xl space-y-3">
          <Flag className="w-8 h-8 text-slate-600 mx-auto" />
          <div className="text-sm font-semibold text-slate-300">No sprints found</div>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Create your first sprint to begin organizing issues into agile development cycles.
          </p>
          <button
            onClick={() => {
              setEditingSprint(null);
              setIsFormModalOpen(true);
            }}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors shadow-lg shadow-indigo-600/20"
          >
            <Plus className="w-4 h-4" />
            Create First Sprint
          </button>
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/60 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4">Sprint</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Goal</th>
                  <th className="py-3 px-4">Dates</th>
                  <th className="py-3 px-4">Issues</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {sprints.map((sprint) => (
                  <tr
                    key={sprint.id}
                    className={`hover:bg-slate-800/40 transition-colors ${
                      sprint.status === 'active' ? 'bg-emerald-500/[0.02]' : ''
                    }`}
                  >
                    <td className="py-3.5 px-4 font-semibold text-slate-100">
                      <Link
                        to={`/projects/${projectId}/sprints/${sprint.id}`}
                        className="hover:text-indigo-400 transition-colors flex items-center gap-2"
                      >
                        <Flag
                          className={`w-4 h-4 ${
                            sprint.status === 'active' ? 'text-emerald-400' : 'text-slate-500'
                          }`}
                        />
                        {sprint.name}
                      </Link>
                    </td>

                    <td className="py-3.5 px-4">
                      <SprintStatusBadge status={sprint.status} />
                    </td>

                    <td className="py-3.5 px-4 max-w-xs truncate text-slate-400">
                      {sprint.goal || <span className="italic text-slate-600">No goal defined</span>}
                    </td>

                    <td className="py-3.5 px-4 text-slate-400 font-mono text-[11px]">
                      {sprint.start_date || sprint.end_date ? (
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-500" />
                          <span>{sprint.start_date || 'TBD'}</span>
                          <span>-</span>
                          <span>{sprint.end_date || 'TBD'}</span>
                        </div>
                      ) : (
                        <span className="text-slate-600">Dates unassigned</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 font-mono font-semibold text-slate-200">
                      {sprint.issues_count ?? 0}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          to={`/projects/${projectId}/sprints/${sprint.id}/board`}
                          className="p-1.5 rounded-lg text-emerald-400 hover:bg-emerald-500/10 transition-colors"
                          title="Open Kanban Board"
                        >
                          <Kanban className="w-4 h-4" />
                        </Link>

                        <Link
                          to={`/projects/${projectId}/sprints/${sprint.id}`}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
                          title="View Sprint Details"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>

                        {/* Planned Actions */}
                        {sprint.status === 'planned' && (
                          <button
                            onClick={() => setConfirmAction({ type: 'start', sprint })}
                            className="p-1.5 rounded-lg text-emerald-400 hover:bg-emerald-500/10 transition-colors"
                            title="Start Sprint"
                          >
                            <Play className="w-4 h-4" />
                          </button>
                        )}

                        {/* Active Actions */}
                        {sprint.status === 'active' && (
                          <>
                            <button
                              onClick={() => setConfirmAction({ type: 'complete', sprint })}
                              className="p-1.5 rounded-lg text-blue-400 hover:bg-blue-500/10 transition-colors"
                              title="Complete Sprint"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setConfirmAction({ type: 'cancel', sprint })}
                              className="p-1.5 rounded-lg text-amber-400 hover:bg-amber-500/10 transition-colors"
                              title="Cancel Sprint"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          </>
                        )}

                        {/* Edit Action */}
                        <button
                          onClick={() => {
                            setEditingSprint(sprint);
                            setIsFormModalOpen(true);
                          }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-400 hover:bg-slate-800 transition-colors"
                          title="Edit Sprint Details"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>

                        {/* Delete Action */}
                        <button
                          onClick={() => setConfirmAction({ type: 'delete', sprint })}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                          title="Delete Sprint"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Form Modal */}
      <SprintFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSubmit={handleCreateOrUpdate}
        sprint={editingSprint}
      />

      {/* Action Confirmation Modal */}
      {confirmAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                  confirmAction.type === 'start'
                    ? 'bg-emerald-500/10 text-emerald-400'
                    : confirmAction.type === 'complete'
                    ? 'bg-blue-500/10 text-blue-400'
                    : confirmAction.type === 'delete'
                    ? 'bg-rose-500/10 text-rose-400'
                    : 'bg-amber-500/10 text-amber-400'
                }`}
              >
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-100 capitalize">
                  {confirmAction.type} Sprint
                </h3>
                <p className="text-xs text-slate-400">
                  Are you sure you want to {confirmAction.type} &quot;{confirmAction.sprint.name}&quot;?
                </p>
              </div>
            </div>

            {actionError && (
              <div className="p-3 text-xs rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 font-medium">
                {actionError}
              </div>
            )}

            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setConfirmAction(null);
                  setActionError(null);
                }}
                className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExecuteAction}
                disabled={isProcessingAction}
                className={`px-4 py-2 text-xs font-semibold text-white rounded-lg transition-colors flex items-center gap-2 shadow-lg ${
                  confirmAction.type === 'start'
                    ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/20'
                    : confirmAction.type === 'complete'
                    ? 'bg-blue-600 hover:bg-blue-500 shadow-blue-600/20'
                    : confirmAction.type === 'delete'
                    ? 'bg-rose-600 hover:bg-rose-500 shadow-rose-600/20'
                    : 'bg-amber-600 hover:bg-amber-500 shadow-amber-600/20'
                }`}
              >
                {isProcessingAction && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Confirm {confirmAction.type}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
