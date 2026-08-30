import React, { useState } from 'react';
import { Copy, Check, ChevronDown, ChevronRight, Eye, Code } from 'lucide-react';

export const JsonViewer = ({ data, title = 'JSON Payload' }) => {
  const [copied, setCopied] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [viewMode, setViewMode] = useState('pretty'); // 'pretty' | 'raw'

  const jsonString = data !== undefined && data !== null
    ? (typeof data === 'string' ? data : JSON.stringify(data, null, 2))
    : '{}';

  const handleCopy = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(jsonString);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="border border-[var(--border-subtle)] rounded-xl overflow-hidden bg-[var(--bg-app)] font-mono text-xs shadow-sm">
      {/* Viewer Header */}
      <div className="px-4 py-2.5 bg-[var(--bg-surface)] border-b border-[var(--border-subtle)] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors p-0.5"
            title={collapsed ? 'Expand' : 'Collapse'}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          <span className="font-semibold text-[var(--text-primary)]">{title}</span>
          <span className="text-[10px] text-[var(--text-muted)]">({jsonString.length} bytes)</span>
        </div>

        <div className="flex items-center gap-2">
          {/* Pretty vs Raw Mode Toggle */}
          <div className="flex bg-[var(--bg-app)] border border-[var(--border-subtle)] rounded-lg p-0.5 text-[10px]">
            <button
              onClick={() => setViewMode('pretty')}
              className={`px-2 py-0.5 rounded font-mono ${
                viewMode === 'pretty'
                  ? 'bg-blue-500/10 text-blue-500 font-bold'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
              }`}
            >
              Pretty
            </button>
            <button
              onClick={() => setViewMode('raw')}
              className={`px-2 py-0.5 rounded font-mono ${
                viewMode === 'raw'
                  ? 'bg-blue-500/10 text-blue-500 font-bold'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
              }`}
            >
              Raw
            </button>
          </div>

          {/* Copy Button */}
          <button
            onClick={handleCopy}
            className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-mono text-[var(--text-secondary)] hover:text-[var(--text-primary)] bg-[var(--bg-surface)] hover:bg-[var(--bg-elevated)] rounded-lg border border-[var(--border-subtle)] transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied ✓' : 'Copy'}</span>
          </button>
        </div>
      </div>

      {/* JSON Payload View Container */}
      {!collapsed && (
        <div className="p-4 overflow-x-auto max-h-[400px] leading-relaxed select-text">
          {viewMode === 'raw' ? (
            <pre className="text-[var(--text-secondary)] whitespace-pre-wrap break-all font-mono">
              {JSON.stringify(data)}
            </pre>
          ) : (
            <pre className="text-blue-600 dark:text-blue-400 whitespace-pre font-mono text-xs">
              {jsonString}
            </pre>
          )}
        </div>
      )}
    </div>
  );
};

export default JsonViewer;
