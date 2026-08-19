import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../app/providers/AuthProvider';
import { api } from '../../services/api';
import type { ApiResponse, Team, OrganizationMember, TeamMember } from '../../types';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { Skeleton } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import { Plus, Users, Trash2, UserPlus } from 'lucide-react';

export const TeamsPage: React.FC = () => {
  const { currentOrg } = useAuth();
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  // Member Modal State
  const [selectedUserId, setSelectedUserId] = useState('');

  const { data: teams, isLoading } = useQuery({
    queryKey: ['teams', currentOrg?.id],
    queryFn: async () => {
      if (!currentOrg) return [];
      const res = await api.get<ApiResponse<Team[]>>(`/organizations/${currentOrg.id}/teams`);
      return res.data.data;
    },
    enabled: !!currentOrg,
  });

  const { data: orgMembers } = useQuery({
    queryKey: ['orgMembers', currentOrg?.id],
    queryFn: async () => {
      if (!currentOrg) return [];
      const res = await api.get<ApiResponse<OrganizationMember[]>>(`/organizations/${currentOrg.id}/members`);
      return res.data.data;
    },
    enabled: !!currentOrg,
  });

  const { data: teamMembers } = useQuery({
    queryKey: ['teamMembers', selectedTeam?.id],
    queryFn: async () => {
      if (!selectedTeam) return [];
      const res = await api.get<ApiResponse<TeamMember[]>>(`/teams/${selectedTeam.id}/members`);
      return res.data.data;
    },
    enabled: !!selectedTeam,
  });

  const createMutation = useMutation({
    mutationFn: async (data: { name: string; description: string }) => {
      const res = await api.post(`/organizations/${currentOrg?.id}/teams`, data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams', currentOrg?.id] });
      setIsModalOpen(false);
      setName('');
      setDescription('');
      setFormError(null);
    },
    onError: (err: any) => {
      setFormError(err.response?.data?.message || 'Failed to create team.');
    },
  });

  const addMemberMutation = useMutation({
    mutationFn: async () => {
      await api.post(`/teams/${selectedTeam?.id}/members`, { user_id: selectedUserId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teamMembers', selectedTeam?.id] });
      queryClient.invalidateQueries({ queryKey: ['teams', currentOrg?.id] });
      setSelectedUserId('');
    },
  });

  const removeMemberMutation = useMutation({
    mutationFn: async (userId: string) => {
      await api.delete(`/teams/${selectedTeam?.id}/members/${userId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teamMembers', selectedTeam?.id] });
      queryClient.invalidateQueries({ queryKey: ['teams', currentOrg?.id] });
    },
  });

  const deleteTeamMutation = useMutation({
    mutationFn: async (teamId: string) => {
      await api.delete(`/teams/${teamId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams', currentOrg?.id] });
    },
  });

  const availableOrgMembers = orgMembers?.filter(
    (om) => !teamMembers?.some((tm) => tm.user.id === om.user.id)
  ) || [];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 tracking-tight">Teams</h1>
          <p className="text-xs text-slate-400 mt-1">Organize users into functional engineering and QA teams</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} icon={<Plus className="w-4 h-4" />}>
          Create Team
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Skeleton className="h-36 w-full" />
          <Skeleton className="h-36 w-full" />
        </div>
      ) : teams?.length === 0 ? (
        <EmptyState
          icon={<Users className="w-8 h-8 text-indigo-400" />}
          title="No teams found"
          description="Create your first team to group organization members."
          actionLabel="Create Team"
          onAction={() => setIsModalOpen(true)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {teams?.map((team) => (
            <Card key={team.id} className="flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="text-base font-semibold text-slate-100">{team.name}</h3>
                  <button
                    onClick={() => deleteTeamMutation.mutate(team.id)}
                    className="p-1 rounded text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <p className="text-xs text-slate-400 line-clamp-2 min-h-[2.5rem]">
                  {team.description || 'No team description provided.'}
                </p>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-800 flex items-center justify-between">
                <span className="text-xs text-slate-400">{team.members_count || 0} members</span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setSelectedTeam(team);
                    setIsMemberModalOpen(true);
                  }}
                  icon={<UserPlus className="w-3.5 h-3.5" />}
                >
                  Manage Members
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Create Team Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create New Team">
        {formError && (
          <div className="mb-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-xs text-rose-400">
            {formError}
          </div>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            createMutation.mutate({ name, description });
          }}
          className="space-y-4"
        >
          <Input
            label="Team Name"
            placeholder="Frontend Development"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Description</label>
            <textarea
              rows={3}
              className="w-full px-3.5 py-2 text-sm bg-slate-900 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              placeholder="Team scope and responsibilities..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-slate-800">
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={createMutation.isPending}>
              Create Team
            </Button>
          </div>
        </form>
      </Modal>

      {/* Manage Team Members Modal */}
      <Modal
        isOpen={isMemberModalOpen}
        onClose={() => setIsMemberModalOpen(false)}
        title={`Manage Members — ${selectedTeam?.name || 'Team'}`}
        maxWidth="lg"
      >
        <div className="space-y-6">
          {/* Add member select */}
          <div className="flex gap-2">
            <select
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              className="flex-1 px-3.5 py-2 text-sm bg-slate-900 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:border-indigo-500"
            >
              <option value="">Select an organization member...</option>
              {availableOrgMembers.map((om) => (
                <option key={om.user.id} value={om.user.id}>
                  {om.user.name} ({om.user.email})
                </option>
              ))}
            </select>
            <Button
              onClick={() => addMemberMutation.mutate()}
              isLoading={addMemberMutation.isPending}
              disabled={!selectedUserId}
              size="sm"
            >
              Add
            </Button>
          </div>

          {/* Members list */}
          <div className="divide-y divide-slate-800 max-h-60 overflow-y-auto">
            {teamMembers?.length === 0 ? (
              <p className="text-xs text-slate-500 py-4 text-center">No members in this team yet.</p>
            ) : (
              teamMembers?.map((tm) => (
                <div key={tm.id} className="py-2.5 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-slate-200">{tm.user.name}</p>
                    <p className="text-[10px] text-slate-400">{tm.user.email}</p>
                  </div>
                  <button
                    onClick={() => removeMemberMutation.mutate(tm.user.id)}
                    className="p-1 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
};
