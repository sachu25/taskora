import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { qaService } from '../../services/qaService';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Skeleton } from '../../components/ui/Skeleton';
import { TestCaseStatusBadge } from '../../components/qa/TestCaseStatusBadge';
import { TestStepEditor } from '../../components/qa/TestStepEditor';
import { TestCaseIssueManager } from '../../components/qa/TestCaseIssueManager';
import { TestCaseFormModal } from '../../components/qa/TestCaseFormModal';
import { ArrowLeft, Edit2 } from 'lucide-react';

export const TestCaseDetailsPage: React.FC = () => {
  const { projectId, testCaseId } = useParams<{ projectId: string; testCaseId: string }>();
  const queryClient = useQueryClient();

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Fetch Test Case details
  const { data: caseRes, isLoading: caseLoading } = useQuery({
    queryKey: ['testCase', testCaseId],
    queryFn: () => qaService.getTestCase(testCaseId!),
    enabled: !!testCaseId,
  });

  // Fetch Test Suites for Modal options
  const { data: suitesRes } = useQuery({
    queryKey: ['testSuites', projectId],
    queryFn: () => qaService.getTestSuites(projectId!),
    enabled: !!projectId,
  });

  const updateCaseMutation = useMutation({
    mutationFn: (data: any) => qaService.updateTestCase(testCaseId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['testCase', testCaseId] });
      queryClient.invalidateQueries({ queryKey: ['testCases', projectId] });
    },
  });

  // Test Steps Mutations
  const addStepMutation = useMutation({
    mutationFn: (data: { action: string; expected_result?: string }) => qaService.addTestStep(testCaseId!, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['testCase', testCaseId] }),
  });

  const updateStepMutation = useMutation({
    mutationFn: ({ stepId, data }: { stepId: string; data: { action?: string; expected_result?: string } }) =>
      qaService.updateTestStep(testCaseId!, stepId, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['testCase', testCaseId] }),
  });

  const deleteStepMutation = useMutation({
    mutationFn: (stepId: string) => qaService.deleteTestStep(testCaseId!, stepId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['testCase', testCaseId] }),
  });

  const reorderStepMutation = useMutation({
    mutationFn: ({ stepId, newPosition }: { stepId: string; newPosition: number }) =>
      qaService.reorderTestStep(testCaseId!, stepId, newPosition),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['testCase', testCaseId] }),
  });

  // Issue Linking Mutations
  const linkIssueMutation = useMutation({
    mutationFn: (issueId: string) => qaService.linkIssue(testCaseId!, issueId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['testCase', testCaseId] }),
  });

  const unlinkIssueMutation = useMutation({
    mutationFn: (issueId: string) => qaService.unlinkIssue(testCaseId!, issueId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['testCase', testCaseId] }),
  });

  const tc = caseRes?.data;
  const suites = suitesRes?.data?.items || [];

  if (caseLoading) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!tc) {
    return (
      <div className="max-w-7xl mx-auto p-6 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400">
        Test case not found or unauthorized access.
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Back Link */}
      <Link to={`/projects/${projectId}/test-cases`} className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200">
        <ArrowLeft className="w-3.5 h-3.5" /> Back to Test Cases
      </Link>

      {/* Header Banner */}
      <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 rounded-lg bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 font-mono font-bold text-sm">
              {tc.key}
            </span>
            <h1 className="text-xl font-bold text-white tracking-tight">{tc.title}</h1>
            <TestCaseStatusBadge status={tc.status} size="sm" />
          </div>
        </div>

        <Button onClick={() => setIsEditModalOpen(true)} icon={<Edit2 className="w-4 h-4" />}>
          Edit Test Case
        </Button>
      </div>

      {/* 2-Column Details Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Left Column: Description, Preconditions, Steps */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6 space-y-4">
            <h3 className="text-sm font-semibold text-slate-200">Preconditions & Context</h3>
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 text-xs text-slate-300 leading-relaxed">
              {tc.preconditions ? tc.preconditions : <span className="text-slate-500 italic">No specific preconditions defined.</span>}
            </div>

            <h3 className="text-sm font-semibold text-slate-200 pt-2">Description</h3>
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 text-xs text-slate-300 leading-relaxed">
              {tc.description ? tc.description : <span className="text-slate-500 italic">No detailed description provided.</span>}
            </div>
          </Card>

          {/* Test Steps Manager */}
          <Card className="p-6">
            <TestStepEditor
              steps={tc.steps || []}
              onAddStep={async (data) => { await addStepMutation.mutateAsync(data); }}
              onUpdateStep={async (stepId, data) => { await updateStepMutation.mutateAsync({ stepId, data }); }}
              onDeleteStep={async (stepId) => { await deleteStepMutation.mutateAsync(stepId); }}
              onReorderStep={async (stepId, newPosition) => { await reorderStepMutation.mutateAsync({ stepId, newPosition }); }}
            />
          </Card>
        </div>

        {/* Right Sidebar Column: Metadata & Linked Issues */}
        <div className="space-y-6">
          {/* Metadata Card */}
          <Card className="p-6 space-y-4">
            <h3 className="text-sm font-semibold text-slate-200 border-b border-slate-800 pb-3">Test Case Specification</h3>
            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center py-1">
                <span className="text-slate-400">Test Type</span>
                <span className="font-semibold text-slate-200 capitalize">{tc.test_type}</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-slate-400">Priority</span>
                <span className={`px-2 py-0.5 rounded font-semibold uppercase text-[10px] ${
                  tc.priority === 'critical' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30' :
                  tc.priority === 'high' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30' :
                  'bg-slate-800 text-slate-400'
                }`}>
                  {tc.priority}
                </span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-slate-400">Test Suite</span>
                {tc.suite ? (
                  <Link to={`/projects/${projectId}/test-suites/${tc.suite.id}`} className="text-indigo-400 font-semibold hover:underline">
                    {tc.suite.name}
                  </Link>
                ) : (
                  <span className="text-slate-500">Unassigned</span>
                )}
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-slate-400">Created By</span>
                <span className="text-slate-200">{tc.creator?.name || 'System Admin'}</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-slate-400">Created At</span>
                <span className="text-slate-400">{new Date(tc.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          </Card>

          {/* Linked Defect Issues Card */}
          <Card className="p-6">
            <TestCaseIssueManager
              caseId={tc.id}
              projectId={projectId!}
              linkedIssues={tc.issues || []}
              onLinkIssue={async (issueId) => { await linkIssueMutation.mutateAsync(issueId); }}
              onUnlinkIssue={async (issueId) => { await unlinkIssueMutation.mutateAsync(issueId); }}
            />
          </Card>
        </div>
      </div>

      {/* Edit Form Modal */}
      <TestCaseFormModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        testCase={tc}
        suites={suites}
        onSubmit={async (data) => {
          await updateCaseMutation.mutateAsync(data);
        }}
        isLoading={updateCaseMutation.isPending}
      />
    </div>
  );
};
