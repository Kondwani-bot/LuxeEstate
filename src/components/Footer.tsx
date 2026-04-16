import { Link } from 'react-router-dom';
import { Instagram, Twitter, Facebook, Mail } from 'lucide-react';
import AdminLoginPopup from './AdminLoginPopup';

export default function Footer() {
  return (
    <footer className="py-12 border-t border-glass-border">
      <div className="container px-4 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="text-sm text-muted-foreground">
          &copy; 2024 Lumina Real Estate. All rights reserved.
        </div>
        <div className="flex items-center gap-8">
          <Link to="#" className="text-sm text-muted-foreground hover:text-white transition-colors">Properties</Link>
          <Link to="#" className="text-sm text-muted-foreground hover:text-white transition-colors">About</Link>
          <Link to="#" className="text-sm text-muted-foreground hover:text-white transition-colors">Contact</Link>
          <AdminLoginPopup />
        </div>
      </div>
    </footer>
  );
}
