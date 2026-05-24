"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { 
  ChevronDown, 
  Filter, 
  ChevronLeft,
  CheckCircle2,
  ShieldCheck,
  Users,
  AlertTriangle,
  RotateCcw,
  UserCircle
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import UniversalHeader from '@/components/ui/universal-header';
import Footer from '@/components/ui/footer';

interface Candidate {
  id: number;
  name: string;
  dept: string;
  img: string;
}

export default function BallotPage() {
  const router = useRouter();
  
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState("ALL");
  const [userRole] = useState<'student' | 'candidate'>('student');
  const [isVoteSuccess, setIsVoteSuccess] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const [selectedCandidateIds, setSelectedCandidateIds] = useState<number[]>([]);
  const [completedCourses, setCompletedCourses] = useState<string[]>([]);
  
  const courses = ["ALL", "DBS", "DCS", "DLH", "DIA", "CFAB"];

  const facultyData: Record<string, { seats: number; limit: number }> = {
    "DBS":  { seats: 3, limit: 2 },
    "DCS":  { seats: 5, limit: 4 },
    "DLH":  { seats: 3, limit: 2 },
    "DIA":  { seats: 5, limit: 4 },
    "CFAB": { seats: 3, limit: 2 },
  };

  useEffect(() => {
    const savedVotes = localStorage.getItem('mpp_completed_votes');
    if (savedVotes) {
      setCompletedCourses(JSON.parse(savedVotes));
    }
  }, []);

  useEffect(() => {
    if (completedCourses.length > 0) {
      localStorage.setItem('mpp_completed_votes', JSON.stringify(completedCourses));
    }
  }, [completedCourses]);

  const resetSimulation = () => {
    localStorage.removeItem('mpp_completed_votes');
    setCompletedCourses([]);
    setSelectedCourse("ALL");
    window.location.reload();
  };

  const allCandidates: Candidate[] = [
    // Updated ID 101 to eventually use your local image via the Card logic below
    { id: 101, name: "Muhammad Haziq Bin Razak", dept: "DCS", img: "/candidates/handsome.jpeg" },
    { id: 102, name: "Nurul Ain Binti Mansor", dept: "DCS", img: "https://images.pexels.com/photos/1181682/pexels-photo-1181682.jpeg" },
    { id: 103, name: "Ahmad Syahmi Bin Idris", dept: "DCS", img: "https://images.pexels.com/photos/2182970/pexels-photo-2182970.jpeg" },
    { id: 104, name: "Siti Sarah Binti Zulkifli", dept: "DCS", img: "https://images.pexels.com/photos/1181519/pexels-photo-1181519.jpeg" },
    { id: 105, name: "Wan Firdaus Bin Aziz", dept: "DCS", img: "https://images.pexels.com/photos/837358/pexels-photo-837358.jpeg" },
    { id: 106, name: "Amira Najwa Binti Roslan", dept: "DCS", img: "https://images.pexels.com/photos/1036623/pexels-photo-1036623.jpeg" },
    { id: 201, name: "Farah Wahida Binti Bakri", dept: "DBS", img: "https://images.pexels.com/photos/764416/pexels-photo-764416.jpeg" },
    { id: 202, name: "Khairul Aming Kamaruzaman", dept: "DBS", img: "https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg" },
    { id: 203, name: "Nur Izzati Binti Hamdan", dept: "DBS", img: "https://images.pexels.com/photos/712513/pexels-photo-712513.jpeg" },
    { id: 204, name: "Muhammad Afiq Bin Zamri", dept: "DBS", img: "https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg" },
    { id: 205, name: "Dayang Nurfaizah", dept: "DBS", img: "https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg" },
    { id: 206, name: "Syed Saddiq Bin Abdul", dept: "DBS", img: "https://images.pexels.com/photos/91227/pexels-photo-91227.jpeg" },
  ];

  const filteredCandidates = useMemo(() => {
    return selectedCourse === "ALL" 
      ? allCandidates 
      : allCandidates.filter(c => c.dept === selectedCourse);
  }, [selectedCourse]);

  const currentLimit = facultyData[selectedCourse]?.limit || 0;
  const isCourseVoted = completedCourses.includes(selectedCourse);

  const handleToggleSelect = (id: number) => {
    if (isCourseVoted) return;
    setSelectedCandidateIds(prev => {
      if (prev.includes(id)) return prev.filter(i => i !== id);
      if (prev.length < currentLimit) return [...prev, id];
      return prev;
    });
  };

  const handleFinalSubmit = () => {
    setIsVoteSuccess(true);
    setTimeout(() => {
      setCompletedCourses(prev => [...prev, selectedCourse]);
      setSelectedCandidateIds([]);
      setIsVoteSuccess(false);
      setShowConfirmModal(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-black relative font-sans text-white overflow-x-hidden">
      <div className="fixed inset-0 z-0 bg-black" />

      <UniversalHeader role="student" />

      <main className="flex-grow p-12 max-w-7xl mx-auto w-full pt-[120px]">
          {/* HEADER SECTION */}
          <div className="flex flex-col md:flex-row justify-between items-center mb-16 gap-6">
            <div className="w-full md:w-1/4 flex items-center gap-4">
              <button onClick={() => router.back()} className="flex items-center gap-3 text-white/60 hover:text-white transition-all bg-white/5 px-6 py-3 rounded-full border border-white/10 backdrop-blur-md">
                <ChevronLeft size={18} />
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Go Back</span>
              </button>
              <button onClick={resetSimulation} className="p-3 bg-red-500/10 border border-red-500/20 rounded-full text-red-500 hover:bg-red-500 hover:text-white transition-all">
                <RotateCcw size={14} />
              </button>
            </div>

            <div className="flex-grow flex justify-center">
              {selectedCourse !== "ALL" && facultyData[selectedCourse] && (
                <div className={`flex items-center gap-1 bg-[#121212]/80 backdrop-blur-3xl border border-white/10 p-1 rounded-2xl shadow-2xl transition-all duration-500 ${isCourseVoted ? 'opacity-30 grayscale' : 'opacity-100'}`}>
                  <div className="flex items-center gap-4 px-8 py-3 bg-white/[0.03] rounded-xl border border-white/5">
                    <div className="p-2 bg-[#c5a021]/20 rounded-lg">
                        <ShieldCheck size={18} className="text-[#c5a021]" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[7px] font-black text-white/30 uppercase tracking-[0.3em]">Total Seats</span>
                      <span className="text-lg font-bold tracking-tighter italic text-[#c5a021] leading-none">{facultyData[selectedCourse].seats} SEATS</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 px-8 py-3">
                    <div className="p-2 bg-blue-500/10 rounded-lg">
                        <Users size={18} className="text-blue-400" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[7px] font-black text-white/30 uppercase tracking-[0.3em]">Vote Limit</span>
                      <span className="text-lg font-bold tracking-tighter italic text-blue-400 leading-none">UP TO {facultyData[selectedCourse].limit}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="w-full md:w-1/4 flex justify-end">
              <div className="relative">
                <button onClick={() => setIsOpen(!isOpen)} className="flex items-center gap-4 bg-white/5 p-1 rounded-full border border-white/10 backdrop-blur-xl hover:bg-white/10 transition-all min-w-[240px]">
                  <div className="flex items-center gap-3 px-4 py-2 text-white/40 border-r border-white/10">
                    <Filter size={14} /><span className="text-[9px] font-black uppercase tracking-widest">COURSE</span>
                  </div>
                  <div className="flex-grow flex items-center justify-between px-4">
                    <span className="text-white text-[11px] font-bold tracking-widest uppercase">{selectedCourse}</span>
                    <ChevronDown size={14} className={`text-white/40 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                  </div>
                </button>
                {isOpen && (
                  <div className="absolute top-full right-0 mt-3 w-full bg-[#1a1a1a]/95 backdrop-blur-2xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl z-[100]">
                    {courses.map((course) => (
                      <button 
                        key={course} 
                        onClick={() => { setSelectedCourse(course); setIsOpen(false); setSelectedCandidateIds([]); }} 
                        className={`w-full text-left px-8 py-4 text-[10px] font-black uppercase tracking-[0.2em] transition-all border-b border-white/5 last:border-none flex justify-between items-center ${selectedCourse === course ? 'text-[#c5a021] bg-white/5' : 'text-white/60 hover:text-white hover:bg-white/5'}`}
                      >
                        {course}
                        {completedCourses.includes(course) && <CheckCircle2 size={12} className="text-green-500" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* CANDIDATES GRID */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-40">
            {filteredCandidates.map((candidate) => (
              <CandidateCard 
                key={candidate.id}
                candidate={candidate}
                isSelected={selectedCandidateIds.includes(candidate.id)}
                onSelect={() => handleToggleSelect(candidate.id)}
                isLocked={isCourseVoted}
                disabled={!selectedCandidateIds.includes(candidate.id) && selectedCandidateIds.length >= currentLimit}
              />
            ))}
          </div>
        </main>

        <div className="mt-auto relative z-20 border-t border-white/5 bg-black/60 backdrop-blur-lg">
          <Footer />
        </div>

        {/* FLOATING BALLOT BAR */}
        {selectedCandidateIds.length > 0 && !isCourseVoted && (
        <div className="fixed bottom-12 left-1/2 -translate-x-1/2 z-[150] w-full max-w-lg px-6 animate-in slide-in-from-bottom-8 duration-500">
          <div className="bg-[#1a1a1a] border border-white/10 p-5 rounded-2xl shadow-2xl backdrop-blur-2xl flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-[#c5a021] flex items-center justify-center text-black font-black text-lg italic">
                {selectedCandidateIds.length}
              </div>
              <div>
                <p className="text-[8px] font-black text-white/30 uppercase tracking-[0.3em]">Ballot Status</p>
                <p className="text-sm font-bold tracking-tight uppercase italic">{selectedCandidateIds.length} / {currentLimit} Selected</p>
              </div>
            </div>
            <button 
              onClick={() => setShowConfirmModal(true)}
              className="bg-white text-black px-8 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-[#c5a021] transition-all"
            >
Confirm Vote
            </button>
          </div>
        </div>
      )}

      {/* CONFIRMATION MODAL */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-black/90 backdrop-blur-sm" onClick={() => !isVoteSuccess && setShowConfirmModal(false)} />
          <div className="relative w-full max-w-md bg-[#0a0a0a] border border-white/10 rounded-[2rem] p-10 overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300 text-center">
            {!isVoteSuccess ? (
              <>
                <div className="flex justify-center mb-6">
                  <div className="h-16 w-16 bg-[#c5a021]/10 rounded-full flex items-center justify-center border border-[#c5a021]/20">
                    <AlertTriangle size={32} className="text-[#c5a021]" />
                  </div>
                </div>
                <h2 className="text-2xl font-bold italic uppercase tracking-tighter mb-2">Final Confirmation</h2>
                <p className="text-white/60 text-xs leading-relaxed mb-10">
                  You are voting for <strong>{selectedCandidateIds.length} candidates</strong>. This action is persistent and will lock your ballot for {selectedCourse}.
                </p>
                <button onClick={handleFinalSubmit} className="w-full bg-white text-black py-4 rounded-xl text-[10px] font-black uppercase tracking-[0.3em] hover:bg-[#c5a021] transition-all mb-3">Confirm Submission</button>
                <button onClick={() => setShowConfirmModal(false)} className="w-full border border-white/10 py-4 rounded-xl text-[10px] font-black uppercase tracking-[0.3em] text-white/40">Cancel</button>
              </>
            ) : (
              <div className="py-10 flex flex-col items-center">
                <CheckCircle2 size={64} className="text-green-500 mb-6 animate-bounce" />
                <h2 className="text-2xl font-bold italic uppercase tracking-tighter mb-2">Vote Recorded</h2>
                <p className="text-white/40 text-[10px] font-bold uppercase tracking-[0.2em]">Updating your portal...</p>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="fixed bottom-0 left-0 right-0 h-2 bg-gradient-to-t from-black to-transparent z-20" />
</div>
  );
}

function CandidateCard({ candidate, isSelected, onSelect, disabled, isLocked }: any) {
  // Logic to ensure ID 101 always uses your specific local file
  const imagePath = candidate.id === 101 ? "/candidates/handsome.jpeg" : candidate.img;

  return (
    <div className={`group rounded-sm overflow-hidden shadow-2xl transition-all duration-500 flex flex-col border border-white/10 
      ${isSelected ? 'bg-[#c5a021]' : 'bg-white'} 
      ${isLocked ? 'opacity-60 grayscale cursor-not-allowed' : 'hover:-translate-y-2'}`}
    >
      <div className="relative aspect-[4/5] bg-slate-200 overflow-hidden">
        <img 
          src={imagePath} 
          alt={candidate.name}
          className={`w-full h-full object-cover transition-all duration-1000 
            ${isSelected ? 'grayscale-0' : 'grayscale group-hover:grayscale-0 group-hover:scale-110'}`}
        />
        <div className="absolute top-4 left-4">
          <div className={`px-3 py-1 text-[9px] font-black uppercase tracking-widest shadow-lg ${isSelected ? 'bg-black text-white' : 'bg-[#4c0519] text-white'}`}>
            ID #{candidate.id}
          </div>
        </div>
        {isLocked && (
            <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center">
                 <CheckCircle2 size={48} className="text-white/80" />
            </div>
        )}
      </div>

      <div className={`p-8 text-center transition-colors duration-300 flex flex-col flex-grow ${isSelected ? 'bg-[#c5a021]' : 'bg-white'}`}>
        <h3 className={`text-lg font-bold uppercase tracking-tighter mb-1 italic leading-none ${isSelected ? 'text-black' : 'text-slate-900'}`}>{candidate.name}</h3>
        <p className={`text-[9px] font-black uppercase tracking-[0.2em] mb-8 min-h-[24px] ${isSelected ? 'text-black/60' : 'text-slate-400'}`}>
          DEPT OF {candidate.dept}
        </p>

        <div className="flex flex-col gap-2 w-full mt-auto">
          {/* VOTE BUTTON */}
          <button 
            onClick={onSelect}
            disabled={disabled || isLocked}
            className={`py-3.5 text-[10px] font-black uppercase tracking-[0.25em] rounded-sm transition-all flex items-center justify-center gap-2
              ${isLocked ? 'bg-black/10 text-black/20 cursor-not-allowed' : 
                isSelected ? 'bg-black text-white hover:bg-black/80' : 
                disabled ? 'bg-slate-100 text-slate-300 cursor-not-allowed border border-slate-200' : 'bg-[#4c0519] text-white hover:bg-red-900'}
            `}
          >
            {isLocked ? 'Vote Recorded' : isSelected ? 'Deselect' : 'Select'}
          </button>

          {/* VIEW PROFILE BUTTON */}
          <Link href={`/dashboard/candidate/${candidate.id}`} className="w-full">
            <button className={`w-full py-3 text-[10px] font-black uppercase tracking-[0.2em] border flex items-center justify-center gap-2 transition-all
              ${isSelected ? 'border-black/20 text-black hover:bg-black/10' : 'border-slate-200 text-slate-400 hover:bg-slate-50 hover:text-slate-900'}
            `}>
              <UserCircle size={14} />
              View Profile
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}