import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  FolderKanban,
  Users,
  Building2,
  ChevronDown,
  Layers,
  Bell,
  Activity as ActivityIcon,
  SlidersHorizontal,
  Sun,
  Moon,
} from 'lucide-react';
import { useAuth } from '../../app/providers/AuthProvider';
import { useTheme } from '../../app/providers/ThemeProvider';

interface SidebarProps {
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onCloseMobile }) => {
  const { currentOrg, organizations, setCurrentOrg, user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [showOrgDropdown, setShowOrgDropdown] = React.useState(false);

  const navItems = [
    { label: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
    { label: 'Projects', to: '/projects', icon: FolderKanban },
    { label: 'Issues & Bugs', to: '/issues', icon: Layers },
    { label: 'Notifications', to: '/notifications', icon: Bell },
    { label: 'Activity Log', to: '/activity', icon: ActivityIcon },
    { label: 'Teams', to: '/teams', icon: Users },
    { label: 'Members', to: '/members', icon: Building2 },
    { label: 'Preferences', to: '/settings/notification-preferences', icon: SlidersHorizontal },
  ];

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col h-full shrink-0 select-none transition-colors duration-200">
      {/* Brand & Organization Selector */}
      <div className="p-4 border-b border-slate-800 relative">
        <div className="flex items-center mb-3 py-1">
          <img
            src={theme === 'light' ? '/taskora-logo-light.png' : '/taskora-logo-dark.png'}
            alt="Taskora Logo"
            className="h-8 w-auto object-contain"
          />
        </div>

        {/* Organization Switcher */}
        <button
          onClick={() => setShowOrgDropdown(!showOrgDropdown)}
          className="w-full flex items-center justify-between p-2 rounded-lg bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 text-left transition-colors"
        >
          <div className="flex items-center gap-2 truncate">
            <Building2 className="w-4 h-4 text-indigo-400 shrink-0" />
            <span className="text-xs font-semibold text-slate-200 truncate">
              {currentOrg?.name || 'Select Organization'}
            </span>
          </div>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-1" />
        </button>

        {showOrgDropdown && (
          <div className="absolute top-full left-4 right-4 mt-1 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-50 overflow-hidden py-1">
            <div className="px-3 py-1 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
              Your Organizations
            </div>
            {organizations.map((org) => (
              <button
                key={org.id}
                onClick={() => {
                  setCurrentOrg(org);
                  setShowOrgDropdown(false);
                }}
                className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-700/60 ${
                  currentOrg?.id === org.id ? 'text-indigo-400 font-semibold bg-indigo-500/10' : 'text-slate-300'
                }`}
              >
                <span className="truncate">{org.name}</span>
                {currentOrg?.id === org.id && <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        <div className="px-3 py-1.5 text-[10px] font-bold tracking-wider uppercase text-slate-500">
          Core Management
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onCloseMobile}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-indigo-600/15 text-indigo-400 border border-indigo-500/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`
              }
            >
              <Icon className="w-4 h-4" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Theme Switcher Footer Controls */}
      <div className="px-3 py-2 border-t border-slate-800/80">
        <button
          onClick={toggleTheme}
          className="w-full flex items-center justify-between px-3 py-1.5 rounded-lg bg-slate-800/50 hover:bg-slate-800 border border-slate-700/40 text-xs font-medium text-slate-300 transition-colors"
        >
          <div className="flex items-center gap-2">
            {theme === 'dark' ? (
              <Moon className="w-3.5 h-3.5 text-indigo-400" />
            ) : (
              <Sun className="w-3.5 h-3.5 text-amber-400" />
            )}
            <span className="capitalize">{theme} Theme</span>
          </div>
          <span className="text-[10px] font-semibold uppercase tracking-wider text-indigo-400 bg-indigo-500/10 px-1.5 py-0.5 rounded">
            Toggle
          </span>
        </button>
      </div>

      {/* Footer / User Profile */}
      <div className="p-3 border-t border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2.5 truncate">
          <div className="w-7 h-7 rounded-full bg-slate-700 flex items-center justify-center font-bold text-xs text-indigo-300">
            {user?.name?.charAt(0) || 'U'}
          </div>
          <div className="truncate">
            <div className="text-xs font-medium text-slate-200 truncate">{user?.name}</div>
            <div className="text-[10px] text-slate-400 truncate">{user?.email}</div>
          </div>
        </div>
      </div>
    </aside>
  );
};
