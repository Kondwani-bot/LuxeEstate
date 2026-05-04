'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, User, ChevronRight, House, Info } from 'lucide-react';

export default function OnboardingPopup() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const hasSeenPopup = localStorage.getItem('onboardingSeen');
    if (!hasSeenPopup) {
      setIsOpen(true);
    }
  }, []);

  const closePopup = () => {
    setIsOpen(false);
    localStorage.setItem('onboardingSeen', 'true');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-white rounded-[2.5rem] p-8 md:p-12 max-w-2xl w-full shadow-2xl relative border border-slate-200 overflow-hidden"
          >
            <button 
              onClick={closePopup}
              className="absolute top-8 right-8 p-3 bg-slate-50 text-slate-500 hover:text-slate-900 rounded-2xl transition-all hover:rotate-90"
            >
              <X className="w-6 h-6"/>
            </button>

            <div className="text-center mb-10">
              <div className="w-16 h-16 bg-sky-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Info className="w-8 h-8 text-sky-600" />
              </div>
              <h2 className="text-3xl font-black text-slate-900 mb-4 tracking-tight uppercase">Welcome to Luxe Estate</h2>
              <p className="text-slate-500 font-medium max-w-md mx-auto">
                The premier destination for premium verified properties. Here is how to get started:
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
              <div className="p-6 rounded-3xl bg-slate-50 border border-slate-100 group hover:border-sky-200 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-sky-50 flex items-center justify-center mb-4 group-hover:bg-sky-500 transition-colors">
                  <House className="w-5 h-5 text-sky-600 group-hover:text-white transition-colors" />
                </div>
                <h3 className="font-bold text-slate-900 mb-2 uppercase tracking-widest text-xs">For Clients</h3>
                <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                  Browse our verified listings, use advanced filters to find your dream home, and contact agents directly.
                </p>
              </div>

              <div className="p-6 rounded-3xl bg-slate-50 border border-slate-100 group hover:border-sky-200 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-sky-50 flex items-center justify-center mb-4 group-hover:bg-sky-500 transition-colors">
                  <User className="w-5 h-5 text-sky-600 group-hover:text-white transition-colors" />
                </div>
                <h3 className="font-bold text-slate-900 mb-2 uppercase tracking-widest text-xs">For Members</h3>
                <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                  Sign up as a luxury member to list your properties and manage inquiries through your dedicated dashboard.
                </p>
              </div>
            </div>

            <button 
              onClick={closePopup}
              className="w-full h-16 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-slate-800 transition-all shadow-xl flex items-center justify-center gap-2"
            >
              Explore Properties <ChevronRight className="w-4 h-4" />
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
