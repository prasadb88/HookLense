import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, Search, Settings, LogOut, ChevronDown, BookOpen } from 'lucide-react';
import ThemeToggle from './ThemeToggle.jsx';
import SearchModal from '../common/SearchModal.jsx';
import { useAuth } from '../../context/AuthContext.jsx';

export const Header = ({ onOpenSidebar, title }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Infer dynamic page title from route if title prop is omitted
  const getPageTitle = () => {
    if (title) return title;
    const path = location.pathname;
    if (path === '/dashboard') return 'Overview';
    if (path === '/dashboard/endpoints') return 'Endpoints';
    if (path === '/dashboard/endpoints/new') return 'Create Endpoint';
    if (path.startsWith('/dashboard/endpoints/')) return 'Endpoint Details';
    if (path === '/dashboard/events') return 'Events Log';
    if (path.startsWith('/dashboard/events/')) return 'Event Details';
    if (path === '/dashboard/replays') return 'Replays';
    if (path === '/dashboard/dlq') return 'Deliveries / DLQ';
    if (path === '/dashboard/security') return 'Security';
    if (path === '/dashboard/settings') return 'Settings';
    if (path === '/dashboard/onboarding') return 'Onboarding';
    return 'Dashboard';
  };

  const handleLogout = () => {
    setMenuOpen(false);
    logout();
    navigate('/login');
  };

  return (
    <>
      <header className="h-16 border-b border-[var(--border-subtle)] bg-[var(--bg-app)]/85 backdrop-blur-md sticky top-0 z-30 px-4 sm:px-6 flex items-center justify-between transition-colors">
        
        {/* Left Section: Mobile Menu Button & Page Title */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onOpenSidebar}
            aria-label="Open sidebar menu"
            className="lg:hidden text-[var(--text-secondary)] hover:text-[var(--text-primary)] p-1.5 rounded bg-[var(--bg-elevated)] border border-[var(--border-subtle)] transition-colors shrink-0"
          >
            <Menu className="w-5 h-5" />
          </button>

          <h1 className="text-sm sm:text-base font-semibold text-[var(--text-primary)] font-mono tracking-tight truncate">
            {getPageTitle()}
          </h1>
        </div>

        {/* Center: Global Search Trigger (Desktop) */}
        <div className="flex-1 max-w-md mx-4 hidden md:block">
          <button
            onClick={() => setSearchOpen(true)}
            aria-label="Open search"
            className="w-full flex items-center justify-between px-3.5 py-1.5 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-subtle)] hover:border-[var(--border-strong)] text-xs font-mono text-[var(--text-muted)] transition-colors"
          >
            <div className="flex items-center gap-2">
              <Search className="w-3.5 h-3.5" />
              <span>Search events, IDs, endpoints...</span>
            </div>
            <kbd className="px-1.5 py-0.5 text-[10px] bg-[var(--bg-app)] border border-[var(--border-subtle)] rounded text-[var(--text-muted)]">
              ⌘ K
            </kbd>
          </button>
        </div>

        {/* Right Section: Mobile Search, Gateway Status, Theme Toggle, User Profile Menu */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* Mobile Search Button */}
          <button
            onClick={() => setSearchOpen(true)}
            aria-label="Open search"
            className="md:hidden text-[var(--text-secondary)] hover:text-[var(--text-primary)] p-1.5 rounded bg-[var(--bg-surface)] border border-[var(--border-subtle)] transition-colors"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Gateway Status Indicator */}
          <div className="hidden lg:flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-mono select-none">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Gateway Active</span>
          </div>

          {/* Theme Toggle */}
          <ThemeToggle />

          {/* User Profile Avatar / Dropdown */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="User account menu"
              aria-expanded={menuOpen}
              className="flex items-center gap-2 p-1 rounded-full sm:rounded-xl hover:bg-[var(--bg-elevated)] border border-transparent hover:border-[var(--border-subtle)] transition-colors"
            >
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={user?.name || 'User avatar'}
                  className="w-8 h-8 rounded-full object-cover border border-[var(--border-subtle)] shrink-0"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-blue-500/10 border border-blue-500/30 flex items-center justify-center font-mono text-xs font-bold text-blue-600 dark:text-blue-400 shrink-0">
                  {user?.name?.[0]?.toUpperCase() || 'U'}
                </div>
              )}
              <ChevronDown className="w-3.5 h-3.5 text-[var(--text-muted)] hidden sm:block" />
            </button>

            {/* Profile Dropdown Card */}
            {menuOpen && (
              <div className="absolute right-0 mt-2 w-56 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-xl p-1.5 z-50 font-sans text-xs">
                {/* User Info Header */}
                <div className="px-3 py-2.5 border-b border-[var(--border-subtle)] mb-1">
                  <p className="font-semibold text-[var(--text-primary)] truncate font-mono">
                    {user?.name || 'Developer User'}
                  </p>
                  <p className="text-[11px] text-[var(--text-muted)] truncate font-mono mt-0.5">
                    {user?.email || 'dev@hooklens.io'}
                  </p>
                </div>

                {/* Dropdown Items */}
                <div className="space-y-0.5">
                  <Link
                    to="/dashboard/settings"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] font-mono transition-colors"
                  >
                    <Settings className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                    <span>Settings & API Keys</span>
                  </Link>

                  <Link
                    to="/developer"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] font-mono transition-colors"
                  >
                    <BookOpen className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                    <span>Developer Docs</span>
                  </Link>
                </div>

                <div className="my-1 border-t border-[var(--border-subtle)]" />

                {/* Logout Action */}
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-500/10 font-mono transition-colors text-left"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Log out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Global Search Modal */}
      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
};

export default Header;
