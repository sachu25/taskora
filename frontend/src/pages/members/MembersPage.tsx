import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../app/providers/AuthProvider';
import { api } from '../../services/api';
import type { ApiResponse, OrganizationMember } from '../../types';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { Badge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';
import { UserPlus, Trash2 } from 'lucide-react';

export const MembersPage: React.FC = () => {
  const { currentOrg, user: currentUser } = useAuth();
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'organization_admin' | 'project_manager' | 'developer' | 'tester' | 'reporter'>('developer');
  const [formError, setFormError] = useState<string | null>(null);

  const { data: members, isLoading } = useQuery({
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
      await api.post(`/organizations/${currentOrg?.id}/members`, { email, role });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orgMembers', currentOrg?.id] });
      setIsModalOpen(false);
      setEmail('');
      setFormError(null);
    },
    onError: (err: any) => {
      setFormError(err.response?.data?.message || err.response?.data?.errors?.email?.[0] || 'Failed to add member.');
    },
  });

  const removeMemberMutation = useMutation({
    mutationFn: async (userId: string) => {
      await api.delete(`/organizations/${currentOrg?.id}/members/${userId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orgMembers', currentOrg?.id] });
    },
  });

  const isCurrentUserAdmin = members?.some(
    (m) => m.user.id === currentUser?.id && m.role === 'organization_admin'
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 tracking-tight">Organization Members</h1>
          <p className="text-xs text-slate-400 mt-1">Manage user access and roles in {currentOrg?.name}</p>
        </div>
        {isCurrentUserAdmin && (
          <Button onClick={() => setIsModalOpen(true)} icon={<UserPlus className="w-4 h-4" />}>
            Add Member
          </Button>
        )}
      </div>

      {isLoading ? (
        <Card className="divide-y divide-slate-800">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </Card>
      ) : (
        <Card className="p-0 overflow-hidden border border-slate-800">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/80 border-b border-slate-800 text-slate-400 uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3.5 font-semibold">User</th>
                  <th className="px-6 py-3.5 font-semibold">Email</th>
                  <th className="px-6 py-3.5 font-semibold">Organization Role</th>
                  <th className="px-6 py-3.5 font-semibold">Status</th>
                  <th className="px-6 py-3.5 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {members?.map((member) => (
                  <tr key={member.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-200">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center font-bold text-xs text-indigo-300">
                          {member.user.name.charAt(0)}
                        </div>
                        <span>{member.user.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-400">{member.user.email}</td>
                    <td className="px-6 py-4">
                      <Badge variant={member.role === 'organization_admin' ? 'primary' : 'neutral'}>
                        {member.role.replace('_', ' ')}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant="success">{member.status}</Badge>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {isCurrentUserAdmin && member.user.id !== currentUser?.id && (
                        <button
                          onClick={() => removeMemberMutation.mutate(member.user.id)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Add Member Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add Organization Member">
        {formError && (
          <div className="mb-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-xs text-rose-400">
            {formError}
          </div>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            addMemberMutation.mutate();
          }}
          className="space-y-4"
        >
          <Input
            label="User Email Address"
            type="email"
            placeholder="member@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Organization Role</label>
            <select
              value={role}
              onChange={(e: any) => setRole(e.target.value)}
              className="w-full px-3.5 py-2 text-sm bg-slate-900 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:border-indigo-500"
            >
              <option value="organization_admin">Organization Administrator</option>
              <option value="project_manager">Project Manager</option>
              <option value="developer">Developer</option>
              <option value="tester">Tester</option>
              <option value="reporter">Reporter</option>
            </select>
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-slate-800">
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={addMemberMutation.isPending}>
              Add Member
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
