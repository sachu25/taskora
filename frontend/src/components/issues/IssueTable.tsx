import React from 'react';
import { Link } from 'react-router-dom';
import type { Issue } from '../../types';
import { IssueTypeBadge } from './IssueTypeBadge';
import { IssueStatusBadge } from './IssueStatusBadge';
import { IssuePriorityBadge } from './IssuePriorityBadge';
import { IssueSeverityBadge } from './IssueSeverityBadge';
import { MessageSquare, Eye, FolderKanban } from 'lucide-react';

interface Props {
  issues: Issue[];
  projectId: string;
  isLoading?: boolean;
}

export const IssueTable: React.FC<Props> = ({ issues, projectId, isLoading }) => {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-16 bg-slate-900/60 rounded-xl animate-pulse border border-slate-800" />
        ))}
      </div>
    );
  }

  if (issues.length === 0) {
    return (
      <div className="p-12 text-center bg-slate-900/40 border border-slate-800/80 rounded-2xl">
        <FolderKanban className="w-12 h-12 text-slate-600 mx-auto mb-3" />
        <h3 className="text-base font-semibold text-slate-200 mb-1">No issues found</h3>
        <p className="text-xs text-slate-400 max-w-sm mx-auto">
          No issues match your current filters or project query.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/70">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-800/50 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800">
            <tr>
              <th className="px-4 py-3">Key</th>
              <th className="px-4 py-3">Title</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Priority</th>
              <th className="px-4 py-3">Severity</th>
              <th className="px-4 py-3">Assignee</th>
              <th className="px-4 py-3 text-right">Activity</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {issues.map((issue) => (
              <tr key={issue.id} className="hover:bg-slate-800/40 transition-colors group">
                <td className="px-4 py-3.5 font-mono text-xs font-bold text-indigo-400 group-hover:text-indigo-300">
                  <Link to={`/projects/${projectId}/issues/${issue.id}`} className="hover:underline">
                    {issue.key}
                  </Link>
                </td>
                <td className="px-4 py-3.5 max-w-md">
                  <Link
                    to={`/projects/${projectId}/issues/${issue.id}`}
                    className="font-medium text-slate-100 hover:text-indigo-300 transition-colors line-clamp-1 block"
                  >
                    {issue.title}
                  </Link>
                  {issue.labels && issue.labels.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {issue.labels.map((l) => (
                        <span
                          key={l.id}
                          className="px-1.5 py-0.2 text-[10px] font-medium rounded bg-slate-800 text-slate-300 border border-slate-700"
                          style={{ borderColor: `${l.color}40`, color: l.color }}
                        >
                          {l.name}
                        </span>
                      ))}
                    </div>
                  )}
                </td>
                <td className="px-4 py-3.5">
                  <IssueTypeBadge type={issue.issue_type} />
                </td>
                <td className="px-4 py-3.5">
                  <IssueStatusBadge status={issue.status} />
                </td>
                <td className="px-4 py-3.5">
                  <IssuePriorityBadge priority={issue.priority} />
                </td>
                <td className="px-4 py-3.5">
                  <IssueSeverityBadge severity={issue.severity} />
                </td>
                <td className="px-4 py-3.5">
                  {issue.assignee ? (
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-slate-700 text-indigo-300 font-bold text-[10px] flex items-center justify-center shrink-0">
                        {issue.assignee.name.charAt(0)}
                      </div>
                      <span className="text-xs text-slate-300 truncate max-w-[120px]">{issue.assignee.name}</span>
                    </div>
                  ) : (
                    <span className="text-slate-500 italic text-[11px]">Unassigned</span>
                  )}
                </td>
                <td className="px-4 py-3.5 text-right text-slate-400">
                  <div className="flex items-center justify-end gap-3 text-[11px]">
                    {Boolean(issue.comments_count) && (
                      <span className="flex items-center gap-1">
                        <MessageSquare className="w-3 h-3 text-slate-500" />
                        {issue.comments_count}
                      </span>
                    )}
                    {Boolean(issue.watchers_count) && (
                      <span className="flex items-center gap-1">
                        <Eye className="w-3 h-3 text-slate-500" />
                        {issue.watchers_count}
                      </span>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card List View */}
      <div className="md:hidden space-y-3">
        {issues.map((issue) => (
          <div key={issue.id} className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <Link
                to={`/projects/${projectId}/issues/${issue.id}`}
                className="font-mono text-xs font-bold text-indigo-400 hover:underline"
              >
                {issue.key}
              </Link>
              <IssueTypeBadge type={issue.issue_type} />
            </div>

            <Link
              to={`/projects/${projectId}/issues/${issue.id}`}
              className="font-medium text-slate-100 text-sm block leading-snug hover:text-indigo-300"
            >
              {issue.title}
            </Link>

            <div className="flex flex-wrap items-center gap-2 pt-1">
              <IssueStatusBadge status={issue.status} />
              <IssuePriorityBadge priority={issue.priority} />
              <IssueSeverityBadge severity={issue.severity} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
