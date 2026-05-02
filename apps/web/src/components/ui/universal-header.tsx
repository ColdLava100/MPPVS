"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  LayoutDashboard, 
  Vote, 
  Users, 
  Settings, 
  LogOut,
  Megaphone,
  BarChart3,
  Home,
  UserCog,
  ChevronRight,
  LucideIcon
} from 'lucide-react';

interface HeaderProps {
  role?: 'student' | 'candidate' | 'admin' | 'superadmin' | 'mpp_advisor' | 'spr';
  userName?: string;
  onLogout?: () => void;
}

interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

const navConfigs: Record<string, NavItem[]> = {
  student: [
    { label: 'Dashboard', href: '/dashboard/student', icon: LayoutDashboard },
    { label: 'Vote', href: '/ballot', icon: Vote },
    { label: 'Candidates', href: '/dashboard/student/candidates/all', icon: Users },
    { label: 'Results', href: '/dashboard/student/results', icon: BarChart3 },
  ],
  candidate: [
    { label: 'Dashboard', href: '/dashboard/candidate', icon: LayoutDashboard },
    { label: 'Campaign', href: '/dashboard/candidate/campaign', icon: Megaphone },
    { label: 'Profile', href: '/dashboard/candidate/profile', icon: UserCog },
  ],
  admin: [
    { label: 'Dashboard', href: '/dashboard/admin', icon: LayoutDashboard },
    { label: 'Elections', href: '/dashboard/admin', icon: Vote },
    { label: 'Candidates', href: '/dashboard/admin', icon: Users },
    { label: 'Sessions', href: '/dashboard/admin', icon: BarChart3 },
    { label: 'Settings', href: '/dashboard/admin', icon: Settings },
  ],
  superadmin: [
    { label: 'Dashboard', href: '/dashboard/superadmin', icon: LayoutDashboard },
    { label: 'Users', href: '/dashboard/superadmin', icon: Users },
    { label: 'Settings', href: '/dashboard/superadmin', icon: Settings },
  ],
  mpp_advisor: [
    { label: 'Dashboard', href: '/dashboard/mppadvisor', icon: LayoutDashboard },
    { label: 'Elections', href: '/dashboard/mppadvisor', icon: Vote },
    { label: 'Candidates', href: '/dashboard/mppadvisor', icon: Users },
    { label: 'Results', href: '/dashboard/mppadvisor', icon: BarChart3 },
  ],
  spr: [
    { label: 'Dashboard', href: '/dashboard/spr', icon: LayoutDashboard },
    { label: 'Elections', href: '/dashboard/spr', icon: Vote },
    { label: 'Candidates', href: '/dashboard/spr', icon: Users },
    { label: 'Voters', href: '/dashboard/spr', icon: Users },
    { label: 'Sessions', href: '/dashboard/spr', icon: BarChart3 },
  ],
};

export default function UniversalHeader({ role = 'student', userName, onLogout }: HeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const navItems = navConfigs[role] || navConfigs.student;

  const handleLogout = async () => {
    if (onLogout) {
      onLogout();
    } else {
      try {
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/logout`, {
          method: 'POST',
          credentials: 'include',
        });
        router.push('/login');
      } catch (err) {
        console.error('Logout error:', err);
        router.push('/login');
      }
    }
  };

  return (
    <header className="h-[100px] bg-[#4c0519]/95 backdrop-blur-2xl text-white flex items-center justify-between px-8 w-full sticky top-0 z-[100] shadow-2xl border-b border-white/10">
      
      {/* LEFT SIDE: LOGO & BRANDING */}
      <div className="flex items-center gap-4 shrink-0">
        <div 
          className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:scale-105 active:scale-95 transition-all cursor-pointer"
          onClick={() => router.push('/dashboard')}
        >
          <Vote className="w-6 h-6 text-[#4c0519]" />
        </div>
        
        <div className="flex flex-col">
          <span className="text-[12px] font-black uppercase tracking-[0.2em] leading-tight">
            MPP Voting
          </span>
          <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-white/40">
            {role === 'spr' ? 'SPR Portal' : role === 'admin' ? 'Administrator' : role === 'superadmin' ? 'Super Admin' : role === 'mpp_advisor' ? 'MPP Advisor' : role === 'candidate' ? 'Candidate' : 'Student Portal'}
          </span>
        </div>
      </div>

      {/* CENTER: HORIZONTAL NAVIGATION */}
      <nav className="flex items-center gap-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          const Icon = item.icon;
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                flex items-center gap-2 px-4 py-2.5 rounded-lg transition-all duration-300 relative group
                ${isActive 
                  ? 'bg-white/10 text-white' 
                  : 'text-white/60 hover:text-white hover:bg-white/5'
                }
              `}
            >
              <Icon size={14} className={isActive ? 'text-yellow-500' : 'text-white/50 group-hover:text-white'} />
              <span className="text-[10px] font-black uppercase tracking-[0.15em]">
                {item.label}
              </span>
              {/* Active indicator */}
              <span className={`absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-yellow-500 transition-all ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-50'}`} />
            </Link>
          );
        })}
      </nav>

      {/* RIGHT SIDE: USER & LOGOUT */}
      <div className="flex items-center gap-4">
        {userName && (
          <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-lg border border-white/10">
            <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
              <span className="text-[10px] font-black text-black uppercase">
                {userName.charAt(0).toUpperCase()}
              </span>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-white/80 max-w-[100px] truncate">
              {userName}
            </span>
          </div>
        )}
        
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-white/60 hover:text-white hover:bg-white/5 border border-white/10 hover:border-white/20 transition-all group"
        >
          <LogOut size={14} className="group-hover:translate-x-0.5 transition-transform" />
          <span className="text-[10px] font-black uppercase tracking-[0.15em]">
            Logout
          </span>
        </button>
      </div>
    </header>
  );
}