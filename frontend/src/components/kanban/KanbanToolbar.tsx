import React from 'react';
import { Search, X, RotateCcw, Filter } from 'lucide-react';
import type { IssueFilterParams } from '../../types';

interface KanbanToolbarProps {
  filters: IssueFilterParams;
  onFilterChange: (newFilters: IssueFilterParams) => void;
  onClearFilters: () => void;
  onRefresh: () => void;
  isLoading?: boolean;
}

export const KanbanToolbar: React.FC<KanbanToolbarProps> = ({
  filters,
  onFilterChange,
  onClearFilters,
  onRefresh,
  isLoading = false,
}) => {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 bg-slate-900 border border-slate-800 rounded-xl">
      <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={filters.search || ''}
            onChange={(e) => onFilterChange({ ...filters, search: e.target.value || undefined })}
            placeholder="Search board issues..."
            className="w-full pl-9 pr-8 py-1.5 text-xs bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors"
          />
          {filters.search && (
            <button
              onClick={() => onFilterChange({ ...filters, search: undefined })}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Priority Filter */}
        <div className="flex items-center gap-1.5">
          <Filter className="w-3.5 h-3.5 text-slate-500" />
          <select
            value={filters.priority || ''}
            onChange={(e) => onFilterChange({ ...filters, priority: e.target.value || undefined })}
            className="px-2.5 py-1.5 text-xs bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer"
          >
            <option value="">All Priorities</option>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>

        {/* Type Filter */}
        <select
          value={filters.type || ''}
          onChange={(e) => onFilterChange({ ...filters, type: e.target.value || undefined })}
          className="px-2.5 py-1.5 text-xs bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer"
        >
          <option value="">All Types</option>
          <option value="bug">Bug</option>
          <option value="feature">Feature</option>
          <option value="task">Task</option>
          <option value="story">Story</option>
          <option value="improvement">Improvement</option>
        </select>

        {(filters.search || filters.priority || filters.type) && (
          <button
            onClick={onClearFilters}
            className="px-2.5 py-1.5 text-xs font-semibold text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 rounded-lg transition-colors flex items-center gap-1"
          >
            <X className="w-3 h-3" />
            Clear
          </button>
        )}
      </div>

      <button
        onClick={onRefresh}
        disabled={isLoading}
        className="px-3 py-1.5 text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 rounded-lg transition-colors flex items-center gap-1.5 shrink-0"
        title="Refresh Board"
      >
        <RotateCcw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
        Refresh Board
      </button>
    </div>
  );
};
