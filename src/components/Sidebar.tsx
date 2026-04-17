'use client';

import { LayoutDashboard, PlusCircle, List, LogOut, ShieldCheck, Settings } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

interface SidebarProps {
  role: 'member' | 'admin';
}

export default function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname();

  const memberLinks = [
    { name: 'My Listings', path: '/dashboard', icon: List },
    { name: 'Submit Property', path: '/dashboard/submit', icon: PlusCircle },
  ];

  const adminLinks = [
    { name: 'Pending Review', path: '/admin', icon: ShieldCheck },
    { name: 'All Listings', path: '/admin/all', icon: List },
    { name: 'Settings', path: '#', icon: Settings },
  ];

  const links = role === 'member' ? memberLinks : adminLinks;

  return (
    <div className="w-64 h-full bg-black/20 backdrop-blur-xl border-r border-glass-border flex flex-col py-8">
      <div className="px-6 mb-12">
        <div className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground mb-1">Lumina Portal</div>
        <div className="text-lg font-bold tracking-tight">{role === 'member' ? 'Member' : 'Admin'}</div>
      </div>

      <nav className="flex-1 px-4 space-y-2">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.path;
          return (
            <Link
              key={link.name}
              href={link.path}
              className={cn(
                "flex items-center gap-3 px-4 py-3 text-xs font-bold uppercase tracking-widest transition-all rounded-xl",
                isActive 
                  ? "bg-accent text-black" 
                  : "text-muted-foreground hover:bg-white/5 hover:text-white"
              )}
            >
              <Icon className="w-4 h-4" />
              {link.name}
            </Link>
          );
        })}
      </nav>

      <div className="px-4 mt-auto">
        <Link
          href="/"
          className="flex items-center gap-3 px-4 py-3 text-xs font-bold uppercase tracking-widest text-red-400 hover:bg-red-500/10 transition-all rounded-xl"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </Link>
      </div>
    </div>
  );
}
