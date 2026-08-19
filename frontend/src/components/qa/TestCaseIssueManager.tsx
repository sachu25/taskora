import React, { useState } from 'react';
import type { TestCaseIssue } from '../../types/qa';
import type { Issue } from '../../types/issue';
import { api } from '../../services/api';
import { Button } from '../ui/Button';
import { Link2, Unlink, Search, Bug } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Props {
  caseId: string;
  projectId: string;
  linkedIssues: TestCaseIssue[];
  onLinkIssue: (issueId: string) => Promise<void>;
  onUnlinkIssue: (issueId: string) => Promise<void>;
  canManage?: boolean;
}

export const TestCaseIssueManager: React.FC<Props> = ({
  caseId: _caseId,
  projectId,
  linkedIssues,
  onLinkIssue,
  onUnlinkIssue,
  canManage = true,
}) => {
  const [isLinking, setIsLinking] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [availableIssues, setAvailableIssues] = useState<Issue[]>([]);
  const [searching, setSearching] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setAvailableIssues([]);
      return;
    }

    try {
      setSearching(true);
      const res = await api.get(`/projects/${projectId}/issues`, { params: { search: query } });
      const items: Issue[] = res.data?.data?.items || res.data?.data || [];
      // Filter out already linked issues
      setAvailableIssues(items.filter((item) => !linkedIssues.some((li) => li.id === item.id)));
    } catch (err) {
      // Ignore search error
    } finally {
      setSearching(false);
    }
  };

  const handleLink = async (issueId: string) => {
    try {
      setLoading(true);
      setError(null);
      await onLinkIssue(issueId);
      setIsLinking(false);
      setSearchQuery('');
      setAvailableIssues([]);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to link issue.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-200">Linked Defect Issues ({linkedIssues.length})</h3>
        {canManage && !isLinking && (
          <Button size="sm" variant="outline" onClick={() => setIsLinking(true)} icon={<Link2 className="w-3.5 h-3.5" />}>
            Link Issue
          </Button>
        )}
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-xs text-rose-400">
          {error}
        </div>
      )}

      {/* Issues list */}
      <div className="space-y-2">
        {linkedIssues.length === 0 && !isLinking ? (
          <div className="p-4 text-center rounded-xl bg-slate-900/50 border border-slate-800 text-xs text-slate-500">
            No defect issues linked to this test case.
          </div>
        ) : (
          linkedIssues.map((issue) => (
            <div
              key={issue.id}
              className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-3 text-xs"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <Bug className="w-4 h-4 text-rose-400 shrink-0" />
                <span className="font-mono font-bold text-indigo-400 shrink-0">{issue.key}</span>
                <Link
                  to={`/projects/${projectId}/issues/${issue.id}`}
                  className="font-medium text-slate-200 hover:text-indigo-400 truncate"
                >
                  {issue.title}
                </Link>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className="px-2 py-0.5 rounded text-[10px] uppercase font-semibold bg-slate-800 text-slate-400 border border-slate-700">
                  {issue.status}
                </span>
                {canManage && (
                  <button
                    onClick={() => onUnlinkIssue(issue.id)}
                    className="p-1 text-slate-500 hover:text-rose-400 transition-colors"
                    title="Unlink Issue"
                  >
                    <Unlink className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          ))
        )}

        {/* Link issue search drop-down */}
        {isLinking && (
          <div className="p-4 rounded-xl bg-slate-900 border border-indigo-500/40 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-semibold text-indigo-400">Search Project Issue to Link</h4>
              <button onClick={() => setIsLinking(false)} className="text-slate-400 hover:text-slate-200 text-xs">
                Cancel
              </button>
            </div>

            <div className="relative">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Search by issue title or key (e.g. WEB-1)..."
                className="w-full pl-9 pr-3.5 py-2 text-xs bg-slate-950 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            {searching ? (
              <div className="p-2 text-center text-xs text-slate-500">Searching issues...</div>
            ) : (
              <div className="max-h-48 overflow-y-auto divide-y divide-slate-800">
                {availableIssues.map((issue) => (
                  <div
                    key={issue.id}
                    className="p-2.5 flex items-center justify-between hover:bg-slate-800/60 rounded-lg transition-colors cursor-pointer"
                    onClick={() => handleLink(issue.id)}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="font-mono font-bold text-indigo-400 text-xs">{issue.key}</span>
                      <span className="text-xs text-slate-200 truncate">{issue.title}</span>
                    </div>
                    <Button size="sm" variant="ghost" isLoading={loading}>
                      Link
                    </Button>
                  </div>
                ))}
                {searchQuery.trim() !== '' && availableIssues.length === 0 && (
                  <div className="p-2 text-center text-xs text-slate-500">No matching issues found.</div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
