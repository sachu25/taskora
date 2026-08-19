import React, { useState } from 'react';
import { UserCheck, UserX, UserPlus } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import type { User } from '../../types';

interface ReleaseManagerSelectorProps {
  currentManager?: User | null;
  members?: User[];
  onAssign: (userId: string) => Promise<void>;
  onRemove: () => Promise<void>;
  canManage?: boolean;
}

export const ReleaseManagerSelector: React.FC<ReleaseManagerSelectorProps> = ({
  currentManager,
  members = [],
  onAssign,
  onRemove,
  canManage = true,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAssignSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserId) return;
    setError(null);
    setIsLoading(true);
    try {
      await onAssign(selectedUserId);
      setIsOpen(false);
      setSelectedUserId('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to assign release manager.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveSubmit = async () => {
    setError(null);
    setIsLoading(true);
    try {
      await onRemove();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to remove release manager.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      {error && (
        <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-xs text-rose-400">
          {error}
        </div>
      )}

      {currentManager ? (
        <div className="flex items-center justify-between p-3 bg-slate-900 border border-slate-800 rounded-xl">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center font-bold text-xs text-indigo-400">
              {currentManager.name.charAt(0)}
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-200">{currentManager.name}</p>
              <p className="text-[10px] text-slate-400">{currentManager.email}</p>
            </div>
          </div>

          {canManage && (
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setIsOpen(true)}
                title="Change Manager"
                disabled={isLoading}
              >
                Change
              </Button>
              <button
                onClick={handleRemoveSubmit}
                disabled={isLoading}
                className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                title="Remove Manager"
              >
                <UserX className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="flex items-center justify-between p-3 bg-slate-900/60 border border-dashed border-slate-800 rounded-xl">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <UserCheck className="w-4 h-4 text-slate-500" />
            <span>No manager assigned</span>
          </div>
          {canManage && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsOpen(true)}
              icon={<UserPlus className="w-3.5 h-3.5" />}
            >
              Assign
            </Button>
          )}
        </div>
      )}

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Assign Release Manager">
        <form onSubmit={handleAssignSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Select Organization Member</label>
            <select
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              className="w-full px-3.5 py-2 text-sm bg-slate-900 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:border-indigo-500"
              required
            >
              <option value="">Choose a user...</option>
              {members.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.email})
                </option>
              ))}
            </select>
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-slate-800">
            <Button type="button" variant="ghost" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isLoading} disabled={!selectedUserId}>
              Assign Manager
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
