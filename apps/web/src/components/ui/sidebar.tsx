"use client";

import React, { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { 
  Home, 
  Vote, 
  Users, 
  Radio,
  Megaphone, 
  LogOut,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ShieldCheck, 
  Settings,    
  History,     // Icon for Audit Logs
  Upload,      // Icon for Campaign Override
  CheckSquare  // Icon for Ballot Preview
} from 'lucide-react';

interface SidebarProps {
  role: 'student' | 'candidate' | 'admin' | 'superadmin';
}

export default function UniversalSidebar({ role }: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isExpanded, setIsExpanded] = useState(false);
  const [openSubMenu, setOpenSubMenu] = useState<string | null>(null);

  const toggleSubMenu = (label: string) => {
    if (!isExpanded) setIsExpanded(true);
    setOpenSubMenu(openSubMenu === label ? null : label);
  };

  const menuConfigs = {
    // 1. STUDENT SIDEBAR CONFIGURATION
    student: [
      { label: 'HOME', icon: Home, path: '/dashboard/student' },
      { label: 'VOTE', icon: Vote, path: '/ballot' },
      { 
        label: 'CANDIDATES', 
        icon: Users, 
        path: '#',
        subItems: [
          { label: 'ALL', path: '/dashboard/student/candidates/all' },
          { label: 'DBS', path: '/dashboard/student/candidates/dbs' },
          { label: 'DCS', path: '/dashboard/student/candidates/dcs' },
          { label: 'DIA', path: '/dashboard/student/candidates/dia' },
          { label: 'DLH', path: '/dashboard/student/candidates/dlh' },
          { label: 'CFAB', path: '/dashboard/student/candidates/cfab' },
        ]
      },
      { label: 'LIVE RESULTS', icon: Radio, path: '/dashboard/student/results' },
    ],
    // 2. CANDIDATE SIDEBAR CONFIGURATION
    candidate: [
      { label: 'HOME', icon: Home, path: '/dashboard/candidate' },
      { label: 'VOTE', icon: Vote, path: '/ballot' },
      { 
        label: 'CAMPAIGN', 
        icon: Megaphone, 
        path: '#',
        subItems: [
          { label: 'MANIFESTO', path: '/dashboard/candidate/manifesto' },
          { label: 'POSTER', path: '/dashboard/candidate/poster' },
          { label: 'SLIDES', path: '/dashboard/candidate/slides' },
          { label: 'VIDEO', path: '/dashboard/candidate/video' },
        ]
      },
      { label: 'LIVE RESULTS', icon: Radio, path: '/dashboard/student/results' },
    ],
    admin: [], 
    // 3. SUPERADMIN SIDEBAR CONFIGURATION
    superadmin: [
      { label: 'DASHBOARD', icon: Home, path: '/dashboard/superadmin' },
      { 
        label: 'CANDIDATE HUB', 
        icon: ShieldCheck, 
        path: '#',
        subItems: [
          { label: 'VALIDATION', path: '/dashboard/superadmin/candidates/validate' },
          { label: 'INTERVIEWS', path: '/dashboard/superadmin/candidates/interviews' },
        ]
      },
      { 
        label: 'ELECTION CONTROL', 
        icon: Settings, 
        path: '#',
        subItems: [
          { label: 'VOTING SLOTS', path: '/dashboard/superadmin/election/slots' },
          { label: 'TIME SETTINGS', path: '/dashboard/superadmin/election/timing' },
        ]
      },
      { label: 'BROADCAST', icon: Megaphone, path: '/dashboard/superadmin/broadcast' },
      { 
        label: 'SYSTEM & TESTING', 
        icon: CheckSquare, 
        path: '#',
        subItems: [
          { label: 'CAMPAIGN OVERRIDE', path: '/dashboard/superadmin/testing/override' },
          { label: 'BALLOT PREVIEW', path: '/dashboard/superadmin/testing/preview' },
        ]
      },
      { label: 'AUDIT LOGS', icon: History, path: '/dashboard/superadmin/logs' },
      { label: 'LIVE ANALYTICS', icon: Radio, path: '/dashboard/superadmin/analytics' },
    ]
  };

  const menuItems = menuConfigs[role] || [];

  return (
    <aside 
      className={`fixed left-4 top-4 bottom-4 transition-all duration-500 z-[150] flex flex-col rounded-[2.5rem] border border-white/10 shadow-2xl ${
        isExpanded ? 'w-72' : 'w-24'
      } bg-white/5 backdrop-blur-3xl`}
    >
      {/* Sidebar Toggle Handle */}
      <div className="absolute -right-4 top-1/2 -translate-y-1/2 z-50">
        <button 
          onClick={() => { setIsExpanded(!isExpanded); if (isExpanded) setOpenSubMenu(null); }}
          className="w-9 h-9 rounded-full bg-white/10 backdrop-blur-2xl flex items-center justify-center text-white border border-white/20 hover:bg-white/20 transition-all shadow-xl"
        >
          {isExpanded ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
        </button>
      </div>

      {/* Top Branding / Logo */}
      <div className="p-8 mb-4 flex justify-center">
        <div className="w-14 h-14 bg-gradient-to-br from-white/20 to-transparent backdrop-blur-md rounded-[1.25rem] flex items-center justify-center border border-white/20 shadow-lg">
           <span className="text-white font-black text-2xl tracking-tighter italic uppercase">W</span>
        </div>
      </div>

      {/* Nav Items Container */}
      <nav className="flex-grow px-4 flex flex-col gap-2 overflow-y-auto no-scrollbar">
        {menuItems.map((item) => {
          const hasSubItems = !!item.subItems;
          const isActive = pathname === item.path;
          const isSubOpen = openSubMenu === item.label;

          return (
            <div key={item.label} className="w-full">
              <button
                onClick={() => hasSubItems ? toggleSubMenu(item.label) : router.push(item.path)}
                className={`flex items-center gap-5 p-4 rounded-2xl transition-all group relative w-full ${
                  isActive || isSubOpen ? 'bg-white/10 text-white border border-white/5' : 'text-white/30 hover:text-white hover:bg-white/5'
                }`}
              >
                <item.icon size={22} className="shrink-0" />
                {isExpanded && (
                  <div className="flex flex-grow items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] whitespace-nowrap">{item.label}</span>
                    {hasSubItems && <ChevronDown size={14} className={`transition-transform duration-300 ${isSubOpen ? 'rotate-180' : ''}`} />}
                  </div>
                )}
                {/* Active Indicator Line */}
                {isActive && <div className="absolute left-0 w-1.5 h-6 bg-white rounded-r-full shadow-[0_0_15px_rgba(255,255,255,0.6)]" />}
              </button>

              {/* Sub-menu rendering */}
              {isExpanded && hasSubItems && isSubOpen && (
                <div className="mt-2 ml-10 flex flex-col gap-1 border-l border-white/10">
                  {item.subItems?.map((sub) => (
                    <button
                      key={sub.label}
                      onClick={() => router.push(sub.path)}
                      className="py-3 px-6 text-[9px] font-black text-white/30 hover:text-white uppercase tracking-[0.4em] text-left transition-colors"
                    >
                      {sub.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Bottom Logout Action */}
      <div className="p-6 mt-auto">
        <button 
          className="w-full flex items-center gap-5 p-4 rounded-2xl text-white/20 hover:text-red-400 hover:bg-red-500/10 transition-all group"
          onClick={() => router.push('/')}
        >
          <LogOut size={22} />
          {isExpanded && <span className="text-[10px] font-black uppercase tracking-[0.3em]">LOGOUT</span>}
        </button>
      </div>
    </aside>
  );
}