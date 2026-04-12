'use client';

import React, { useState } from 'react';
import { LayoutGrid, List, Calendar } from 'lucide-react';
import ElectionCard from './ElectionCard';
import ElectionDetailModal from './ElectionDetailModal';

interface ElectionOverviewProps {
  elections: any[];
  courses: any[];
  onEditElection: (election: any) => void;
  onRefresh: () => void;
}

export default function ElectionOverview({ elections, courses, onEditElection, onRefresh }: ElectionOverviewProps) {
  const [viewMode, setViewMode] = useState<'cards' | 'list'>('cards');
  const [selectedElection, setSelectedElection] = useState<any>(null);

  const ongoingElections = elections.filter(e => e.status === 'ACTIVE');
  const draftElections = elections.filter(e => e.status === 'DRAFT');
  const previousElections = elections.filter(e => e.status === 'COMPLETED');

  const handleViewDetails = (election: any) => {
    setSelectedElection(election);
  };

  const handleEdit = (election: any) => {
    onEditElection(election);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-700';
      case 'DRAFT':
        return 'bg-yellow-100 text-yellow-800';
      case 'COMPLETED':
        return 'bg-slate-100 text-slate-600';
      default:
        return 'bg-slate-100 text-slate-600';
    }
  };

  const formatDateOnly = (date: string | null) => {
    if (!date) return 'Not set';
    return new Date(date).toLocaleDateString();
  };

  return (
    <div>
      {/* View Toggle */}
      <div className="flex justify-end mb-6">
        <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-sm p-1">
          <button
            onClick={() => setViewMode('cards')}
            className={`px-3 py-2 rounded-sm transition-all flex items-center gap-2 ${
              viewMode === 'cards' 
                ? 'bg-[#c5a021] text-black' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <LayoutGrid size={14} />
            <span className="text-[10px] font-black uppercase tracking-widest">Cards</span>
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`px-3 py-2 rounded-sm transition-all flex items-center gap-2 ${
              viewMode === 'list' 
                ? 'bg-[#c5a021] text-black' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <List size={14} />
            <span className="text-[10px] font-black uppercase tracking-widest">List</span>
          </button>
        </div>
      </div>

      {/* Ongoing Elections */}
      {ongoingElections.length > 0 && (
        <div className="mb-12">
          <h3 className="text-lg font-bold uppercase tracking-tighter text-[#4c0519] mb-4 flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            Ongoing Elections
          </h3>
          {viewMode === 'cards' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {ongoingElections.map(election => (
                <ElectionCard 
                  key={election.id} 
                  election={election}
                  onViewDetails={handleViewDetails}
                  onEdit={handleEdit}
                />
              ))}
            </div>
          ) : (
            <div className="bg-white/95 backdrop-blur-xl border border-white/20 rounded-sm overflow-hidden">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="text-left text-[10px] font-black text-slate-500 uppercase tracking-widest px-4 py-3">Title</th>
                    <th className="text-left text-[10px] font-black text-slate-500 uppercase tracking-widest px-4 py-3">Status</th>
                    <th className="text-left text-[10px] font-black text-slate-500 uppercase tracking-widest px-4 py-3">Period</th>
                    <th className="text-left text-[10px] font-black text-slate-500 uppercase tracking-widest px-4 py-3">Courses</th>
                    <th className="text-left text-[10px] font-black text-slate-500 uppercase tracking-widest px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {ongoingElections.map(election => {
                    const courseCount = election.courseSettings ? Object.keys(election.courseSettings).length : 0;
                    return (
                      <tr key={election.id} className="border-b border-slate-100 hover:bg-slate-50">
                        <td className="px-4 py-3">
                          <span 
                            className="text-sm font-bold text-black cursor-pointer hover:text-[#4c0519]"
                            onClick={() => handleViewDetails(election)}
                          >
                            {election.title}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded-full text-[9px] font-black uppercase ${getStatusBadge(election.status)}`}>
                            {election.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-600">
                          {formatDateOnly(election.startDate)} - {formatDateOnly(election.endDate)}
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-600">
                          {courseCount} course{courseCount !== 1 ? 's' : ''}
                        </td>
                        <td className="px-4 py-3">
                          <button 
                            onClick={() => handleEdit(election)}
                            className="text-[#4c0519] hover:underline text-xs font-bold uppercase"
                          >
                            Edit
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Draft Elections */}
      {draftElections.length > 0 && (
        <div className="mb-12">
          <h3 className="text-lg font-bold uppercase tracking-tighter text-[#4c0519] mb-4 flex items-center gap-2">
            <span className="w-2 h-2 bg-yellow-500 rounded-full" />
            Draft Elections
          </h3>
          {viewMode === 'cards' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {draftElections.map(election => (
                <ElectionCard 
                  key={election.id} 
                  election={election}
                  onViewDetails={handleViewDetails}
                  onEdit={handleEdit}
                />
              ))}
            </div>
          ) : (
            <div className="bg-white/95 backdrop-blur-xl border border-white/20 rounded-sm overflow-hidden">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="text-left text-[10px] font-black text-slate-500 uppercase tracking-widest px-4 py-3">Title</th>
                    <th className="text-left text-[10px] font-black text-slate-500 uppercase tracking-widest px-4 py-3">Status</th>
                    <th className="text-left text-[10px] font-black text-slate-500 uppercase tracking-widest px-4 py-3">Period</th>
                    <th className="text-left text-[10px] font-black text-slate-500 uppercase tracking-widest px-4 py-3">Courses</th>
                    <th className="text-left text-[10px] font-black text-slate-500 uppercase tracking-widest px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {draftElections.map(election => {
                    const courseCount = election.courseSettings ? Object.keys(election.courseSettings).length : 0;
                    return (
                      <tr key={election.id} className="border-b border-slate-100 hover:bg-slate-50">
                        <td className="px-4 py-3">
                          <span 
                            className="text-sm font-bold text-black cursor-pointer hover:text-[#4c0519]"
                            onClick={() => handleViewDetails(election)}
                          >
                            {election.title}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded-full text-[9px] font-black uppercase ${getStatusBadge(election.status)}`}>
                            {election.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-600">
                          {formatDateOnly(election.startDate)} - {formatDateOnly(election.endDate)}
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-600">
                          {courseCount} course{courseCount !== 1 ? 's' : ''}
                        </td>
                        <td className="px-4 py-3">
                          <button 
                            onClick={() => handleEdit(election)}
                            className="text-[#4c0519] hover:underline text-xs font-bold uppercase"
                          >
                            Edit
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Previous Elections */}
      {previousElections.length > 0 && (
        <div className="mb-12">
          <h3 className="text-lg font-bold uppercase tracking-tighter text-[#4c0519] mb-4 flex items-center gap-2">
            <span className="w-2 h-2 bg-slate-400 rounded-full" />
            Previous Elections
          </h3>
          {viewMode === 'cards' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {previousElections.map(election => (
                <ElectionCard 
                  key={election.id} 
                  election={election}
                  onViewDetails={handleViewDetails}
                  onEdit={handleEdit}
                />
              ))}
            </div>
          ) : (
            <div className="bg-white/95 backdrop-blur-xl border border-white/20 rounded-sm overflow-hidden">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="text-left text-[10px] font-black text-slate-500 uppercase tracking-widest px-4 py-3">Title</th>
                    <th className="text-left text-[10px] font-black text-slate-500 uppercase tracking-widest px-4 py-3">Status</th>
                    <th className="text-left text-[10px] font-black text-slate-500 uppercase tracking-widest px-4 py-3">Period</th>
                    <th className="text-left text-[10px] font-black text-slate-500 uppercase tracking-widest px-4 py-3">Courses</th>
                    <th className="text-left text-[10px] font-black text-slate-500 uppercase tracking-widest px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {previousElections.map(election => {
                    const courseCount = election.courseSettings ? Object.keys(election.courseSettings).length : 0;
                    return (
                      <tr key={election.id} className="border-b border-slate-100 hover:bg-slate-50">
                        <td className="px-4 py-3">
                          <span 
                            className="text-sm font-bold text-black cursor-pointer hover:text-[#4c0519]"
                            onClick={() => handleViewDetails(election)}
                          >
                            {election.title}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded-full text-[9px] font-black uppercase ${getStatusBadge(election.status)}`}>
                            {election.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-600">
                          {formatDateOnly(election.startDate)} - {formatDateOnly(election.endDate)}
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-600">
                          {courseCount} course{courseCount !== 1 ? 's' : ''}
                        </td>
                        <td className="px-4 py-3">
                          <button 
                            onClick={() => handleEdit(election)}
                            className="text-[#4c0519] hover:underline text-xs font-bold uppercase"
                          >
                            Edit
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Empty State */}
      {elections.length === 0 && (
        <div className="text-center py-16 bg-white/5 border border-white/10 rounded-sm">
          <Calendar size={48} className="text-slate-400 mx-auto mb-4" />
          <p className="text-slate-400 text-lg font-bold">No elections found</p>
          <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-2">
            Click "Election Setup" to create your first election
          </p>
        </div>
      )}

      {/* Detail Modal */}
      {selectedElection && (
        <ElectionDetailModal 
          election={selectedElection}
          courses={courses}
          onClose={() => setSelectedElection(null)}
        />
      )}
    </div>
  );
}