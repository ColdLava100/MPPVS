'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import UniversalHeader from '@/components/ui/universal-header';
import AuditLogTable from '@/components/ui/AuditLogTable';

export default function AuditLogsPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const authRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
          credentials: 'include',
        });
        if (authRes.status === 401 || authRes.status === 403) {
          router.push('/login');
          return;
        }
      } catch {
        router.push('/login');
        return;
      }
      setIsLoading(false);
    };
    checkAuth();
  }, [router]);

  if (isLoading) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
        }}
      >
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black overflow-hidden relative font-sans text-white">
      <UniversalHeader role="superadmin" />

      <main className="flex-grow overflow-y-auto relative custom-scrollbar pt-[120px]">
        <div className="relative z-10 p-12 max-w-7xl mx-auto w-full flex flex-col gap-8">
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.push('/dashboard/superadmin')}
              className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
            >
              <ArrowLeft size={20} />
              <span className="text-[10px] font-black uppercase tracking-widest">
                Back to Dashboard
              </span>
            </button>
          </div>

          <div className="p-8 bg-white/95 backdrop-blur-xl border border-white/20 shadow-2xl rounded-sm">
            <h1 className="text-2xl font-bold uppercase tracking-tighter text-black mb-6">
              Audit Logs
            </h1>
            <AuditLogTable />
          </div>
        </div>
      </main>
    </div>
  );
}
