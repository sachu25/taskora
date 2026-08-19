import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import type { TestRun } from '../../types/qa';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { name: string; description?: string; environment?: string }) => Promise<void>;
  run?: TestRun | null;
  isLoading?: boolean;
}

export const TestRunFormModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onSubmit,
  run,
  isLoading = false,
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [environment, setEnvironment] = useState('staging');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (run) {
      setName(run.name);
      setDescription(run.description || '');
      setEnvironment(run.environment || 'staging');
    } else {
      setName('');
      setDescription('');
      setEnvironment('staging');
    }
    setError(null);
  }, [run, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Test run name is required.');
      return;
    }

    try {
      setError(null);
      await onSubmit({ name, description, environment });
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save test run.');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={run ? 'Edit Test Run' : 'Create New Test Run'}
    >
      {error && (
        <div className="mb-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-xs text-rose-400">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">Run Name *</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Sprint 3 Regression Run, v2.1.0 Build Verification"
            className="w-full px-3.5 py-2 text-sm bg-slate-900 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">Environment</label>
          <input
            type="text"
            value={environment}
            onChange={(e) => setEnvironment(e.target.value)}
            placeholder="e.g. staging, production, uat, dev-01"
            className="w-full px-3.5 py-2 text-sm bg-slate-900 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Objective of this execution cycle..."
            rows={3}
            className="w-full px-3.5 py-2 text-sm bg-slate-900 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 resize-none"
          />
        </div>

        <div className="pt-4 flex justify-end gap-3 border-t border-slate-800">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isLoading}>
            {run ? 'Save Changes' : 'Create Test Run'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
