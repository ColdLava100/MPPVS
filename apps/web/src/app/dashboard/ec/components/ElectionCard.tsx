'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Pencil, Calendar, Users, ChevronRight } from 'lucide-react';

interface ElectionCardProps {
  election: any;
  onViewDetails?: (election: any) => void;
  onEdit: (election: any) => void;
}

export default function ElectionCard({ election, onViewDetails, onEdit }: ElectionCardProps) {
  const router = useRouter();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'border-b-green-700';
      case 'DRAFT':
        return 'border-b-yellow-600';
      case 'COMPLETED':
        return 'border-b-slate-400';
      default:
        return 'border-b-slate-400';
    }
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

  const courseCount = election.courseSettings ? Object.keys(election.courseSettings).length : 0;
  const startDate = election.startDate ? new Date(election.startDate).toLocaleDateString() : 'Not set';
  const endDate = election.endDate ? new Date(election.endDate).toLocaleDateString() : 'Not set';

  const handleViewDetails = () => {
    router.push(`/dashboard/ec/election/${election.id}`);
  };

  return (
    <div 
      onClick={handleViewDetails}
      className={`p-8 bg-white/95 backdrop-blur-xl border border-white/20 border-b-[6px] ${getStatusColor(election.status)} shadow-2xl group cursor-pointer hover:-translate-y-1 hover:shadow-2xl transition-all duration-300 rounded-sm`}
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-xl font-bold text-black group-hover:text-[#4c0519] transition-colors">
            {election.title}
          </h3>
          <span className={`inline-block mt-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${getStatusBadge(election.status)}`}>
            {election.status}
          </span>
        </div>
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onEdit(election);
          }}
          className="p-2 hover:bg-slate-100 rounded transition-colors"
          title="Edit Election"
        >
          <Pencil size={18} className="text-slate-400 group-hover:text-[#4c0519] transition-colors" />
        </button>
      </div>

      <div className="space-y-3 mt-6">
        <div className="flex items-center gap-2 text-slate-500">
          <Calendar size={14} />
          <span className="text-xs font-bold">
            {startDate} - {endDate}
          </span>
        </div>
        
        <div className="flex items-center gap-2 text-slate-500">
          <Users size={14} />
          <span className="text-xs font-bold">
            {courseCount} course{courseCount !== 1 ? 's' : ''} configured
          </span>
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-slate-500 group-hover:text-[#c5a021] transition-colors">
        <span className="text-[10px] font-black uppercase tracking-widest">View Election Details</span>
        <ChevronRight size={16} className="transform group-hover:translate-x-1 transition-transform" />
      </div>
    </div>
  );
}