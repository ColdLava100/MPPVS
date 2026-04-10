'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminDashboard() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/2fa/status`, { 
          credentials: 'include' 
        });
        if (res.status === 401 || res.status === 403) {
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
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: '#fff', color: '#000', minHeight: '100vh', padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>Welcome to the Admin Dashboard</h1>
    </div>
  );
}