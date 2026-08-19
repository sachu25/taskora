import React from 'react';
import { Link } from 'react-router-dom';
import { Trash2 } from 'lucide-react';
import type { ReleaseIssue } from '../../types/release';
import { IssueStatusBadge } from '../issues/IssueStatusBadge';
import { IssueTypeBadge } from '../issues/IssueTypeBadge';

interface ReleaseIssueTableProps {
  issues: ReleaseIssue[];
  projectId: string;
  onRemoveIssue?: (issueId: string) => Promise<void>;
  canManage?: boolean;
}

export const ReleaseIssueTable: React.FC<ReleaseIssueTableProps> = ({
  issues,
  projectId,
  onRemoveIssue,
  canManage = true,
}) => {
  if (issues.length === 0) {
    return (
      <div className="p-8 text-center bg-slate-900/60 border border-dashed border-slate-800 rounded-xl">
        <p className="text-sm font-medium text-slate-400">No issues assigned to this release.</p>
        <p className="text-xs text-slate-500 mt-1">Use the issue manager above to attach scope to this release.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto border border-slate-800 rounded-xl bg-slate-900">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-950/60 text-slate-400 uppercase tracking-wider text-[10px] font-semibold border-b border-slate-800">
            <tr>
              <th className="py-3 px-4">Key</th>
              <th className="py-3 px-4">Type</th>
              <th className="py-3 px-4">Title</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Priority</th>
              <th className="py-3 px-4">Assignee</th>
              {canManage && onRemoveIssue && <th className="py-3 px-4 text-right">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/80 text-slate-300">
            {issues.map((ri) => {
              const issue = ri.issue;
              if (!issue) return null;

              return (
                <tr key={ri.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-indigo-400">
                    <Link to={`/projects/${projectId}/issues/${issue.id}`} className="hover:underline">
                      {issue.key}
                    </Link>
                  </td>
                  <td className="py-3 px-4">
                    <IssueTypeBadge type={issue.issue_type as any} />
                  </td>
                  <td className="py-3 px-4 font-medium text-slate-200 max-w-xs truncate">
                    <Link to={`/projects/${projectId}/issues/${issue.id}`} className="hover:text-indigo-400 transition-colors">
                      {issue.title}
                    </Link>
                  </td>
                  <td className="py-3 px-4">
                    <IssueStatusBadge status={issue.status as any} />
                  </td>
                  <td className="py-3 px-4">
                    <span className="capitalize px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                      {issue.priority}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    {issue.assignee ? (
                      <span className="text-slate-300">{issue.assignee.name}</span>
                    ) : (
                      <span className="text-slate-500 italic">Unassigned</span>
                    )}
                  </td>
                  {canManage && onRemoveIssue && (
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => onRemoveIssue(issue.id)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                        title="Remove issue from release"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Card List View */}
      <div className="md:hidden space-y-3">
        {issues.map((ri) => {
          const issue = ri.issue;
          if (!issue) return null;

          return (
            <div key={ri.id} className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <Link to={`/projects/${projectId}/issues/${issue.id}`} className="font-mono font-bold text-indigo-400 text-xs">
                  {issue.key}
                </Link>
                <div className="flex items-center gap-2">
                  <IssueTypeBadge type={issue.issue_type as any} />
                  {canManage && onRemoveIssue && (
                    <button
                      onClick={() => onRemoveIssue(issue.id)}
                      className="p-1 rounded text-slate-500 hover:text-rose-400"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              <Link to={`/projects/${projectId}/issues/${issue.id}`} className="block text-xs font-semibold text-slate-200 line-clamp-2">
                {issue.title}
              </Link>

              <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-800/80">
                <IssueStatusBadge status={issue.status as any} />
                <span className="text-[11px] text-slate-400">
                  {issue.assignee ? issue.assignee.name : 'Unassigned'}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
