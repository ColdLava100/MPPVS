'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import UniversalHeader from '@/components/ui/universal-header';
import StudentDashboard from './components/StudentDashboard';
import CandidateProfileModal from './components/CandidateProfileModal';

const bgImageUrl = "https://beranang.kpm.edu.my/kpmb/images/speasyimagegallery/albums/7/images/dewan-3.jpg";

export default function StudentPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [election, setElection] = useState<any>(null);
  const [session, setSession] = useState<any>(null);
  const [canVote, setCanVote] = useState(false);
  const [reason, setReason] = useState<string | null>(null);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [selectedCandidates, setSelectedCandidates] = useState<string[]>([]);
  const [hasVoted, setHasVoted] = useState(false);
  const [votedAt, setVotedAt] = useState<string | null>(null);
  const [selectedCandidateProfile, setSelectedCandidateProfile] = useState<any>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const authRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/student/status`, { 
          credentials: 'include' 
        });
        
        if (authRes.status === 401 || authRes.status === 403) {
          const logoutRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/logout`, {
            method: 'POST',
            credentials: 'include',
          });
          router.push('/login');
          return;
        }

        const statusData = await authRes.json();
        
        // Check if already voted (from status response)
        if (statusData.hasVoted) {
          setHasVoted(true);
          setVotedAt(statusData.votedAt);
          setCurrentUser({ name: 'Student' });
          setIsLoading(false);
          return;
        }

        // Get user data from /auth/me
        const meRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
          credentials: 'include',
        });
        if (meRes.ok) {
          const userData = await meRes.json();
          setCurrentUser(userData);
        }

        setCanVote(statusData.canVote);
        setReason(statusData.reason);
        setElection(statusData.election);
        setSession(statusData.session);

        // Debug: Log election info
        console.log('[DEBUG] Student statusData.election:', statusData.election);

        // Fetch candidates if there's an active election
        if (statusData.election) {
          console.log('[DEBUG] Fetching candidates for electionId:', statusData.election.id);
          const candidatesRes = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/elections/${statusData.election.id}/candidates`,
            { credentials: 'include' }
          );
          console.log('[DEBUG] Candidates response status:', candidatesRes.status);
          if (candidatesRes.ok) {
            const candidatesData = await candidatesRes.json();
            console.log('[DEBUG] Candidates fetched:', candidatesData);
            setCandidates(candidatesData);
          } else {
            console.error('Failed to fetch candidates:', candidatesRes.status, await candidatesRes.text());
          }
        } else {
          console.log('[DEBUG] No election in statusData');
        }
      } catch (err) {
        console.error('Auth check failed:', err);
        router.push('/login');
        return;
      }
      setIsLoading(false);
    };
    checkAuth();
  }, [router]);

  const handleToggleCandidate = (candidateId: string) => {
    const courseSettings = election?.courseSettings || {};
    const coursePrefixes = Object.keys(courseSettings);

    // DEBUG: Log candidate info
    const candidate = candidates.find(c => c.id === candidateId);
    console.log('[DEBUG] handleToggleCandidate called:', {
      candidateId,
      candidate: candidate,
      electionCourseSettings: courseSettings
    });

    if (!candidate) {
      console.error('[DEBUG] Candidate not found:', candidateId);
      return;
    }

    // Securely extract course prefix
    const prefix = candidate.user?.course?.studentPrefix || candidate.courseCode;
    console.log('[DEBUG] Extracted prefix:', prefix);

    if (!prefix) {
      console.warn('[DEBUG] No course prefix found for candidate');
      return;
    }

    // Check if already selected - allow deselection
    if (selectedCandidates.includes(candidateId)) {
      console.log('[DEBUG] Deselecting candidate:', candidateId);
      setSelectedCandidates(prev => prev.filter(id => id !== candidateId));
      return;
    }

    // Determine max chairs safely
    const maxChairs = courseSettings[prefix] ? parseInt(courseSettings[prefix], 10) : 0;
    console.log('[DEBUG] maxChairs for', prefix, ':', maxChairs);

    // FIXED: Check if course has chairs allocated
    if (maxChairs === 0) {
      alert(`Voting Configuration Error: The course '${prefix}' has not been allocated any chairs for this election. Please contact the EC.`);
      return;
    }

    // Count currently selected from this course
    const selectedInCourse = selectedCandidates.filter(id => {
      const c = candidates.find(c => c.id === id);
      const cPrefix = c?.user?.course?.studentPrefix || c?.courseCode;
      return cPrefix === prefix;
    }).length;

    // Check if reached limit
    if (selectedInCourse >= maxChairs) {
      alert(`You can only select ${maxChairs} candidate(s) for ${prefix}.`);
      return;
    }

    console.log('[DEBUG] Selecting candidate:', candidateId, 'Course:', prefix);
    setSelectedCandidates(prev => [...prev, candidateId]);
  };

  const handleViewProfile = (candidate: any) => {
    setSelectedCandidateProfile(candidate);
  };

  const handleSubmitVote = async () => {
    if (!election) return;
    if (selectedCandidates.length === 0) {
      alert('Please select at least one candidate.');
      return;
    }

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
        setHasVoted(true);
        setVotedAt(new Date().toISOString());
      } else {
        const err = await res.text();
        alert(`Failed to submit vote: ${err}`);
      }
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black overflow-hidden relative font-sans text-white">
        <UniversalHeader role="student" />
        <main className="flex-grow flex items-center justify-center pt-[120px]">
          <p className="text-slate-400">Loading...</p>
        </main>
      </div>
    );
  }

  // Check if user has voted - show success popup
  if (hasVoted) {
    return (
      <div className="min-h-screen bg-black overflow-hidden relative font-sans text-white">
        <UniversalHeader role="student" />
        <main className="flex-grow flex items-center justify-center relative pt-[120px]">
            <div 
              className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat"
              style={{ backgroundImage: `url(${bgImageUrl})`, filter: 'blur(10px) brightness(0.3)' }}
            />
            <div className="relative z-10">
              <div className="bg-white p-6 md:p-12 rounded-sm max-w-md w-full mx-4 text-center">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-black uppercase tracking-tighter mb-4">
                  Vote Submitted
                </h2>
                <p className="text-slate-600 mb-2">
                  Your vote has been cast successfully.
                </p>
                {votedAt && (
                  <p className="text-sm text-slate-500 mb-8">
                    Voted on: {new Date(votedAt).toLocaleString()}
                  </p>
                )}
                <button
                  onClick={async () => {
                    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/logout`, {
                      method: 'POST',
                      credentials: 'include',
                    });
                    router.push('/login');
                  }}
                  className="bg-[#4c0519] text-white px-8 py-4 rounded-sm text-[12px] font-black uppercase tracking-[0.3em] hover:bg-[#6b1324] transition-all w-full"
                >
                  Logout
                </button>
              </div>
            </div>
          </main>
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-black overflow-hidden relative font-sans text-white">
      <UniversalHeader role="student" userName={currentUser?.name} />

      <main className="flex-grow overflow-y-auto relative custom-scrollbar">
        <div 
          className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat transition-all duration-700"
          style={{ backgroundImage: `url(${bgImageUrl})`, filter: 'blur(10px) brightness(0.3)' }}
        />

        <div className="relative z-10 p-4 md:p-12 max-w-7xl mx-auto w-full">
            <StudentDashboard
              election={election}
              session={session}
              canVote={canVote}
              reason={reason}
              user={currentUser}
              candidates={candidates}
              selectedCandidates={selectedCandidates}
              onToggleCandidate={handleToggleCandidate}
              onViewProfile={handleViewProfile}
              onSubmitVote={handleSubmitVote}
              hasVoted={hasVoted}
              votedAt={votedAt}
            />
          </div>
        </main>

        {selectedCandidateProfile && (
          <CandidateProfileModal
            candidate={selectedCandidateProfile}
            onClose={() => setSelectedCandidateProfile(null)}
          />
        )}
      </div>
    );
}