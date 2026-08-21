import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Rocket,
  Plus,
  Search,
  Filter,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Layers,
  Clock,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { api } from '../../services/api';
import { releaseService } from '../../services/releaseService';
import type { ApiResponse, Project, OrganizationMember } from '../../types';
import type { Release } from '../../types/release';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Skeleton } from '../../components/ui/Skeleton';
import { ReleaseStatusBadge } from '../../components/releases/ReleaseStatusBadge';
import { ReleaseFormModal } from '../../components/releases/ReleaseFormModal';
import { DeleteReleaseConfirmModal } from '../../components/releases/DeleteReleaseConfirmModal';
import { useAuth } from '../../app/providers/AuthProvider';

export const ReleasesPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const { currentOrg } = useAuth();
  const queryClient = useQueryClient();

  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [page, setPage] = useState(1);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingRelease, setEditingRelease] = useState<Release | null>(null);
  const [deletingRelease, setDeletingRelease] = useState<Release | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const requestIdRef = useRef(0);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch Project details
  const { data: project } = useQuery({
    queryKey: ['project', projectId],
    queryFn: async () => {
      const res = await api.get<ApiResponse<Project>>(`/projects/${projectId}`);
      return res.data.data;
    },
    enabled: !!projectId,
  });

  // Fetch Organization Members for Manager selector
  const { data: orgMembers } = useQuery({
    queryKey: ['orgMembers', currentOrg?.id],
    queryFn: async () => {
      if (!currentOrg) return [];
      const res = await api.get<ApiResponse<OrganizationMember[]>>(`/organizations/${currentOrg.id}/members`);
      return res.data.data.map((om) => om.user);
    },
    enabled: !!currentOrg,
  });

  // Fetch Releases (Paginated, Search, Filter)
  const {
    data: releasesData,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['releases', projectId, debouncedSearch, statusFilter, page],
    queryFn: async () => {
      const currentReq = ++requestIdRef.current;
      const res = await releaseService.getProjectReleases(projectId!, {
        search: debouncedSearch || undefined,
        status: statusFilter || undefined,
        page,
        per_page: 15,
      });

      if (requestIdRef.current !== currentReq) {
        return { items: [], pagination: { current_page: 1, per_page: 15, total: 0, last_page: 1 } };
      }
      return res.data;
    },
    enabled: !!projectId,
  });

  const releases = releasesData?.items || [];
  const pagination = releasesData?.pagination;

  // Mutations
  const createMutation = useMutation({
    mutationFn: async (payload: any) => {
      return await releaseService.createRelease(projectId!, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['releases', projectId] });
      setIsCreateModalOpen(false);
      setErrorMsg(null);
    },
    onError: (err: any) => {
      setErrorMsg(err.response?.data?.message || 'Failed to create release');
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: any }) => {
      return await releaseService.updateRelease(id, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['releases', projectId] });
      setEditingRelease(null);
      setErrorMsg(null);
    },
    onError: (err: any) => {
      setErrorMsg(err.response?.data?.message || 'Failed to update release');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return await releaseService.deleteRelease(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['releases', projectId] });
      setDeletingRelease(null);
    },
  });

  const handleCreateSubmit = async (payload: any) => {
    await createMutation.mutateAsync(payload);
  };

  const handleUpdateSubmit = async (payload: any) => {
    if (!editingRelease) return;
    await updateMutation.mutateAsync({ id: editingRelease.id, payload });
  };

  const handleConfirmDelete = async () => {
    if (!deletingRelease) return;
    await deleteMutation.mutateAsync(deletingRelease.id);
  };

  // Metrics summary calculation
  const totalCount = pagination?.total || releases.length;
  const plannedCount = releases.filter((r) => r.status === 'planned').length;
  const inProgressCount = releases.filter((r) => r.status === 'in_progress').length;
  const releasedCount = releases.filter((r) => r.status === 'released').length;
  const cancelledCount = releases.filter((r) => r.status === 'cancelled').length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Breadcrumb Link */}
      <Link
        to={`/projects/${projectId}`}
        className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Back to Project
      </Link>

      {/* Header Banner */}
      <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30">
              <Rocket className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">Releases</h1>
              <p className="text-xs text-slate-400">
                {project ? `${project.name} (${project.key})` : 'Project'} Release Management & Version Control
              </p>
            </div>
          </div>
        </div>

        <Button
          onClick={() => setIsCreateModalOpen(true)}
          icon={<Plus className="w-4 h-4" />}
        >
          Create Release
        </Button>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-400 flex items-center justify-between">
          <span>{errorMsg}</span>
          <button onClick={() => setErrorMsg(null)} className="text-rose-400 hover:text-rose-200">
            Dismiss
          </button>
        </div>
      )}

      {/* Summary Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <Card className="p-4 flex flex-col justify-between space-y-2">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Total Releases</span>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold text-slate-100 font-mono">{totalCount}</span>
            <Layers className="w-5 h-5 text-indigo-400/60" />
          </div>
        </Card>

        <Card className="p-4 flex flex-col justify-between space-y-2">
          <span className="text-[11px] font-semibold text-purple-400 uppercase tracking-wider">Planned</span>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold text-purple-300 font-mono">{plannedCount}</span>
            <Clock className="w-5 h-5 text-purple-400/60" />
          </div>
        </Card>

        <Card className="p-4 flex flex-col justify-between space-y-2">
          <span className="text-[11px] font-semibold text-sky-400 uppercase tracking-wider">In Progress</span>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold text-sky-300 font-mono">{inProgressCount}</span>
            <Rocket className="w-5 h-5 text-sky-400/60" />
          </div>
        </Card>

        <Card className="p-4 flex flex-col justify-between space-y-2">
          <span className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider">Released</span>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold text-emerald-300 font-mono">{releasedCount}</span>
            <CheckCircle2 className="w-5 h-5 text-emerald-400/60" />
          </div>
        </Card>

        <Card className="p-4 flex flex-col justify-between space-y-2 col-span-2 sm:col-span-1">
          <span className="text-[11px] font-semibold text-rose-400 uppercase tracking-wider">Cancelled</span>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold text-rose-300 font-mono">{cancelledCount}</span>
            <XCircle className="w-5 h-5 text-rose-400/60" />
          </div>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search version, release name..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-950 border border-slate-700/80 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="flex items-center gap-2 text-xs text-slate-400 shrink-0">
            <Filter className="w-3.5 h-3.5 text-indigo-400" />
            <span>Status:</span>
          </div>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="w-full sm:w-44 px-3 py-2 text-xs bg-slate-950 border border-slate-700/80 rounded-lg text-slate-100 focus:outline-none focus:border-indigo-500"
          >
            <option value="">All Statuses</option>
            <option value="planned">Planned</option>
            <option value="in_progress">In Progress</option>
            <option value="released">Released</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Loading Skeletons */}
      {isLoading && (
        <div className="space-y-3">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      )}

      {/* Error View */}
      {isError && (
        <div className="p-8 text-center bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-xs">
          Failed to load project releases. Please check authorization or network connection.
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !isError && releases.length === 0 && (
        <Card className="p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mx-auto">
            <Rocket className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-semibold text-slate-200">No Releases Found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            {debouncedSearch || statusFilter
              ? 'No project releases match your search/filter criteria.'
              : 'No releases have been created for this project yet.'}
          </p>
          {!debouncedSearch && !statusFilter && (
            <Button size="sm" onClick={() => setIsCreateModalOpen(true)} icon={<Plus className="w-3.5 h-3.5" />}>
              Create First Release
            </Button>
          )}
        </Card>
      )}

      {/* Releases List - Desktop Table & Mobile Cards */}
      {!isLoading && !isError && releases.length > 0 && (
        <div className="space-y-4">
          {/* Desktop Table */}
          <div className="hidden lg:block overflow-x-auto border border-slate-800 rounded-xl bg-slate-900">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/60 text-slate-400 uppercase tracking-wider text-[10px] font-semibold border-b border-slate-800">
                <tr>
                  <th className="py-3.5 px-4">Version</th>
                  <th className="py-3.5 px-4">Release Name</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Release Manager</th>
                  <th className="py-3.5 px-4">Start Date</th>
                  <th className="py-3.5 px-4">Target Date</th>
                  <th className="py-3.5 px-4">Issues</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 text-slate-300">
                {releases.map((release) => (
                  <tr key={release.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-indigo-400">
                      <Link to={`/projects/${projectId}/releases/${release.version || release.id}`} className="hover:underline">
                        {release.version}
                      </Link>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-100">
                      <Link to={`/projects/${projectId}/releases/${release.version || release.id}`} className="hover:text-indigo-400 transition-colors">
                        {release.name}
                      </Link>
                    </td>
                    <td className="py-3.5 px-4">
                      <ReleaseStatusBadge status={release.status} />
                    </td>
                    <td className="py-3.5 px-4">
                      {release.release_manager ? (
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center text-[10px] font-bold text-slate-200">
                            {release.release_manager.name.charAt(0)}
                          </div>
                          <span>{release.release_manager.name}</span>
                        </div>
                      ) : (
                        <span className="text-slate-500 italic">Unassigned</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-slate-400">{release.start_date || '—'}</td>
                    <td className="py-3.5 px-4 text-slate-400">{release.release_date || '—'}</td>
                    <td className="py-3.5 px-4 font-mono font-semibold text-slate-300">
                      {release.issues_count ?? 0}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link to={`/projects/${projectId}/releases/${release.version || release.id}`}>
                          <Button size="sm" variant="outline">
                            Details
                          </Button>
                        </Link>
                        <Button size="sm" variant="ghost" onClick={() => setEditingRelease(release)}>
                          Edit
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => setDeletingRelease(release)} className="text-rose-400 hover:text-rose-300">
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile / Tablet Responsive Cards */}
          <div className="lg:hidden space-y-3">
            {releases.map((release) => (
              <div key={release.id} className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-indigo-400 text-xs">{release.version}</span>
                  <ReleaseStatusBadge status={release.status} size="sm" />
                </div>

                <div>
                  <Link to={`/projects/${projectId}/releases/${release.version || release.id}`} className="text-sm font-bold text-slate-100 hover:text-indigo-400 block">
                    {release.name}
                  </Link>
                  {release.description && (
                    <p className="text-xs text-slate-400 mt-1 line-clamp-2">{release.description}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs text-slate-400 pt-2 border-t border-slate-800/80">
                  <div>
                    <span className="text-[10px] text-slate-500 block">Manager</span>
                    <span className="text-slate-200">{release.release_manager?.name || 'Unassigned'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Target Date</span>
                    <span className="text-slate-200">{release.release_date || 'Not set'}</span>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between border-t border-slate-800">
                  <span className="text-xs text-slate-400">
                    <strong className="text-slate-200">{release.issues_count ?? 0}</strong> Issues
                  </span>
                  <div className="flex items-center gap-2">
                    <Link to={`/projects/${projectId}/releases/${release.version || release.id}`}>
                      <Button size="sm" variant="outline">
                        View
                      </Button>
                    </Link>
                    <Button size="sm" variant="ghost" onClick={() => setEditingRelease(release)}>
                      Edit
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination Controls */}
          {pagination && pagination.last_page > 1 && (
            <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between text-xs text-slate-400">
              <span>
                Page {pagination.current_page} of {pagination.last_page} ({pagination.total} total releases)
              </span>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={pagination.current_page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  icon={<ChevronLeft className="w-3.5 h-3.5" />}
                >
                  Previous
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={pagination.current_page >= pagination.last_page}
                  onClick={() => setPage((p) => p + 1)}
                  icon={<ChevronRight className="w-3.5 h-3.5" />}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Create Release Modal */}
      <ReleaseFormModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateSubmit}
        members={orgMembers}
        isSubmitting={createMutation.isPending}
      />

      {/* Edit Release Modal */}
      <ReleaseFormModal
        isOpen={!!editingRelease}
        onClose={() => setEditingRelease(null)}
        onSubmit={handleUpdateSubmit}
        initialData={editingRelease}
        members={orgMembers}
        isSubmitting={updateMutation.isPending}
      />

      {/* Delete Release Confirm Modal */}
      {deletingRelease && (
        <DeleteReleaseConfirmModal
          isOpen={!!deletingRelease}
          onClose={() => setDeletingRelease(null)}
          onConfirm={handleConfirmDelete}
          releaseName={deletingRelease.name}
          releaseVersion={deletingRelease.version}
        />
      )}
    </div>
  );
};
