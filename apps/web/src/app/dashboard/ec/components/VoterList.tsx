'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Search,
  ChevronLeft,
  ChevronRight,
  User,
  Shield,
  Mail,
  Eye,
  EyeOff,
  RotateCw,
  CheckCircle,
  Circle,
} from 'lucide-react';

interface VoterListProps {
  electionId: string;
  courses: string[];
}

interface Voter {
  id: string;
  userId: string;
  name: string;
  studentId: string;
  courseCode: string;
  courseName: string;
  securityCode: string | null;
  hasVoted: boolean;
  votedAt: string | null;
}

interface PaginationInfo {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

type SubTab = 'status' | 'security';

export default function VoterList({ electionId, courses }: VoterListProps) {
  const [voters, setVoters] = useState<Voter[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({
    total: 0,
    page: 1,
    limit: 50,
    totalPages: 0,
  });

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<
    'all' | 'hasVoted' | 'notVoted'
  >('all');
  const [courseFilter, setCourseFilter] = useState('all');
  const [loading, setLoading] = useState(false);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [activeSubTab, setActiveSubTab] = useState<SubTab>('status');
  const [visibleCodes, setVisibleCodes] = useState<Set<string>>(new Set());

  const fetchVoters = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: '50',
        status: statusFilter,
      });

      if (search) params.append('search', search);
      if (courseFilter !== 'all') params.append('course', courseFilter);

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/elections/${electionId}/voters?${params}`,
        { credentials: 'include' },
      );

      if (res.ok) {
        const data = await res.json();
        setVoters(data.data);
        setPagination(data.pagination);
      }
    } catch (err) {
      console.error('Failed to fetch voters:', err);
    }
    setLoading(false);
  }, [electionId, pagination.page, search, statusFilter, courseFilter]);

  useEffect(() => {
    fetchVoters();
  }, [fetchVoters]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setPagination((prev) => ({ ...prev, page: 1 }));
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPagination((prev) => ({ ...prev, page: newPage }));
    }
  };

  const formatVotedAt = (date: string | null) => {
    if (!date) return '';
    return new Date(date).toLocaleString();
  };

  const handleSelectAll = () => {
    const allIds = voters.map((v) => v.userId);
    const allSelected = allIds.every((id) => selectedUserIds.includes(id));
    if (allSelected) {
      setSelectedUserIds([]);
    } else {
      setSelectedUserIds(allIds);
    }
  };

  const handleSelectOne = (userId: string) => {
    setSelectedUserIds((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId],
    );
  };

  const toggleCodeVisibility = (userId: string) => {
    setVisibleCodes((prev) => {
      const next = new Set(prev);
      if (next.has(userId)) {
        next.delete(userId);
      } else {
        next.add(userId);
      }
      return next;
    });
  };

  const generateSingleCode = async (userId: string) => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/users/${userId}/security-code`,
        { method: 'POST', credentials: 'include' },
      );
      if (res.ok) {
        fetchVoters();
      }
    } catch (err) {
      console.error('Failed to generate security code:', err);
    }
  };

  const generateBulkCodes = async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/elections/${electionId}/generate-security-codes`,
        { method: 'POST', credentials: 'include' },
      );
      if (res.ok) {
        const data = await res.json();
        alert(`Successfully generated ${data.count} security code(s).`);
        fetchVoters();
      }
    } catch (err) {
      console.error('Failed to generate bulk security codes:', err);
    }
  };

  const regenerateAllCodes = async () => {
    if (
      !confirm(
        'DANGER: Are you sure you want to regenerate ALL security codes for this election? Old codes will be destroyed.',
      )
    )
      return;
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/elections/${electionId}/regenerate-all-security-codes`,
        { method: 'POST', credentials: 'include' },
      );
      if (res.ok) {
        const data = await res.json();
        alert(`Successfully regenerated ${data.count} security code(s).`);
        fetchVoters();
      }
    } catch (err) {
      console.error('Failed to regenerate all security codes:', err);
    }
  };

  const regenerateSelectedCodes = async () => {
    if (
      !confirm(
        'Regenerate security codes for the ' +
          selectedUserIds.length +
          ' selected voters? Old codes will be destroyed.',
      )
    )
      return;
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/elections/${electionId}/regenerate-selected-codes`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ userIds: selectedUserIds }),
        },
      );
      if (res.ok) {
        const data = await res.json();
        alert(`Successfully regenerated ${data.count} security code(s).`);
        setSelectedUserIds([]);
        fetchVoters();
      }
    } catch (err) {
      console.error('Failed to regenerate selected codes:', err);
    }
  };

  const sendEmailCode = async (userId: string) => {
    if (!confirm('Send security code email to this voter?')) return;
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/users/${userId}/send-email`,
        { method: 'POST', credentials: 'include' },
      );
      if (res.ok) {
        alert('Email sent successfully.');
      }
    } catch (err) {
      console.error('Failed to send email:', err);
    }
  };

  const sendBulkEmails = async () => {
    if (
      !confirm(
        'Send official security code emails to all non-voted voters in this election?',
      )
    )
      return;
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/elections/${electionId}/send-bulk-emails`,
        { method: 'POST', credentials: 'include' },
      );
      if (res.ok) {
        const data = await res.json();
        alert(`Successfully sent ${data.count} email(s).`);
        fetchVoters();
      }
    } catch (err) {
      console.error('Failed to send bulk emails:', err);
    }
  };

  const sendSelectedEmails = async () => {
    if (
      !confirm(
        'Send emails to the ' +
          selectedUserIds.length +
          ' selected voters?',
      )
    )
      return;
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/elections/${electionId}/send-selected-emails`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ userIds: selectedUserIds }),
        },
      );
      if (res.ok) {
        const data = await res.json();
        alert(`Successfully sent ${data.count} email(s).`);
        setSelectedUserIds([]);
        fetchVoters();
      }
    } catch (err) {
      console.error('Failed to send selected emails:', err);
    }
  };

  const hasSelection = selectedUserIds.length > 0;

  const withCodes = voters.filter((v) => v.securityCode).length;
  const withoutCodes = voters.filter((v) => !v.securityCode).length;
  const votedCount = voters.filter((v) => v.hasVoted).length;
  const notVotedCount = voters.filter((v) => !v.hasVoted).length;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-forwards">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4 mb-6">
        <div className="relative flex-1 min-w-[200px] max-w-[400px]">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or student ID..."
            className="w-full bg-white border-b border-slate-300 pl-10 pr-4 py-3 text-sm text-black outline-none focus:border-[#4c0519] font-bold"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value as 'all' | 'hasVoted' | 'notVoted');
            setPagination((prev) => ({ ...prev, page: 1 }));
          }}
          className="bg-white border-b border-slate-300 px-4 py-3 text-sm text-black outline-none focus:border-[#4c0519] font-bold"
        >
          <option value="all" className="text-black">
            All Status
          </option>
          <option value="hasVoted" className="text-black">
            Has Voted
          </option>
          <option value="notVoted" className="text-black">
            Not Voted
          </option>
        </select>

        <select
          value={courseFilter}
          onChange={(e) => {
            setCourseFilter(e.target.value);
            setPagination((prev) => ({ ...prev, page: 1 }));
          }}
          className="bg-white border-b border-slate-300 px-4 py-3 text-sm text-black outline-none focus:border-[#4c0519] font-bold"
        >
          <option value="all" className="text-black">
            All Courses
          </option>
          {courses.map((course) => (
            <option key={course} value={course} className="text-black">
              {course}
            </option>
          ))}
        </select>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex items-center gap-2 mb-4">
        <button
          onClick={() => setActiveSubTab('status')}
          className={`flex items-center gap-2 px-4 py-2 rounded-sm text-[10px] font-black uppercase tracking-widest transition-all ${
            activeSubTab === 'status'
              ? 'bg-[#4c0519] text-white'
              : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
          }`}
        >
          <User size={14} />
          Voter Status
        </button>
        <button
          onClick={() => setActiveSubTab('security')}
          className={`flex items-center gap-2 px-4 py-2 rounded-sm text-[10px] font-black uppercase tracking-widest transition-all ${
            activeSubTab === 'security'
              ? 'bg-[#4c0519] text-white'
              : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
          }`}
        >
          <Shield size={14} />
          Security Distribution
        </button>
      </div>

      {/* Summary + Actions */}
      <div className="flex items-center gap-6 mb-4 text-sm flex-wrap">
        <span className="text-slate-500 whitespace-nowrap">
          Total:{' '}
          <span className="font-bold text-black">{pagination.total}</span>{' '}
          voters
        </span>

        {activeSubTab === 'status' ? (
          <>
            <span className="text-green-600 flex items-center gap-1 whitespace-nowrap">
              <CheckCircle size={14} />
              <span className="font-bold">{votedCount}</span> voted
            </span>
            <span className="text-slate-500 flex items-center gap-1 whitespace-nowrap">
              <Circle size={14} />
              <span className="font-bold">{notVotedCount}</span> not voted
            </span>
          </>
        ) : (
          <>
            <span className="text-green-600 flex items-center gap-1 whitespace-nowrap">
              <Shield size={14} />
              <span className="font-bold">{withCodes}</span> with codes
            </span>
            <span className="text-slate-500 flex items-center gap-1 whitespace-nowrap">
              <Circle size={14} />
              <span className="font-bold">{withoutCodes}</span> missing
            </span>

            {/* Action Buttons */}
            <button
              onClick={hasSelection ? regenerateSelectedCodes : generateBulkCodes}
              className="bg-[#4c0519] text-white px-4 py-2 rounded-sm text-[10px] font-black uppercase tracking-widest hover:bg-[#6b1324] transition-all ml-auto"
            >
              {hasSelection
                ? `Generate for Selected (${selectedUserIds.length})`
                : 'Generate Missing Codes'}
            </button>
            <button
              onClick={hasSelection ? regenerateSelectedCodes : regenerateAllCodes}
              className="bg-white/5 border border-red-900/30 text-red-500 hover:bg-red-900/20 hover:text-red-400 px-4 py-2 rounded-sm text-[10px] font-black uppercase tracking-widest transition-all"
            >
              {hasSelection
                ? `Regenerate Selected (${selectedUserIds.length})`
                : 'Regenerate ALL Codes'}
            </button>
            <button
              onClick={hasSelection ? sendSelectedEmails : sendBulkEmails}
              className="bg-[#c5a021] text-black px-4 py-2 rounded-sm text-[10px] font-black uppercase tracking-widest hover:bg-yellow-400 transition-all"
            >
              {hasSelection
                ? `Email Selected (${selectedUserIds.length})`
                : 'Email All Codes'}
            </button>
          </>
        )}
      </div>

      {/* Table */}
      {loading ? (
        <div className="text-center py-8">
          <p className="text-slate-500">Loading voters...</p>
        </div>
      ) : voters.length === 0 ? (
        <div className="text-center py-8 bg-slate-50 border border-dashed border-slate-300 rounded-sm">
          <p className="text-slate-500">
            No voters found matching your criteria.
          </p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  {activeSubTab === 'security' && (
                    <th className="w-10 px-3 py-3">
                      <input
                        type="checkbox"
                        onChange={handleSelectAll}
                        checked={
                          voters.length > 0 &&
                          voters.every((v) =>
                            selectedUserIds.includes(v.userId),
                          )
                        }
                        className="accent-[#4c0519] w-4 h-4 rounded border-slate-300"
                      />
                    </th>
                  )}
                  <th className="text-left text-[10px] font-black text-slate-500 uppercase tracking-widest px-4 py-3">
                    Name
                  </th>
                  <th className="text-left text-[10px] font-black text-slate-500 uppercase tracking-widest px-4 py-3">
                    Student ID
                  </th>

                  {activeSubTab === 'status' ? (
                    <>
                      <th className="text-left text-[10px] font-black text-slate-500 uppercase tracking-widest px-4 py-3">
                        Course
                      </th>
                      <th className="text-left text-[10px] font-black text-slate-500 uppercase tracking-widest px-4 py-3">
                        Status
                      </th>
                      <th className="text-left text-[10px] font-black text-slate-500 uppercase tracking-widest px-4 py-3">
                        Voted At
                      </th>
                    </>
                  ) : (
                    <th className="text-left text-[10px] font-black text-slate-500 uppercase tracking-widest px-4 py-3">
                      Security Code
                    </th>
                  )}
                </tr>
              </thead>
              <tbody>
                {voters.map((voter) => (
                  <tr
                    key={voter.id}
                    className={`border-b border-slate-100 hover:bg-slate-50 ${
                      selectedUserIds.includes(voter.userId)
                        ? 'bg-[#4c0519]/5'
                        : ''
                    }`}
                  >
                    {activeSubTab === 'security' && (
                      <td className="px-3 py-3">
                        <input
                          type="checkbox"
                          checked={selectedUserIds.includes(voter.userId)}
                          onChange={() => handleSelectOne(voter.userId)}
                          className="accent-[#4c0519] w-4 h-4 rounded border-slate-300"
                        />
                      </td>
                    )}
                    <td className="px-4 py-3">
                      <span className="text-sm font-bold text-black">
                        {voter.name}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm font-mono text-slate-600">
                        {voter.studentId || 'N/A'}
                      </span>
                    </td>

                    {activeSubTab === 'status' ? (
                      <>
                        <td className="px-4 py-3">
                          <span className="text-sm text-slate-600">
                            {voter.courseCode}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {voter.hasVoted ? (
                            <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-[9px] font-black uppercase">
                              Voted
                            </span>
                          ) : (
                            <span className="bg-slate-100 text-slate-500 px-2 py-1 rounded-full text-[9px] font-black uppercase">
                              Not Voted
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-sm text-slate-500">
                            {voter.votedAt ? formatVotedAt(voter.votedAt) : '-'}
                          </span>
                        </td>
                      </>
                    ) : (
                      <td className="px-4 py-3">
                        {voter.securityCode ? (
                          <span className="inline-flex items-center gap-2">
                            <span className="font-mono font-bold text-slate-700">
                              {visibleCodes.has(voter.userId)
                                ? voter.securityCode
                                : '••••••'}
                            </span>
                            <button
                              onClick={() =>
                                toggleCodeVisibility(voter.userId)
                              }
                              className="text-slate-400 hover:text-slate-600 transition-colors"
                              title={
                                visibleCodes.has(voter.userId)
                                  ? 'Hide Code'
                                  : 'Show Code'
                              }
                            >
                              {visibleCodes.has(voter.userId) ? (
                                <EyeOff size={12} />
                              ) : (
                                <Eye size={12} />
                              )}
                            </button>
                            <button
                              onClick={() => {
                                if (
                                  confirm(
                                    'Regenerate code for this user? The old code will stop working immediately.',
                                  )
                                )
                                  generateSingleCode(voter.userId);
                              }}
                              className="text-slate-400 hover:text-red-600 transition-colors"
                              title="Regenerate Code"
                            >
                              <RotateCw size={12} />
                            </button>
                            <button
                              onClick={() => sendEmailCode(voter.userId)}
                              className="text-slate-400 hover:text-[#c5a021] transition-colors"
                              title="Send Email"
                            >
                              <Mail size={12} />
                            </button>
                          </span>
                        ) : (
                          <button
                            onClick={() => generateSingleCode(voter.userId)}
                            className="text-[9px] font-black uppercase text-[#c5a021] hover:underline"
                          >
                            Generate
                          </button>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-200">
              <span className="text-sm text-slate-500">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className={`p-2 rounded-sm transition-colors ${
                    pagination.page === 1
                      ? 'text-slate-300 cursor-not-allowed'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <ChevronLeft size={20} />
                </button>
                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.totalPages}
                  className={`p-2 rounded-sm transition-colors ${
                    pagination.page === pagination.totalPages
                      ? 'text-slate-300 cursor-not-allowed'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
