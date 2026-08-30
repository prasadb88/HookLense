import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { Logo } from '../common/Logo.jsx';
import {
  LayoutDashboard,
  Webhook,
  Activity,
  RotateCcw,
  AlertTriangle,
  Shield,
  Settings,
  BookOpen,
  LogOut,
  X,
  ChevronLeft,
  ChevronRight,
  Key,
  Layers,
  Users,
  Bell,
  FileText,
} from 'lucide-react';

export const Sidebar = ({ isOpen, onClose, isCollapsed: propIsCollapsed, setIsCollapsed: propSetIsCollapsed }) => {
  const { user, logout } = useAuth();
  const [localCollapsed, setLocalCollapsed] = useState(false);

  const isCollapsed = propIsCollapsed !== undefined ? propIsCollapsed : localCollapsed;
  const setIsCollapsed = propSetIsCollapsed || setLocalCollapsed;

  const navItems = [
    { name: 'Overview', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Events', path: '/dashboard/events', icon: Activity },
    { name: 'Endpoints', path: '/dashboard/endpoints', icon: Webhook },
    { name: 'Deliveries / DLQ', path: '/dashboard/dlq', icon: AlertTriangle },
    { name: 'Replays', path: '/dashboard/replays', icon: RotateCcw },
    { name: 'Failed Events', path: '/dashboard/events?status=FAILED', icon: AlertTriangle },
    { name: 'Security', path: '/dashboard/security', icon: Shield },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
        />
      )}

      <aside
        className={`fixed top-0 left-0 bottom-0 z-50 bg-[var(--bg-surface)] border-r border-[var(--border-subtle)] flex flex-col transition-all duration-200 lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } ${isCollapsed ? 'lg:w-16' : 'lg:w-64'} w-64`}
      >
        {/* Header / Official Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-[var(--border-subtle)]">
          <NavLink to="/dashboard" className="flex items-center gap-2.5 min-w-0">
            <Logo className="w-[145px] sm:w-[170px] h-auto object-contain shrink-0 transition-opacity" />
          </NavLink>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="hidden lg:flex text-[var(--text-muted)] hover:text-[var(--text-primary)] p-1 rounded hover:bg-[var(--bg-elevated)] transition-colors"
              title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            >
              {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
            <button onClick={onClose} className="lg:hidden text-[var(--text-muted)] hover:text-[var(--text-primary)] p-1">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {!isCollapsed && (
            <div className="px-3 pb-2 text-[10px] font-mono font-semibold uppercase tracking-wider text-[var(--text-muted)]">
              Observability
            </div>
          )}

          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.name}
                to={item.path}
                end={item.path === '/dashboard'}
                onClick={onClose}
                title={isCollapsed ? item.name : undefined}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-mono font-medium transition-colors group relative ${
                    isActive
                      ? 'bg-blue-500/10 text-blue-500 border border-blue-500/20 font-semibold'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                {!isCollapsed && <span>{item.name}</span>}
              </NavLink>
            );
          })}

          <div className="pt-4 pb-2 px-1">
            <div className="h-px bg-[var(--border-subtle)] mb-4" />
            {!isCollapsed && (
              <div className="px-2 text-[10px] font-mono font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-2">
                Management
              </div>
            )}

            <NavLink
              to="/dashboard/settings"
              onClick={onClose}
              title={isCollapsed ? 'Settings' : undefined}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-mono font-medium transition-colors ${
                  isActive
                    ? 'bg-blue-500/10 text-blue-500 border border-blue-500/20 font-semibold'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]'
                }`
              }
            >
              <Settings className="w-4 h-4 shrink-0" />
              {!isCollapsed && <span>Settings</span>}
            </NavLink>

            <NavLink
              to="/dashboard/api-keys"
              onClick={onClose}
              title={isCollapsed ? 'API Keys' : undefined}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-mono font-medium transition-colors ${
                  isActive
                    ? 'bg-blue-500/10 text-blue-500 border border-blue-500/20 font-semibold'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]'
                }`
              }
            >
              <Key className="w-4 h-4 shrink-0" />
              {!isCollapsed && <span>API Keys</span>}
            </NavLink>

            <NavLink
              to="/developer"
              onClick={onClose}
              title={isCollapsed ? 'Documentation' : undefined}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-mono font-medium transition-colors ${
                  isActive
                    ? 'bg-blue-500/10 text-blue-500 border border-blue-500/20 font-semibold'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]'
                }`
              }
            >
              <BookOpen className="w-4 h-4 shrink-0" />
              {!isCollapsed && <span>Documentation</span>}
            </NavLink>
          </div>

          {/* Coming Soon Section */}
          <div className="pt-2 pb-2 px-1">
            <div className="h-px bg-[var(--border-subtle)] mb-4" />
            {!isCollapsed && (
              <div className="px-2 flex items-center justify-between text-[10px] font-mono font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-2">
                <span>Coming Soon</span>
                <span className="px-1.5 py-0.2 text-[9px] bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded font-mono font-semibold">SOON</span>
              </div>
            )}

            <div
              title={isCollapsed ? 'Team & Roles (Coming Soon)' : 'Multi-user team management & RBAC'}
              className="flex items-center justify-between px-3 py-2 rounded-lg text-xs font-mono font-medium text-[var(--text-muted)] opacity-60 cursor-not-allowed select-none"
            >
              <div className="flex items-center gap-3 min-w-0">
                <Users className="w-4 h-4 shrink-0" />
                {!isCollapsed && <span className="truncate">Team & Roles</span>}
              </div>
              {!isCollapsed && (
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-[var(--text-muted)] shrink-0">Soon</span>
              )}
            </div>

            <div
              title={isCollapsed ? 'Alerts & Webhooks (Coming Soon)' : 'Slack, Discord & Email notifications'}
              className="flex items-center justify-between px-3 py-2 rounded-lg text-xs font-mono font-medium text-[var(--text-muted)] opacity-60 cursor-not-allowed select-none"
            >
              <div className="flex items-center gap-3 min-w-0">
                <Bell className="w-4 h-4 shrink-0" />
                {!isCollapsed && <span className="truncate">Alerts & Slack</span>}
              </div>
              {!isCollapsed && (
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-[var(--text-muted)] shrink-0">Soon</span>
              )}
            </div>

            <div
              title={isCollapsed ? 'Audit Logs (Coming Soon)' : 'Compliance activity trail'}
              className="flex items-center justify-between px-3 py-2 rounded-lg text-xs font-mono font-medium text-[var(--text-muted)] opacity-60 cursor-not-allowed select-none"
            >
              <div className="flex items-center gap-3 min-w-0">
                <FileText className="w-4 h-4 shrink-0" />
                {!isCollapsed && <span className="truncate">Audit Trail</span>}
              </div>
              {!isCollapsed && (
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-[var(--text-muted)] shrink-0">Soon</span>
              )}
            </div>
          </div>
        </div>

        {/* Workspace & User Profile Footer */}
        <div className="p-3 border-t border-[var(--border-subtle)] bg-[var(--bg-app)]/50 space-y-2">
          {!isCollapsed && (
            <div className="flex items-center justify-between p-2 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-subtle)] font-mono text-xs">
              <div className="flex items-center gap-2 truncate">
                <Layers className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                <span className="truncate font-semibold text-[var(--text-primary)]">My Workspace</span>
              </div>
              <span className="text-[10px] text-emerald-500 font-semibold">Pro</span>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-[var(--bg-elevated)] border border-[var(--border-subtle)] flex items-center justify-center font-mono text-xs font-semibold text-blue-500 shrink-0">
                {user?.name?.[0]?.toUpperCase() || 'U'}
              </div>
              {!isCollapsed && (
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-[var(--text-primary)] truncate">{user?.name || 'Authenticated User'}</div>
                  <div className="text-[11px] text-[var(--text-muted)] truncate">{user?.email || ''}</div>
                </div>
              )}
            </div>
            {!isCollapsed && (
              <button
                onClick={logout}
                title="Log Out"
                className="text-[var(--text-muted)] hover:text-red-500 p-1.5 rounded hover:bg-[var(--bg-elevated)] transition-colors shrink-0"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
