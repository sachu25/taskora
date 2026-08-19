import React, { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';

interface DeleteReleaseConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  releaseName: string;
  releaseVersion: string;
}

export const DeleteReleaseConfirmModal: React.FC<DeleteReleaseConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  releaseName,
  releaseVersion,
}) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConfirm = async () => {
    setError(null);
    setIsDeleting(true);
    try {
      await onConfirm();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to soft delete release.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Soft Delete Release" maxWidth="md">
      <div className="space-y-4">
        {error && (
          <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-xs text-rose-400">
            {error}
          </div>
        )}

        <div className="flex items-start gap-3 p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-300 text-xs">
          <AlertTriangle className="w-5 h-5 shrink-0 text-amber-400 mt-0.5" />
          <div>
            <p className="font-semibold text-amber-200">Are you sure you want to soft delete this release?</p>
            <p className="mt-1 text-amber-400/90">
              Release <strong className="font-mono font-bold">{releaseVersion}</strong> ({releaseName}) will be moved to soft-deleted state. You can restore it later if no version conflict exists.
            </p>
          </div>
        </div>

        <div className="pt-2 flex justify-end gap-3 border-t border-slate-800">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="button"
            variant="danger"
            onClick={handleConfirm}
            isLoading={isDeleting}
          >
            Soft Delete
          </Button>
        </div>
      </div>
    </Modal>
  );
};
