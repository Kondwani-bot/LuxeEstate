'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, User } from 'lucide-react';
import { CardTitle, CardDescription } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function MemberLoginPopup() {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`
        }
      });
      if (error) throw error;
      // Note: Supabase handles the redirect automatically for OAuth
    } catch (error) {
      console.error('Error logging in with Google:', error);
      setLoading(false);
    }
  };

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-md bg-white rounded-3xl overflow-hidden shadow-2xl border border-slate-200"
          >
            <div className="bg-slate-50 p-8 text-slate-800 flex items-center gap-4 border-b border-slate-200">
              <button 
                onClick={() => setIsOpen(false)} 
                className="hover:text-sky-600 transition-colors flex items-center gap-2"
                title="Go Back"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h3 className="text-xl uppercase tracking-widest font-bold">Member Access</h3>
            </div>

            <div className="p-8 space-y-6">
              <div className="text-center mb-8">
                <CardTitle className="text-3xl mb-2 text-slate-900">Welcome Back</CardTitle>
                <CardDescription className="uppercase tracking-widest text-[10px] text-slate-500">
                  Access your exclusive portfolio
                </CardDescription>
              </div>

              <button 
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full h-14 rounded-xl bg-white text-slate-800 border border-slate-200 hover:bg-slate-50 shadow-sm flex items-center justify-center gap-3 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="text-sm font-bold uppercase tracking-widest text-slate-400 animate-pulse">Connecting...</span>
                ) : (
                  <>
                    <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
                    <span className="text-sm font-bold uppercase tracking-widest">Sign in with Google</span>
                  </>
                )}
              </button>
              
              <div className="relative mt-8">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-slate-200"></span>
                </div>
                <div className="relative flex justify-center text-[10px] uppercase tracking-widest">
                  <span className="bg-white px-4 text-slate-500">Member Access Only</span>
                </div>
              </div>
              
              <p className="text-center mt-6 text-[9px] text-slate-500 font-light leading-relaxed uppercase tracking-widest">
                By signing in, you agree to Luxe Estate's <br />
                <span className="underline cursor-pointer hover:text-slate-800 transition-colors">Terms of Service</span> and <span className="underline cursor-pointer hover:text-slate-800 transition-colors">Privacy Policy</span>.
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="btn-glass text-sm font-medium flex items-center gap-2"
      >
        <User className="w-4 h-4" /> Member Login
      </button>
      {mounted && createPortal(modalContent, document.body)}
    </>
  );
}
