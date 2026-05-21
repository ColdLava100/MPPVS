"use client";

import React, { useState, useEffect } from 'react';
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
  Menu,
  X,
  LucideIcon
} from 'lucide-react';

interface HeaderProps {
  role?: 'student' | 'candidate' | 'admin' | 'superadmin' | 'mpp_advisor' | 'ec';
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
    { label: 'Voting Portal', href: '/dashboard/student', icon: LayoutDashboard },
    { label: 'Vote', href: '/ballot', icon: Vote },
  ],
  candidate: [
    { label: 'Dashboard', href: '/dashboard/candidate', icon: LayoutDashboard },
  ],
  admin: [
    { label: 'Dashboard', href: '/dashboard/admin', icon: LayoutDashboard },
  ],
  superadmin: [
    { label: 'System Admin', href: '/dashboard/superadmin', icon: LayoutDashboard },
  ],
  mpp_advisor: [
    { label: 'Dashboard', href: '/dashboard/mppadvisor', icon: LayoutDashboard },
  ],
  ec: [
    { label: 'EC Operations', href: '/dashboard/ec', icon: LayoutDashboard },
  ],
};

export default function UniversalHeader({ role = 'student', userName, onLogout }: HeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const navItems = navConfigs[role] || navConfigs.student;
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

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
    <>
      <header className="h-[72px] md:h-[100px] bg-[#4c0519]/95 backdrop-blur-2xl text-white flex items-center justify-between px-4 md:px-8 w-full sticky top-0 z-[100] shadow-2xl border-b border-white/10">
        
        {/* LEFT SIDE: LOGO & BRANDING */}
        <div className="flex items-center gap-3 md:gap-4 shrink-0">
          <div 
            className="w-10 h-10 md:w-12 md:h-12 bg-white rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:scale-105 active:scale-95 transition-all cursor-pointer"
            onClick={() => router.push('/dashboard')}
          >
            <Vote className="w-5 h-5 md:w-6 md:h-6 text-[#4c0519]" />
          </div>
          
          <div className="flex flex-col">
            <span className="text-[11px] md:text-[12px] font-black uppercase tracking-[0.2em] leading-tight">
              SRC Voting
            </span>
            <span className="text-[8px] md:text-[9px] font-bold uppercase tracking-[0.3em] text-white/40">
              {role === 'ec' ? 'EC Operations' : role === 'admin' ? 'Administrator' : role === 'superadmin' ? 'Super Admin' : role === 'mpp_advisor' ? 'SRC Advisor' : role === 'candidate' ? 'Candidate' : 'Student Portal'}
            </span>
          </div>
        </div>

        {/* CENTER: HORIZONTAL NAVIGATION - DESKTOP ONLY */}
        <nav className="hidden items-center gap-1">
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
                <span className={`absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-yellow-500 transition-all ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-50'}`} />
              </Link>
            );
          })}
        </nav>

        {/* RIGHT SIDE: USER & LOGOUT */}
        <div className="flex items-center gap-2 md:gap-4">
          {userName && (
            <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-white/5 rounded-lg border border-white/10">
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
            className="hidden md:flex items-center gap-2 px-4 py-2.5 rounded-lg text-white/60 hover:text-white hover:bg-white/5 border border-white/10 hover:border-white/20 transition-all group"
          >
            <LogOut size={14} className="group-hover:translate-x-0.5 transition-transform" />
            <span className="text-[10px] font-black uppercase tracking-[0.15em]">
              Logout
            </span>
          </button>

          {/* HAMBURGER BUTTON - MOBILE ONLY */}
          <button
            onClick={() => setMenuOpen(true)}
            className="md:hidden flex items-center justify-center w-10 h-10 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-all"
            aria-label="Open menu"
          >
            <Menu size={22} />
          </button>
        </div>
      </header>

      {/* MOBILE DRAWER OVERLAY */}
      {menuOpen && (
        <div className="fixed inset-0 z-[200] md:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setMenuOpen(false)} />
          <div className="absolute top-0 right-0 h-full w-[280px] max-w-[85vw] bg-[#4c0519] shadow-2xl border-l border-white/10 flex flex-col">
            {/* Drawer Header */}
            <div className="flex items-center justify-between px-5 py-5 border-b border-white/10">
              <span className="text-[13px] font-black uppercase tracking-[0.2em] text-white">Navigation</span>
              <button
                onClick={() => setMenuOpen(false)}
                className="flex items-center justify-center w-9 h-9 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-all"
                aria-label="Close menu"
              >
                <X size={20} />
              </button>
            </div>

            {/* User Info (mobile) */}
            {userName && (
              <div className="flex items-center gap-3 px-5 py-4 bg-white/5 border-b border-white/5">
                <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center shrink-0">
                  <span className="text-[12px] font-black text-black uppercase">
                    {userName.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="min-w-0">
                  <p className="text-[12px] font-bold text-white truncate">{userName}</p>
                  <p className="text-[9px] text-white/50 uppercase tracking-wider">{role}</p>
                </div>
              </div>
            )}

            {/* Nav Items */}
            <nav className="flex-1 overflow-y-auto py-4 px-3">
              {navItems.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMenuOpen(false)}
                    className={`flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all mb-1 ${
                      isActive
                        ? 'bg-white/10 text-white'
                        : 'text-white/60 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <Icon size={18} className={isActive ? 'text-yellow-500' : 'text-white/50'} />
                    <span className="text-[12px] font-black uppercase tracking-[0.15em]">{item.label}</span>
                    {isActive && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-yellow-500" />}
                  </Link>
                );
              })}
            </nav>

            {/* Logout button at bottom */}
            <div className="px-3 py-4 border-t border-white/10">
              <button
                onClick={() => { setMenuOpen(false); handleLogout(); }}
                className="flex items-center gap-4 w-full px-4 py-3.5 rounded-xl text-white/60 hover:text-white hover:bg-white/5 transition-all"
              >
                <LogOut size={18} />
                <span className="text-[12px] font-black uppercase tracking-[0.15em]">Logout</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}