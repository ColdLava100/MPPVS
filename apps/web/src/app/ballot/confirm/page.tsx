"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ShieldCheck, 
  AlertCircle, 
  CheckCircle2, 
  ChevronLeft, 
  ArrowRight,
  Fingerprint
} from 'lucide-react';
import StudentHeader from '@/components/ui/header';
import Footer from '@/components/ui/footer';

export default function ConfirmVotePage() {
  const router = useRouter();
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [course, setCourse] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Mock data to match your current candidates
  const allCandidates = [
    { id: 101, name: "Muhammad Haziq Bin Razak", dept: "DCS", img: "/candidates/handsome.jpeg" },
    { id: 102, name: "Nurul Ain Binti Mansor", dept: "DCS", img: "https://images.pexels.com/photos/1181682/pexels-photo-1181682.jpeg" },
    { id: 103, name: "Ahmad Syahmi Bin Idris", dept: "DCS", img: "https://images.pexels.com/photos/2182970/pexels-photo-2182970.jpeg" },
    { id: 104, name: "Siti Sarah Binti Zulkifli", dept: "DCS", img: "https://images.pexels.com/photos/1181519/pexels-photo-1181519.jpeg" },
  ];

  useEffect(() => {
    const data = localStorage.getItem('temp_selection');
    if (data) {
      const parsed = JSON.parse(data);
      setSelectedIds(parsed.ids);
      setCourse(parsed.course);
    } else {
      router.push('/ballot');
    }
  }, [router]);

  const chosenCandidates = allCandidates.filter(c => selectedIds.includes(c.id));

  const handleFinalCast = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      const currentVotes = JSON.parse(localStorage.getItem('mpp_completed_votes') || '[]');
      localStorage.setItem('mpp_completed_votes', JSON.stringify([...currentVotes, course]));
      localStorage.removeItem('temp_selection');
      setIsSubmitting(false);
      setIsSuccess(true);
      setTimeout(() => router.push('/ballot'), 2500);
    }, 2000);
  };

  // SUCCESS STATE - Bright and encouraging
  if (isSuccess) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center text-center p-6">
        <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mb-8 border border-green-100">
          <CheckCircle2 size={48} className="text-green-500 animate-in zoom-in duration-500" />
        </div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Vote Recorded Successfully</h1>
        <p className="text-slate-400 text-xs font-medium uppercase tracking-[0.2em]">Redirecting you back to the ballot...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col">
      <StudentHeader />
      
      <main className="flex-grow flex flex-col items-center py-16 px-6 max-w-3xl mx-auto w-full">
        {/* Header Section */}
        <div className="flex flex-col items-center mb-12 text-center">
          <div className="h-14 w-14 bg-blue-50 rounded-2xl flex items-center justify-center border border-blue-100 mb-6 shadow-sm">
            <Fingerprint size={28} className="text-blue-600" />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 mb-2">Final Confirmation</h1>
          <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.3em]">Reviewing selections for {course}</p>
        </div>

        {/* Selected Candidates List */}
        <div className="w-full space-y-4 mb-10">
          {chosenCandidates.map(candidate => (
            <div key={candidate.id} className="flex items-center gap-5 bg-white border border-slate-200 p-4 rounded-2xl shadow-sm">
              <div className="h-16 w-16 rounded-xl overflow-hidden bg-slate-100 border border-slate-100 shrink-0">
                <img src={candidate.img} alt="" className="h-full w-full object-cover" />
              </div>
              <div className="flex-grow">
                <h3 className="font-bold text-slate-900 leading-tight">{candidate.name}</h3>
                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Candidate ID #{candidate.id}</p>
              </div>
              <div className="px-3 py-1 bg-slate-50 rounded-lg border border-slate-100">
                 <ShieldCheck size={14} className="text-blue-500" />
              </div>
            </div>
          ))}
        </div>

        {/* Warning Card */}
        <div className="w-full bg-amber-50 border border-amber-100 rounded-2xl p-6 mb-10 flex items-start gap-4">
          <AlertCircle className="text-amber-500 shrink-0" size={20} />
          <div>
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-amber-700 mb-1">Important Notice</h4>
            <p className="text-xs text-amber-800/70 leading-relaxed font-medium">
              Once submitted, your vote for the <strong>{course}</strong> department is final and cannot be modified. Please ensure your selection is correct.
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 w-full mt-auto sm:mt-0">
          <button 
            onClick={() => router.back()}
            disabled={isSubmitting}
            className="flex-1 bg-white border border-slate-200 py-4 rounded-xl text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
          >
            <ChevronLeft size={14} /> Change Choice
          </button>
          <button 
            onClick={handleFinalCast}
            disabled={isSubmitting}
            className="flex-[1.5] bg-slate-900 text-white py-4 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-blue-600 shadow-lg shadow-slate-200 transition-all flex items-center justify-center gap-2"
          >
            {isSubmitting ? "Securing Ballot..." : <>Confirm & Cast Vote <ArrowRight size={14} /></>}
          </button>
        </div>
      </main>

      <Footer />
    </div>
  );
}