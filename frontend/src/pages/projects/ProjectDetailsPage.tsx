import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../services/api';
import type { ApiResponse, Project, OrganizationMember } from '../../types';
import { useAuth } from '../../app/providers/AuthProvider';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Skeleton } from '../../components/ui/Skeleton';
import { Modal } from '../../components/ui/Modal';
import { ArrowLeft, UserPlus, Trash2 } from 'lucide-react';

export const ProjectDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { currentOrg } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'overview' | 'members'>('overview');
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [selectedRole, setSelectedRole] = useState<'project_manager' | 'developer' | 'tester' | 'reporter' | 'viewer'>('developer');
  const [addMemberError, setAddMemberError] = useState<string | null>(null);

  // Fetch Project Details
  const { data: project, isLoading, isError } = useQuery({
    queryKey: ['project', id],
    queryFn: async () => {
      const res = await api.get<ApiResponse<Project>>(`/projects/${id}`);
      return res.data.data;
    },
    enabled: !!id,
  });

  // Fetch Org Members to add to Project
  const { data: orgMembers } = useQuery({
    queryKey: ['orgMembers', currentOrg?.id],
    queryFn: async () => {
      if (!currentOrg) return [];
      const res = await api.get<ApiResponse<OrganizationMember[]>>(`/organizations/${currentOrg.id}/members`);
      return res.data.data;
    },
    enabled: !!currentOrg,
  });

  const addMemberMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post(`/projects/${id}/members`, {
        user_id: selectedUserId,
        role: selectedRole,
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', id] });
      setIsAddMemberModalOpen(false);
      setSelectedUserId('');
      setAddMemberError(null);
    },
    onError: (err: any) => {
      setAddMemberError(err.response?.data?.message || err.response?.data?.errors?.user_id?.[0] || 'Failed to add member');
    },
  });

  const removeMemberMutation = useMutation({
    mutationFn: async (userId: string) => {
      await api.delete(`/projects/${id}/members/${userId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', id] });
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (isError || !project) {
    return (
      <div className="max-w-7xl mx-auto p-6 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400">
        Project not found or unauthorized access.
      </div>
    );
  }

  // Filter out users already in project
  const availableUsers = orgMembers?.filter(
    (om) => !project.members?.some((pm) => pm.user.id === om.user.id)
  ) || [];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Back Link */}
      <Link to="/projects" className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200">
        <ArrowLeft className="w-3.5 h-3.5" /> Back to Projects
      </Link>

      {/* Project Banner Header */}
      <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 rounded-lg bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 font-mono font-bold text-sm">
              {project.key}
            </span>
            <h1 className="text-2xl font-bold text-white tracking-tight">{project.name}</h1>
            <Badge variant={project.status === 'active' ? 'success' : 'neutral'}>
              {project.status}
            </Badge>
          </div>
          <p className="text-xs text-slate-400 max-w-2xl">{project.description || 'No project description provided.'}</p>
        </div>

        <div className="flex items-center gap-3">
          <Button onClick={() => setIsAddMemberModalOpen(true)} icon={<UserPlus className="w-4 h-4" />}>
            Add Member
          </Button>
        </div>
      </div>

      {/* Navigation Tabs (Overview, Members, & Future Modules) */}
      <div className="border-b border-slate-800 flex items-center gap-6 text-sm font-medium overflow-x-auto pb-px">
        <button
          onClick={() => setActiveTab('overview')}
          className={`py-2 border-b-2 transition-colors cursor-pointer ${
            activeTab === 'overview'
              ? 'border-indigo-500 text-indigo-400 font-semibold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Overview
        </button>

        <button
          onClick={() => setActiveTab('members')}
          className={`py-2 border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
            activeTab === 'members'
              ? 'border-indigo-500 text-indigo-400 font-semibold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <span>Members</span>
          <span className="px-2 py-0.5 rounded-full bg-slate-800 text-xs text-slate-400">
            {project.members?.length || 0}
          </span>
        </button>

        <Link
          to={`/projects/${project?.key || id}/sprints`}
          className="py-2 text-slate-400 hover:text-indigo-400 flex items-center gap-1.5 transition-colors"
        >
          <span>Sprints</span>
        </Link>
        <Link
          to={`/projects/${project?.key || id}/backlog`}
          className="py-2 text-slate-400 hover:text-indigo-400 flex items-center gap-1.5 transition-colors"
        >
          <span>Backlog</span>
        </Link>
        <Link
          to={`/projects/${project?.key || id}/sprint-planning`}
          className="py-2 text-slate-400 hover:text-indigo-400 flex items-center gap-1.5 transition-colors"
        >
          <span>Sprint Planning</span>
        </Link>
        <Link
          to={`/projects/${project?.key || id}/qa`}
          className="py-2 text-slate-400 hover:text-indigo-400 flex items-center gap-1.5 transition-colors"
        >
          <span>QA & Testing</span>
        </Link>
        <Link
          to={`/projects/${project?.key || id}/releases`}
          className="py-2 text-slate-400 hover:text-indigo-400 flex items-center gap-1.5 transition-colors"
        >
          <span>Releases</span>
        </Link>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <h3 className="text-sm font-semibold text-slate-200 mb-3">Project Metadata</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
                <div>
                  <span className="text-slate-500 block mb-1">Key Identifier</span>
                  <span className="font-mono font-bold text-indigo-400">{project.key}</span>
                </div>
                <div>
                  <span className="text-slate-500 block mb-1">Visibility</span>
                  <span className="capitalize text-slate-200">{project.visibility}</span>
                </div>
                <div>
                  <span className="text-slate-500 block mb-1">Status</span>
                  <Badge variant={project.status === 'active' ? 'success' : 'neutral'}>
                    {project.status}
                  </Badge>
                </div>
                <div>
                  <span className="text-slate-500 block mb-1">Start Date</span>
                  <span className="text-slate-200">{project.start_date || 'Not set'}</span>
                </div>
                <div>
                  <span className="text-slate-500 block mb-1">Target Date</span>
                  <span className="text-slate-200">{project.target_date || 'Not set'}</span>
                </div>
                <div>
                  <span className="text-slate-500 block mb-1">Created By</span>
                  <span className="text-slate-200">{project.creator?.name || 'System Admin'}</span>
                </div>
              </div>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-slate-200">Project Members</h3>
                <span className="text-xs text-slate-400">{project.members?.length || 0} Total</span>
              </div>
              <div className="space-y-3">
                {project.members?.map((pm) => (
                  <div key={pm.id} className="flex items-center justify-between py-1.5 border-b border-slate-800/60 last:border-0">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-slate-700 flex items-center justify-center font-bold text-xs text-slate-200">
                        {pm.user.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-slate-200">{pm.user.name}</p>
                        <p className="text-[10px] text-slate-400">{pm.user.email}</p>
                      </div>
                    </div>
                    <Badge size="sm" variant="info">
                      {pm.role.replace('_', ' ')}
                    </Badge>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      )}

      {activeTab === 'members' && (
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-200">Assigned Project Members</h3>
            <Button size="sm" onClick={() => setIsAddMemberModalOpen(true)} icon={<UserPlus className="w-3.5 h-3.5" />}>
              Add Member
            </Button>
          </div>

          <div className="divide-y divide-slate-800">
            {project.members?.map((pm) => (
              <div key={pm.id} className="py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-slate-700 border border-slate-600 flex items-center justify-center font-bold text-xs text-indigo-300">
                    {pm.user.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-100">{pm.user.name}</p>
                    <p className="text-xs text-slate-400">{pm.user.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Badge variant="info">{pm.role.replace('_', ' ')}</Badge>
                  <button
                    onClick={() => removeMemberMutation.mutate(pm.user.id)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Add Member Modal */}
      <Modal isOpen={isAddMemberModalOpen} onClose={() => setIsAddMemberModalOpen(false)} title="Add Member to Project">
        {addMemberError && (
          <div className="mb-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-xs text-rose-400">
            {addMemberError}
          </div>
        )}

        {availableUsers.length === 0 ? (
          <p className="text-xs text-slate-400 py-4">All organization members are already added to this project.</p>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              addMemberMutation.mutate();
            }}
            className="space-y-4"
          >
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Select Member</label>
              <select
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                className="w-full px-3.5 py-2 text-sm bg-slate-900 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:border-indigo-500"
                required
              >
                <option value="">Choose an organization member...</option>
                {availableUsers.map((om) => (
                  <option key={om.user.id} value={om.user.id}>
                    {om.user.name} ({om.user.email})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Project Role</label>
              <select
                value={selectedRole}
                onChange={(e: any) => setSelectedRole(e.target.value)}
                className="w-full px-3.5 py-2 text-sm bg-slate-900 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:border-indigo-500"
              >
                <option value="project_manager">Project Manager</option>
                <option value="developer">Developer</option>
                <option value="tester">Tester</option>
                <option value="reporter">Reporter</option>
                <option value="viewer">Viewer</option>
              </select>
            </div>

            <div className="pt-4 flex justify-end gap-3 border-t border-slate-800">
              <Button type="button" variant="ghost" onClick={() => setIsAddMemberModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" isLoading={addMemberMutation.isPending} disabled={!selectedUserId}>
                Add Member
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};
