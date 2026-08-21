import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../app/providers/AuthProvider';
import { api } from '../../services/api';
import type { ApiResponse, Project } from '../../types';
import { FolderKanban, ChevronRight, Layers, Plus } from 'lucide-react';

export const IssuesPage: React.FC = () => {
  const { currentOrg } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentOrg) return;
    setLoading(true);
    api
      .get<ApiResponse<Project[]>>(`/organizations/${currentOrg.id}/projects`)
      .then((res) => setProjects(res.data.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [currentOrg]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
          <Layers className="w-5 h-5 text-indigo-400" />
          Issue Engine Navigator
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Select a project to browse, filter, search, and manage issues across {currentOrg?.name || 'organization'}.
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-slate-900 border border-slate-800 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : projects.length === 0 ? (
        <div className="p-12 text-center bg-slate-900/40 border border-slate-800 rounded-2xl">
          <FolderKanban className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-slate-200">No Projects Found</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Create a project first before managing issues.
          </p>
          <Link
            to="/projects"
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-500 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Go to Projects</span>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project) => (
            <Link
              key={project.id}
              to={`/projects/${project.key || project.id}/issues`}
              className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-indigo-500/40 hover:bg-slate-850/80 transition-all group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-xs font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                    {project.key}
                  </span>
                  <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-all" />
                </div>
                <h3 className="font-bold text-slate-100 text-sm group-hover:text-indigo-300 transition-colors">
                  {project.name}
                </h3>
                <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                  {project.description || 'No description provided.'}
                </p>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                <span>Browse Issues</span>
                <span className="font-medium text-indigo-400">View →</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};
