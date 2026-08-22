import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext.jsx';
import { Sun, Moon, Monitor, ChevronDown } from 'lucide-react';

export const ThemeToggle = () => {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const options = [
    { value: 'light', label: 'Light', icon: Sun },
    { value: 'dark', label: 'Dark', icon: Moon },
    { value: 'system', label: 'System', icon: Monitor },
  ];

  const currentOption = options.find((o) => o.value === theme) || options[2];
  const CurrentIcon = resolvedTheme === 'dark' ? Moon : Sun;

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-mono text-[var(--text-secondary)] hover:text-[var(--text-primary)] bg-[var(--bg-elevated)] hover:bg-[var(--border-subtle)] border border-[var(--border-subtle)] rounded-lg transition-colors"
        title="Switch Theme"
      >
        <CurrentIcon className="w-3.5 h-3.5 text-indigo-500" />
        <span className="capitalize hidden sm:inline">{currentOption.label}</span>
        <ChevronDown className="w-3 h-3 opacity-60" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1 w-32 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-strong)] shadow-xl z-50 py-1 font-mono text-xs animate-fade-in">
          {options.map((opt) => {
            const Icon = opt.icon;
            const isSelected = theme === opt.value;

            return (
              <button
                key={opt.value}
                onClick={() => {
                  setTheme(opt.value);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center gap-2 px-3 py-1.5 text-left transition-colors ${
                  isSelected
                    ? 'bg-indigo-600/10 text-indigo-500 font-semibold'
                    : 'text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{opt.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ThemeToggle;
