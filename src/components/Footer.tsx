import Link from 'next/link';
import { Building2, Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-slate-200 text-slate-800 pb-8 pt-20">
      <div className="container px-4 mx-auto max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          <div className="space-y-6">
            <Link href="/" className="inline-flex items-center gap-2">
              <Building2 className="w-8 h-8 text-sky-600" />
              <span className="text-xl font-bold tracking-tighter text-slate-900">LuxeEstate.</span>
            </Link>
            <p className="text-sm text-slate-500 leading-relaxed max-w-xs">
              The premier platform for finding, regulating, and promoting world-class real estate properties with inclusivity and sustainability.
            </p>
            <div className="flex items-center gap-4 text-slate-400">
              <a href="#" className="hover:text-sky-600 transition-colors"><Facebook className="w-5 h-5"/></a>
              <a href="#" className="hover:text-sky-600 transition-colors"><Twitter className="w-5 h-5"/></a>
              <a href="#" className="hover:text-sky-600 transition-colors"><Instagram className="w-5 h-5"/></a>
              <a href="#" className="hover:text-sky-600 transition-colors"><Linkedin className="w-5 h-5"/></a>
            </div>
          </div>

          <div>
            <h4 className="font-bold text-slate-900 mb-6 uppercase tracking-wider text-xs">Quick Links</h4>
            <ul className="space-y-4 text-sm text-slate-500 font-medium">
              <li><Link href="/" className="hover:text-sky-600 transition-colors">Home</Link></li>
              <li><Link href="/" className="hover:text-sky-600 transition-colors">Properties</Link></li>
              <li><Link href="/dashboard" className="hover:text-sky-600 transition-colors">Member Dashboard</Link></li>
              <li><Link href="/admin" className="hover:text-sky-600 transition-colors">Admin Portal</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-slate-900 mb-6 uppercase tracking-wider text-xs">Legal & Support</h4>
            <ul className="space-y-4 text-sm text-slate-500 font-medium">
              <li><Link href="#" className="hover:text-sky-600 transition-colors">Privacy Policy</Link></li>
              <li><Link href="#" className="hover:text-sky-600 transition-colors">Terms of Service</Link></li>
              <li><Link href="#" className="hover:text-sky-600 transition-colors">Regulatory Standards</Link></li>
              <li><Link href="#" className="hover:text-sky-600 transition-colors">Contact Support</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-slate-900 mb-6 uppercase tracking-wider text-xs">Contact Us</h4>
            <ul className="space-y-4 text-sm text-slate-500">
              <li className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                <span>123 Regulatory Tower, Suite 400<br/>Business District, 10001</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-sky-600 shrink-0" />
                <span>+1 (555) 123-4567</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-sky-600 shrink-0" />
                <span>support@luxeestate.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-xs font-semibold text-slate-400">
            &copy; {new Date().getFullYear()} Luxe Estate Portal. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}
