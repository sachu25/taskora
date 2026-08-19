import React, { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import type { Issue, IssueType, IssueStatus, IssuePriority, IssueSeverity, ProjectMember } from '../../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<Issue> & { assignee_id?: string | null }) => Promise<void>;
  initialData?: Issue | null;
  members?: ProjectMember[];
  titleText?: string;
}

export const IssueFormModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData = null,
  members = [],
  titleText,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [issueType, setIssueType] = useState<IssueType>('task');
  const [status, setStatus] = useState<IssueStatus>('todo');
  const [priority, setPriority] = useState<IssuePriority>('medium');
  const [severity, setSeverity] = useState<IssueSeverity | ''>('');
  const [assigneeId, setAssigneeId] = useState<string>('');

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || '');
      setDescription(initialData.description || '');
      setIssueType(initialData.issue_type || 'task');
      setStatus(initialData.status || 'todo');
      setPriority(initialData.priority || 'medium');
      setSeverity(initialData.severity || '');
      setAssigneeId(initialData.assignee?.id || initialData.assignee_id || '');
    } else {
      setTitle('');
      setDescription('');
      setIssueType('task');
      setStatus('todo');
      setPriority('medium');
      setSeverity('');
      setAssigneeId('');
    }
    setErrorMsg(null);
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setSubmitting(true);
    setErrorMsg(null);

    try {
      await onSubmit({
        title: title.trim(),
        description: description.trim() || null,
        issue_type: issueType,
        status,
        priority,
        severity: severity ? (severity as IssueSeverity) : null,
        assignee_id: assigneeId || null,
      });
      onClose();
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Failed to save issue. Please check validation rules.';
      setErrorMsg(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-100">
            {titleText || (initialData ? `Edit ${initialData.key}` : 'Create New Issue')}
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1">
          {errorMsg && (
            <div className="p-3 text-xs text-rose-300 bg-rose-500/10 border border-rose-500/20 rounded-lg">
              {errorMsg}
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Title <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Summary or bug headline..."
              className="w-full px-3 py-2 rounded-lg bg-slate-800/80 border border-slate-700/80 text-slate-100 text-xs placeholder:text-slate-500 focus:outline-hidden focus:border-indigo-500"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Description</label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add details, reproduction steps, or context..."
              className="w-full px-3 py-2 rounded-lg bg-slate-800/80 border border-slate-700/80 text-slate-100 text-xs placeholder:text-slate-500 focus:outline-hidden focus:border-indigo-500"
            />
          </div>

          {/* Grid Selectors */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Issue Type</label>
              <select
                value={issueType}
                onChange={(e) => setIssueType(e.target.value as IssueType)}
                className="w-full px-3 py-2 rounded-lg bg-slate-800/80 border border-slate-700/80 text-slate-200 text-xs focus:outline-hidden focus:border-indigo-500"
              >
                <option value="task">Task</option>
                <option value="bug">Bug</option>
                <option value="story">Story</option>
                <option value="feature">Feature</option>
                <option value="improvement">Improvement</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as IssueStatus)}
                className="w-full px-3 py-2 rounded-lg bg-slate-800/80 border border-slate-700/80 text-slate-200 text-xs focus:outline-hidden focus:border-indigo-500"
              >
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="backlog">Backlog</option>
                <option value="done">Done</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as IssuePriority)}
                className="w-full px-3 py-2 rounded-lg bg-slate-800/80 border border-slate-700/80 text-slate-200 text-xs focus:outline-hidden focus:border-indigo-500"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Severity</label>
              <select
                value={severity}
                onChange={(e) => setSeverity(e.target.value as IssueSeverity | '')}
                className="w-full px-3 py-2 rounded-lg bg-slate-800/80 border border-slate-700/80 text-slate-200 text-xs focus:outline-hidden focus:border-indigo-500"
              >
                <option value="">None</option>
                <option value="minor">Minor</option>
                <option value="major">Major</option>
                <option value="critical">Critical</option>
                <option value="blocker">Blocker</option>
              </select>
            </div>
          </div>

          {/* Assignee */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Assignee</label>
            <select
              value={assigneeId}
              onChange={(e) => setAssigneeId(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-800/80 border border-slate-700/80 text-slate-200 text-xs focus:outline-hidden focus:border-indigo-500"
            >
              <option value="">Unassigned</option>
              {members.map((m) => (
                <option key={m.user.id} value={m.user.id}>
                  {m.user.name} ({m.user.email})
                </option>
              ))}
            </select>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || !title.trim()}
              className="flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-semibold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 disabled:opacity-50 transition-all shadow-md shadow-indigo-600/20"
            >
              {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>{initialData ? 'Save Changes' : 'Create Issue'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
