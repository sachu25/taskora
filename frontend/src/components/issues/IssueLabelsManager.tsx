import React, { useState } from 'react';
import type { Label } from '../../types';
import { Tag, Plus, X } from 'lucide-react';

interface Props {
  attachedLabels: Label[];
  availableOrgLabels: Label[];
  onAttach: (labelId: string) => Promise<void>;
  onDetach: (labelId: string) => Promise<void>;
  canManage?: boolean;
}

export const IssueLabelsManager: React.FC<Props> = ({
  attachedLabels = [],
  availableOrgLabels = [],
  onAttach,
  onDetach,
  canManage = true,
}) => {
  const [showDropdown, setShowDropdown] = useState(false);

  const attachedIds = new Set(attachedLabels.map((l) => l.id));
  const unattached = availableOrgLabels.filter((l) => !attachedIds.has(l.id));

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
          <Tag className="w-3.5 h-3.5 text-indigo-400" />
          Labels
        </span>
        {canManage && unattached.length > 0 && (
          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="p-1 rounded text-slate-400 hover:text-indigo-300 hover:bg-slate-800 transition-colors"
              title="Add Label"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>

            {showDropdown && (
              <div className="absolute right-0 top-full mt-1 w-44 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-50 py-1 overflow-hidden">
                <div className="px-3 py-1 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  Attach Label
                </div>
                {unattached.map((label) => (
                  <button
                    key={label.id}
                    onClick={async () => {
                      await onAttach(label.id);
                      setShowDropdown(false);
                    }}
                    className="w-full text-left px-3 py-1.5 text-xs text-slate-200 hover:bg-slate-700 flex items-center gap-2"
                  >
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: label.color }} />
                    <span className="truncate">{label.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-1.5 min-h-[28px] items-center">
        {attachedLabels.length === 0 ? (
          <span className="text-xs text-slate-500 italic">No labels attached</span>
        ) : (
          attachedLabels.map((label) => (
            <span
              key={label.id}
              className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md border text-xs font-medium bg-slate-900 text-slate-200 border-slate-700"
              style={{ borderColor: `${label.color}40` }}
            >
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: label.color }} />
              <span>{label.name}</span>
              {canManage && (
                <button
                  onClick={() => onDetach(label.id)}
                  className="text-slate-400 hover:text-rose-400 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </span>
          ))
        )}
      </div>
    </div>
  );
};
