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

const LABEL_MAP: Record<string, string> = {
  sentCount: 'Emails Sent',
  regeneratedCount: 'Codes Regenerated',
  generatedCount: 'Codes Generated',
  targetUserIds: 'Targeted Users',
  targetUserId: 'User',
  electionId: 'Election',
  createdUserId: 'Created User',
  updatedUserId: 'Updated User',
  deletedUserId: 'Deleted User',
  changes: 'Fields Changed',
  role: 'Role',
  title: 'Title',
  id: 'ID',
};

function truncate(value: string): string {
  if (value.length > 10) return value.slice(0, 8) + '...';
  return value;
}

function formatDetailsPills(
  details: Record<string, unknown> | null,
): React.ReactNode {
  if (!details || Object.keys(details).length === 0) return '—';

  const entries = Object.entries(details);
  const pills: { label: string; value: string }[] = [];

  for (const [key, raw] of entries) {
    const label = LABEL_MAP[key] || key.charAt(0).toUpperCase() + key.slice(1);

    if (key === 'targetUserIds' && Array.isArray(raw)) {
      pills.push({ label, value: String(raw.length) });
    } else if (
      (key === 'id' || key === 'electionId' || key === 'targetUserId' ||
        key === 'createdUserId' || key === 'updatedUserId' ||
        key === 'deletedUserId') &&
      typeof raw === 'string'
    ) {
      pills.push({ label, value: truncate(raw) });
    } else if (typeof raw === 'object' || Array.isArray(raw)) {
      pills.push({ label, value: JSON.stringify(raw) });
    } else {
      pills.push({ label, value: String(raw) });
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      {pills.map((pill) => (
        <span
          key={pill.label}
          className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider"
        >
          {pill.label}: {pill.value}
        </span>
      ))}
    </div>
  );
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

  const extractElectionId = (
    details: Record<string, unknown> | null,
  ): string | null => {
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

  const getActionBadge = (action: string) => {
    if (action.includes('DELETE'))
      return 'bg-red-100 text-red-700 border-red-200';
    if (
      action.includes('CREATE') ||
      action.includes('GENERATE') ||
      action.includes('REGENERATE') ||
      action.includes('BULK')
    )
      return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    if (action.includes('UPDATE') || action.includes('IMPERSONATE'))
      return 'bg-amber-100 text-amber-700 border-amber-200';
    if (action.includes('VOTE'))
      return 'bg-blue-100 text-blue-700 border-blue-200';
    return 'bg-slate-100 text-slate-600 border-slate-200';
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500">Loading audit logs...</p>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-forwards">
      <div className="flex items-center justify-between mb-4 gap-4">
        <span className="text-slate-500 text-sm whitespace-nowrap">
          Total:{' '}
          <span className="font-bold text-slate-800">
            {filteredLogs.length}
          </span>{' '}
          entries
        </span>

        <div className="flex items-center gap-2">
          {availableElections.length > 0 && (
            <select
              value={electionFilter}
              onChange={(e) => setElectionFilter(e.target.value)}
              className="bg-white border border-slate-300 rounded-sm px-3 py-1.5 text-xs text-slate-700 outline-none focus:border-[#4c0519]"
            >
              <option value="all" className="text-slate-700">
                All Elections
              </option>
              {availableElections.map((eId) => (
                <option
                  key={eId}
                  value={eId}
                  className="text-slate-700"
                >
                  Election {eId.slice(0, 8)}...
                </option>
              ))}
            </select>
          )}

          <button
            onClick={fetchLogs}
            className="flex items-center gap-1 text-slate-400 hover:text-[#4c0519] transition-colors text-[10px] font-black uppercase tracking-widest"
          >
            <RefreshCw size={12} />
            Refresh
          </button>
        </div>
      </div>

      {filteredLogs.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-slate-200 rounded-sm">
          <Shield size={32} className="mx-auto mb-3 text-slate-300" />
          <p className="text-slate-500">No audit log entries found.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-100 border-b border-slate-200">
              <tr>
                <th className="text-left text-[10px] font-black uppercase tracking-widest text-slate-500 px-4 py-3">
                  Timestamp
                </th>
                <th className="text-left text-[10px] font-black uppercase tracking-widest text-slate-500 px-4 py-3">
                  Actor
                </th>
                <th className="text-left text-[10px] font-black uppercase tracking-widest text-slate-500 px-4 py-3">
                  Action
                </th>
                <th className="text-left text-[10px] font-black uppercase tracking-widest text-slate-500 px-4 py-3">
                  Details
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map((log) => (
                <tr
                  key={log.id}
                  className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
                >
                  <td className="px-4 py-3">
                    <span className="text-xs font-mono text-slate-500">
                      {new Date(log.createdAt).toLocaleString()}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-slate-800">
                        {log.user?.name || 'Unknown'}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {log.user?.email || ''}
                      </span>
                      <span className="text-[9px] font-black uppercase text-slate-400 mt-0.5">
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
                  <td className="px-4 py-3 max-w-[350px]">
                    {formatDetailsPills(log.details)}
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
