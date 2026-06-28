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
    window.dispatchEvent(new Event('onboardingClosed'));
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-md overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-white rounded-[2rem] p-6 sm:p-8 md:p-10 max-w-lg w-full shadow-2xl relative border border-slate-200 overflow-hidden my-auto"
          >
            <button 
              onClick={closePopup}
              className="absolute top-5 right-5 sm:top-6 sm:right-6 p-2.5 bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200 rounded-full transition-all hover:rotate-90 z-20"
              title="Close Popup"
            >
              <X className="w-5 h-5"/>
            </button>

            <div className="text-center mb-8 pt-2">
              <div className="w-14 h-14 bg-sky-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Info className="w-7 h-7 text-sky-600" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mb-2 tracking-tight uppercase">Welcome to Luxe Estate</h2>
              <p className="text-xs sm:text-sm text-slate-500 font-medium max-w-md mx-auto leading-relaxed">
                The premier destination for premium verified properties. Here is how to get started:
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-100 group hover:border-sky-200 transition-colors">
                <div className="w-9 h-9 rounded-xl bg-sky-50 flex items-center justify-center mb-3 group-hover:bg-sky-500 transition-colors">
                  <House className="w-4 h-4 text-sky-600 group-hover:text-white transition-colors" />
                </div>
                <h3 className="font-bold text-slate-900 mb-1 uppercase tracking-widest text-[11px]">For Clients</h3>
                <p className="text-[11px] text-slate-500 leading-normal">
                  Browse verified listings, filter your dream home, and book instant AI voice tours.
                </p>
              </div>

              <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-100 group hover:border-sky-200 transition-colors">
                <div className="w-9 h-9 rounded-xl bg-sky-50 flex items-center justify-center mb-3 group-hover:bg-sky-500 transition-colors">
                  <User className="w-4 h-4 text-sky-600 group-hover:text-white transition-colors" />
                </div>
                <h3 className="font-bold text-slate-900 mb-1 uppercase tracking-widest text-[11px]">For Members</h3>
                <p className="text-[11px] text-slate-500 leading-normal">
                  List luxury estates and track scheduled client tours from your dashboard.
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button 
                onClick={closePopup}
                className="flex-1 h-13 bg-slate-900 text-white rounded-xl font-bold uppercase tracking-wider text-xs hover:bg-slate-800 transition-all shadow-lg flex items-center justify-center gap-2 active:scale-95 py-3.5"
              >
                Explore Properties <ChevronRight className="w-4 h-4" />
              </button>
              <button 
                onClick={closePopup}
                className="h-13 px-6 bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900 rounded-xl font-bold uppercase tracking-wider text-xs transition-all flex items-center justify-center active:scale-95 py-3.5"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
