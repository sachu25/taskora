import React, { useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bell, CheckCheck, ExternalLink } from 'lucide-react';
import type { Notification } from '../../types/notification';
import { NotificationItem } from './NotificationItem';

interface NotificationDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: Notification[];
  unreadCount: number;
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
  isLoading?: boolean;
}

export const NotificationDropdown: React.FC<NotificationDropdownProps> = ({
  isOpen,
  onClose,
  notifications,
  unreadCount,
  onMarkRead,
  onMarkAllRead,
  isLoading = false,
}) => {
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={dropdownRef}
      className="absolute right-0 top-12 w-80 sm:w-96 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150"
    >
      <div className="p-4 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-indigo-400" />
          <h3 className="text-xs font-semibold text-slate-100">Notifications</h3>
          {unreadCount > 0 && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
              {unreadCount} new
            </span>
          )}
        </div>

        {unreadCount > 0 && (
          <button
            onClick={onMarkAllRead}
            className="text-[11px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-medium"
          >
            <CheckCheck className="w-3.5 h-3.5" /> Mark all read
          </button>
        )}
      </div>

      <div className="max-h-80 overflow-y-auto p-3 space-y-2">
        {isLoading && (
          <div className="p-6 text-center text-xs text-slate-400 animate-pulse">Loading notifications...</div>
        )}

        {!isLoading && notifications.length === 0 && (
          <div className="p-8 text-center text-xs text-slate-400">
            <p className="font-semibold text-slate-300">No Notifications</p>
            <p className="text-slate-500 mt-1">You are all caught up!</p>
          </div>
        )}

        {!isLoading &&
          notifications.slice(0, 5).map((n) => (
            <NotificationItem
              key={n.id}
              notification={n}
              onMarkRead={onMarkRead}
              compact
            />
          ))}
      </div>

      <div className="p-3 border-t border-slate-800 bg-slate-950/60 text-center">
        <Link to="/notifications" onClick={onClose} className="text-xs font-medium text-indigo-400 hover:text-indigo-300 inline-flex items-center gap-1">
          View All Notifications <ExternalLink className="w-3 h-3" />
        </Link>
      </div>
    </div>
  );
};
