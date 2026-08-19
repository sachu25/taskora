import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../../app/providers/AuthProvider';
import { issueService } from '../../services/issueService';
import { api } from '../../services/api';
import type {
  ApiResponse,
  Project,
  Issue,
  Label,
  ProjectMember,
  IssueFilterParams,
  PaginationMetadata,
} from '../../types';
import { IssueFilterBar } from '../../components/issues/IssueFilterBar';
import { IssueTable } from '../../components/issues/IssueTable';
import { IssueFormModal } from '../../components/issues/IssueFormModal';
import { Plus, ChevronRight, FolderKanban, ChevronLeft } from 'lucide-react';

export const ProjectIssuesPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const { currentOrg } = useAuth();

  const [project, setProject] = useState<Project | null>(null);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [pagination, setPagination] = useState<PaginationMetadata>({
    current_page: 1,
    per_page: 25,
    total: 0,
    last_page: 1,
  });

  const [filters, setFilters] = useState<IssueFilterParams>({ page: 1, per_page: 25 });
  const [labels, setLabels] = useState<Label[]>([]);
  const [members, setMembers] = useState<ProjectMember[]>([]);

  const [loading, setLoading] = useState(true);
  const [createModalOpen, setCreateModalOpen] = useState(false);

  // Request counter to prevent async race conditions
  const requestIdRef = useRef(0);

  // Fetch Project Details
  useEffect(() => {
    if (!projectId) return;
    api
      .get<ApiResponse<Project>>(`/projects/${projectId}`)
      .then((res) => setProject(res.data.data))
      .catch((err) => console.error(err));
  }, [projectId]);

  // Fetch Organization Labels & Members
  useEffect(() => {
    if (!currentOrg || !projectId) return;
    issueService
      .getOrgLabels(currentOrg.id)
      .then((res) => setLabels(res.data))
      .catch((err) => console.error(err));

    api
      .get<ApiResponse<ProjectMember[]>>(`/projects/${projectId}/members`)
      .then((res) => setMembers(res.data.data))
      .catch((err) => console.error(err));
  }, [currentOrg, projectId]);

  // Fetch Issues Function with Race Condition Prevention
  const fetchIssues = useCallback(() => {
    if (!projectId) return;
    const currentRequestId = ++requestIdRef.current;
    setLoading(true);

    issueService
      .getProjectIssues(projectId, filters)
      .then((res) => {
        // Only update state if this is still the latest request
        if (currentRequestId === requestIdRef.current) {
          setIssues(res.data.items);
          setPagination(res.data.pagination);
        }
      })
      .catch((err) => {
        if (currentRequestId === requestIdRef.current) {
          console.error(err);
        }
      })
      .finally(() => {
        if (currentRequestId === requestIdRef.current) {
          setLoading(false);
        }
      });
  }, [projectId, filters]);

  useEffect(() => {
    fetchIssues();
  }, [fetchIssues]);

  const handleCreateIssue = async (data: Partial<Issue>) => {
    if (!projectId) return;
    await issueService.createIssue(projectId, data);
    fetchIssues();
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-xs text-slate-400">
        <Link to="/projects" className="hover:text-slate-200 transition-colors">
          Projects
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
        <Link to={`/projects/${projectId}`} className="hover:text-slate-200 transition-colors">
          {project?.name || 'Project'}
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
        <span className="text-indigo-400 font-medium">Issues</span>
      </nav>

      {/* Header & Primary Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <FolderKanban className="w-5 h-5 text-indigo-400" />
            {project ? `${project.name} Issues` : 'Issues'}
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Browse, filter, and track issues for key <span className="font-mono text-indigo-400 font-bold">{project?.key}</span>.
          </p>
        </div>

        <button
          onClick={() => setCreateModalOpen(true)}
          className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 transition-all shadow-md shadow-indigo-600/20"
        >
          <Plus className="w-4 h-4" />
          <span>Create Issue</span>
        </button>
      </div>

      {/* Filter Bar */}
      <IssueFilterBar
        filters={filters}
        onFilterChange={(newFilters) => setFilters(newFilters)}
        onClearFilters={() => setFilters({ page: 1, per_page: 25 })}
        labels={labels}
        members={members}
      />

      {/* Issues Table */}
      <IssueTable issues={issues} projectId={projectId || ''} isLoading={loading} />

      {/* Server Pagination Controls */}
      {pagination.last_page > 1 && (
        <div className="flex items-center justify-between pt-4 border-t border-slate-800 text-xs text-slate-400">
          <div>
            Showing page <span className="font-semibold text-slate-200">{pagination.current_page}</span> of{' '}
            <span className="font-semibold text-slate-200">{pagination.last_page}</span> ({pagination.total} issues)
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setFilters({ ...filters, page: Math.max(1, pagination.current_page - 1) })}
              disabled={pagination.current_page === 1}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-850 border border-slate-750 text-slate-300 hover:bg-slate-800 disabled:opacity-40 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>
            <button
              onClick={() => setFilters({ ...filters, page: Math.min(pagination.last_page, pagination.current_page + 1) })}
              disabled={pagination.current_page === pagination.last_page}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-850 border border-slate-750 text-slate-300 hover:bg-slate-800 disabled:opacity-40 transition-colors"
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Create Issue Modal */}
      <IssueFormModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSubmit={handleCreateIssue}
        members={members}
      />
    </div>
  );
};
