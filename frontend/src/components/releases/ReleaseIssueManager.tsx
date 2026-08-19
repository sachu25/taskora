import React, { useState, useEffect, useRef } from 'react';
import { Search, Plus, Check } from 'lucide-react';
import { api } from '../../services/api';
import type { ApiResponse, Issue } from '../../types';
import type { ReleaseIssue } from '../../types/release';
import { Button } from '../ui/Button';

interface ReleaseIssueManagerProps {
  projectId: string;
  existingIssues: ReleaseIssue[];
  onAddIssue: (issueId: string) => Promise<void>;
  canManage?: boolean;
}

export const ReleaseIssueManager: React.FC<ReleaseIssueManagerProps> = ({
  projectId,
  existingIssues,
  onAddIssue,
  canManage = true,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Issue[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [addingIssueId, setAddingIssueId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const searchRequestIdRef = useRef<number>(0);

  // Debounced search for project issues
  useEffect(() => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    const currentRequestId = ++searchRequestIdRef.current;
    setIsSearching(true);

    const timer = setTimeout(async () => {
      try {
        const res = await api.get<ApiResponse<{ items: Issue[] }>>(`/projects/${projectId}/issues`, {
          params: { search: searchTerm, per_page: 10 },
        });

        if (searchRequestIdRef.current === currentRequestId) {
          setSearchResults(res.data.data.items || []);
        }
      } catch (err) {
        if (searchRequestIdRef.current === currentRequestId) {
          setSearchResults([]);
        }
      } finally {
        if (searchRequestIdRef.current === currentRequestId) {
          setIsSearching(false);
        }
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [searchTerm, projectId]);

  const existingIssueIds = new Set(existingIssues.map((ri) => ri.issue_id));

  const handleAdd = async (issueId: string) => {
    setError(null);
    setAddingIssueId(issueId);
    try {
      await onAddIssue(issueId);
      setSearchTerm('');
      setSearchResults([]);
    } catch (err: any) {
      setError(err.response?.data?.message || err.response?.data?.errors?.issue_id?.[0] || 'Failed to attach issue to release.');
    } finally {
      setAddingIssueId(null);
    }
  };

  if (!canManage) return null;

  return (
    <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-semibold text-slate-200">Attach Issue to Release</h4>
        <span className="text-[10px] text-slate-400">Search project issues by title or key</span>
      </div>

      {error && (
        <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-xs text-rose-400">
          {error}
        </div>
      )}

      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search issue title or key (e.g. WEB-1)..."
          className="w-full pl-9 pr-4 py-2 text-xs bg-slate-950 border border-slate-700/80 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
        />
        {isSearching && (
          <span className="text-[10px] text-slate-400 absolute right-3 top-2.5 animate-pulse">
            Searching...
          </span>
        )}
      </div>

      {/* Search Dropdown Results */}
      {searchResults.length > 0 && (
        <div className="max-h-56 overflow-y-auto border border-slate-800 rounded-lg divide-y divide-slate-800 bg-slate-950">
          {searchResults.map((issue) => {
            const isAttached = existingIssueIds.has(issue.id);

            return (
              <div key={issue.id} className="p-2.5 flex items-center justify-between hover:bg-slate-900/60 transition-colors">
                <div className="space-y-0.5 truncate pr-3">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-indigo-400 text-xs">{issue.key}</span>
                    <span className="text-[10px] uppercase font-semibold px-1.5 py-0.2 rounded bg-slate-800 text-slate-400">
                      {issue.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-200 truncate">{issue.title}</p>
                </div>

                {isAttached ? (
                  <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-medium px-2 py-1 bg-emerald-500/10 rounded-md shrink-0">
                    <Check className="w-3 h-3" /> Attached
                  </span>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleAdd(issue.id)}
                    isLoading={addingIssueId === issue.id}
                    icon={<Plus className="w-3.5 h-3.5" />}
                    className="shrink-0"
                  >
                    Add
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
