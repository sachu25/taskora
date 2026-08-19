import React, { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import type { IssueFilterParams, Label, ProjectMember } from '../../types';

interface Props {
  filters: IssueFilterParams;
  onFilterChange: (newFilters: IssueFilterParams) => void;
  onClearFilters: () => void;
  labels?: Label[];
  members?: ProjectMember[];
}

export const IssueFilterBar: React.FC<Props> = ({
  filters,
  onFilterChange,
  onClearFilters,
  labels = [],
  members = [],
}) => {
  const [searchInput, setSearchInput] = useState(filters.search || '');

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      if (searchInput !== (filters.search || '')) {
        onFilterChange({ ...filters, search: searchInput || undefined, page: 1 });
      }
    }, 400);
    return () => clearTimeout(handler);
  }, [searchInput]);

  const hasActiveFilters = Boolean(
    filters.search ||
    filters.type ||
    filters.status ||
    filters.priority ||
    filters.severity ||
    filters.assignee ||
    filters.label
  );

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 md:p-4 space-y-3 mb-6 backdrop-blur-xs">
      <div className="flex flex-col md:flex-row md:items-center gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search by title, key (WEB-101)..."
            className="w-full pl-9 pr-8 py-2 rounded-lg bg-slate-800/80 border border-slate-700/80 text-slate-100 text-xs placeholder:text-slate-500 focus:outline-hidden focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          />
          {searchInput && (
            <button
              onClick={() => {
                setSearchInput('');
                onFilterChange({ ...filters, search: undefined, page: 1 });
              }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Clear Filters Button */}
        {hasActiveFilters && (
          <button
            onClick={() => {
              setSearchInput('');
              onClearFilters();
            }}
            className="self-start md:self-auto flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 rounded-lg transition-colors"
          >
            <X className="w-3.5 h-3.5" />
            <span>Clear Filters</span>
          </button>
        )}
      </div>

      {/* Filter Dropdowns Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 pt-1 border-t border-slate-800/60">
        {/* Type */}
        <select
          value={filters.type || ''}
          onChange={(e) => onFilterChange({ ...filters, type: e.target.value || undefined, page: 1 })}
          className="px-2.5 py-1.5 rounded-lg bg-slate-800/60 border border-slate-700/60 text-slate-300 text-xs focus:outline-hidden focus:border-indigo-500"
        >
          <option value="">All Types</option>
          <option value="bug">Bug</option>
          <option value="task">Task</option>
          <option value="story">Story</option>
          <option value="feature">Feature</option>
          <option value="improvement">Improvement</option>
        </select>

        {/* Status */}
        <select
          value={filters.status || ''}
          onChange={(e) => onFilterChange({ ...filters, status: e.target.value || undefined, page: 1 })}
          className="px-2.5 py-1.5 rounded-lg bg-slate-800/60 border border-slate-700/60 text-slate-300 text-xs focus:outline-hidden focus:border-indigo-500"
        >
          <option value="">All Statuses</option>
          <option value="backlog">Backlog</option>
          <option value="todo">To Do</option>
          <option value="in_progress">In Progress</option>
          <option value="done">Done</option>
        </select>

        {/* Priority */}
        <select
          value={filters.priority || ''}
          onChange={(e) => onFilterChange({ ...filters, priority: e.target.value || undefined, page: 1 })}
          className="px-2.5 py-1.5 rounded-lg bg-slate-800/60 border border-slate-700/60 text-slate-300 text-xs focus:outline-hidden focus:border-indigo-500"
        >
          <option value="">All Priorities</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="urgent">Urgent</option>
        </select>

        {/* Severity */}
        <select
          value={filters.severity || ''}
          onChange={(e) => onFilterChange({ ...filters, severity: e.target.value || undefined, page: 1 })}
          className="px-2.5 py-1.5 rounded-lg bg-slate-800/60 border border-slate-700/60 text-slate-300 text-xs focus:outline-hidden focus:border-indigo-500"
        >
          <option value="">All Severities</option>
          <option value="minor">Minor</option>
          <option value="major">Major</option>
          <option value="critical">Critical</option>
          <option value="blocker">Blocker</option>
        </select>

        {/* Assignee */}
        <select
          value={filters.assignee || ''}
          onChange={(e) => onFilterChange({ ...filters, assignee: e.target.value || undefined, page: 1 })}
          className="px-2.5 py-1.5 rounded-lg bg-slate-800/60 border border-slate-700/60 text-slate-300 text-xs focus:outline-hidden focus:border-indigo-500"
        >
          <option value="">All Assignees</option>
          {members.map((m) => (
            <option key={m.user.id} value={m.user.id}>
              {m.user.name}
            </option>
          ))}
        </select>

        {/* Labels */}
        <select
          value={filters.label || ''}
          onChange={(e) => onFilterChange({ ...filters, label: e.target.value || undefined, page: 1 })}
          className="px-2.5 py-1.5 rounded-lg bg-slate-800/60 border border-slate-700/60 text-slate-300 text-xs focus:outline-hidden focus:border-indigo-500"
        >
          <option value="">All Labels</option>
          {labels.map((l) => (
            <option key={l.id} value={l.id}>
              {l.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};
