'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import UniversalHeader from '@/components/ui/universal-header';

const bgImageUrl = "https://beranang.kpm.edu.my/kpmb/images/speasyimagegallery/albums/7/images/dewan-3.jpg";

export default function ConfirmPage() {
  const router = useRouter();
  const [election, setElection] = useState<any>(null);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [selectedCandidates, setSelectedCandidates] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('studentVoteSelection');
    if (stored) {
      const data = JSON.parse(stored);
      setElection(data.election);
      setSelectedCandidates(data.selectedCandidates);
      setCandidates(data.candidates || []);
    } else {
      router.push('/dashboard/student');
    }
  }, [router]);

  const handleConfirm = async () => {
    if (!election) return;
    setIsSubmitting(true);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/votes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          electionId: election.id,
          candidateIds: selectedCandidates,
        }),
      });

      if (res.ok) {
        localStorage.removeItem('studentVoteSelection');
        router.push('/dashboard/student');
      } else {
        const err = await res.text();
        alert(`Failed to submit vote: ${err}`);
        setIsSubmitting(false);
      }
    } catch (err: any) {
      alert(`Error: ${err.message}`);
      setIsSubmitting(false);
    }
  };

  const handleGoBack = () => {
    router.push('/dashboard/student');
  };

  if (!election) {
    return null;
  }

  const courseSettings = election.courseSettings || {};
  
  const selectedCandidateDetails = selectedCandidates.map(id => {
    const candidate = candidates.find(c => c.id === id);
    return {
      id,
      name: candidate?.name || 'Unknown',
      courseCode: candidate?.courseCode || 'N/A',
    };
  });

  const groupedByCourse = selectedCandidateDetails.reduce((acc, c) => {
    if (!acc[c.courseCode]) acc[c.courseCode] = [];
    acc[c.courseCode].push(c);
    return acc;
  }, {} as Record<string, any[]>);

  return (
    <div className="min-h-screen bg-black overflow-hidden relative font-sans text-white">
      <UniversalHeader role="student" />

      <main className="flex-grow overflow-y-auto relative custom-scrollbar pt-[120px]">
        <div 
          className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${bgImageUrl})`, filter: 'blur(10px) brightness(0.3)' }}
        />

        <div className="relative z-10 p-12 max-w-3xl mx-auto w-full">
            <button 
              onClick={handleGoBack}
              className="flex items-center gap-2 text-slate-400 hover:text-white mb-8 transition-colors"
            >
              <ArrowLeft size={20} />
              <span className="text-[10px] font-black uppercase tracking-widest">Back to Voting</span>
            </button>

            <div className="p-8 bg-white/95 backdrop-blur-xl border border-white/20 rounded-sm">
              <h1 className="text-2xl font-bold uppercase tracking-tighter text-black mb-2">
                Confirm Your Vote
              </h1>
              <p className="text-slate-500 text-sm mb-8">
                Please review your selections before submitting
              </p>

              <div className="space-y-6">
                {Object.entries(groupedByCourse).map(([courseCode, courseCandidates]) => (
                  <div key={courseCode}>
                    <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-wider mb-2">
                      {courseCode} ({courseCandidates.length}/{courseSettings[courseCode]} votes)
                    </h3>
                    <div className="space-y-2">
                      {courseCandidates.map((candidate: any) => (
                        <div 
                          key={candidate.id}
                          className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-sm"
                        >
                          <CheckCircle size={18} className="text-green-500" />
                          <span className="text-sm font-bold text-black">{candidate.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 pt-6 border-t border-slate-200">
                <p className="text-xs text-slate-500 mb-4">
                  By confirming, your vote will be cast and cannot be changed.
                </p>
                <div className="flex gap-4">
                  <button
                    onClick={handleConfirm}
                    disabled={isSubmitting}
                    className="flex-1 bg-[#c5a021] text-black px-8 py-4 rounded-sm text-[12px] font-black uppercase tracking-[0.3em] hover:bg-yellow-400 transition-all disabled:opacity-50"
                  >
                    {isSubmitting ? 'Submitting...' : 'Confirm Vote'}
                  </button>
                  <button
                    onClick={handleGoBack}
                    className="flex-1 bg-slate-200 text-black px-8 py-4 rounded-sm text-[12px] font-black uppercase tracking-[0.3em] hover:bg-slate-300 transition-all"
                  >
                    Go Back
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
}