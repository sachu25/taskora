import React, { useState } from 'react';
import type { TestStep } from '../../types/qa';
import { Button } from '../ui/Button';
import { Plus, Trash2, ArrowUp, ArrowDown, Edit2, Check, X } from 'lucide-react';

interface Props {
  steps: TestStep[];
  onAddStep: (data: { action: string; expected_result?: string }) => Promise<void>;
  onUpdateStep: (stepId: string, data: { action?: string; expected_result?: string }) => Promise<void>;
  onDeleteStep: (stepId: string) => Promise<void>;
  onReorderStep: (stepId: string, newPosition: number) => Promise<void>;
  canManage?: boolean;
}

export const TestStepEditor: React.FC<Props> = ({
  steps,
  onAddStep,
  onUpdateStep,
  onDeleteStep,
  onReorderStep,
  canManage = true,
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newAction, setNewAction] = useState('');
  const [newExpected, setNewExpected] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editAction, setEditAction] = useState('');
  const [editExpected, setEditExpected] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAction.trim()) return;

    try {
      setLoading(true);
      setError(null);
      await onAddStep({ action: newAction, expected_result: newExpected || undefined });
      setNewAction('');
      setNewExpected('');
      setIsAdding(false);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to add step');
    } finally {
      setLoading(false);
    }
  };

  const handleStartEdit = (step: TestStep) => {
    setEditingId(step.id);
    setEditAction(step.action);
    setEditExpected(step.expected_result || '');
  };

  const handleSaveEdit = async (stepId: string) => {
    if (!editAction.trim()) return;

    try {
      setLoading(true);
      setError(null);
      await onUpdateStep(stepId, { action: editAction, expected_result: editExpected || undefined });
      setEditingId(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update step');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-200">Test Execution Steps ({steps.length})</h3>
        {canManage && !isAdding && (
          <Button size="sm" onClick={() => setIsAdding(true)} icon={<Plus className="w-3.5 h-3.5" />}>
            Add Step
          </Button>
        )}
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-xs text-rose-400">
          {error}
        </div>
      )}

      {/* Steps List */}
      <div className="space-y-2.5">
        {steps.length === 0 && !isAdding ? (
          <div className="p-6 text-center rounded-xl bg-slate-900/50 border border-slate-800 text-xs text-slate-500">
            No test steps defined yet. Click "Add Step" to create instructions.
          </div>
        ) : (
          steps.map((step, index) => {
            const isEditing = editingId === step.id;

            return (
              <div
                key={step.id}
                className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-start gap-3 text-xs group transition-colors hover:border-slate-700/80"
              >
                <div className="w-6 h-6 rounded-lg bg-slate-800 border border-slate-700 font-mono font-bold text-indigo-400 flex items-center justify-center shrink-0 mt-0.5">
                  {step.step_number}
                </div>

                <div className="flex-1 space-y-1">
                  {isEditing ? (
                    <div className="space-y-2">
                      <input
                        type="text"
                        value={editAction}
                        onChange={(e) => setEditAction(e.target.value)}
                        placeholder="Action description"
                        className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-md text-slate-100 text-xs focus:outline-none focus:border-indigo-500"
                      />
                      <input
                        type="text"
                        value={editExpected}
                        onChange={(e) => setEditExpected(e.target.value)}
                        placeholder="Expected result"
                        className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-md text-slate-100 text-xs focus:outline-none focus:border-indigo-500"
                      />
                      <div className="flex gap-2 justify-end pt-1">
                        <button
                          onClick={() => setEditingId(null)}
                          className="p-1 text-slate-400 hover:text-slate-200"
                        >
                          <X className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleSaveEdit(step.id)}
                          className="p-1 text-emerald-400 hover:text-emerald-300"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <p className="font-medium text-slate-200 leading-relaxed">{step.action}</p>
                      {step.expected_result && (
                        <p className="text-slate-400 text-[11px] leading-relaxed">
                          <span className="font-semibold text-slate-500">Expected: </span>
                          {step.expected_result}
                        </p>
                      )}
                    </>
                  )}
                </div>

                {canManage && !isEditing && (
                  <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                    <button
                      disabled={index === 0 || loading}
                      onClick={() => onReorderStep(step.id, step.step_number - 1)}
                      className="p-1 text-slate-500 hover:text-slate-300 disabled:opacity-30"
                      title="Move Up"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      disabled={index === steps.length - 1 || loading}
                      onClick={() => onReorderStep(step.id, step.step_number + 1)}
                      className="p-1 text-slate-500 hover:text-slate-300 disabled:opacity-30"
                      title="Move Down"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleStartEdit(step)}
                      className="p-1 text-slate-500 hover:text-indigo-400"
                      title="Edit Step"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDeleteStep(step.id)}
                      className="p-1 text-slate-500 hover:text-rose-400"
                      title="Delete Step"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}

        {/* Add Step Form inline */}
        {isAdding && (
          <form onSubmit={handleAddSubmit} className="p-4 rounded-xl bg-slate-900 border border-indigo-500/40 space-y-3">
            <h4 className="text-xs font-semibold text-indigo-400">Add Step #{steps.length + 1}</h4>
            <div>
              <input
                type="text"
                value={newAction}
                onChange={(e) => setNewAction(e.target.value)}
                placeholder="Action step description *"
                className="w-full px-3.5 py-2 text-xs bg-slate-950 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                required
              />
            </div>
            <div>
              <input
                type="text"
                value={newExpected}
                onChange={(e) => setNewExpected(e.target.value)}
                placeholder="Expected outcome / verification criteria"
                className="w-full px-3.5 py-2 text-xs bg-slate-950 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <Button type="button" variant="ghost" size="sm" onClick={() => setIsAdding(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" isLoading={loading}>
                Save Step
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
