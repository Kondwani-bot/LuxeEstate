import Link from 'next/link';
import { MapPin, ArrowRight } from 'lucide-react';
import { Property } from '@/types';
import { Badge } from '@/components/ui/badge';

interface PropertyCardProps {
  property: Property;
}

export default function PropertyCard({ property }: PropertyCardProps) {
  const statusColors = {
    'Approved': 'bg-green-500/20 text-green-400',
    'Pending': 'bg-amber-500/20 text-amber-400',
    'Rejected': 'bg-red-500/20 text-red-400'
  };

  return (
    <div className="luxury-card group">
      <div className="relative aspect-[16/10] overflow-hidden">
        <img 
          src={property.imageUrl} 
          alt={property.title} 
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          referrerPolicy="no-referrer"
        />
        <div className="absolute top-4 right-4">
          <Badge variant="outline" className={`rounded-md uppercase tracking-widest px-2 py-1 text-[10px] font-bold border-none backdrop-blur-md ${statusColors[property.status]}`}>
            {property.status}
          </Badge>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-black/60 to-transparent"></div>
      </div>
      <div className="p-6">
        <div className="card-price text-2xl font-bold text-accent mb-1">
          K{property.price.toLocaleString()}
        </div>
        <h3 className="text-lg font-semibold mb-2">{property.title}</h3>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <MapPin className="w-4 h-4" /> {property.location}
        </div>
        <Link href={`/property/${property.id}`}>
          <button className="btn-details w-full py-3 bg-white/5 border border-glass-border rounded-xl text-sm font-medium hover:bg-white/10 transition-all">
            View Details
          </button>
        </Link>
      </div>
    </div>
  );
}
