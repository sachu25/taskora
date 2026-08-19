import React, { useState } from 'react';
import type { IssueComment, User } from '../../types';
import { Send, Trash2, Edit2, Loader2, MessageSquare } from 'lucide-react';

interface Props {
  comments: IssueComment[];
  currentUser: User | null;
  onAddComment: (body: string) => Promise<void>;
  onUpdateComment: (commentId: string, body: string) => Promise<void>;
  onDeleteComment: (commentId: string) => Promise<void>;
}

export const IssueComments: React.FC<Props> = ({
  comments,
  currentUser,
  onAddComment,
  onUpdateComment,
  onDeleteComment,
}) => {
  const [newBody, setNewBody] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editBody, setEditBody] = useState('');
  const [updating, setUpdating] = useState(false);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBody.trim() || submitting) return;

    setSubmitting(true);
    try {
      await onAddComment(newBody.trim());
      setNewBody('');
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleStartEdit = (c: IssueComment) => {
    setEditingId(c.id);
    setEditBody(c.body);
  };

  const handleSaveEdit = async (cId: string) => {
    if (!editBody.trim() || updating) return;
    setUpdating(true);
    try {
      await onUpdateComment(cId, editBody.trim());
      setEditingId(null);
    } catch (err) {
      console.error(err);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        <MessageSquare className="w-4 h-4 text-indigo-400" />
        <h3 className="text-sm font-bold text-slate-100">Discussion ({comments.length})</h3>
      </div>

      {/* New Comment Input */}
      <form onSubmit={handleAdd} className="space-y-2">
        <textarea
          rows={3}
          value={newBody}
          onChange={(e) => setNewBody(e.target.value)}
          placeholder="Add a comment to this issue..."
          className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 text-xs placeholder:text-slate-500 focus:outline-hidden focus:border-indigo-500 transition-colors"
        />
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={submitting || !newBody.trim()}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 transition-all shadow-xs"
          >
            {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
            <span>Comment</span>
          </button>
        </div>
      </form>

      {/* Comment Thread List */}
      <div className="space-y-4 pt-2">
        {comments.map((c) => {
          const isAuthor = currentUser?.id === c.user.id;
          const isEditing = editingId === c.id;

          return (
            <div key={c.id} className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-slate-700 font-bold text-xs text-indigo-300 flex items-center justify-center">
                    {c.user.name.charAt(0)}
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-slate-200 block leading-none">{c.user.name}</span>
                    <span className="text-[10px] text-slate-500">
                      {new Date(c.created_at).toLocaleString()}
                    </span>
                  </div>
                </div>

                {isAuthor && !isEditing && (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleStartEdit(c)}
                      className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
                      title="Edit comment"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDeleteComment(c.id)}
                      className="p-1 rounded text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                      title="Delete comment"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>

              {isEditing ? (
                <div className="space-y-2 pt-1">
                  <textarea
                    rows={3}
                    value={editBody}
                    onChange={(e) => setEditBody(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 text-xs focus:outline-hidden"
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setEditingId(null)}
                      className="px-3 py-1 text-xs text-slate-400 hover:text-slate-200"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSaveEdit(c.id)}
                      disabled={updating || !editBody.trim()}
                      className="px-3 py-1 rounded bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold"
                    >
                      Save
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap pl-9">{c.body}</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
