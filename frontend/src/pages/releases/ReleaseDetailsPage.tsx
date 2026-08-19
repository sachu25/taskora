import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Calendar, Clock, Rocket, Shield, Info } from 'lucide-react';
import { api } from '../../services/api';
import { releaseService } from '../../services/releaseService';
import type { ApiResponse, OrganizationMember } from '../../types';
import { Card } from '../../components/ui/Card';
import { Skeleton } from '../../components/ui/Skeleton';
import { ReleaseStatusBadge } from '../../components/releases/ReleaseStatusBadge';
import { ReleaseProgress } from '../../components/releases/ReleaseProgress';
import { ReleaseLifecycleActions } from '../../components/releases/ReleaseLifecycleActions';
import { ReleaseManagerSelector } from '../../components/releases/ReleaseManagerSelector';
import { ReleaseIssueManager } from '../../components/releases/ReleaseIssueManager';
import { ReleaseIssueTable } from '../../components/releases/ReleaseIssueTable';
import { ReleaseFormModal } from '../../components/releases/ReleaseFormModal';
import { DeleteReleaseConfirmModal } from '../../components/releases/DeleteReleaseConfirmModal';
import { useAuth } from '../../app/providers/AuthProvider';

export const ReleaseDetailsPage: React.FC = () => {
  const { projectId, releaseId } = useParams<{ projectId: string; releaseId: string }>();
  const navigate = useNavigate();
  const { currentOrg } = useAuth();
  const queryClient = useQueryClient();

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Fetch Release details
  const {
    data: release,
    isLoading: isReleaseLoading,
    isError: isReleaseError,
  } = useQuery({
    queryKey: ['release', releaseId],
    queryFn: async () => {
      const res = await releaseService.getRelease(releaseId!);
      return res.data;
    },
    enabled: !!releaseId,
  });

  // Fetch Release Issues
  const { data: releaseIssues = [] } = useQuery({
    queryKey: ['releaseIssues', releaseId],
    queryFn: async () => {
      const res = await releaseService.getReleaseIssues(releaseId!);
      return res.data;
    },
    enabled: !!releaseId,
  });

  // Fetch Organization Members for Manager selection
  const { data: orgMembers } = useQuery({
    queryKey: ['orgMembers', currentOrg?.id],
    queryFn: async () => {
      if (!currentOrg) return [];
      const res = await api.get<ApiResponse<OrganizationMember[]>>(`/organizations/${currentOrg.id}/members`);
      return res.data.data.map((om) => om.user);
    },
    enabled: !!currentOrg,
  });

  // Lifecycle Mutations
  const startMutation = useMutation({
    mutationFn: () => releaseService.startRelease(releaseId!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['release', releaseId] });
      queryClient.invalidateQueries({ queryKey: ['releases', projectId] });
      setErrorMsg(null);
    },
    onError: (err: any) => setErrorMsg(err.response?.data?.message || 'Failed to start release.'),
  });

  const completeMutation = useMutation({
    mutationFn: () => releaseService.completeRelease(releaseId!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['release', releaseId] });
      queryClient.invalidateQueries({ queryKey: ['releases', projectId] });
      setErrorMsg(null);
    },
    onError: (err: any) => setErrorMsg(err.response?.data?.message || 'Failed to complete release.'),
  });

  const cancelMutation = useMutation({
    mutationFn: () => releaseService.cancelRelease(releaseId!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['release', releaseId] });
      queryClient.invalidateQueries({ queryKey: ['releases', projectId] });
      setErrorMsg(null);
    },
    onError: (err: any) => setErrorMsg(err.response?.data?.message || 'Failed to cancel release.'),
  });

  const restoreMutation = useMutation({
    mutationFn: () => releaseService.restoreRelease(releaseId!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['release', releaseId] });
      queryClient.invalidateQueries({ queryKey: ['releases', projectId] });
      setErrorMsg(null);
    },
    onError: (err: any) => setErrorMsg(err.response?.data?.message || 'Failed to restore release.'),
  });

  const updateMutation = useMutation({
    mutationFn: (payload: any) => releaseService.updateRelease(releaseId!, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['release', releaseId] });
      queryClient.invalidateQueries({ queryKey: ['releases', projectId] });
      setIsEditModalOpen(false);
      setErrorMsg(null);
    },
    onError: (err: any) => setErrorMsg(err.response?.data?.message || 'Failed to update release.'),
  });

  const deleteMutation = useMutation({
    mutationFn: () => releaseService.deleteRelease(releaseId!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['releases', projectId] });
      navigate(`/projects/${projectId}/releases`);
    },
  });

  // Issue attachment mutations
  const addIssueMutation = useMutation({
    mutationFn: (issueId: string) => releaseService.addIssueToRelease(releaseId!, { issue_id: issueId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['releaseIssues', releaseId] });
      queryClient.invalidateQueries({ queryKey: ['release', releaseId] });
    },
  });

  const removeIssueMutation = useMutation({
    mutationFn: (issueId: string) => releaseService.removeIssueFromRelease(releaseId!, issueId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['releaseIssues', releaseId] });
      queryClient.invalidateQueries({ queryKey: ['release', releaseId] });
    },
  });

  // Manager mutations
  const assignManagerMutation = useMutation({
    mutationFn: (userId: string) => releaseService.assignReleaseManager(releaseId!, { user_id: userId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['release', releaseId] });
    },
  });

  const removeManagerMutation = useMutation({
    mutationFn: () => releaseService.removeReleaseManager(releaseId!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['release', releaseId] });
    },
  });

  if (isReleaseLoading) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (isReleaseError || !release) {
    return (
      <div className="max-w-7xl mx-auto space-y-4">
        <Link to={`/projects/${projectId}/releases`} className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Releases
        </Link>
        <div className="p-8 text-center bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-xs">
          Release not found or you do not have permission to view it.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Breadcrumb */}
      <div className="flex items-center justify-between">
        <Link
          to={`/projects/${projectId}/releases`}
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Releases
        </Link>
      </div>

      {/* Header Banner & Lifecycle Control */}
      <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 rounded-lg bg-indigo-600/20 border border-indigo-500/30 font-mono font-bold text-sm text-indigo-400">
                {release.version}
              </span>
              <h1 className="text-2xl font-bold text-white tracking-tight">{release.name}</h1>
              <ReleaseStatusBadge status={release.status} size="lg" />
            </div>
          </div>

          <ReleaseLifecycleActions
            release={release}
            onStart={async () => { await startMutation.mutateAsync(); }}
            onComplete={async () => { await completeMutation.mutateAsync(); }}
            onCancel={async () => { await cancelMutation.mutateAsync(); }}
            onEdit={() => setIsEditModalOpen(true)}
            onDelete={() => setIsDeleteModalOpen(true)}
            onRestore={async () => { await restoreMutation.mutateAsync(); }}
          />
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-400 flex items-center justify-between">
          <span>{errorMsg}</span>
          <button onClick={() => setErrorMsg(null)} className="text-rose-400 hover:text-rose-200">
            Dismiss
          </button>
        </div>
      )}

      {/* 2-Column Responsive Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2-span): Progress, Description & Issue Manager */}
        <div className="lg:col-span-2 space-y-6">
          {/* Progress Card */}
          <Card>
            <h3 className="text-xs font-semibold text-slate-200 mb-3">Release Readiness & Scope Progress</h3>
            <ReleaseProgress issues={releaseIssues} totalCount={release.issues_count} />
          </Card>

          {/* Release Notes / Description */}
          <Card>
            <h3 className="text-xs font-semibold text-slate-200 mb-2">Description & Release Notes</h3>
            <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl text-xs text-slate-300 leading-relaxed min-h-[5rem]">
              {release.description ? (
                <p className="whitespace-pre-wrap">{release.description}</p>
              ) : (
                <span className="text-slate-500 italic">No description provided for this release.</span>
              )}
            </div>
          </Card>

          {/* Linked Issues Manager & Table */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-100">Release Issues</h3>
              <span className="text-xs text-slate-400">{releaseIssues.length} Issues Attached</span>
            </div>

            <ReleaseIssueManager
              projectId={projectId!}
              existingIssues={releaseIssues}
              onAddIssue={async (id) => { await addIssueMutation.mutateAsync(id); }}
              canManage={release.status === 'planned' || release.status === 'in_progress'}
            />

            <ReleaseIssueTable
              issues={releaseIssues}
              projectId={projectId!}
              onRemoveIssue={async (id) => { await removeIssueMutation.mutateAsync(id); }}
              canManage={release.status === 'planned' || release.status === 'in_progress'}
            />
          </div>
        </div>

        {/* Right Column (1-span): Manager & Metadata */}
        <div className="space-y-6">
          {/* Release Manager Selector */}
          <Card>
            <h3 className="text-xs font-semibold text-slate-200 mb-3">Release Manager</h3>
            <ReleaseManagerSelector
              currentManager={release.release_manager}
              members={orgMembers}
              onAssign={async (userId) => { await assignManagerMutation.mutateAsync(userId); }}
              onRemove={async () => { await removeManagerMutation.mutateAsync(); }}
            />
          </Card>

          {/* Metadata Card */}
          <Card>
            <h3 className="text-xs font-semibold text-slate-200 mb-3">Release Schedule & Audit</h3>
            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between py-1.5 border-b border-slate-800/80">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-indigo-400" /> Start Date
                </span>
                <span className="text-slate-200 font-mono">{release.start_date || 'Not set'}</span>
              </div>

              <div className="flex items-center justify-between py-1.5 border-b border-slate-800/80">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-indigo-400" /> Target Date
                </span>
                <span className="text-slate-200 font-mono">{release.release_date || 'Not set'}</span>
              </div>

              {release.released_at && (
                <div className="flex items-center justify-between py-1.5 border-b border-slate-800/80">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <Rocket className="w-3.5 h-3.5 text-emerald-400" /> Released At
                  </span>
                  <span className="text-emerald-400 font-mono">
                    {new Date(release.released_at).toLocaleDateString()}
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between py-1.5 border-b border-slate-800/80">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5 text-slate-400" /> Created By
                </span>
                <span className="text-slate-200">{release.creator?.name || 'System Admin'}</span>
              </div>

              <div className="flex items-center justify-between py-1.5">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-slate-400" /> Created At
                </span>
                <span className="text-slate-400 text-[11px]">
                  {new Date(release.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Edit Release Modal */}
      <ReleaseFormModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSubmit={async (payload) => { await updateMutation.mutateAsync(payload); }}
        initialData={release}
        members={orgMembers}
        isSubmitting={updateMutation.isPending}
      />

      {/* Delete Release Confirm Modal */}
      {isDeleteModalOpen && (
        <DeleteReleaseConfirmModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={async () => { await deleteMutation.mutateAsync(); }}
          releaseName={release.name}
          releaseVersion={release.version}
        />
      )}
    </div>
  );
};
