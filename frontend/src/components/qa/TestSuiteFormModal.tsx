import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import type { TestSuite } from '../../types/qa';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { name: string; description?: string; status?: 'active' | 'archived' }) => Promise<void>;
  suite?: TestSuite | null;
  isLoading?: boolean;
}

export const TestSuiteFormModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onSubmit,
  suite,
  isLoading = false,
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<'active' | 'archived'>('active');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (suite) {
      setName(suite.name);
      setDescription(suite.description || '');
      setStatus(suite.status || 'active');
    } else {
      setName('');
      setDescription('');
      setStatus('active');
    }
    setError(null);
  }, [suite, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Suite name is required.');
      return;
    }

    try {
      setError(null);
      await onSubmit({ name, description, status });
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save test suite.');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={suite ? 'Edit Test Suite' : 'Create New Test Suite'}
    >
      {error && (
        <div className="mb-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-xs text-rose-400">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">Suite Name *</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Smoke Testing, Authentication & Security"
            className="w-full px-3.5 py-2 text-sm bg-slate-900 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Overview of test scope and modules covered..."
            rows={3}
            className="w-full px-3.5 py-2 text-sm bg-slate-900 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 resize-none"
          />
        </div>

        {suite && (
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as 'active' | 'archived')}
              className="w-full px-3.5 py-2 text-sm bg-slate-900 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:border-indigo-500"
            >
              <option value="active">Active</option>
              <option value="archived">Archived</option>
            </select>
          </div>
        )}

        <div className="pt-4 flex justify-end gap-3 border-t border-slate-800">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isLoading}>
            {suite ? 'Save Changes' : 'Create Test Suite'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
