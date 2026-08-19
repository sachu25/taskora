import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { qaService } from '../../services/qaService';
import type { ExecutionStatus } from '../../types/qa';
import { Card } from '../../components/ui/Card';
import { Skeleton } from '../../components/ui/Skeleton';
import { ExecutionStatusBadge } from '../../components/qa/ExecutionStatusBadge';
import { QAProgress } from '../../components/qa/QAProgress';
import { TestCaseIssueManager } from '../../components/qa/TestCaseIssueManager';
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  AlertOctagon,
  FastForward,
  RotateCcw,
  Search,
  CheckSquare,
  ShieldAlert,
} from 'lucide-react';

export const TestExecutionPage: React.FC = () => {
  const { projectId, testRunId } = useParams<{ projectId: string; testRunId: string }>();
  const queryClient = useQueryClient();

  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');

  // Form states for execution recorder
  const [actualResult, setActualResult] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Fetch Test Run details
  const { data: runRes, isLoading: runLoading } = useQuery({
    queryKey: ['testRun', testRunId],
    queryFn: () => qaService.getTestRun(testRunId!),
    enabled: !!testRunId,
  });

  // Fetch Test Run Cases & Executions
  const { data: runCasesRes, isLoading: casesLoading } = useQuery({
    queryKey: ['testRunCases', testRunId],
    queryFn: () => qaService.getTestRunCases(testRunId!),
    enabled: !!testRunId,
  });

  // Execute Case Mutation
  const executeMutation = useMutation({
    mutationFn: ({ caseId, status, actual_result, notes }: { caseId: string; status: ExecutionStatus; actual_result?: string; notes?: string }) =>
      qaService.executeTestCase(testRunId!, caseId, { status, actual_result, notes }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['testRunCases', testRunId] });
      queryClient.invalidateQueries({ queryKey: ['testRun', testRunId] });
      setError(null);
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || 'Failed to record execution.');
    },
  });

  // Reset Execution Mutation
  const resetMutation = useMutation({
    mutationFn: (caseId: string) => qaService.resetTestExecution(testRunId!, caseId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['testRunCases', testRunId] });
      queryClient.invalidateQueries({ queryKey: ['testRun', testRunId] });
      setActualResult('');
      setNotes('');
      setError(null);
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || 'Failed to reset execution.');
    },
  });

  // Issue Linking Mutations
  const linkIssueMutation = useMutation({
    mutationFn: (issueId: string) => qaService.linkIssue(selectedCaseId!, issueId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['testRunCases', testRunId] }),
  });

  const unlinkIssueMutation = useMutation({
    mutationFn: (issueId: string) => qaService.unlinkIssue(selectedCaseId!, issueId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['testRunCases', testRunId] }),
  });

  const run = runRes?.data;
  const runCases = runCasesRes?.data || [];

  // Auto select first case if none selected
  useEffect(() => {
    if (runCases.length > 0 && !selectedCaseId) {
      setSelectedCaseId(runCases[0].test_case_id);
    }
  }, [runCases, selectedCaseId]);

  // Sync actual result & notes when active test case changes
  const activeRunCase = runCases.find((rc) => rc.test_case_id === selectedCaseId);
  const activeTestCase = activeRunCase?.test_case;
  const activeExecution = activeRunCase?.execution;

  useEffect(() => {
    if (activeExecution) {
      setActualResult(activeExecution.actual_result || '');
      setNotes(activeExecution.notes || '');
    } else {
      setActualResult('');
      setNotes('');
    }
  }, [selectedCaseId, activeExecution]);

  const isLoading = runLoading || casesLoading;

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto">
        <Skeleton className="h-10 w-48" />
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

  // Filtered run cases for left sidebar
  const filteredCases = runCases.filter((rc) => {
    const tc = rc.test_case;
    const matchesSearch = !search || tc?.title.toLowerCase().includes(search.toLowerCase()) || tc?.key.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = !statusFilter || (rc.execution?.status || 'not_run') === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Calculate run progress metrics
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

  const handleRecordExecution = async (status: ExecutionStatus) => {
    if (!selectedCaseId) return;
    await executeMutation.mutateAsync({
      caseId: selectedCaseId,
      status,
      actual_result: actualResult || undefined,
      notes: notes || undefined,
    });
  };

  return (
    <div className="space-y-4 max-w-[1600px] mx-auto">
      {/* Top Header Bar */}
      <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <Link to={`/projects/${projectId}/test-runs/${run.id}`} className="text-slate-400 hover:text-slate-200">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-white truncate">{run.name}</h1>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-indigo-400 border border-slate-700">
                {run.environment || 'staging'}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 truncate">
              {run.status === 'active' ? 'Active QA Execution Workspace' : `Run status is '${run.status}'`}
            </p>
          </div>
        </div>

        <div className="w-64 hidden md:block">
          <QAProgress passed={passed} failed={failed} blocked={blocked} skipped={skipped} notRun={notRun} showLabels={false} />
        </div>
      </div>

      {/* 3-Panel Execution Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start min-h-[750px]">
        {/* LEFT PANEL: Test Cases List (3 cols) */}
        <Card className="lg:col-span-3 p-3 space-y-3 h-full max-h-[780px] flex flex-col">
          <div className="space-y-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search run cases..."
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-950 border border-slate-800 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-2.5 py-1 text-[11px] bg-slate-950 border border-slate-800 rounded-lg text-slate-300 focus:outline-none focus:border-indigo-500"
            >
              <option value="">All Statuses ({runCases.length})</option>
              <option value="not_run">Not Run ({notRun})</option>
              <option value="passed">Passed ({passed})</option>
              <option value="failed">Failed ({failed})</option>
              <option value="blocked">Blocked ({blocked})</option>
              <option value="skipped">Skipped ({skipped})</option>
            </select>
          </div>

          <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
            {filteredCases.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-500">No test cases match filter.</div>
            ) : (
              filteredCases.map((rc) => {
                const tc = rc.test_case;
                const isSelected = tc?.id === selectedCaseId;
                const status = rc.execution?.status || 'not_run';

                return (
                  <div
                    key={rc.id}
                    onClick={() => setSelectedCaseId(tc?.id || null)}
                    className={`p-3 rounded-lg border text-xs cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-indigo-600/15 border-indigo-500/50 text-slate-100 shadow-md'
                        : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-mono font-bold text-indigo-400 text-[11px]">{tc?.key}</span>
                      <ExecutionStatusBadge status={status} size="sm" />
                    </div>
                    <p className="font-medium line-clamp-2 text-xs leading-snug">{tc?.title}</p>
                  </div>
                );
              })
            )}
          </div>
        </Card>

        {/* CENTER PANEL: Active Test Case Details & Step Checklist (5 cols) */}
        <Card className="lg:col-span-5 p-5 space-y-5 h-full max-h-[780px] overflow-y-auto">
          {!activeTestCase ? (
            <div className="p-12 text-center text-xs text-slate-500">
              Select a test case from the left list to view test steps and record result.
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="space-y-1 border-b border-slate-800 pb-4">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-sm text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded">
                    {activeTestCase.key}
                  </span>
                  <span className="text-xs capitalize font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                    {activeTestCase.test_type}
                  </span>
                  <span className={`px-2 py-0.5 rounded font-semibold uppercase text-[10px] ${
                    activeTestCase.priority === 'critical' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {activeTestCase.priority}
                  </span>
                </div>
                <h2 className="text-lg font-bold text-slate-100">{activeTestCase.title}</h2>
              </div>

              {/* Preconditions */}
              {activeTestCase.preconditions && (
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-1">
                  <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">Preconditions</span>
                  <p className="text-slate-300 leading-relaxed">{activeTestCase.preconditions}</p>
                </div>
              )}

              {/* Description */}
              {activeTestCase.description && (
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-1">
                  <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">Description</span>
                  <p className="text-slate-300 leading-relaxed">{activeTestCase.description}</p>
                </div>
              )}

              {/* Steps Checklist */}
              <div className="space-y-3 pt-2">
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                  <CheckSquare className="w-4 h-4 text-indigo-400" />
                  Test Step Verification Checklist ({activeTestCase.steps?.length || 0})
                </h3>

                {(!activeTestCase.steps || activeTestCase.steps.length === 0) ? (
                  <div className="p-4 text-center text-xs text-slate-500 bg-slate-950 rounded-lg border border-slate-800">
                    No steps explicitly defined for this test case.
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {activeTestCase.steps.map((step) => (
                      <div key={step.id} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 space-y-1.5">
                        <div className="flex items-start gap-2.5 text-xs">
                          <span className="w-5 h-5 rounded bg-slate-900 border border-slate-700 font-mono font-bold text-indigo-400 flex items-center justify-center shrink-0 mt-0.5">
                            {step.step_number}
                          </span>
                          <div className="space-y-1 flex-1">
                            <p className="font-semibold text-slate-200">{step.action}</p>
                            {step.expected_result && (
                              <p className="text-[11px] text-slate-400">
                                <span className="font-bold text-slate-500">Expected: </span>
                                {step.expected_result}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </Card>

        {/* RIGHT PANEL: Execution Result Recorder & Defect Linker (4 cols) */}
        <Card className="lg:col-span-4 p-5 space-y-5 h-full max-h-[780px] overflow-y-auto">
          {!activeTestCase ? (
            <div className="p-12 text-center text-xs text-slate-500">Select a test case to record execution.</div>
          ) : (
            <>
              <div className="space-y-1 border-b border-slate-800 pb-3">
                <h3 className="text-sm font-semibold text-slate-200">Record Test Result</h3>
                <p className="text-[11px] text-slate-400">Record execution status and actual outcome for {activeTestCase.key}.</p>
              </div>

              {error && (
                <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-xs text-rose-400">
                  {error}
                </div>
              )}

              {run.status !== 'active' && (
                <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-amber-400 flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 shrink-0" />
                  <span>Test run is not active. Start run to record executions.</span>
                </div>
              )}

              {/* Status Action Buttons */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-300">Set Result Status *</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    disabled={run.status !== 'active' || executeMutation.isPending}
                    onClick={() => handleRecordExecution('passed')}
                    className={`p-2.5 rounded-lg border font-semibold text-xs flex items-center justify-center gap-2 transition-all ${
                      activeExecution?.status === 'passed'
                        ? 'bg-emerald-500 border-emerald-400 text-white shadow-lg shadow-emerald-500/20'
                        : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4" /> Passed
                  </button>

                  <button
                    disabled={run.status !== 'active' || executeMutation.isPending}
                    onClick={() => handleRecordExecution('failed')}
                    className={`p-2.5 rounded-lg border font-semibold text-xs flex items-center justify-center gap-2 transition-all ${
                      activeExecution?.status === 'failed'
                        ? 'bg-rose-500 border-rose-400 text-white shadow-lg shadow-rose-500/20'
                        : 'bg-rose-500/10 border-rose-500/30 text-rose-400 hover:bg-rose-500/20'
                    }`}
                  >
                    <XCircle className="w-4 h-4" /> Failed
                  </button>

                  <button
                    disabled={run.status !== 'active' || executeMutation.isPending}
                    onClick={() => handleRecordExecution('blocked')}
                    className={`p-2.5 rounded-lg border font-semibold text-xs flex items-center justify-center gap-2 transition-all ${
                      activeExecution?.status === 'blocked'
                        ? 'bg-amber-500 border-amber-400 text-white shadow-lg shadow-amber-500/20'
                        : 'bg-amber-500/10 border-amber-500/30 text-amber-400 hover:bg-amber-500/20'
                    }`}
                  >
                    <AlertOctagon className="w-4 h-4" /> Blocked
                  </button>

                  <button
                    disabled={run.status !== 'active' || executeMutation.isPending}
                    onClick={() => handleRecordExecution('skipped')}
                    className={`p-2.5 rounded-lg border font-semibold text-xs flex items-center justify-center gap-2 transition-all ${
                      activeExecution?.status === 'skipped'
                        ? 'bg-violet-500 border-violet-400 text-white shadow-lg shadow-violet-500/20'
                        : 'bg-violet-500/10 border-violet-500/30 text-violet-400 hover:bg-violet-500/20'
                    }`}
                  >
                    <FastForward className="w-4 h-4" /> Skipped
                  </button>
                </div>
              </div>

              {/* Textareas */}
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Actual Result / Trace Output</label>
                  <textarea
                    value={actualResult}
                    onChange={(e) => setActualResult(e.target.value)}
                    placeholder="Enter step observations or failure stack traces..."
                    rows={3}
                    disabled={run.status !== 'active'}
                    className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 resize-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Execution Notes</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Tester notes, device config, or browser version..."
                    rows={2}
                    disabled={run.status !== 'active'}
                    className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 resize-none"
                  />
                </div>
              </div>

              {/* Reset Execution Button */}
              {activeExecution && activeExecution.status !== 'not_run' && run.status === 'active' && (
                <button
                  onClick={() => resetMutation.mutate(selectedCaseId!)}
                  className="w-full py-1.5 text-xs text-slate-400 hover:text-slate-200 border border-slate-800 rounded-lg flex items-center justify-center gap-1.5 transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Reset Execution Status
                </button>
              )}

              {/* Linked Defect Issues */}
              <div className="pt-3 border-t border-slate-800">
                <TestCaseIssueManager
                  caseId={activeTestCase.id}
                  projectId={projectId!}
                  linkedIssues={activeTestCase.issues || []}
                  onLinkIssue={async (issueId) => { await linkIssueMutation.mutateAsync(issueId); }}
                  onUnlinkIssue={async (issueId) => { await unlinkIssueMutation.mutateAsync(issueId); }}
                />
              </div>
            </>
          )}
        </Card>
      </div>
    </div>
  );
};
