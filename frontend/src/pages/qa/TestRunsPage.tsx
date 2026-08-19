import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { qaService } from '../../services/qaService';
import { api } from '../../services/api';
import type { ApiResponse, Project } from '../../types';
import type { TestRun, TestRunCase } from '../../types/qa';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Skeleton } from '../../components/ui/Skeleton';
import { TestRunStatusBadge } from '../../components/qa/TestRunStatusBadge';
import { QAProgress } from '../../components/qa/QAProgress';
import { TestRunFormModal } from '../../components/qa/TestRunFormModal';
import { DeleteQAConfirmModal } from '../../components/qa/DeleteQAConfirmModal';
import { ArrowLeft, Plus, Search, Play, CheckCircle2, Ban, Trash2, Edit2, FolderOpen } from 'lucide-react';

export const TestRunsPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const queryClient = useQueryClient();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingRun, setEditingRun] = useState<TestRun | null>(null);
  const [deletingRun, setDeletingRun] = useState<TestRun | null>(null);

  // Fetch Project
  const { data: project } = useQuery({
    queryKey: ['project', projectId],
    queryFn: async () => {
      const res = await api.get<ApiResponse<Project>>(`/projects/${projectId}`);
      return res.data.data;
    },
    enabled: !!projectId,
  });

  // Fetch Test Runs
  const { data: runsRes, isLoading } = useQuery({
    queryKey: ['testRuns', projectId, search, statusFilter],
    queryFn: () => qaService.getTestRuns(projectId!, { search: search || undefined, status: statusFilter || undefined }),
    enabled: !!projectId,
  });

  const createRunMutation = useMutation({
    mutationFn: (data: any) => qaService.createTestRun(projectId!, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['testRuns', projectId] }),
  });

  const updateRunMutation = useMutation({
    mutationFn: (data: any) => qaService.updateTestRun(editingRun!.id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['testRuns', projectId] }),
  });

  const deleteRunMutation = useMutation({
    mutationFn: (runId: string) => qaService.deleteTestRun(runId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['testRuns', projectId] });
      setDeletingRun(null);
    },
  });

  // Lifecycle Mutations
  const startRunMutation = useMutation({
    mutationFn: (runId: string) => qaService.startTestRun(runId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['testRuns', projectId] }),
  });

  const completeRunMutation = useMutation({
    mutationFn: (runId: string) => qaService.completeTestRun(runId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['testRuns', projectId] }),
  });

  const cancelRunMutation = useMutation({
    mutationFn: (runId: string) => qaService.cancelTestRun(runId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['testRuns', projectId] }),
  });

  const runs: TestRun[] = runsRes?.data?.items || [];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Back Link */}
      <Link to={`/projects/${projectId}/qa`} className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200">
        <ArrowLeft className="w-3.5 h-3.5" /> Back to QA Dashboard
      </Link>

      {/* Header Banner */}
      <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 rounded-lg bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 font-mono font-bold text-sm">
              {project?.key}
            </span>
            <h1 className="text-2xl font-bold text-white tracking-tight">Test Runs & Execution Cycles</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">Manage QA execution cycles, environments, and test status recording.</p>
        </div>

        <Button onClick={() => { setEditingRun(null); setIsFormModalOpen(true); }} icon={<Plus className="w-4 h-4" />}>
          Create Test Run
        </Button>
      </div>

      {/* Filter Bar */}
      <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search test runs..."
            className="w-full pl-9 pr-3.5 py-2 text-xs bg-slate-950 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center gap-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-indigo-500"
          >
            <option value="">All Statuses</option>
            <option value="planned">Planned</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Test Runs List */}
      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-36 w-full" />
          <Skeleton className="h-36 w-full" />
        </div>
      ) : runs.length === 0 ? (
        <Card className="p-12 text-center space-y-3">
          <Play className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-base font-semibold text-slate-300">No Test Runs Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Create a test run cycle to assign test cases and begin execution.
          </p>
          <Button size="sm" onClick={() => { setEditingRun(null); setIsFormModalOpen(true); }} icon={<Plus className="w-3.5 h-3.5" />}>
            Create Test Run
          </Button>
        </Card>
      ) : (
        <div className="space-y-4">
          {runs.map((run: TestRun) => {
            const runCases = run.run_cases || [];
            let passed = 0;
            let failed = 0;
            let blocked = 0;
            let skipped = 0;
            let notRun = 0;

            runCases.forEach((rc: TestRunCase) => {
              const st = rc.execution?.status || 'not_run';
              if (st === 'passed') passed++;
              else if (st === 'failed') failed++;
              else if (st === 'blocked') blocked++;
              else if (st === 'skipped') skipped++;
              else notRun++;
            });

            return (
              <Card key={run.id} className="p-5 space-y-4 hover:border-slate-700/80 transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <Link
                        to={`/projects/${projectId}/test-runs/${run.id}`}
                        className="text-lg font-bold text-slate-100 hover:text-indigo-400 transition-colors"
                      >
                        {run.name}
                      </Link>
                      <TestRunStatusBadge status={run.status} size="sm" />
                      {run.environment && (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                          {run.environment}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400">{run.description || 'No run description provided.'}</p>
                  </div>

                  {/* Lifecycle Controls */}
                  <div className="flex items-center gap-2 shrink-0">
                    {run.status === 'planned' && (
                      <Button
                        size="sm"
                        onClick={() => startRunMutation.mutate(run.id)}
                        isLoading={startRunMutation.isPending}
                        icon={<Play className="w-3.5 h-3.5" />}
                      >
                        Start Run
                      </Button>
                    )}

                    {run.status === 'active' && (
                      <>
                        <Link to={`/projects/${projectId}/test-runs/${run.id}/execute`}>
                          <Button size="sm" icon={<Play className="w-3.5 h-3.5" />}>
                            Execute Tests
                          </Button>
                        </Link>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => completeRunMutation.mutate(run.id)}
                          isLoading={completeRunMutation.isPending}
                          icon={<CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                        >
                          Complete Run
                        </Button>
                      </>
                    )}

                    {(run.status === 'planned' || run.status === 'active') && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => cancelRunMutation.mutate(run.id)}
                        isLoading={cancelRunMutation.isPending}
                        icon={<Ban className="w-3.5 h-3.5 text-rose-400" />}
                      >
                        Cancel
                      </Button>
                    )}

                    <Link to={`/projects/${projectId}/test-runs/${run.id}`}>
                      <Button size="sm" variant="outline" icon={<FolderOpen className="w-3.5 h-3.5" />}>
                        Details
                      </Button>
                    </Link>

                    <button
                      onClick={() => { setEditingRun(run); setIsFormModalOpen(true); }}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-400 hover:bg-slate-800 transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeletingRun(run)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <QAProgress
                  passed={passed}
                  failed={failed}
                  blocked={blocked}
                  skipped={skipped}
                  notRun={notRun}
                />
              </Card>
            );
          })}
        </div>
      )}

      {/* Form Modal */}
      <TestRunFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        run={editingRun}
        onSubmit={async (data) => {
          if (editingRun) {
            await updateRunMutation.mutateAsync(data);
          } else {
            await createRunMutation.mutateAsync(data);
          }
        }}
        isLoading={createRunMutation.isPending || updateRunMutation.isPending}
      />

      {/* Delete Confirmation Modal */}
      <DeleteQAConfirmModal
        isOpen={!!deletingRun}
        onClose={() => setDeletingRun(null)}
        title="Delete Test Run"
        description={`Are you sure you want to soft-delete test run "${deletingRun?.name}"?`}
        onConfirm={async () => {
          if (deletingRun) {
            await deleteRunMutation.mutateAsync(deletingRun.id);
          }
        }}
        isLoading={deleteRunMutation.isPending}
      />
    </div>
  );
};
