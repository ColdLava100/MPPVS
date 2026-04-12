'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Search, ChevronLeft, ChevronRight, UserCheck, UserX } from 'lucide-react';

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
  hasVoted: boolean;
  votedAt: string | null;
}

interface PaginationInfo {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export default function VoterList({ electionId, courses }: VoterListProps) {
  const [voters, setVoters] = useState<Voter[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({
    total: 0,
    page: 1,
    limit: 50,
    totalPages: 0,
  });
  
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'hasVoted' | 'notVoted'>('all');
  const [courseFilter, setCourseFilter] = useState('all');
  const [loading, setLoading] = useState(false);

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
        { credentials: 'include' }
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
      setPagination(prev => ({ ...prev, page: 1 }));
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPagination(prev => ({ ...prev, page: newPage }));
    }
  };

  const formatVotedAt = (date: string | null) => {
    if (!date) return '';
    return new Date(date).toLocaleString();
  };

  return (
    <div>
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4 mb-6">
        <div className="relative flex-1 min-w-[200px] max-w-[400px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
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
            setStatusFilter(e.target.value as any);
            setPagination(prev => ({ ...prev, page: 1 }));
          }}
          className="bg-white border-b border-slate-300 px-4 py-3 text-sm text-black outline-none focus:border-[#4c0519] font-bold"
        >
          <option value="all" className="text-black">All Status</option>
          <option value="hasVoted" className="text-black">Has Voted</option>
          <option value="notVoted" className="text-black">Not Voted</option>
        </select>

        <select
          value={courseFilter}
          onChange={(e) => {
            setCourseFilter(e.target.value);
            setPagination(prev => ({ ...prev, page: 1 }));
          }}
          className="bg-white border-b border-slate-300 px-4 py-3 text-sm text-black outline-none focus:border-[#4c0519] font-bold"
        >
          <option value="all" className="text-black">All Courses</option>
          {courses.map(course => (
            <option key={course} value={course} className="text-black">{course}</option>
          ))}
        </select>
      </div>

      {/* Summary */}
      <div className="flex items-center gap-6 mb-4 text-sm">
        <span className="text-slate-500">
          Total: <span className="font-bold text-black">{pagination.total}</span> voters
        </span>
        <span className="text-green-600 flex items-center gap-1">
          <UserCheck size={14} />
          <span className="font-bold">{voters.filter(v => v.hasVoted).length}</span> voted
        </span>
        <span className="text-slate-500 flex items-center gap-1">
          <UserX size={14} />
          <span className="font-bold">{voters.filter(v => !v.hasVoted).length}</span> not voted
        </span>
      </div>

      {/* Table */}
      {loading ? (
        <div className="text-center py-8">
          <p className="text-slate-500">Loading voters...</p>
        </div>
      ) : voters.length === 0 ? (
        <div className="text-center py-8 bg-slate-50 border border-dashed border-slate-300 rounded-sm">
          <p className="text-slate-500">No voters found matching your criteria.</p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left text-[10px] font-black text-slate-500 uppercase tracking-widest px-4 py-3">Name</th>
                  <th className="text-left text-[10px] font-black text-slate-500 uppercase tracking-widest px-4 py-3">Student ID</th>
                  <th className="text-left text-[10px] font-black text-slate-500 uppercase tracking-widest px-4 py-3">Course</th>
                  <th className="text-left text-[10px] font-black text-slate-500 uppercase tracking-widest px-4 py-3">Status</th>
                  <th className="text-left text-[10px] font-black text-slate-500 uppercase tracking-widest px-4 py-3">Voted At</th>
                </tr>
              </thead>
              <tbody>
                {voters.map((voter) => (
                  <tr key={voter.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <span className="text-sm font-bold text-black">{voter.name}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm font-mono text-slate-600">{voter.studentId || 'N/A'}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-slate-600">{voter.courseCode}</span>
                    </td>
                    <td className="px-4 py-3">
                      {voter.hasVoted ? (
                        <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-[9px] font-black uppercase">Voted</span>
                      ) : (
                        <span className="bg-slate-100 text-slate-500 px-2 py-1 rounded-full text-[9px] font-black uppercase">Not Voted</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-slate-500">
                        {voter.votedAt ? formatVotedAt(voter.votedAt) : '-'}
                      </span>
                    </td>
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