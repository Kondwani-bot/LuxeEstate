'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, User, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'motion/react';

import MemberLoginPopup from './MemberLoginPopup';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const isDashboard = pathname?.includes('dashboard');

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Collection', path: '/' },
    { name: 'About', path: '#' },
    { name: 'Contact', path: '#' },
  ];

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
      isScrolled || isDashboard ? 'bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm py-4' : 'bg-transparent py-8'
    }`}>
      <div className="container px-4 flex justify-between items-center">
        <Link href="/" className="text-2xl font-extrabold tracking-tighter logo-gradient">
          ZICTA ESTATE
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-12">
          <div className="flex gap-8">
            {navLinks.map((link) => (
               <Link 
                key={link.name} 
                href={link.path} 
                className={`text-sm font-semibold transition-colors ${isScrolled || isDashboard ? 'text-slate-600 hover:text-sky-600' : 'text-slate-800 hover:text-sky-600 object-outline'}`}
              >
                {link.name}
              </Link>
            ))}
          </div>
          <div className="flex items-center gap-4">
            <MemberLoginPopup />
          </div>
        </div>

        {/* Mobile Toggle */}
        <button 
          className="md:hidden text-slate-800"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-full left-0 right-0 bg-white/95 backdrop-blur-xl border-b border-slate-200 shadow-lg p-8 md:hidden flex flex-col gap-6 text-center"
          >
            {navLinks.map((link) => (
              <Link 
                key={link.name} 
                href={link.path} 
                className="text-sm uppercase tracking-widest font-bold text-slate-600 hover:text-sky-600 transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {link.name}
              </Link>
            ))}
            <div onClick={() => setIsMobileMenuOpen(false)}>
              <MemberLoginPopup />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
