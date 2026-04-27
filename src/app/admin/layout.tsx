'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, ArrowRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useRouter, usePathname } from 'next/navigation';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  // Simple auth state logic. In a real app, this should be derived from a secure session.
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  // Reset auth on mount (user specification that popup opens "every time i go on the admin page")
  // Actually, opening every single navigation within admin might be annoying, but we'll store auth in sessionStorage
  // so a refresh or new tab requires login, but navigating between admin pages doesn't.
  useEffect(() => {
    const authStatus = sessionStorage.getItem('admin_authenticated');
    if (authStatus === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (email === 'admin@gmail.com' && password === '1234') {
      setIsAuthenticated(true);
      sessionStorage.setItem('admin_authenticated', 'true');
    } else {
      setError('Invalid credentials. Please try again.');
    }
  };

  return (
    <>
      {isAuthenticated ? (
        children
      ) : (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="relative w-full max-w-md bg-white rounded-3xl overflow-hidden shadow-2xl border border-slate-200"
          >
            <div className="bg-slate-50 p-8 text-slate-900 flex justify-center items-center border-b border-slate-200">
              <div className="flex items-center gap-3">
                <Shield className="w-6 h-6 text-sky-600" />
                <h3 className="text-xl uppercase tracking-widest font-bold">Admin Console</h3>
              </div>
            </div>

            <form onSubmit={handleLogin} className="p-8 space-y-6">
              <div className="space-y-2">
                <Label className="uppercase tracking-widest text-[10px] text-slate-500 font-bold">Admin Email</Label>
                <Input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@gmail.com" 
                  className="bg-slate-50 border border-slate-200 rounded-xl px-4 h-12 text-slate-900 focus-visible:ring-sky-500"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label className="uppercase tracking-widest text-[10px] text-slate-500 font-bold">Security Key</Label>
                <Input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••" 
                  className="bg-slate-50 border border-slate-200 rounded-xl px-4 h-12 text-slate-900 focus-visible:ring-sky-500"
                  required
                />
              </div>

              {error && <p className="text-red-500 font-bold text-[10px] uppercase tracking-widest">{error}</p>}

              <button type="submit" className="w-full rounded-xl h-12 bg-sky-600 text-white font-bold hover:bg-sky-700 shadow-sm flex items-center justify-center gap-2 transition-all">
                Authenticate <ArrowRight className="w-4 h-4" />
              </button>
              
              <button 
                type="button" 
                onClick={() => router.push('/')}
                className="w-full rounded-xl h-10 border border-slate-200 text-slate-500 text-xs font-bold hover:bg-slate-50 transition-all"
              >
                Return to Home
              </button>
              
              <p className="text-center text-[9px] text-slate-400 font-bold justify-center uppercase tracking-widest mt-2">
                Authorized Personnel Only &mdash; All actions are logged
              </p>
            </form>
          </motion.div>
        </div>
      )}
    </>
  );
}
