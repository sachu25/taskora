import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../app/providers/AuthProvider';
import { api } from '../../services/api';
import type { ApiResponse, DashboardData } from '../../types';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';
import { FolderKanban, Users, Building2, ArrowRight, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/Button';

export const DashboardPage: React.FC = () => {
  const { currentOrg } = useAuth();

  const { data, isLoading, error } = useQuery({
    queryKey: ['dashboard', currentOrg?.id],
    queryFn: async () => {
      if (!currentOrg) return null;
      const res = await api.get<ApiResponse<DashboardData>>(`/organizations/${currentOrg.id}/dashboard`);
      return res.data.data;
    },
    enabled: !!currentOrg,
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-20 w-full" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-28 w-full" />
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-6 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400">
        Failed to load workspace dashboard data.
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-slate-900 border border-slate-800 rounded-2xl shadow-lg">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs uppercase font-bold tracking-wider text-indigo-400">Workspace Dashboard</span>
            <Badge variant="primary">{data.user_role?.replace('_', ' ')}</Badge>
          </div>
          <h1 className="text-2xl font-bold text-slate-100 tracking-tight">{data.organization_name}</h1>
          <p className="text-xs text-slate-400 mt-1">Foundation overview and active projects summary</p>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/projects">
            <Button icon={<Plus className="w-4 h-4" />}>New Project</Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Total Projects</span>
            <div className="text-3xl font-extrabold text-slate-100 mt-1">{data.stats.projects_count}</div>
          </div>
          <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-indigo-400">
            <FolderKanban className="w-6 h-6" />
          </div>
        </Card>

        <Card className="flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Total Teams</span>
            <div className="text-3xl font-extrabold text-slate-100 mt-1">{data.stats.teams_count}</div>
          </div>
          <div className="p-3 bg-violet-500/10 border border-violet-500/20 rounded-xl text-violet-400">
            <Users className="w-6 h-6" />
          </div>
        </Card>

        <Card className="flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Organization Members</span>
            <div className="text-3xl font-extrabold text-slate-100 mt-1">{data.stats.members_count}</div>
          </div>
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400">
            <Building2 className="w-6 h-6" />
          </div>
        </Card>
      </div>

      {/* Recent Projects List */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-slate-100">Recently Created Projects</h2>
          <Link to="/projects" className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-medium">
            View All Projects <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {data.recent_projects.length === 0 ? (
          <p className="text-xs text-slate-500 py-6 text-center">No projects created yet.</p>
        ) : (
          <div className="divide-y divide-slate-800">
            {data.recent_projects.map((project) => (
              <div key={project.id} className="py-3.5 flex items-center justify-between hover:bg-slate-800/30 px-3 rounded-lg transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-xs text-indigo-400">
                    {project.key}
                  </div>
                  <div>
                    <Link to={`/projects/${project.id}`} className="text-sm font-semibold text-slate-100 hover:text-indigo-400">
                      {project.name}
                    </Link>
                    <div className="text-xs text-slate-400 truncate max-w-md">{project.description || 'No description provided.'}</div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Badge variant={project.status === 'active' ? 'success' : 'neutral'}>
                    {project.status}
                  </Badge>
                  <span className="text-xs text-slate-500">{project.members_count || 0} members</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
