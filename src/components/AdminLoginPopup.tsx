import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, X, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useNavigate } from 'react-router-dom';

export default function AdminLoginPopup() {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (email === 'admin@gmail.com' && password === '1234') {
      setIsOpen(false);
      navigate('/admin');
    } else {
      setError('Invalid credentials. Please try again.');
    }
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="text-[10px] uppercase tracking-[0.5em] text-muted-foreground/30 hover:text-muted-foreground transition-colors py-4"
      >
        Admin Access
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
              className="relative w-full max-w-md glass-panel rounded-3xl overflow-hidden shadow-2xl"
            >
              <div className="bg-white/5 p-8 text-white flex justify-between items-center border-b border-glass-border">
                <div className="flex items-center gap-3">
                  <Shield className="w-6 h-6 text-accent" />
                  <h3 className="text-xl uppercase tracking-widest font-bold">Admin Console</h3>
                </div>
                <button onClick={() => setIsOpen(false)} className="hover:text-accent transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleLogin} className="p-8 space-y-6">
                <div className="space-y-2">
                  <Label className="uppercase tracking-widest text-[10px] text-muted-foreground">Admin Email</Label>
                  <Input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@gmail.com" 
                    className="luxury-input bg-white/5 border border-glass-border rounded-xl px-4 h-12"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label className="uppercase tracking-widest text-[10px] text-muted-foreground">Security Key</Label>
                  <Input 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••" 
                    className="luxury-input bg-white/5 border border-glass-border rounded-xl px-4 h-12"
                    required
                  />
                </div>

                {error && <p className="text-red-400 text-[10px] uppercase tracking-widest">{error}</p>}

                <button type="submit" className="w-full rounded-xl h-12 bg-accent text-black font-bold hover:bg-accent/90 flex items-center justify-center gap-2 transition-all">
                  Authenticate <ArrowRight className="w-4 h-4" />
                </button>
                
                <p className="text-center text-[9px] text-muted-foreground uppercase tracking-widest">
                  Authorized Personnel Only &mdash; All actions are logged
                </p>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
