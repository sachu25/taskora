import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { qaService } from '../../services/qaService';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Skeleton } from '../../components/ui/Skeleton';
import { TestCaseStatusBadge } from '../../components/qa/TestCaseStatusBadge';
import { TestCaseFormModal } from '../../components/qa/TestCaseFormModal';
import { ArrowLeft, Plus, TestTube2 } from 'lucide-react';

export const TestSuiteDetailsPage: React.FC = () => {
  const { projectId, suiteId } = useParams<{ projectId: string; suiteId: string }>();
  const queryClient = useQueryClient();

  const [isCaseModalOpen, setIsCaseModalOpen] = useState(false);

  // Fetch Test Suite details
  const { data: suiteRes, isLoading: suiteLoading } = useQuery({
    queryKey: ['testSuite', suiteId],
    queryFn: () => qaService.getTestSuite(suiteId!),
    enabled: !!suiteId,
  });

  // Fetch Test Cases in this Suite
  const { data: casesRes, isLoading: casesLoading } = useQuery({
    queryKey: ['testCases', projectId, suiteId],
    queryFn: () => qaService.getTestCases(projectId!, { suite_id: suiteId }),
    enabled: !!projectId && !!suiteId,
  });

  const createCaseMutation = useMutation({
    mutationFn: (data: any) => qaService.createTestCase(projectId!, { ...data, suite_id: suiteId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['testCases', projectId, suiteId] });
      queryClient.invalidateQueries({ queryKey: ['testSuite', suiteId] });
    },
  });

  const isLoading = suiteLoading || casesLoading;
  const suite = suiteRes?.data;
  const cases = casesRes?.data?.items || [];

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!suite) {
    return (
      <div className="max-w-7xl mx-auto p-6 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400">
        Test suite not found or unauthorized access.
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Back Link */}
      <Link to={`/projects/${projectId}/test-suites`} className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200">
        <ArrowLeft className="w-3.5 h-3.5" /> Back to Test Suites
      </Link>

      {/* Header Banner */}
      <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-white tracking-tight">{suite.name}</h1>
            <span className="text-xs font-mono font-semibold px-2.5 py-1 rounded bg-slate-800 text-indigo-400 border border-slate-700">
              {cases.length} Test Cases
            </span>
          </div>
          <p className="text-xs text-slate-400">{suite.description || 'No description provided for this test suite.'}</p>
        </div>

        <Button onClick={() => setIsCaseModalOpen(true)} icon={<Plus className="w-4 h-4" />}>
          Add Test Case
        </Button>
      </div>

      {/* Test Cases Table Card */}
      <Card className="p-6 space-y-4">
        <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
          <TestTube2 className="w-4 h-4 text-indigo-400" />
          Suite Test Cases ({cases.length})
        </h3>

        {cases.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500 bg-slate-950/50 rounded-xl border border-slate-800">
            No test cases attached to this suite yet. Click "Add Test Case" to create one.
          </div>
        ) : (
          <div className="divide-y divide-slate-800">
            {cases.map((tc) => (
              <div key={tc.id} className="py-3.5 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="font-mono font-bold text-xs text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2 py-1 rounded">
                    {tc.key}
                  </span>
                  <Link
                    to={`/projects/${projectId}/test-cases/${tc.id}`}
                    className="text-sm font-semibold text-slate-200 hover:text-indigo-400 transition-colors truncate"
                  >
                    {tc.title}
                  </Link>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-xs text-slate-400 font-medium capitalize">{tc.test_type}</span>
                  <TestCaseStatusBadge status={tc.status} size="sm" />
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Create Case Modal */}
      <TestCaseFormModal
        isOpen={isCaseModalOpen}
        onClose={() => setIsCaseModalOpen(false)}
        defaultSuiteId={suite.id}
        onSubmit={async (data) => {
          await createCaseMutation.mutateAsync(data);
        }}
        isLoading={createCaseMutation.isPending}
      />
    </div>
  );
};
