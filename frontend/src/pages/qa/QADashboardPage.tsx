import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { qaService } from '../../services/qaService';
import { api } from '../../services/api';
import type { ApiResponse, Project } from '../../types';
import type { TestRun, TestRunCase, TestSuite } from '../../types/qa';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Skeleton } from '../../components/ui/Skeleton';
import { QASummaryCards } from '../../components/qa/QASummaryCards';
import { QAProgress } from '../../components/qa/QAProgress';
import { TestRunStatusBadge } from '../../components/qa/TestRunStatusBadge';
import { ArrowLeft, Play, Layers, TestTube2, ArrowRight } from 'lucide-react';

export const QADashboardPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();

  // Fetch Project details
  const { data: project, isLoading: projectLoading } = useQuery({
    queryKey: ['project', projectId],
    queryFn: async () => {
      const res = await api.get<ApiResponse<Project>>(`/projects/${projectId}`);
      return res.data.data;
    },
    enabled: !!projectId,
  });

  // Fetch Test Suites
  const { data: suitesRes, isLoading: suitesLoading } = useQuery({
    queryKey: ['testSuites', projectId],
    queryFn: () => qaService.getTestSuites(projectId!),
    enabled: !!projectId,
  });

  // Fetch Test Cases
  const { data: casesRes, isLoading: casesLoading } = useQuery({
    queryKey: ['testCases', projectId],
    queryFn: () => qaService.getTestCases(projectId!),
    enabled: !!projectId,
  });

  // Fetch Test Runs
  const { data: runsRes, isLoading: runsLoading } = useQuery({
    queryKey: ['testRuns', projectId],
    queryFn: () => qaService.getTestRuns(projectId!),
    enabled: !!projectId,
  });

  const isLoading = projectLoading || suitesLoading || casesLoading || runsLoading;

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  const suites: TestSuite[] = suitesRes?.data?.items || [];
  const cases = casesRes?.data?.items || [];
  const runs: TestRun[] = runsRes?.data?.items || [];
  const activeRuns = runs.filter((r: TestRun) => r.status === 'active');

  // Compute aggregate stats across runs
  let totalExecutions = 0;
  let passedCount = 0;
  let failedCount = 0;
  let blockedCount = 0;

  runs.forEach((r: TestRun) => {
    if (r.run_cases) {
      r.run_cases.forEach((rc: TestRunCase) => {
        if (rc.execution) {
          totalExecutions++;
          if (rc.execution.status === 'passed') passedCount++;
          if (rc.execution.status === 'failed') failedCount++;
          if (rc.execution.status === 'blocked') blockedCount++;
        }
      });
    }
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Back Link */}
      <Link to={`/projects/${projectId}`} className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200">
        <ArrowLeft className="w-3.5 h-3.5" /> Back to Project ({project?.key})
      </Link>

      {/* Header Banner */}
      <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 rounded-lg bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 font-mono font-bold text-sm">
              {project?.key}
            </span>
            <h1 className="text-2xl font-bold text-white tracking-tight">QA & Test Management Workspace</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Test suites, test case repository, active execution runs, and defect traceability.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link to={`/projects/${projectId}/test-cases`}>
            <Button variant="outline" size="sm" icon={<TestTube2 className="w-4 h-4" />}>
              Test Cases ({cases.length})
            </Button>
          </Link>
          <Link to={`/projects/${projectId}/test-runs`}>
            <Button size="sm" icon={<Play className="w-4 h-4" />}>
              Test Runs ({runs.length})
            </Button>
          </Link>
        </div>
      </div>

      {/* QA Sub-Navigation Tabs */}
      <div className="border-b border-slate-800 flex items-center gap-6 text-sm font-medium overflow-x-auto pb-px">
        <Link to={`/projects/${projectId}/qa`} className="py-2 border-b-2 border-indigo-500 text-indigo-400 font-semibold">
          QA Dashboard
        </Link>
        <Link to={`/projects/${projectId}/test-suites`} className="py-2 text-slate-400 hover:text-slate-200">
          Test Suites ({suites.length})
        </Link>
        <Link to={`/projects/${projectId}/test-cases`} className="py-2 text-slate-400 hover:text-slate-200">
          Test Cases ({cases.length})
        </Link>
        <Link to={`/projects/${projectId}/test-runs`} className="py-2 text-slate-400 hover:text-slate-200">
          Test Runs ({runs.length})
        </Link>
      </div>

      {/* Metric Summary Cards */}
      <QASummaryCards
        totalSuites={suites.length}
        totalCases={cases.length}
        activeRuns={activeRuns.length}
        passedCount={passedCount}
        failedCount={failedCount}
        blockedCount={blockedCount}
        totalExecutions={totalExecutions}
      />

      {/* Main Grid: Active Runs & Test Suites */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Test Runs Section */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
              <Play className="w-4 h-4 text-indigo-400" />
              Active Test Execution Cycles ({activeRuns.length})
            </h3>
            <Link to={`/projects/${projectId}/test-runs`} className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
              View All Runs <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {activeRuns.length === 0 ? (
            <Card className="p-8 text-center text-xs text-slate-500">
              No active test execution cycles in progress. Navigate to Test Runs to start an execution cycle.
            </Card>
          ) : (
            activeRuns.map((run: TestRun) => {
              const runCases = run.run_cases || [];
              let runPassed = 0;
              let runFailed = 0;
              let runBlocked = 0;
              let runSkipped = 0;
              let runNotRun = 0;

              runCases.forEach((rc: TestRunCase) => {
                const st = rc.execution?.status || 'not_run';
                if (st === 'passed') runPassed++;
                else if (st === 'failed') runFailed++;
                else if (st === 'blocked') runBlocked++;
                else if (st === 'skipped') runSkipped++;
                else runNotRun++;
              });

              return (
                <Card key={run.id} className="p-5 space-y-4 hover:border-slate-700/80 transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2.5">
                        <h4 className="text-base font-bold text-slate-100">{run.name}</h4>
                        <TestRunStatusBadge status={run.status} size="sm" />
                      </div>
                      <p className="text-xs text-slate-400 mt-1">{run.description || 'No run description provided.'}</p>
                    </div>

                    <Link to={`/projects/${projectId}/test-runs/${run.id}/execute`}>
                      <Button size="sm" icon={<Play className="w-3.5 h-3.5" />}>
                        Execute Tests
                      </Button>
                    </Link>
                  </div>

                  <QAProgress
                    passed={runPassed}
                    failed={runFailed}
                    blocked={runBlocked}
                    skipped={runSkipped}
                    notRun={runNotRun}
                  />
                </Card>
              );
            })
          )}
        </div>

        {/* Test Suites Sidebar Card */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-400" />
              Test Suites ({suites.length})
            </h3>
            <Link to={`/projects/${projectId}/test-suites`} className="text-xs text-indigo-400 hover:text-indigo-300">
              View All
            </Link>
          </div>

          <Card className="p-4 space-y-3">
            {suites.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-4">No test suites created yet.</p>
            ) : (
              suites.slice(0, 5).map((suite: TestSuite) => (
                <Link
                  key={suite.id}
                  to={`/projects/${projectId}/test-suites/${suite.id}`}
                  className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-indigo-500/40 block transition-colors"
                >
                  <div className="flex items-center justify-between mb-1">
                    <h5 className="text-xs font-semibold text-slate-200 truncate">{suite.name}</h5>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-indigo-400">
                      {suite.test_cases_count ?? 0} Cases
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 line-clamp-1">{suite.description || 'No description'}</p>
                </Link>
              ))
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};
