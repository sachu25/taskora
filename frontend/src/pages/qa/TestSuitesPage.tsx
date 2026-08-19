import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { qaService } from '../../services/qaService';
import { api } from '../../services/api';
import type { ApiResponse, Project } from '../../types';
import type { TestSuite } from '../../types/qa';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Skeleton } from '../../components/ui/Skeleton';
import { TestSuiteFormModal } from '../../components/qa/TestSuiteFormModal';
import { DeleteQAConfirmModal } from '../../components/qa/DeleteQAConfirmModal';
import { ArrowLeft, Plus, Search, Layers, Edit2, Trash2, FolderOpen } from 'lucide-react';

export const TestSuitesPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const queryClient = useQueryClient();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('active');
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingSuite, setEditingSuite] = useState<TestSuite | null>(null);
  const [deletingSuite, setDeletingSuite] = useState<TestSuite | null>(null);

  // Fetch Project
  const { data: project } = useQuery({
    queryKey: ['project', projectId],
    queryFn: async () => {
      const res = await api.get<ApiResponse<Project>>(`/projects/${projectId}`);
      return res.data.data;
    },
    enabled: !!projectId,
  });

  // Fetch Test Suites
  const { data: suitesRes, isLoading } = useQuery({
    queryKey: ['testSuites', projectId, search, statusFilter],
    queryFn: () => qaService.getTestSuites(projectId!, { search: search || undefined, status: statusFilter || undefined }),
    enabled: !!projectId,
  });

  const createSuiteMutation = useMutation({
    mutationFn: (data: { name: string; description?: string; status?: 'active' | 'archived' }) =>
      qaService.createTestSuite(projectId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['testSuites', projectId] });
    },
  });

  const updateSuiteMutation = useMutation({
    mutationFn: (data: { name?: string; description?: string; status?: 'active' | 'archived' }) =>
      qaService.updateTestSuite(editingSuite!.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['testSuites', projectId] });
    },
  });

  const deleteSuiteMutation = useMutation({
    mutationFn: (suiteId: string) => qaService.deleteTestSuite(suiteId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['testSuites', projectId] });
      setDeletingSuite(null);
    },
  });

  const suites: TestSuite[] = suitesRes?.data?.items || [];

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
            <h1 className="text-2xl font-bold text-white tracking-tight">Test Suites</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">Organize test specifications by module, domain, or feature set.</p>
        </div>

        <Button onClick={() => { setEditingSuite(null); setIsFormModalOpen(true); }} icon={<Plus className="w-4 h-4" />}>
          Create Test Suite
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
            placeholder="Search test suites..."
            className="w-full pl-9 pr-3.5 py-2 text-xs bg-slate-950 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center gap-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-indigo-500"
          >
            <option value="active">Active Suites</option>
            <option value="archived">Archived Suites</option>
            <option value="">All Statuses</option>
          </select>
        </div>
      </div>

      {/* Suite Cards List */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
      ) : suites.length === 0 ? (
        <Card className="p-12 text-center space-y-3">
          <Layers className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-base font-semibold text-slate-300">No Test Suites Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Get started by creating your first test suite to categorize project test cases.
          </p>
          <Button size="sm" onClick={() => { setEditingSuite(null); setIsFormModalOpen(true); }} icon={<Plus className="w-3.5 h-3.5" />}>
            Create Suite
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {suites.map((suite: TestSuite) => (
            <Card key={suite.id} className="p-5 flex flex-col justify-between space-y-4 hover:border-slate-700/80 transition-colors group">
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-3">
                  <Link
                    to={`/projects/${projectId}/test-suites/${suite.id}`}
                    className="text-base font-bold text-slate-100 hover:text-indigo-400 transition-colors line-clamp-1"
                  >
                    {suite.name}
                  </Link>
                  <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-slate-800 text-indigo-400 border border-slate-700 shrink-0">
                    {suite.test_cases_count ?? 0} Cases
                  </span>
                </div>
                <p className="text-xs text-slate-400 line-clamp-2">{suite.description || 'No description provided.'}</p>
              </div>

              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <span className="text-slate-500">By {suite.creator?.name || 'User'}</span>
                <div className="flex items-center gap-2">
                  <Link to={`/projects/${projectId}/test-suites/${suite.id}`}>
                    <Button size="sm" variant="ghost" icon={<FolderOpen className="w-3.5 h-3.5" />}>
                      Open
                    </Button>
                  </Link>
                  <button
                    onClick={() => { setEditingSuite(suite); setIsFormModalOpen(true); }}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-400 hover:bg-slate-800 transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setDeletingSuite(suite)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Form Modal */}
      <TestSuiteFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        suite={editingSuite}
        onSubmit={async (data) => {
          if (editingSuite) {
            await updateSuiteMutation.mutateAsync(data);
          } else {
            await createSuiteMutation.mutateAsync(data);
          }
        }}
        isLoading={createSuiteMutation.isPending || updateSuiteMutation.isPending}
      />

      {/* Delete Confirmation Modal */}
      <DeleteQAConfirmModal
        isOpen={!!deletingSuite}
        onClose={() => setDeletingSuite(null)}
        title="Delete Test Suite"
        description={`Are you sure you want to soft-delete test suite "${deletingSuite?.name}"? Test cases in this suite will remain intact.`}
        onConfirm={async () => {
          if (deletingSuite) {
            await deleteSuiteMutation.mutateAsync(deletingSuite.id);
          }
        }}
        isLoading={deleteSuiteMutation.isPending}
      />
    </div>
  );
};
