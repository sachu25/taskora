import React, { useState } from 'react';
import { Play, CheckCircle2, XCircle, Edit3, Trash2, RotateCcw } from 'lucide-react';
import { Button } from '../ui/Button';
import type { Release } from '../../types/release';

interface ReleaseLifecycleActionsProps {
  release: Release;
  onStart: () => Promise<void>;
  onComplete: () => Promise<void>;
  onCancel: () => Promise<void>;
  onEdit?: () => void;
  onDelete?: () => void;
  onRestore?: () => Promise<void>;
  canManage?: boolean;
}

export const ReleaseLifecycleActions: React.FC<ReleaseLifecycleActionsProps> = ({
  release,
  onStart,
  onComplete,
  onCancel,
  onEdit,
  onDelete,
  onRestore,
  canManage = true,
}) => {
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const handleAction = async (name: string, fn: () => Promise<void>) => {
    setActionLoading(name);
    try {
      await fn();
    } finally {
      setActionLoading(null);
    }
  };

  if (!canManage) return null;

  const isDeleted = !!release.deleted_at;

  if (isDeleted) {
    return (
      <div className="flex items-center gap-2">
        {onRestore && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleAction('restore', onRestore)}
            isLoading={actionLoading === 'restore'}
            icon={<RotateCcw className="w-3.5 h-3.5" />}
          >
            Restore Release
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Start Action */}
      {release.status === 'planned' && (
        <Button
          size="sm"
          onClick={() => handleAction('start', onStart)}
          isLoading={actionLoading === 'start'}
          icon={<Play className="w-3.5 h-3.5" />}
        >
          Start Release
        </Button>
      )}

      {/* Complete Action */}
      {release.status === 'in_progress' && (
        <Button
          size="sm"
          onClick={() => handleAction('complete', onComplete)}
          isLoading={actionLoading === 'complete'}
          icon={<CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
          className="bg-emerald-600 hover:bg-emerald-500 text-white"
        >
          Complete Release
        </Button>
      )}

      {/* Cancel Action */}
      {(release.status === 'planned' || release.status === 'in_progress') && (
        <Button
          size="sm"
          variant="outline"
          onClick={() => handleAction('cancel', onCancel)}
          isLoading={actionLoading === 'cancel'}
          icon={<XCircle className="w-3.5 h-3.5 text-rose-400" />}
        >
          Cancel Release
        </Button>
      )}

      {/* Edit & Delete Buttons */}
      {onEdit && (
        <Button
          size="sm"
          variant="ghost"
          onClick={onEdit}
          icon={<Edit3 className="w-3.5 h-3.5" />}
        >
          Edit
        </Button>
      )}

      {onDelete && (
        <Button
          size="sm"
          variant="ghost"
          onClick={onDelete}
          icon={<Trash2 className="w-3.5 h-3.5 text-rose-400" />}
          className="text-rose-400 hover:text-rose-300 hover:bg-rose-500/10"
        >
          Delete
        </Button>
      )}
    </div>
  );
};
