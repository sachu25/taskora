import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../app/providers/AuthProvider';
import { api } from '../../services/api';
import type { ApiResponse, Project } from '../../types';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { Badge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import { Plus, FolderKanban, Calendar, Users, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';

export const ProjectsPage: React.FC = () => {
  const { currentOrg } = useAuth();
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [key, setKey] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<'planned' | 'active' | 'on_hold' | 'completed' | 'archived'>('active');
  const [visibility, setVisibility] = useState<'private' | 'organization'>('organization');
  const [startDate, setStartDate] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const { data: projects, isLoading, isError } = useQuery({
    queryKey: ['projects', currentOrg?.id],
    queryFn: async () => {
      if (!currentOrg) return [];
      const res = await api.get<ApiResponse<Project[]>>(`/organizations/${currentOrg.id}/projects`);
      return res.data.data;
    },
    enabled: !!currentOrg,
  });

  const createMutation = useMutation({
    mutationFn: async (newProject: any) => {
      const res = await api.post<ApiResponse<Project>>(`/organizations/${currentOrg?.id}/projects`, newProject);
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects', currentOrg?.id] });
      setIsModalOpen(false);
      resetForm();
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || err.response?.data?.errors?.key?.[0] || 'Failed to create project.';
      setFormError(msg);
    },
  });

  const resetForm = () => {
    setName('');
    setKey('');
    setDescription('');
    setStatus('active');
    setVisibility('organization');
    setStartDate('');
    setTargetDate('');
    setFormError(null);
  };

  const handleNameChange = (val: string) => {
    setName(val);
    if (!key && val.length >= 2) {
      const autoKey = val.replace(/[^a-zA-Z]/g, '').substring(0, 4).toUpperCase();
      setKey(autoKey);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({
      name,
      key,
      description,
      status,
      visibility,
      start_date: startDate || null,
      target_date: targetDate || null,
    });
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 tracking-tight">Projects</h1>
          <p className="text-xs text-slate-400 mt-1">Manage organization delivery projects and tracking keys</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} icon={<Plus className="w-4 h-4" />}>
          Create Project
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Skeleton className="h-44 w-full" />
          <Skeleton className="h-44 w-full" />
          <Skeleton className="h-44 w-full" />
        </div>
      ) : isError ? (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm">
          Failed to load projects.
        </div>
      ) : projects?.length === 0 ? (
        <EmptyState
          icon={<FolderKanban className="w-8 h-8 text-indigo-400" />}
          title="No projects found"
          description="Get started by creating your organization's first project."
          actionLabel="Create Project"
          onAction={() => setIsModalOpen(true)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects?.map((project) => (
            <Card key={project.id} className="flex flex-col justify-between hover:border-slate-600 transition-all">
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2.5">
                    <span className="px-2.5 py-1 rounded-lg bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 font-mono font-bold text-xs">
                      {project.key}
                    </span>
                    <Badge variant={project.status === 'active' ? 'success' : 'neutral'}>
                      {project.status}
                    </Badge>
                  </div>
                  <span className="text-[10px] text-slate-400 capitalize">{project.visibility}</span>
                </div>

                <Link to={`/projects/${project.id}`} className="group">
                  <h3 className="text-base font-semibold text-slate-100 group-hover:text-indigo-400 transition-colors line-clamp-1">
                    {project.name}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2 min-h-[2rem]">
                    {project.description || 'No description provided.'}
                  </p>
                </Link>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                <div className="flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-slate-400" />
                  <span>{project.members_count || 0} members</span>
                </div>
                {project.target_date && (
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>Target: {project.target_date}</span>
                  </div>
                )}
                <Link to={`/projects/${project.id}`} className="text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1">
                  <Eye className="w-3.5 h-3.5" /> Details
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Create Project Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create New Project" maxWidth="lg">
        {formError && (
          <div className="mb-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-xs text-rose-400">
            {formError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <Input
                label="Project Name"
                placeholder="Website Revamp"
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                required
              />
            </div>
            <div>
              <Input
                label="Key (2-10 uppercase)"
                placeholder="WEB"
                value={key}
                onChange={(e) => setKey(e.target.value.toUpperCase())}
                maxLength={10}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Description</label>
            <textarea
              rows={3}
              className="w-full px-3.5 py-2 text-sm bg-slate-900/80 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              placeholder="Brief description of project goals and scope..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Status</label>
              <select
                value={status}
                onChange={(e: any) => setStatus(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-slate-900 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                <option value="planned">Planned</option>
                <option value="active">Active</option>
                <option value="on_hold">On Hold</option>
                <option value="completed">Completed</option>
                <option value="archived">Archived</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Visibility</label>
              <select
                value={visibility}
                onChange={(e: any) => setVisibility(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-slate-900 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                <option value="organization">Organization-wide</option>
                <option value="private">Private to Members</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Start Date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
            <Input
              label="Target Completion Date"
              type="date"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
            />
          </div>

          <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-800">
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={createMutation.isPending}>
              Create Project
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
