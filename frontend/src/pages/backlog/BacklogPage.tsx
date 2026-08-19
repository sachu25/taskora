import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Layers, Target, FolderKanban } from 'lucide-react';
import { sprintService } from '../../services/sprintService';
import type { Issue, PaginationMetadata, IssueFilterParams } from '../../types';
import { IssueFilterBar } from '../../components/issues/IssueFilterBar';
import { IssueTable } from '../../components/issues/IssueTable';

export const BacklogPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();

  const [backlogIssues, setBacklogIssues] = useState<Issue[]>([]);
  const [pagination, setPagination] = useState<PaginationMetadata>({
    current_page: 1,
    per_page: 25,
    total: 0,
    last_page: 1,
  });
  const [filters, setFilters] = useState<IssueFilterParams>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const requestIdRef = useRef(0);

  const fetchBacklog = useCallback(
    async (page = 1, currentFilters = filters) => {
      if (!projectId) return;

      const currentRequestId = ++requestIdRef.current;
      setIsLoading(true);
      setError(null);

      try {
        const response = await sprintService.getProjectBacklog(projectId, {
          ...currentFilters,
          page,
          per_page: pagination.per_page,
        });

        if (currentRequestId === requestIdRef.current && response.success) {
          setBacklogIssues(response.data.items);
          setPagination(response.data.pagination);
        }
      } catch (err: any) {
        if (currentRequestId === requestIdRef.current) {
          setError(err.response?.data?.message || 'Failed to load product backlog.');
        }
      } finally {
        if (currentRequestId === requestIdRef.current) {
          setIsLoading(false);
        }
      }
    },
    [projectId, pagination.per_page, filters]
  );

  useEffect(() => {
    fetchBacklog(1, filters);
  }, [filters, fetchBacklog]);

  const handleFilterChange = (newFilters: IssueFilterParams) => {
    setFilters(newFilters);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
            <FolderKanban className="w-3.5 h-3.5 text-indigo-400" />
            <span>Projects</span>
            <span>/</span>
            <span className="text-slate-200 font-medium">Product Backlog</span>
          </div>
          <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2.5">
            <Layers className="w-5 h-5 text-indigo-400" />
            Product Backlog ({pagination.total})
          </h1>
        </div>

        <Link
          to={`/projects/${projectId}/sprint-planning`}
          className="px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors flex items-center gap-2 shadow-lg shadow-indigo-600/20 self-start md:self-auto"
        >
          <Target className="w-4 h-4" />
          Open Sprint Planning Workspace
        </Link>
      </div>

      {/* Filter Bar Component Reused */}
      <IssueFilterBar
        filters={filters}
        onFilterChange={handleFilterChange}
        onClearFilters={() => setFilters({})}
      />

      {/* Backlog Table */}
      {error ? (
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-xs text-rose-400 font-medium">
          {error}
        </div>
      ) : (
        <IssueTable
          issues={backlogIssues}
          projectId={projectId || ''}
          isLoading={isLoading}
        />
      )}
    </div>
  );
};
