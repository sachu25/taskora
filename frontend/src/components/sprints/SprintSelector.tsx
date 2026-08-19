import React from 'react';
import { Flag, ChevronDown } from 'lucide-react';
import type { Sprint } from '../../types';

interface SprintSelectorProps {
  sprints: Sprint[];
  selectedSprintId: string | null;
  onSelectSprint: (sprint: Sprint) => void;
  className?: string;
}

export const SprintSelector: React.FC<SprintSelectorProps> = ({
  sprints,
  selectedSprintId,
  onSelectSprint,
  className = '',
}) => {
  return (
    <div className={`relative inline-block ${className}`}>
      <select
        value={selectedSprintId || ''}
        onChange={(e) => {
          const found = sprints.find((s) => s.id === e.target.value);
          if (found) onSelectSprint(found);
        }}
        className="w-full pl-9 pr-8 py-2 text-xs bg-slate-900 border border-slate-800 rounded-lg text-slate-200 font-medium appearance-none focus:outline-none focus:border-indigo-500 cursor-pointer transition-colors"
      >
        <option value="" disabled>
          Select a Sprint...
        </option>
        {sprints.map((sprint) => (
          <option key={sprint.id} value={sprint.id}>
            {sprint.name} ({sprint.status.toUpperCase()})
          </option>
        ))}
      </select>
      <Flag className="w-4 h-4 text-indigo-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
      <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
    </div>
  );
};
