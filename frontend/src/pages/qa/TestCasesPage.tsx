import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { qaService } from '../../services/qaService';
import { api } from '../../services/api';
import type { ApiResponse, Project } from '../../types';
import type { TestCase, TestSuite } from '../../types/qa';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Skeleton } from '../../components/ui/Skeleton';
import { TestCaseStatusBadge } from '../../components/qa/TestCaseStatusBadge';
import { TestCaseFormModal } from '../../components/qa/TestCaseFormModal';
import { DeleteQAConfirmModal } from '../../components/qa/DeleteQAConfirmModal';
import { ArrowLeft, Plus, Search, TestTube2, Edit2, Trash2, Bug, ListOrdered } from 'lucide-react';

export const TestCasesPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const queryClient = useQueryClient();

  const [search, setSearch] = useState('');
  const [selectedSuite, setSelectedSuite] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedPriority, setSelectedPriority] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [page, setPage] = useState(1);

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingCase, setEditingCase] = useState<TestCase | null>(null);
  const [deletingCase, setDeletingCase] = useState<TestCase | null>(null);

  // Fetch Project
  const { data: project } = useQuery({
    queryKey: ['project', projectId],
    queryFn: async () => {
      const res = await api.get<ApiResponse<Project>>(`/projects/${projectId}`);
      return res.data.data;
    },
    enabled: !!projectId,
  });

  // Fetch Test Suites for filter dropdown
  const { data: suitesRes } = useQuery({
    queryKey: ['testSuites', projectId],
    queryFn: () => qaService.getTestSuites(projectId!),
    enabled: !!projectId,
  });

  // Fetch Test Cases
  const { data: casesRes, isLoading } = useQuery({
    queryKey: ['testCases', projectId, search, selectedSuite, selectedType, selectedPriority, selectedStatus, page],
    queryFn: () =>
      qaService.getTestCases(projectId!, {
        search: search || undefined,
        suite_id: selectedSuite || undefined,
        test_type: selectedType || undefined,
        priority: selectedPriority || undefined,
        status: selectedStatus || undefined,
        page,
        per_page: 25,
      }),
    enabled: !!projectId,
  });

  const createCaseMutation = useMutation({
    mutationFn: (data: any) => qaService.createTestCase(projectId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['testCases', projectId] });
    },
  });

  const updateCaseMutation = useMutation({
    mutationFn: (data: any) => qaService.updateTestCase(editingCase!.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['testCases', projectId] });
    },
  });

  const deleteCaseMutation = useMutation({
    mutationFn: (caseId: string) => qaService.deleteTestCase(caseId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['testCases', projectId] });
      setDeletingCase(null);
    },
  });

  const suites: TestSuite[] = suitesRes?.data?.items || [];
  const cases: TestCase[] = casesRes?.data?.items || [];
  const pagination = casesRes?.data?.pagination;

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
            <h1 className="text-2xl font-bold text-white tracking-tight">Test Cases Repository</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">Master repository of test specifications, steps, and defect links.</p>
        </div>

        <Button onClick={() => { setEditingCase(null); setIsFormModalOpen(true); }} icon={<Plus className="w-4 h-4" />}>
          Create Test Case
        </Button>
      </div>

      {/* Filter Bar */}
      <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
          <div className="relative md:col-span-1">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search title..."
              className="w-full pl-9 pr-3.5 py-2 text-xs bg-slate-950 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <select
            value={selectedSuite}
            onChange={(e) => { setSelectedSuite(e.target.value); setPage(1); }}
            className="px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-indigo-500"
          >
            <option value="">All Suites</option>
            {suites.map((s: TestSuite) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>

          <select
            value={selectedType}
            onChange={(e) => { setSelectedType(e.target.value); setPage(1); }}
            className="px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-indigo-500"
          >
            <option value="">All Test Types</option>
            <option value="functional">Functional</option>
            <option value="smoke">Smoke</option>
            <option value="regression">Regression</option>
            <option value="security">Security</option>
            <option value="usability">Usability</option>
          </select>

          <select
            value={selectedPriority}
            onChange={(e) => { setSelectedPriority(e.target.value); setPage(1); }}
            className="px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-indigo-500"
          >
            <option value="">All Priorities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => { setSelectedStatus(e.target.value); setPage(1); }}
            className="px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-indigo-500"
          >
            <option value="">All Statuses</option>
            <option value="draft">Draft</option>
            <option value="ready">Ready</option>
            <option value="deprecated">Deprecated</option>
          </select>
        </div>
      </div>

      {/* Cases Table */}
      <Card className="p-0 overflow-hidden border border-slate-800">
        {isLoading ? (
          <div className="p-6 space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : cases.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <TestTube2 className="w-10 h-10 text-slate-600 mx-auto" />
            <h3 className="text-base font-semibold text-slate-300">No Test Cases Found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              No matching test cases found. Create your first test case to start documenting test steps.
            </p>
            <Button size="sm" onClick={() => { setEditingCase(null); setIsFormModalOpen(true); }} icon={<Plus className="w-3.5 h-3.5" />}>
              Create Test Case
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="p-4">Key</th>
                  <th className="p-4">Title</th>
                  <th className="p-4">Suite</th>
                  <th className="p-4">Type</th>
                  <th className="p-4">Priority</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Steps / Defects</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {cases.map((tc: TestCase) => (
                  <tr key={tc.id} className="hover:bg-slate-900/50 transition-colors group">
                    <td className="p-4 font-mono font-bold text-indigo-400 whitespace-nowrap">
                      <Link to={`/projects/${projectId}/test-cases/${tc.id}`} className="hover:underline">
                        {tc.key}
                      </Link>
                    </td>

                    <td className="p-4 font-medium text-slate-200">
                      <Link to={`/projects/${projectId}/test-cases/${tc.id}`} className="hover:text-indigo-400 transition-colors">
                        {tc.title}
                      </Link>
                    </td>

                    <td className="p-4 text-slate-400 whitespace-nowrap">
                      {tc.suite?.name || <span className="text-slate-600">Unassigned</span>}
                    </td>

                    <td className="p-4 capitalize text-slate-300 whitespace-nowrap">{tc.test_type}</td>

                    <td className="p-4 whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded font-semibold uppercase text-[10px] ${
                        tc.priority === 'critical' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30' :
                        tc.priority === 'high' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30' :
                        'bg-slate-800 text-slate-400'
                      }`}>
                        {tc.priority}
                      </span>
                    </td>

                    <td className="p-4 whitespace-nowrap">
                      <TestCaseStatusBadge status={tc.status} size="sm" />
                    </td>

                    <td className="p-4 whitespace-nowrap">
                      <div className="flex items-center gap-3 text-slate-400">
                        <span className="flex items-center gap-1" title="Test Steps">
                          <ListOrdered className="w-3.5 h-3.5 text-indigo-400" />
                          {tc.steps?.length || 0}
                        </span>
                        <span className="flex items-center gap-1" title="Linked Defects">
                          <Bug className="w-3.5 h-3.5 text-rose-400" />
                          {tc.issues?.length || 0}
                        </span>
                      </div>
                    </td>

                    <td className="p-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => { setEditingCase(tc); setIsFormModalOpen(true); }}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-400 hover:bg-slate-800 transition-colors"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeletingCase(tc)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        {pagination && pagination.last_page > 1 && (
          <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span>Page {pagination.current_page} of {pagination.last_page} ({pagination.total} total cases)</span>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                disabled={page === 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Previous
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={page === pagination.last_page}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Form Modal */}
      <TestCaseFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        testCase={editingCase}
        suites={suites}
        onSubmit={async (data) => {
          if (editingCase) {
            await updateCaseMutation.mutateAsync(data);
          } else {
            await createCaseMutation.mutateAsync(data);
          }
        }}
        isLoading={createCaseMutation.isPending || updateCaseMutation.isPending}
      />

      {/* Delete Confirmation Modal */}
      <DeleteQAConfirmModal
        isOpen={!!deletingCase}
        onClose={() => setDeletingCase(null)}
        title="Delete Test Case"
        description={`Are you sure you want to soft-delete test case ${deletingCase?.key} ("${deletingCase?.title}")?`}
        onConfirm={async () => {
          if (deletingCase) {
            await deleteCaseMutation.mutateAsync(deletingCase.id);
          }
        }}
        isLoading={deleteCaseMutation.isPending}
      />
    </div>
  );
};
