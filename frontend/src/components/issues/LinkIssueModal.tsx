import React, { useState } from 'react';
import { X, Link2, Loader2 } from 'lucide-react';
import type { Issue, IssueLinkType } from '../../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (linkedIssueId: string, linkType: IssueLinkType) => Promise<void>;
  projectIssues: Issue[];
  currentIssueId: string;
}

export const LinkIssueModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onSubmit,
  projectIssues = [],
  currentIssueId,
}) => {
  const [selectedIssueId, setSelectedIssueId] = useState('');
  const [linkType, setLinkType] = useState<IssueLinkType>('relates_to');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const candidateIssues = projectIssues.filter((i) => i.id !== currentIssueId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedIssueId || submitting) return;

    setSubmitting(true);
    setErrorMsg(null);

    try {
      await onSubmit(selectedIssueId, linkType);
      onClose();
    } catch (err: any) {
      setErrorMsg(err?.response?.data?.message || 'Failed to create issue link.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <Link2 className="w-4 h-4 text-indigo-400" />
            Link Issue
          </h3>
          <button onClick={onClose} className="p-1 rounded text-slate-400 hover:text-slate-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 text-xs text-rose-300 bg-rose-500/10 border border-rose-500/20 rounded-lg">
              {errorMsg}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Relationship</label>
            <select
              value={linkType}
              onChange={(e) => setLinkType(e.target.value as IssueLinkType)}
              className="w-full px-3 py-2 rounded-lg bg-slate-800/80 border border-slate-700/80 text-slate-200 text-xs focus:outline-hidden"
            >
              <option value="relates_to">relates to</option>
              <option value="blocks">blocks</option>
              <option value="blocked_by">is blocked by</option>
              <option value="duplicates">duplicates</option>
              <option value="duplicated_by">is duplicated by</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Target Issue</label>
            <select
              value={selectedIssueId}
              onChange={(e) => setSelectedIssueId(e.target.value)}
              required
              className="w-full px-3 py-2 rounded-lg bg-slate-800/80 border border-slate-700/80 text-slate-200 text-xs focus:outline-hidden"
            >
              <option value="">Select an issue to link...</option>
              {candidateIssues.map((issue) => (
                <option key={issue.id} value={issue.id}>
                  {issue.key} — {issue.title}
                </option>
              ))}
            </select>
          </div>

          <div className="pt-3 flex justify-end gap-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-slate-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || !selectedIssueId}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50"
            >
              {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>Link Issue</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
