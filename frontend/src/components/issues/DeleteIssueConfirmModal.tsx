import React, { useState } from 'react';
import { AlertTriangle, Loader2 } from 'lucide-react';

interface Props {
  isOpen: boolean;
  issueKey: string;
  issueTitle: string;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

export const DeleteIssueConfirmModal: React.FC<Props> = ({
  isOpen,
  issueKey,
  issueTitle,
  onClose,
  onConfirm,
}) => {
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    setSubmitting(true);
    try {
      await onConfirm();
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
      <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden p-6 space-y-4">
        <div className="flex items-center gap-3 text-rose-400">
          <div className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/20">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-100">Delete Issue {issueKey}?</h3>
            <p className="text-xs text-slate-400">This issue will be soft-deleted.</p>
          </div>
        </div>

        <p className="text-xs text-slate-300 bg-slate-850 p-3 rounded-lg border border-slate-800 line-clamp-2 italic">
          "{issueTitle}"
        </p>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-slate-200"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={submitting}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 disabled:opacity-50"
          >
            {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            <span>Delete Issue</span>
          </button>
        </div>
      </div>
    </div>
  );
};
