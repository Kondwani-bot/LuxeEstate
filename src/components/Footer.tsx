import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="py-12 bg-white border-t border-slate-200">
      <div className="container px-4 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="text-sm font-medium text-slate-500">
          &copy; 2024 Luxe Estate Portal. All rights reserved.
        </div>
        <div className="flex items-center gap-8">
          <Link href="/collections" className="text-sm font-semibold text-slate-600 hover:text-sky-600 transition-colors">Properties</Link>
          <Link href="/about" className="text-sm font-semibold text-slate-600 hover:text-sky-600 transition-colors">About</Link>
          <Link href="/contact" className="text-sm font-semibold text-slate-600 hover:text-sky-600 transition-colors">Contact</Link>
        </div>
      </div>
    </footer>
  );
}
