import React, { useState } from 'react';
import type { SprintIssue, IssueStatus } from '../../types';
import { KanbanIssueCard } from './KanbanIssueCard';
import { Layers } from 'lucide-react';

interface KanbanColumnProps {
  status: IssueStatus;
  title: string;
  sprintIssues: SprintIssue[];
  projectId: string;
  isReadOnly?: boolean;
  processingIssueId?: string | null;
  onDropIssue?: (issueId: string, newStatus: IssueStatus) => void;
  onMoveStatus?: (issueId: string, newStatus: IssueStatus) => void;
  onReorder?: (issueId: string, currentPos: number, direction: 'up' | 'down') => void;
  onDragStart?: (e: React.DragEvent, sprintIssue: SprintIssue) => void;
}

export const KanbanColumn: React.FC<KanbanColumnProps> = ({
  status,
  title,
  sprintIssues,
  projectId,
  isReadOnly = false,
  processingIssueId = null,
  onDropIssue,
  onMoveStatus,
  onReorder,
  onDragStart,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!isReadOnly) setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (isReadOnly) return;

    const issueId = e.dataTransfer.getData('text/plain');
    if (issueId && onDropIssue) {
      onDropIssue(issueId, status);
    }
  };

  const statusColors: Record<IssueStatus, { border: string; bg: string; dot: string }> = {
    backlog: { border: 'border-slate-800', bg: 'bg-slate-500/10', dot: 'bg-slate-500' },
    todo: { border: 'border-slate-800', bg: 'bg-blue-500/10', dot: 'bg-blue-500' },
    in_progress: { border: 'border-amber-500/30', bg: 'bg-amber-500/10', dot: 'bg-amber-500' },
    done: { border: 'border-emerald-500/30', bg: 'bg-emerald-500/10', dot: 'bg-emerald-500' },
  };

  const colorConfig = statusColors[status] || statusColors.todo;

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`bg-slate-900/60 border ${
        isDragOver ? 'border-indigo-500 bg-indigo-500/[0.03] shadow-lg shadow-indigo-500/10' : 'border-slate-800'
      } rounded-xl p-4 flex flex-col h-[750px] transition-all`}
    >
      {/* Column Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800 shrink-0">
        <div className="flex items-center gap-2">
          <span className={`w-2.5 h-2.5 rounded-full ${colorConfig.dot}`} />
          <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider">{title}</h3>
        </div>
        <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
          {sprintIssues.length}
        </span>
      </div>

      {/* Column Issues Scroll Container */}
      <div className="flex-1 overflow-y-auto pt-3 space-y-3 pr-1">
        {sprintIssues.length === 0 ? (
          <div
            className={`h-32 border-2 border-dashed border-slate-800/80 rounded-xl flex flex-col items-center justify-center text-slate-600 text-xs gap-1.5 transition-colors ${
              isDragOver ? 'border-indigo-500/60 text-indigo-400 bg-indigo-500/5' : ''
            }`}
          >
            <Layers className="w-5 h-5" />
            <span>{isDragOver ? 'Drop Issue Here' : 'No issues in this column'}</span>
          </div>
        ) : (
          sprintIssues.map((si) => (
            <KanbanIssueCard
              key={si.id}
              sprintIssue={si}
              projectId={projectId}
              isReadOnly={isReadOnly}
              isProcessing={processingIssueId === si.issue.id}
              onMoveStatus={onMoveStatus}
              onReorder={onReorder}
              onDragStart={onDragStart}
            />
          ))
        )}
      </div>
    </div>
  );
};
