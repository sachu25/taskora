import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import type { Release, CreateReleasePayload, UpdateReleasePayload } from '../../types/release';
import type { User } from '../../types';

interface ReleaseFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: CreateReleasePayload | UpdateReleasePayload) => Promise<void>;
  initialData?: Release | null;
  members?: User[];
  isSubmitting?: boolean;
}

export const ReleaseFormModal: React.FC<ReleaseFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  members = [],
  isSubmitting = false,
}) => {
  const [name, setName] = useState('');
  const [version, setVersion] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [releaseDate, setReleaseDate] = useState('');
  const [releaseManagerId, setReleaseManagerId] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setName(initialData.name || '');
      setVersion(initialData.version || '');
      setDescription(initialData.description || '');
      setStartDate(initialData.start_date || '');
      setReleaseDate(initialData.release_date || '');
      setReleaseManagerId(initialData.release_manager_id || '');
    } else {
      setName('');
      setVersion('');
      setDescription('');
      setStartDate('');
      setReleaseDate('');
      setReleaseManagerId('');
    }
    setError(null);
  }, [initialData, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (startDate && releaseDate && releaseDate < startDate) {
      setError('Target release date cannot be earlier than the start date.');
      return;
    }

    try {
      await onSubmit({
        name,
        version,
        description: description || undefined,
        start_date: startDate || undefined,
        release_date: releaseDate || undefined,
        release_manager_id: releaseManagerId || undefined,
      });
      onClose();
    } catch (err: any) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.errors?.version?.[0] ||
        err.response?.data?.errors?.release_date?.[0] ||
        'Failed to save release. Please try again.';
      setError(msg);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? `Edit Release (${initialData.version})` : 'Create Project Release'}
      maxWidth="lg"
    >
      {error && (
        <div className="mb-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-xs text-rose-400">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Release Version <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              value={version}
              onChange={(e) => setVersion(e.target.value)}
              placeholder="e.g. v1.2.0"
              className="w-full px-3.5 py-2 text-sm bg-slate-900 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Release Name <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Fall Feature Launch"
              className="w-full px-3.5 py-2 text-sm bg-slate-900 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1.5">Release Manager</label>
          <select
            value={releaseManagerId}
            onChange={(e) => setReleaseManagerId(e.target.value)}
            className="w-full px-3.5 py-2 text-sm bg-slate-900 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:border-indigo-500"
          >
            <option value="">No release manager assigned</option>
            {members.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name} ({u.email})
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3.5 py-2 text-sm bg-slate-900 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Target Release Date</label>
            <input
              type="date"
              value={releaseDate}
              onChange={(e) => setReleaseDate(e.target.value)}
              className="w-full px-3.5 py-2 text-sm bg-slate-900 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1.5">Description & Release Notes</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder="Summarize key features, bug fixes, and deployment scope..."
            className="w-full px-3.5 py-2 text-sm bg-slate-900 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 resize-none"
          />
        </div>

        <div className="pt-4 flex justify-end gap-3 border-t border-slate-800">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isSubmitting}>
            {initialData ? 'Update Release' : 'Create Release'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
