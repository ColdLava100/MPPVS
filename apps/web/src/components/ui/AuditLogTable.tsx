'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Shield, RefreshCw } from 'lucide-react';

interface AuditLogUser {
  name: string;
  email: string;
  role: string;
}

interface AuditLog {
  id: string;
  userId: string;
  action: string;
  details: Record<string, unknown> | null;
  createdAt: string;
  user: AuditLogUser;
}

interface AuditLogTableProps {
  electionId?: string | null;
}

export default function AuditLogTable({ electionId }: AuditLogTableProps) {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [electionFilter, setElectionFilter] = useState(electionId || 'all');

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/audit-logs`,
        { credentials: 'include' },
      );
      if (res.ok) {
        const data = await res.json();
        setLogs(data);
      }
    } catch (err) {
      console.error('Failed to fetch audit logs:', err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const extractElectionId = (details: Record<string, unknown> | null): string | null => {
    if (!details) return null;
    return (details.electionId as string) || (details.id as string) || null;
  };

  const availableElections = useMemo(() => {
    const ids = new Set<string>();
    logs.forEach((log) => {
      const eId = extractElectionId(log.details);
      if (eId) ids.add(eId);
    });
    return Array.from(ids).sort();
  }, [logs]);

  const filteredLogs = useMemo(() => {
    if (electionFilter === 'all') return logs;
    return logs.filter((log) => {
      const eId = extractElectionId(log.details);
      return eId === electionFilter;
    });
  }, [logs, electionFilter]);

  const formatAction = (action: string) => {
    return action
      .replace(/_/g, ' ')
      .toLowerCase()
      .replace(/\b\w/g, (c) => c.toUpperCase());
  };

  const formatDetails = (details: Record<string, unknown> | null) => {
    if (!details || Object.keys(details).length === 0) return '—';
    try {
      return Object.entries(details)
        .map(([key, value]) => `${key}: ${JSON.stringify(value)}`)
        .join(' • ');
    } catch {
      return String(details);
    }
  };

  const getActionBadge = (action: string) => {
    if (action.includes('DELETE'))
      return 'bg-red-900/30 text-red-400 border-red-900/30';
    if (
      action.includes('CREATE') ||
      action.includes('GENERATE') ||
      action.includes('REGENERATE') ||
      action.includes('BULK')
    )
      return 'bg-emerald-900/30 text-emerald-400 border-emerald-900/30';
    if (action.includes('UPDATE') || action.includes('IMPERSONATE'))
      return 'bg-amber-900/30 text-amber-400 border-amber-900/30';
    if (action.includes('VOTE'))
      return 'bg-blue-900/30 text-blue-400 border-blue-900/30';
    return 'bg-slate-800 text-slate-400 border-slate-700';
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-400">Loading audit logs...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4 gap-4">
        <span className="text-slate-400 text-sm whitespace-nowrap">
          Total:{' '}
          <span className="font-bold text-white">{filteredLogs.length}</span>{' '}
          entries
        </span>

        <div className="flex items-center gap-2">
          {availableElections.length > 0 && (
            <select
              value={electionFilter}
              onChange={(e) => setElectionFilter(e.target.value)}
              className="bg-white/10 border border-white/10 rounded-sm px-3 py-1.5 text-xs text-white outline-none focus:border-white/30"
            >
              <option value="all" className="bg-slate-800 text-white">
                All Elections
              </option>
              {availableElections.map((eId) => (
                <option key={eId} value={eId} className="bg-slate-800 text-white">
                  Election {eId.slice(0, 8)}...
                </option>
              ))}
            </select>
          )}

          <button
            onClick={fetchLogs}
            className="flex items-center gap-1 text-slate-400 hover:text-white transition-colors text-[10px] font-black uppercase tracking-widest"
          >
            <RefreshCw size={12} />
            Refresh
          </button>
        </div>
      </div>

      {filteredLogs.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-white/10 rounded-sm">
          <Shield size={32} className="mx-auto mb-3 text-slate-600" />
          <p className="text-slate-500">No audit log entries found.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/5 border-b border-white/10">
              <tr>
                <th className="text-left text-[10px] font-black text-slate-400 uppercase tracking-widest px-4 py-3">
                  Timestamp
                </th>
                <th className="text-left text-[10px] font-black text-slate-400 uppercase tracking-widest px-4 py-3">
                  Actor
                </th>
                <th className="text-left text-[10px] font-black text-slate-400 uppercase tracking-widest px-4 py-3">
                  Action
                </th>
                <th className="text-left text-[10px] font-black text-slate-400 uppercase tracking-widest px-4 py-3">
                  Details
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map((log) => (
                <tr
                  key={log.id}
                  className="border-b border-white/5 hover:bg-white/5 transition-colors"
                >
                  <td className="px-4 py-3">
                    <span className="text-xs font-mono text-slate-300">
                      {new Date(log.createdAt).toLocaleString()}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-white">
                        {log.user?.name || 'Unknown'}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {log.user?.email || ''}
                      </span>
                      <span className="text-[9px] font-black uppercase text-slate-600 mt-0.5">
                        {log.user?.role || 'N/A'}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-[9px] font-black uppercase px-2 py-1 rounded-full border ${getActionBadge(log.action)}`}
                    >
                      {formatAction(log.action)}
                    </span>
                  </td>
                  <td className="px-4 py-3 max-w-[300px]">
                    <span className="text-xs text-slate-400 break-all leading-relaxed">
                      {formatDetails(log.details)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
