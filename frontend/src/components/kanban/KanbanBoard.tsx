import React, { useState } from 'react';
import { AlertCircle, X } from 'lucide-react';
import type { SprintIssue, IssueStatus } from '../../types';
import { KanbanColumn } from './KanbanColumn';
import { issueService } from '../../services/issueService';
import { sprintService } from '../../services/sprintService';

interface KanbanBoardProps {
  sprintId: string;
  projectId: string;
  sprintIssues: SprintIssue[];
  isReadOnly?: boolean;
  onRefresh: () => void;
}

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
  sprintId,
  projectId,
  sprintIssues,
  isReadOnly = false,
  onRefresh,
}) => {
  const [localSprintIssues, setLocalSprintIssues] = useState<SprintIssue[]>(sprintIssues);
  const [processingIssueId, setProcessingIssueId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Synchronize local issues when props update from refetch
  React.useEffect(() => {
    setLocalSprintIssues(sprintIssues);
  }, [sprintIssues]);

  const handleDragStart = (e: React.DragEvent, sprintIssue: SprintIssue) => {
    e.dataTransfer.setData('text/plain', sprintIssue.issue.id);
  };

  // Status Change Handler with Optimistic UI & Automatic Rollback
  const handleUpdateStatus = async (issueId: string, newStatus: IssueStatus) => {
    if (isReadOnly) return;

    const targetIndex = localSprintIssues.findIndex((si) => si.issue.id === issueId);
    if (targetIndex === -1) return;

    const previousIssue = localSprintIssues[targetIndex];
    if (previousIssue.issue.status === newStatus) return; // No change

    // 1. Optimistic Update
    setProcessingIssueId(issueId);
    setError(null);

    setLocalSprintIssues((prev) =>
      prev.map((si) =>
        si.issue.id === issueId
          ? { ...si, issue: { ...si.issue, status: newStatus } }
          : si
      )
    );

    try {
      // 2. Persist Status via Issue API
      await issueService.updateIssue(issueId, { status: newStatus });
      onRefresh();
    } catch (err: any) {
      // 3. Rollback on Error
      setLocalSprintIssues((prev) =>
        prev.map((si) => (si.issue.id === issueId ? previousIssue : si))
      );
      setError(
        err.response?.data?.message || 'Failed to update issue status. Rollback applied.'
      );
    } finally {
      setProcessingIssueId(null);
    }
  };

  // Reorder Position Handler
  const handleReorder = async (
    issueId: string,
    currentPos: number,
    direction: 'up' | 'down'
  ) => {
    if (isReadOnly) return;
    const newPos = direction === 'up' ? Math.max(1, currentPos - 1) : currentPos + 1;

    setProcessingIssueId(issueId);
    setError(null);

    try {
      await sprintService.reorderSprintIssue(sprintId, issueId, newPos);
      onRefresh();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to reorder issue.');
    } finally {
      setProcessingIssueId(null);
    }
  };

  const columns: { status: IssueStatus; title: string }[] = [
    { status: 'backlog', title: 'Backlog' },
    { status: 'todo', title: 'Todo' },
    { status: 'in_progress', title: 'In Progress' },
    { status: 'done', title: 'Done' },
  ];

  return (
    <div className="space-y-4">
      {error && (
        <div className="p-3.5 text-xs rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 font-medium flex items-center justify-between animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError(null)} className="p-1 hover:bg-rose-500/20 rounded">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 4-Column Responsive Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {columns.map((col) => {
          const colIssues = localSprintIssues.filter(
            (si) => si.issue.status === col.status
          );

          return (
            <KanbanColumn
              key={col.status}
              status={col.status}
              title={col.title}
              sprintIssues={colIssues}
              projectId={projectId}
              isReadOnly={isReadOnly}
              processingIssueId={processingIssueId}
              onDropIssue={handleUpdateStatus}
              onMoveStatus={handleUpdateStatus}
              onReorder={handleReorder}
              onDragStart={handleDragStart}
            />
          );
        })}
      </div>
    </div>
  );
};
