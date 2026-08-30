import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import apiKeyApi from '../../api/apiKeyApi.js';
import { formatDate } from '../../utils/formatters.js';
import EmptyState from '../../components/common/EmptyState.jsx';
import Modal from '../../components/common/Modal.jsx';
import {
  Key,
  Plus,
  Copy,
  Check,
  Trash2,
  AlertTriangle,
  ShieldAlert,
  Info,
  Loader2,
} from 'lucide-react';

export const ApiKeysPage = () => {
  const { user } = useAuth();
  const [keys, setKeys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copiedKeyId, setCopiedKeyId] = useState(null);

  // Create Modal State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [newKeyType, setNewKeyType] = useState('Live');
  const [creating, setCreating] = useState(false);
  const [createdKeyData, setCreatedKeyData] = useState(null);
  const [createCopied, setCreateCopied] = useState(false);

  // Revoke Modal State
  const [revokeTarget, setRevokeTarget] = useState(null);
  const [revoking, setRevoking] = useState(false);

  const fetchKeys = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await apiKeyApi.getApiKeys();
      if (res && res.success) {
        setKeys(res.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch API keys:', err);
      setError(err?.response?.data?.message || err?.message || 'Failed to load API keys');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKeys();
  }, []);

  const handleCopy = (id, text) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
    }
    setCopiedKeyId(id);
    setTimeout(() => setCopiedKeyId(null), 2000);
  };

  const handleCopyCreatedKey = (text) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
    }
    setCreateCopied(true);
    setTimeout(() => setCreateCopied(false), 2000);
  };

  const handleCreateKey = async (e) => {
    e.preventDefault();
    if (!newKeyName.trim() || creating) return;

    try {
      setCreating(true);
      const res = await apiKeyApi.createApiKey(newKeyName.trim(), newKeyType);
      if (res && res.success) {
        const generatedFullKey = res.rawFullKey;
        const newRecord = {
          ...res.data,
          fullKey: generatedFullKey,
        };
        setCreatedKeyData(newRecord);
        fetchKeys();
      }
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Failed to create API Key');
    } finally {
      setCreating(false);
    }
  };

  const handleConfirmRevoke = async () => {
    if (!revokeTarget || revoking) return;
    try {
      setRevoking(true);
      const res = await apiKeyApi.revokeApiKey(revokeTarget._id || revokeTarget.id);
      if (res && res.success) {
        setKeys((prev) =>
          prev.map((k) =>
            (k._id || k.id) === (revokeTarget._id || revokeTarget.id)
              ? { ...k, status: 'Revoked' }
              : k
          )
        );
      }
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Failed to revoke API Key');
    } finally {
      setRevoking(false);
      setRevokeTarget(null);
    }
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-3 border-b border-[var(--border-subtle)]">
        <div>
          <h2 className="text-xl font-bold font-mono text-[var(--text-primary)] flex items-center gap-2.5">
            <Key className="w-5 h-5 text-emerald-500" />
            API Keys
          </h2>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5 font-sans">
            API keys authenticate programmatic requests to HookLens Ingestion, Management, and Replay APIs.
          </p>
        </div>

        <button
          onClick={() => {
            setNewKeyName('');
            setNewKeyType('Live');
            setCreatedKeyData(null);
            setIsCreateOpen(true);
          }}
          className="btn-primary inline-flex items-center gap-2 px-4 py-2 text-xs font-mono font-semibold rounded-xl border border-blue-500 shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Create API Key</span>
        </button>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-xs font-mono">
          {error}
        </div>
      )}

      {/* Security Tip Banner */}
      <div className="p-4 bg-blue-500/5 border border-blue-500/20 rounded-2xl flex items-start gap-3 text-xs font-sans text-[var(--text-secondary)]">
        <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-[var(--text-primary)] font-mono">Keep API Keys Secret:</span> Keep your API keys confidential and do not share them in public repositories. Pass API keys using the <code className="px-1.5 py-0.5 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded text-blue-500 font-mono text-[11px]">X-HookLens-Key</code> or Bearer header.
        </div>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="p-12 text-center text-xs font-mono text-[var(--text-muted)] flex flex-col items-center justify-center gap-2">
          <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
          <span>Loading tenant API keys...</span>
        </div>
      ) : keys.length === 0 ? (
        <EmptyState
          icon={Key}
          title="No API Keys Found"
          description="Create your first API key to authenticate automated scripts, workers, or CLI tools."
          actionLabel="Create API Key"
          onAction={() => {
            setNewKeyName('');
            setNewKeyType('Live');
            setCreatedKeyData(null);
            setIsCreateOpen(true);
          }}
        />
      ) : (
        <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs border-collapse">
              <thead>
                <tr className="border-b border-[var(--border-subtle)] bg-[var(--bg-app)]/50 text-[var(--text-muted)] text-[10px] uppercase font-semibold">
                  <th className="py-3 px-4">Name / Label</th>
                  <th className="py-3 px-4">Key Prefix</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Created</th>
                  <th className="py-3 px-4">Last Used</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-subtle)]">
                {keys.map((k) => {
                  const keyId = k._id || k.id;
                  return (
                    <tr key={keyId} className="hover:bg-[var(--bg-app)]/40 transition-colors">
                      <td className="py-3.5 px-4 font-semibold text-[var(--text-primary)]">
                        {k.name}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-[var(--text-secondary)]">
                        <span className="bg-[var(--bg-app)] px-2 py-1 rounded border border-[var(--border-subtle)]">
                          {k.prefix}••••••••••••
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2 py-0.5 text-[10px] rounded font-bold uppercase ${
                            k.type === 'Live'
                              ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                              : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                          }`}
                        >
                          {k.type}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-[var(--text-muted)]">
                        {formatDate(k.createdAt)}
                      </td>
                      <td className="py-3.5 px-4 text-[var(--text-muted)]">
                        {!k.lastUsedAt ? 'Never' : formatDate(k.lastUsedAt)}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-[10px] rounded-full font-semibold ${
                            k.status === 'Active'
                              ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                              : 'bg-red-500/10 text-red-500 border border-red-500/20'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              k.status === 'Active' ? 'bg-emerald-500' : 'bg-red-500'
                            }`}
                          />
                          {k.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleCopy(keyId, k.fullKey || `${k.prefix}••••••••••••`)}
                            title="Copy key prefix"
                            className="p-1.5 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] bg-[var(--bg-app)] hover:bg-[var(--bg-elevated)] border border-[var(--border-subtle)] transition-colors"
                          >
                            {copiedKeyId === keyId ? (
                              <Check className="w-3.5 h-3.5 text-emerald-500" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>

                          {k.status === 'Active' && (
                            <button
                              onClick={() => setRevokeTarget(k)}
                              title="Revoke API Key"
                              className="p-1.5 rounded-lg text-red-500/80 hover:text-red-500 bg-red-500/5 hover:bg-red-500/10 border border-red-500/20 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create API Key Modal */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => {
          setIsCreateOpen(false);
          setCreatedKeyData(null);
        }}
        title={createdKeyData ? 'API Key Generated' : 'Create New API Key'}
      >
        {createdKeyData ? (
          <div className="space-y-4 font-mono text-xs">
            <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-600 dark:text-amber-400 font-sans text-xs flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Save this secret key!</span> For security reasons, you will not be able to view this full key again after closing this window.
              </div>
            </div>

            <div>
              <label className="block text-[var(--text-muted)] text-[10px] uppercase font-semibold mb-1">
                Generated Key ({createdKeyData.name})
              </label>
              <div className="flex items-center gap-2 p-3 bg-[var(--bg-app)] border border-[var(--border-subtle)] rounded-xl">
                <span className="flex-1 text-emerald-500 font-semibold select-all break-all font-mono">
                  {createdKeyData.fullKey}
                </span>
                <button
                  onClick={() => handleCopyCreatedKey(createdKeyData.fullKey)}
                  className="px-3 py-1.5 text-xs bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors shrink-0 flex items-center gap-1 font-sans"
                >
                  {createCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{createCopied ? 'Copied' : 'Copy Secret'}</span>
                </button>
              </div>
            </div>

            <div className="pt-2 flex justify-end font-sans">
              <button
                onClick={() => {
                  setIsCreateOpen(false);
                  setCreatedKeyData(null);
                }}
                className="px-4 py-2 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-[var(--text-primary)] rounded-xl font-semibold hover:bg-[var(--bg-surface)] transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleCreateKey} className="space-y-4 font-mono text-xs">
            <div>
              <label className="block text-[var(--text-secondary)] font-semibold mb-1.5">
                Key Label / Purpose
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Stripe Production Worker"
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
                className="w-full p-2.5 bg-[var(--bg-app)] border border-[var(--border-subtle)] rounded-xl text-[var(--text-primary)] focus:outline-none focus:border-blue-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-[var(--text-secondary)] font-semibold mb-1.5">
                Key Environment
              </label>
              <div className="grid grid-cols-2 gap-3 font-sans">
                <button
                  type="button"
                  onClick={() => setNewKeyType('Live')}
                  className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all ${
                    newKeyType === 'Live'
                      ? 'border-emerald-500 bg-emerald-500/10 text-[var(--text-primary)]'
                      : 'border-[var(--border-subtle)] bg-[var(--bg-app)] text-[var(--text-secondary)]'
                  }`}
                >
                  <span className="font-mono font-bold text-xs">Live Key</span>
                  <span className="text-[11px] text-[var(--text-muted)] mt-1">Full production access</span>
                </button>

                <button
                  type="button"
                  onClick={() => setNewKeyType('Test')}
                  className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all ${
                    newKeyType === 'Test'
                      ? 'border-amber-500 bg-amber-500/10 text-[var(--text-primary)]'
                      : 'border-[var(--border-subtle)] bg-[var(--bg-app)] text-[var(--text-secondary)]'
                  }`}
                >
                  <span className="font-mono font-bold text-xs">Test Key</span>
                  <span className="text-[11px] text-[var(--text-muted)] mt-1">Sandbox telemetry only</span>
                </button>
              </div>
            </div>

            <div className="pt-3 flex justify-end gap-3 font-sans">
              <button
                type="button"
                onClick={() => setIsCreateOpen(false)}
                className="px-4 py-2 border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={creating}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl transition-colors disabled:opacity-50 flex items-center gap-1.5"
              >
                {creating && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>{creating ? 'Generating...' : 'Generate Key'}</span>
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* Revoke API Key Modal */}
      <Modal
        isOpen={!!revokeTarget}
        onClose={() => setRevokeTarget(null)}
        title="Revoke API Key"
      >
        <div className="space-y-4 font-mono text-xs">
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-600 dark:text-red-400 font-sans text-xs flex items-start gap-2.5">
            <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
            <div>
              Are you sure you want to revoke <strong className="font-mono">{revokeTarget?.name}</strong>? Automated services using this key will immediately be blocked from accessing HookLens APIs.
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-3 font-sans">
            <button
              type="button"
              onClick={() => setRevokeTarget(null)}
              className="px-4 py-2 border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded-xl font-mono transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirmRevoke}
              disabled={revoking}
              className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-semibold rounded-xl font-mono transition-colors disabled:opacity-50 flex items-center gap-1.5"
            >
              {revoking && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>{revoking ? 'Revoking...' : 'Revoke Key'}</span>
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ApiKeysPage;
