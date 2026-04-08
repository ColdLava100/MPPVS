"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { 
  User, 
  LogIn, 
  Bell, 
  PlusCircle, 
  Search 
} from 'lucide-react';
import Image from 'next/image';

interface HeaderProps {
  // Pass null for landing page, or the specific role after login
  userRole?: 'student' | 'candidate' | 'admin' | 'superadmin' | null; 
}

export default function Header({ userRole = null }: HeaderProps) {
  const router = useRouter();

  return (
    <nav className="fixed top-0 left-0 right-0 z-[100] px-6 py-3 md:px-12 bg-[#1A0508] border-b border-[#C0A060]/30 shadow-2xl">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        
        {/* LEFT: Official KPM Branding */}
        <div 
          className="flex items-center gap-4 cursor-pointer group" 
          onClick={() => router.push('/')}
        >

          <div className="hidden sm:block">
            <h2 className="text-white font-black text-xs uppercase tracking-[0.3em] leading-none">KPM Beranang</h2>
            <p className="text-[#C0A060] font-bold text-[8px] uppercase tracking-[0.4em] mt-1.5">Official Management Portal</p>
          </div>
        </div>

        {/* RIGHT: Conditional Actions */}
        <div className="flex items-center gap-3">
          
          {!userRole ? (
            /* --- GUEST STATE: Appears when userRole is null --- */
            <button 
              onClick={() => router.push('/login')}
              className="flex items-center gap-3 bg-white text-[#1A0508] px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-[#C0A060] transition-all duration-300 shadow-xl"
            >
              <LogIn size={14} />
              Sign In
            </button>
          ) : (
            /* --- AUTHENTICATED STATE: Appears when a role exists --- */
            <div className="flex items-center gap-4 animate-in fade-in slide-in-from-right-4 duration-500">
              
              {/* Functional Search Icon */}
              <button className="p-3 text-white/40 hover:text-[#C0A060] transition-colors">
                <Search size={20} />
              </button>

              {/* Superadmin/Admin Quick Action Button */}
              {(userRole === 'superadmin' || userRole === 'admin') && (
                <button 
                  className="p-3 bg-[#C0A060] rounded-xl text-[#1A0508] hover:bg-white transition-all shadow-lg"
                  title="New Announcement"
                >
                  <PlusCircle size={20} />
                </button>
              )}

              {/* Notification Hub */}
              <button className="relative p-3 bg-white/5 rounded-xl border border-white/10 text-white/60 hover:text-white transition-all">
                <Bell size={20} />
                <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-600 rounded-full border-2 border-[#1A0508]" />
              </button>

              <div className="h-8 w-[1px] bg-white/10 mx-2" />
              
              {/* Profile Shortcut with MPP Logo */}
              <button 
                onClick={() => router.push(`/dashboard/${userRole}`)}
                className="flex items-center gap-4 pl-2 pr-4 py-2 bg-white/5 border border-white/10 rounded-2xl hover:border-[#C0A060] transition-all group"
              >
                <div className="relative w-9 h-9 bg-white rounded-xl flex items-center justify-center p-1 overflow-hidden group-hover:scale-110 transition-transform">
                  <Image 
                    src="/logoMPP.png" 
                    alt="MPP Logo" 
                    width={28} 
                    height={28} 
                    className="object-contain"
                  />
                </div>
                <div className="hidden md:flex flex-col items-start">
                  <span className="text-[8px] font-black text-[#C0A060] uppercase tracking-widest leading-none">Session</span>
                  <span className="text-[10px] font-bold text-white uppercase tracking-tighter mt-1">{userRole}</span>
                </div>
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}