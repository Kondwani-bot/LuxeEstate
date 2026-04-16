import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { LogIn, X, User } from 'lucide-react';
import { CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

export default function MemberLoginPopup() {
  const [isOpen, setIsOpen] = useState(false);

  const handleGoogleLogin = () => {
    // Mock login - redirect to member dashboard
    window.location.href = '/dashboard';
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="btn-glass text-sm font-medium flex items-center gap-2"
      >
        <User className="w-4 h-4" /> Member Login
      </button>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md luxury-card border-none shadow-2xl overflow-hidden"
            >
              <div className="bg-white/5 p-8 text-white flex justify-between items-center border-b border-glass-border">
                <div className="flex items-center gap-3">
                  <LogIn className="w-6 h-6 text-accent" />
                  <h3 className="text-xl uppercase tracking-widest font-bold">Member Access</h3>
                </div>
                <button onClick={() => setIsOpen(false)} className="hover:text-accent transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="p-8 space-y-6">
                <div className="text-center mb-8">
                  <CardTitle className="text-3xl mb-2 text-white">Welcome Back</CardTitle>
                  <CardDescription className="uppercase tracking-widest text-[10px] text-muted-foreground">
                    Access your exclusive portfolio
                  </CardDescription>
                </div>

                <button 
                  onClick={handleGoogleLogin}
                  className="w-full h-14 rounded-xl bg-white/5 text-white border border-glass-border hover:bg-white/10 flex items-center justify-center gap-3 transition-all"
                >
                  <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
                  <span className="text-sm font-bold uppercase tracking-widest">Sign in with Google</span>
                </button>
                
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-glass-border"></span>
                  </div>
                  <div className="relative flex justify-center text-[10px] uppercase tracking-widest">
                    <span className="bg-background px-4 text-muted-foreground">Member Access Only</span>
                  </div>
                </div>
                
                <p className="text-center text-[9px] text-muted-foreground font-light leading-relaxed uppercase tracking-widest">
                  By signing in, you agree to LuxeEstate's <br />
                  <span className="underline cursor-pointer hover:text-white transition-colors">Terms of Service</span> and <span className="underline cursor-pointer hover:text-white transition-colors">Privacy Policy</span>.
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
