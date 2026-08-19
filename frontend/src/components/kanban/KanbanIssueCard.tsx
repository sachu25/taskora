import React from 'react';
import { Link } from 'react-router-dom';
import { User as UserIcon, ArrowLeft, ArrowRight, ArrowUp, ArrowDown, GripVertical } from 'lucide-react';
import type { SprintIssue, IssueStatus } from '../../types';
import { IssueTypeBadge } from '../issues/IssueTypeBadge';
import { IssuePriorityBadge } from '../issues/IssuePriorityBadge';
import { IssueSeverityBadge } from '../issues/IssueSeverityBadge';

interface KanbanIssueCardProps {
  sprintIssue: SprintIssue;
  projectId: string;
  isReadOnly?: boolean;
  isProcessing?: boolean;
  onMoveStatus?: (issueId: string, newStatus: IssueStatus) => void;
  onReorder?: (issueId: string, currentPos: number, direction: 'up' | 'down') => void;
  onDragStart?: (e: React.DragEvent, sprintIssue: SprintIssue) => void;
}

export const KanbanIssueCard: React.FC<KanbanIssueCardProps> = ({
  sprintIssue,
  projectId,
  isReadOnly = false,
  isProcessing = false,
  onMoveStatus,
  onReorder,
  onDragStart,
}) => {
  const { issue, position } = sprintIssue;

  // Workflow status column ordering for accessible move left/right
  const statusOrder: IssueStatus[] = ['backlog', 'todo', 'in_progress', 'done'];
  const currentIdx = statusOrder.indexOf(issue.status);
  const prevStatus = currentIdx > 0 ? statusOrder[currentIdx - 1] : null;
  const nextStatus = currentIdx < statusOrder.length - 1 ? statusOrder[currentIdx + 1] : null;

  return (
    <div
      draggable={!isReadOnly && !isProcessing}
      onDragStart={(e) => onDragStart && onDragStart(e, sprintIssue)}
      className={`p-3.5 bg-slate-900 border border-slate-800 rounded-xl space-y-2.5 shadow-lg hover:border-slate-700 transition-all ${
        isReadOnly ? 'cursor-default' : 'cursor-grab active:cursor-grabbing'
      } ${isProcessing ? 'opacity-50 pointer-events-none' : ''}`}
    >
      {/* Top Header: Key, Badges, Drag Handle */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {!isReadOnly && <GripVertical className="w-3.5 h-3.5 text-slate-600 shrink-0" />}
          <Link
            to={`/projects/${projectId}/issues/${issue.id}`}
            onClick={(e) => e.stopPropagation()}
            className="font-mono text-xs font-bold text-indigo-400 hover:underline"
          >
            {issue.key}
          </Link>
          <IssueTypeBadge type={issue.issue_type} />
        </div>

        <IssuePriorityBadge priority={issue.priority} />
      </div>

      {/* Title */}
      <Link
        to={`/projects/${projectId}/issues/${issue.id}`}
        onClick={(e) => e.stopPropagation()}
        className="block text-xs font-semibold text-slate-100 hover:text-indigo-300 transition-colors line-clamp-2 leading-relaxed"
      >
        {issue.title}
      </Link>

      {/* Metadata & Footer */}
      <div className="pt-1 flex items-center justify-between gap-2 border-t border-slate-800/80 text-[11px] text-slate-400">
        <div className="flex items-center gap-1.5 truncate">
          {issue.severity && <IssueSeverityBadge severity={issue.severity} />}
          {issue.assignee ? (
            <div className="flex items-center gap-1 truncate text-slate-300">
              <UserIcon className="w-3 h-3 text-slate-500 shrink-0" />
              <span className="truncate">{issue.assignee.name}</span>
            </div>
          ) : (
            <span className="text-slate-600 italic">Unassigned</span>
          )}
        </div>

        {/* Accessible Keyboard Control Buttons */}
        {!isReadOnly && (
          <div className="flex items-center gap-0.5 shrink-0 bg-slate-950/60 p-0.5 rounded-lg border border-slate-800">
            {prevStatus && onMoveStatus && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onMoveStatus(issue.id, prevStatus);
                }}
                className="p-1 text-slate-400 hover:text-indigo-400 hover:bg-slate-800 rounded transition-colors"
                title={`Move to ${prevStatus.toUpperCase()}`}
              >
                <ArrowLeft className="w-3 h-3" />
              </button>
            )}

            {onReorder && (
              <>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onReorder(issue.id, position, 'up');
                  }}
                  className="p-1 text-slate-400 hover:text-indigo-400 hover:bg-slate-800 rounded transition-colors"
                  title="Move Up"
                >
                  <ArrowUp className="w-3 h-3" />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onReorder(issue.id, position, 'down');
                  }}
                  className="p-1 text-slate-400 hover:text-indigo-400 hover:bg-slate-800 rounded transition-colors"
                  title="Move Down"
                >
                  <ArrowDown className="w-3 h-3" />
                </button>
              </>
            )}

            {nextStatus && onMoveStatus && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onMoveStatus(issue.id, nextStatus);
                }}
                className="p-1 text-slate-400 hover:text-indigo-400 hover:bg-slate-800 rounded transition-colors"
                title={`Move to ${nextStatus.toUpperCase()}`}
              >
                <ArrowRight className="w-3 h-3" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
