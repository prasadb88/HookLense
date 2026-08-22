import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, Plus, Search, Bell, ChevronDown } from 'lucide-react';
import ThemeToggle from './ThemeToggle.jsx';
import SearchModal from '../common/SearchModal.jsx';
import { useAuth } from '../../context/AuthContext.jsx';

export const Header = ({ onOpenSidebar, title }) => {
  const { user } = useAuth();
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <>
      <header className="h-16 border-b border-[var(--border-subtle)] bg-[var(--bg-app)]/85 backdrop-blur-md sticky top-0 z-30 px-4 sm:px-6 flex items-center justify-between transition-colors">
        
        {/* Left Section: Mobile Menu & Workspace Selector / Title */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenSidebar}
            className="lg:hidden text-[var(--text-secondary)] hover:text-[var(--text-primary)] p-1.5 rounded bg-[var(--bg-elevated)] border border-[var(--border-subtle)]"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Workspace Switcher */}
          <div className="hidden sm:flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-xs font-mono text-[var(--text-primary)] cursor-pointer hover:border-[var(--border-strong)] transition-colors">
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            <span className="font-semibold">My Workspace</span>
            <ChevronDown className="w-3.5 h-3.5 text-[var(--text-muted)]" />
          </div>

          <h1 className="text-sm sm:text-base font-semibold text-[var(--text-primary)] font-mono tracking-tight ml-1">
            {title || 'Overview'}
          </h1>
        </div>

        {/* Center: Global Search Trigger */}
        <div className="flex-1 max-w-md mx-4 hidden md:block">
          <button
            onClick={() => setSearchOpen(true)}
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

        {/* Right Section: Gateway Status, Search Mobile, Notifications, Theme, User Avatar, CTA */}
        <div className="flex items-center gap-2.5">
          {/* Mobile Search Button */}
          <button
            onClick={() => setSearchOpen(true)}
            className="md:hidden text-[var(--text-secondary)] hover:text-[var(--text-primary)] p-1.5 rounded bg-[var(--bg-surface)] border border-[var(--border-subtle)]"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Gateway Status Indicator */}
          <div className="hidden lg:flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Gateway Active</span>
          </div>

          {/* Notifications Button */}
          <button
            className="relative text-[var(--text-secondary)] hover:text-[var(--text-primary)] p-1.5 rounded bg-[var(--bg-surface)] border border-[var(--border-subtle)] transition-colors"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-blue-500" />
          </button>

          <ThemeToggle />

          {/* User Profile Avatar */}
          <div className="w-8 h-8 rounded-full bg-[var(--bg-elevated)] border border-[var(--border-subtle)] flex items-center justify-center font-mono text-xs font-semibold text-blue-500 shrink-0">
            {user?.name?.[0] || 'A'}
          </div>

          {/* Primary CTA */}
          <Link
            to="/dashboard/endpoints/new"
            className="btn-primary inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-medium rounded-lg border border-blue-500"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">New Endpoint</span>
          </Link>
        </div>
      </header>

      {/* Global Search Modal */}
      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
};

export default Header;
