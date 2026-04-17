import Link from 'next/link';
import { MapPin, ArrowRight } from 'lucide-react';
import { Property } from '@/types';
import { Badge } from '@/components/ui/badge';

interface PropertyCardProps {
  property: Property;
}

export default function PropertyCard({ property }: PropertyCardProps) {
  const statusColors = {
    'Approved': 'bg-green-100 text-green-700 font-bold',
    'Pending': 'bg-amber-100 text-amber-700 font-bold',
    'Rejected': 'bg-red-100 text-red-700 font-bold'
  };

  return (
    <div className="luxury-card group flex flex-col h-full hover:-translate-y-1">
      <div className="relative aspect-[16/10] overflow-hidden">
        <img 
          src={property.imageUrl} 
          alt={property.title} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          referrerPolicy="no-referrer"
        />
        <div className="absolute top-4 right-4">
          <Badge variant="outline" className={`rounded-md uppercase tracking-widest px-2 py-1 text-[10px] border-none backdrop-blur-md shadow-sm ${statusColors[property.status]}`}>
            {property.status}
          </Badge>
        </div>
      </div>
      <div className="p-6 flex flex-col flex-grow bg-white">
        <div className="card-price text-2xl font-bold text-sky-600 mb-1">
          K{property.price.toLocaleString()}
        </div>
        <h3 className="text-lg font-bold text-slate-900 mb-2">{property.title}</h3>
        <div className="flex items-center gap-2 text-sm text-slate-500 mb-6 flex-grow">
          <MapPin className="w-4 h-4 text-sky-500" /> {property.location}
        </div>
        <Link href={`/property/${property.id}`} className="mt-auto">
          <button className="flex items-center justify-center gap-2 w-full py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-100 transition-all group-hover:text-sky-600 group-hover:border-sky-200">
            View Details <ArrowRight className="w-4 h-4" />
          </button>
        </Link>
      </div>
    </div>
  );
}
