import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { qaService } from '../../services/qaService';
import type { TestCase } from '../../types/qa';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Skeleton } from '../../components/ui/Skeleton';
import { TestRunStatusBadge } from '../../components/qa/TestRunStatusBadge';
import { ExecutionStatusBadge } from '../../components/qa/ExecutionStatusBadge';
import { QAProgress } from '../../components/qa/QAProgress';
import { ArrowLeft, Play, Plus, Trash2, ArrowUp, ArrowDown, CheckCircle2 } from 'lucide-react';

export const TestRunDetailsPage: React.FC = () => {
  const { projectId, testRunId } = useParams<{ projectId: string; testRunId: string }>();
  const queryClient = useQueryClient();

  const [selectedCaseToAdd, setSelectedCaseToAdd] = useState('');
  const [addError, setAddError] = useState<string | null>(null);

  // Fetch Test Run details
  const { data: runRes, isLoading: runLoading } = useQuery({
    queryKey: ['testRun', testRunId],
    queryFn: () => qaService.getTestRun(testRunId!),
    enabled: !!testRunId,
  });

  // Fetch Test Run Cases
  const { data: casesRes, isLoading: casesLoading } = useQuery({
    queryKey: ['testRunCases', testRunId],
    queryFn: () => qaService.getTestRunCases(testRunId!),
    enabled: !!testRunId,
  });

  // Fetch all Project Test Cases (to add to run)
  const { data: allCasesRes } = useQuery({
    queryKey: ['testCases', projectId],
    queryFn: () => qaService.getTestCases(projectId!),
    enabled: !!projectId,
  });

  // Mutations
  const addCaseMutation = useMutation({
    mutationFn: (testCaseId: string) => qaService.addTestCaseToRun(testRunId!, testCaseId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['testRunCases', testRunId] });
      queryClient.invalidateQueries({ queryKey: ['testRun', testRunId] });
      setSelectedCaseToAdd('');
      setAddError(null);
    },
    onError: (err: any) => {
      setAddError(err.response?.data?.message || 'Failed to add test case to run');
    },
  });

  const removeCaseMutation = useMutation({
    mutationFn: (caseId: string) => qaService.removeTestCaseFromRun(testRunId!, caseId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['testRunCases', testRunId] });
      queryClient.invalidateQueries({ queryKey: ['testRun', testRunId] });
    },
  });

  const reorderCaseMutation = useMutation({
    mutationFn: ({ caseId, newPosition }: { caseId: string; newPosition: number }) =>
      qaService.reorderTestRunCase(testRunId!, caseId, newPosition),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['testRunCases', testRunId] });
    },
  });

  const startRunMutation = useMutation({
    mutationFn: () => qaService.startTestRun(testRunId!),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['testRun', testRunId] }),
  });

  const completeRunMutation = useMutation({
    mutationFn: () => qaService.completeTestRun(testRunId!),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['testRun', testRunId] }),
  });

  const run = runRes?.data;
  const runCases = casesRes?.data || [];
  const allCases: TestCase[] = allCasesRes?.data?.items || [];

  // Available test cases to add (not in run yet)
  const availableCases = allCases.filter((tc: TestCase) => !runCases.some((rc) => rc.test_case_id === tc.id));

  const isLoading = runLoading || casesLoading;

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!run) {
    return (
      <div className="max-w-7xl mx-auto p-6 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400">
        Test run not found or unauthorized access.
      </div>
    );
  }

  // Calculate execution status breakdown
  let passed = 0;
  let failed = 0;
  let blocked = 0;
  let skipped = 0;
  let notRun = 0;

  runCases.forEach((rc) => {
    const st = rc.execution?.status || 'not_run';
    if (st === 'passed') passed++;
    else if (st === 'failed') failed++;
    else if (st === 'blocked') blocked++;
    else if (st === 'skipped') skipped++;
    else notRun++;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Back Link */}
      <Link to={`/projects/${projectId}/test-runs`} className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200">
        <ArrowLeft className="w-3.5 h-3.5" /> Back to Test Runs
      </Link>

      {/* Header Banner */}
      <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-white tracking-tight">{run.name}</h1>
            <TestRunStatusBadge status={run.status} size="sm" />
            {run.environment && (
              <span className="text-xs font-mono font-semibold px-2.5 py-1 rounded bg-slate-800 text-slate-400 border border-slate-700">
                {run.environment}
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400">{run.description || 'No run description provided.'}</p>
        </div>

        <div className="flex items-center gap-3">
          {run.status === 'planned' && (
            <Button onClick={() => startRunMutation.mutate()} isLoading={startRunMutation.isPending} icon={<Play className="w-4 h-4" />}>
              Start Execution
            </Button>
          )}

          {run.status === 'active' && (
            <>
              <Link to={`/projects/${projectId}/test-runs/${run.id}/execute`}>
                <Button icon={<Play className="w-4 h-4" />}>Execute Tests Workspace</Button>
              </Link>
              <Button
                variant="secondary"
                onClick={() => completeRunMutation.mutate()}
                isLoading={completeRunMutation.isPending}
                icon={<CheckCircle2 className="w-4 h-4 text-emerald-400" />}
              >
                Complete Run
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Progress Breakdown Card */}
      <Card className="p-6 space-y-3">
        <h3 className="text-sm font-semibold text-slate-200">Execution Progress ({runCases.length} Test Cases)</h3>
        <QAProgress passed={passed} failed={failed} blocked={blocked} skipped={skipped} notRun={notRun} />
      </Card>

      {/* Test Cases Assignment & Management */}
      <Card className="p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <h3 className="text-sm font-semibold text-slate-200">Included Test Cases ({runCases.length})</h3>

          {/* Add test case drop-down */}
          <div className="flex items-center gap-2">
            <select
              value={selectedCaseToAdd}
              onChange={(e) => setSelectedCaseToAdd(e.target.value)}
              className="px-3 py-1.5 text-xs bg-slate-950 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="">Select project test case to add...</option>
              {availableCases.map((tc: TestCase) => (
                <option key={tc.id} value={tc.id}>
                  {tc.key}: {tc.title}
                </option>
              ))}
            </select>
            <Button
              size="sm"
              disabled={!selectedCaseToAdd}
              isLoading={addCaseMutation.isPending}
              onClick={() => addCaseMutation.mutate(selectedCaseToAdd)}
              icon={<Plus className="w-3.5 h-3.5" />}
            >
              Add
            </Button>
          </div>
        </div>

        {addError && (
          <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-xs text-rose-400">
            {addError}
          </div>
        )}

        {/* Included cases table */}
        {runCases.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500 bg-slate-950/50 rounded-xl border border-slate-800">
            No test cases assigned to this run yet. Select a test case from the dropdown above to add it.
          </div>
        ) : (
          <div className="space-y-2">
            {runCases.map((rc, idx) => {
              const tc = rc.test_case;
              const execution = rc.execution;

              return (
                <div
                  key={rc.id}
                  className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-4 text-xs group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="w-6 h-6 rounded bg-slate-900 border border-slate-700 font-mono font-bold text-slate-400 flex items-center justify-center shrink-0">
                      {rc.position}
                    </span>
                    <span className="font-mono font-bold text-indigo-400 shrink-0">{tc?.key || 'TC'}</span>
                    <Link
                      to={`/projects/${projectId}/test-cases/${tc?.id}`}
                      className="font-medium text-slate-200 hover:text-indigo-400 truncate"
                    >
                      {tc?.title || 'Unknown Test Case'}
                    </Link>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <ExecutionStatusBadge status={execution?.status || 'not_run'} size="sm" />

                    <div className="flex items-center gap-1">
                      <button
                        disabled={idx === 0}
                        onClick={() => reorderCaseMutation.mutate({ caseId: rc.id, newPosition: rc.position - 1 })}
                        className="p-1 text-slate-500 hover:text-slate-300 disabled:opacity-30"
                        title="Move Up"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        disabled={idx === runCases.length - 1}
                        onClick={() => reorderCaseMutation.mutate({ caseId: rc.id, newPosition: rc.position + 1 })}
                        className="p-1 text-slate-500 hover:text-slate-300 disabled:opacity-30"
                        title="Move Down"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => removeCaseMutation.mutate(rc.id)}
                        className="p-1 text-slate-500 hover:text-rose-400"
                        title="Remove from Run"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
};
