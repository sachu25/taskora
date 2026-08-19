import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import type { TestCase, TestSuite, TestType, TestCasePriority, TestCaseStatus } from '../../types/qa';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    title: string;
    suite_id?: string;
    description?: string;
    preconditions?: string;
    test_type?: TestType;
    priority?: TestCasePriority;
    status?: TestCaseStatus;
  }) => Promise<void>;
  testCase?: TestCase | null;
  suites?: TestSuite[];
  defaultSuiteId?: string;
  isLoading?: boolean;
}

export const TestCaseFormModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onSubmit,
  testCase,
  suites = [],
  defaultSuiteId = '',
  isLoading = false,
}) => {
  const [title, setTitle] = useState('');
  const [suiteId, setSuiteId] = useState('');
  const [description, setDescription] = useState('');
  const [preconditions, setPreconditions] = useState('');
  const [testType, setTestType] = useState<TestType>('functional');
  const [priority, setPriority] = useState<TestCasePriority>('medium');
  const [status, setStatus] = useState<TestCaseStatus>('ready');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (testCase) {
      setTitle(testCase.title);
      setSuiteId(testCase.suite_id || '');
      setDescription(testCase.description || '');
      setPreconditions(testCase.preconditions || '');
      setTestType(testCase.test_type || 'functional');
      setPriority(testCase.priority || 'medium');
      setStatus(testCase.status || 'ready');
    } else {
      setTitle('');
      setSuiteId(defaultSuiteId);
      setDescription('');
      setPreconditions('');
      setTestType('functional');
      setPriority('medium');
      setStatus('ready');
    }
    setError(null);
  }, [testCase, defaultSuiteId, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Test case title is required.');
      return;
    }

    try {
      setError(null);
      await onSubmit({
        title,
        suite_id: suiteId || undefined,
        description,
        preconditions,
        test_type: testType,
        priority,
        status,
      });
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save test case.');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={testCase ? `Edit Test Case (${testCase.key})` : 'Create New Test Case'}
    >
      {error && (
        <div className="mb-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-xs text-rose-400">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">Test Case Title *</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Verify mobile menu drawer toggle on Safari"
            className="w-full px-3.5 py-2 text-sm bg-slate-900 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Test Suite</label>
            <select
              value={suiteId}
              onChange={(e) => setSuiteId(e.target.value)}
              className="w-full px-3.5 py-2 text-sm bg-slate-900 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:border-indigo-500"
            >
              <option value="">No Suite (Unassigned)</option>
              {suites.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Test Type</label>
            <select
              value={testType}
              onChange={(e) => setTestType(e.target.value as TestType)}
              className="w-full px-3.5 py-2 text-sm bg-slate-900 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:border-indigo-500"
            >
              <option value="functional">Functional</option>
              <option value="smoke">Smoke</option>
              <option value="regression">Regression</option>
              <option value="integration">Integration</option>
              <option value="acceptance">Acceptance</option>
              <option value="usability">Usability</option>
              <option value="performance">Performance</option>
              <option value="security">Security</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Priority</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as TestCasePriority)}
              className="w-full px-3.5 py-2 text-sm bg-slate-900 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:border-indigo-500"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as TestCaseStatus)}
              className="w-full px-3.5 py-2 text-sm bg-slate-900 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:border-indigo-500"
            >
              <option value="draft">Draft</option>
              <option value="ready">Ready</option>
              <option value="deprecated">Deprecated</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">Preconditions</label>
          <textarea
            value={preconditions}
            onChange={(e) => setPreconditions(e.target.value)}
            placeholder="e.g. User is logged in as Project Manager on iOS 17 device..."
            rows={2}
            className="w-full px-3.5 py-2 text-sm bg-slate-900 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 resize-none"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Detailed testing objective and context..."
            rows={3}
            className="w-full px-3.5 py-2 text-sm bg-slate-900 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 resize-none"
          />
        </div>

        <div className="pt-4 flex justify-end gap-3 border-t border-slate-800">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isLoading}>
            {testCase ? 'Save Changes' : 'Create Test Case'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
