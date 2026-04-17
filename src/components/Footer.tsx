import Link from 'next/link';
import { Instagram, Twitter, Facebook, Mail } from 'lucide-react';
import AdminLoginPopup from './AdminLoginPopup';

export default function Footer() {
  return (
    <footer className="py-12 bg-white border-t border-slate-200">
      <div className="container px-4 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="text-sm font-medium text-slate-500">
          &copy; 2024 ZICTA Estate Portal. All rights reserved.
        </div>
        <div className="flex items-center gap-8">
          <Link href="#" className="text-sm font-semibold text-slate-600 hover:text-sky-600 transition-colors">Properties</Link>
          <Link href="#" className="text-sm font-semibold text-slate-600 hover:text-sky-600 transition-colors">About</Link>
          <Link href="#" className="text-sm font-semibold text-slate-600 hover:text-sky-600 transition-colors">Contact</Link>
          <AdminLoginPopup />
        </div>
      </div>
    </footer>
  );
}
