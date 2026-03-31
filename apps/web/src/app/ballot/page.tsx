"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function BallotPage() {
  const [selectedCandidate, setSelectedCandidate] = useState<string | null>(null);
  const router = useRouter();

  const candidates = [
    { id: '1', name: 'Alice Smith', vision: 'Transparency and action.' },
    { id: '2', name: 'Bob Jones', vision: 'Building a better community.' },
    { id: '3', name: 'Charlie Brown', vision: 'Focusing on student needs.' },
  ];

  const handleSubmit = () => {
    if (selectedCandidate) {
      router.push('/success');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8 flex flex-col items-center">
      <div className="w-full max-w-2xl space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">Official Ballot</h1>
          <p className="text-gray-600">Please select one candidate for President.</p>
        </div>

        <div className="space-y-4">
          {candidates.map((c) => (
            <div 
              key={c.id}
              onClick={() => setSelectedCandidate(c.id)}
              className={`p-6 border-2 rounded-xl cursor-pointer transition-all ${selectedCandidate === c.id ? 'border-blue-600 bg-blue-50' : 'border-gray-200 bg-white hover:border-blue-300'}`}
            >
              <h2 className="text-xl font-semibold text-gray-900">{c.name}</h2>
              <p className="text-gray-500 mt-1">{c.vision}</p>
            </div>
          ))}
        </div>

        <button
          onClick={handleSubmit}
          disabled={!selectedCandidate}
          className={`w-full py-4 text-lg font-bold rounded-xl transition ${selectedCandidate ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
        >
          Submit Vote
        </button>
      </div>
    </div>
  );
}
