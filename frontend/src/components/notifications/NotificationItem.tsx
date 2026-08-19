import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  UserCheck,
  MessageSquare,
  RefreshCw,
  Rocket,
  Play,
  CheckCircle2,
  XCircle,
  Bell,
  Trash2,
} from 'lucide-react';
import type { Notification } from '../../types/notification';

interface NotificationItemProps {
  notification: Notification;
  onMarkRead?: (id: string) => void;
  onMarkUnread?: (id: string) => void;
  onDelete?: (id: string) => void;
  compact?: boolean;
}

export const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onMarkRead,
  onMarkUnread,
  onDelete,
  compact = false,
}) => {
  const navigate = useNavigate();

  const getIcon = (type: string) => {
    if (type.includes('assigned')) return <UserCheck className="w-4 h-4 text-indigo-400" />;
    if (type.includes('commented')) return <MessageSquare className="w-4 h-4 text-sky-400" />;
    if (type.includes('status')) return <RefreshCw className="w-4 h-4 text-amber-400" />;
    if (type.startsWith('sprint')) return <Play className="w-4 h-4 text-purple-400" />;
    if (type.startsWith('release')) return <Rocket className="w-4 h-4 text-emerald-400" />;
    if (type.includes('failed')) return <XCircle className="w-4 h-4 text-rose-400" />;
    if (type.includes('completed')) return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
    return <Bell className="w-4 h-4 text-slate-400" />;
  };

  const handleClick = () => {
    if (!notification.is_read && onMarkRead) {
      onMarkRead(notification.id);
    }
    if (notification.action_url) {
      navigate(notification.action_url);
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
        notification.is_read
          ? 'bg-slate-900/60 border-slate-800/80 text-slate-300 hover:bg-slate-800/40'
          : 'bg-slate-900 border-indigo-500/30 text-slate-100 shadow-md shadow-indigo-500/5 hover:border-indigo-500/50'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          <div className="p-2 rounded-lg bg-slate-800/80 shrink-0 mt-0.5">
            {getIcon(notification.type)}
          </div>
          <div className="space-y-1 min-w-0">
            <div className="flex items-center gap-2">
              <h4 className="text-xs font-semibold text-slate-100 truncate">{notification.title}</h4>
              {!notification.is_read && (
                <span className="w-2 h-2 rounded-full bg-indigo-500 shrink-0" title="Unread" />
              )}
            </div>
            <p className={`text-xs text-slate-400 leading-relaxed ${compact ? 'line-clamp-2' : ''}`}>
              {notification.message}
            </p>
            <span className="text-[10px] text-slate-500 block font-mono">
              {new Date(notification.created_at).toLocaleString()}
            </span>
          </div>
        </div>

        {!compact && (
          <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
            {notification.is_read ? (
              onMarkUnread && (
                <button
                  onClick={() => onMarkUnread(notification.id)}
                  className="p-1 rounded text-slate-500 hover:text-indigo-400 hover:bg-slate-800 text-[10px]"
                  title="Mark as unread"
                >
                  Unread
                </button>
              )
            ) : (
              onMarkRead && (
                <button
                  onClick={() => onMarkRead(notification.id)}
                  className="p-1 rounded text-slate-400 hover:text-emerald-400 hover:bg-slate-800 text-[10px]"
                  title="Mark as read"
                >
                  Read
                </button>
              )
            )}
            {onDelete && (
              <button
                onClick={() => onDelete(notification.id)}
                className="p-1 rounded text-slate-500 hover:text-rose-400 hover:bg-rose-500/10"
                title="Delete notification"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
