'use client';

import { LayoutDashboard, PlusCircle, List, LogOut, ShieldCheck, Settings, User } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Suspense } from 'react';

interface SidebarProps {
  role: 'member' | 'admin';
}

function SidebarInner({ role }: SidebarProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentTab = searchParams.get('tab');

  const memberLinks = [
    { name: 'My Listings', path: '/dashboard', match: (p: string, param: string | null) => p === '/dashboard' && param !== 'submit', icon: List },
    { name: 'Submit Property', path: '/dashboard?tab=submit', match: (p: string, param: string | null) => p === '/dashboard' && param === 'submit', icon: PlusCircle },
    { name: 'Inquiries', path: '/dashboard/inquiries', match: (p: string, param: string | null) => p === '/dashboard/inquiries', icon: ShieldCheck },
  ];

  const adminLinks = [
    { name: 'Pending Review', path: '/admin', match: (p: string, param: string | null) => p === '/admin', icon: ShieldCheck },
    { name: 'All Listings', path: '/admin/all', match: (p: string, param: string | null) => p === '/admin/all', icon: List },
    { name: 'Members', path: '/admin/members', match: (p: string, param: string | null) => p === '/admin/members', icon: User },
    { name: 'Settings', path: '/admin/settings', match: (p: string, param: string | null) => p === '/admin/settings', icon: Settings },
  ];

  const links = role === 'member' ? memberLinks : adminLinks;

  return (
    <div className="w-64 h-full bg-white border-r border-slate-200 flex flex-col py-8 shadow-sm relative z-20">
      <div className="px-6 mb-12">
        <div className="text-[10px] uppercase tracking-[0.3em] text-sky-600 font-bold mb-1">Luxe Estate Portal</div>
        <div className="text-lg font-bold tracking-tight text-slate-800">{role === 'member' ? 'Member Access' : 'Administrator'}</div>
      </div>

      <nav className="flex-1 px-4 space-y-2">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = link.match(pathname, currentTab);
          return (
            <Link
              key={link.name}
              href={link.path}
              className={cn(
                "flex items-center gap-3 px-4 py-3 text-xs font-bold uppercase tracking-widest transition-all rounded-xl",
                isActive 
                  ? "bg-sky-50 text-sky-700 border border-sky-100" 
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-900 border border-transparent"
              )}
            >
              <Icon className="w-4 h-4 mt-[-1px]" />
              {link.name}
            </Link>
          );
        })}
      </nav>

      <div className="px-4 mt-auto">
        <Link
          href="/"
          className="flex items-center gap-3 px-4 py-3 text-xs font-bold uppercase tracking-widest text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-all rounded-xl"
        >
          <LogOut className="w-4 h-4 mt-[-1px]" />
          Return Home
        </Link>
      </div>
    </div>
  );
}

export default function Sidebar({ role }: SidebarProps) {
  return (
    <Suspense fallback={<div className="w-64 h-full bg-white border-r border-slate-200" />}>
      <SidebarInner role={role} />
    </Suspense>
  );
}
