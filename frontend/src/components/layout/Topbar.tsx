import React from 'react';
import { Menu, LogOut, ShieldCheck, Sun, Moon } from 'lucide-react';
import { useAuth } from '../../app/providers/AuthProvider';
import { useTheme } from '../../app/providers/ThemeProvider';
import { Badge } from '../ui/Badge';
import { NotificationBell } from '../notifications/NotificationBell';

interface TopbarProps {
  onOpenMobileMenu: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({ onOpenMobileMenu }) => {
  const { user, organizations, currentOrg, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [showUserMenu, setShowUserMenu] = React.useState(false);

  const role = organizations.find((o) => o.id === currentOrg?.id)?.pivot_role || 'member';

  return (
    <header className="h-14 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 px-4 md:px-6 flex items-center justify-between sticky top-0 z-30 transition-colors duration-200">
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileMenu}
          className="md:hidden p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-medium hidden sm:inline">Organization:</span>
          <span className="text-sm font-semibold text-slate-100">{currentOrg?.name || 'Taskora'}</span>
          {role && (
            <Badge variant="primary" size="sm">
              {role.replace('_', ' ')}
            </Badge>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3 relative">
        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
          className="p-2 rounded-xl text-slate-400 hover:text-indigo-400 hover:bg-slate-800/80 border border-transparent hover:border-slate-700/60 transition-all duration-200"
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-indigo-400" />
          )}
        </button>

        <NotificationBell />

        <button
          onClick={() => setShowUserMenu(!showUserMenu)}
          className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
        >
          <div className="w-7 h-7 rounded-full bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 flex items-center justify-center text-xs font-bold">
            {user?.name?.charAt(0) || 'U'}
          </div>
          <span className="text-xs font-medium text-slate-200 hidden sm:inline">{user?.name}</span>
        </button>

        {showUserMenu && (
          <div className="absolute right-0 top-full mt-2 w-56 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-50 py-1 overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-800">
              <p className="text-xs font-semibold text-slate-100">{user?.name}</p>
              <p className="text-[11px] text-slate-400 truncate">{user?.email}</p>
            </div>
            <div className="px-4 py-2 flex items-center gap-2 text-xs text-slate-300">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Role: <strong className="text-indigo-400">{role}</strong></span>
            </div>
            <div className="px-4 py-2 border-t border-slate-800 flex items-center justify-between text-xs text-slate-300">
              <span>Theme</span>
              <button
                onClick={toggleTheme}
                className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-indigo-400 flex items-center gap-1.5 transition-colors"
              >
                {theme === 'dark' ? <Sun className="w-3 h-3 text-amber-400" /> : <Moon className="w-3 h-3 text-indigo-400" />}
                <span className="capitalize">{theme}</span>
              </button>
            </div>
            <div className="border-t border-slate-800 py-1">
              <button
                onClick={() => {
                  setShowUserMenu(false);
                  logout();
                }}
                className="w-full text-left px-4 py-2 text-xs text-rose-400 hover:bg-rose-500/10 flex items-center gap-2 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
