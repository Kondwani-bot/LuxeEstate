import Image from 'next/image';
import Link from 'next/link';
import { MapPin, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { Property } from '@/types';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface PropertyCardProps {
  property: Property;
}

export default function PropertyCard({ property }: PropertyCardProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const statusColors = {
    'Approved': 'bg-green-100 text-green-700 font-bold',
    'Pending': 'bg-amber-100 text-amber-700 font-bold',
    'Rejected': 'bg-red-100 text-red-700 font-bold'
  };

  const images = property.images && property.images.length > 0 ? property.images : [property.imageUrl || 'https://picsum.photos/seed/placeholder/800/600'];

  const nextImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div className="luxury-card group flex flex-col h-full hover:shadow-2xl transition-all duration-500">
      <div className="relative aspect-[16/10] overflow-hidden rounded-t-2xl">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentImageIndex}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="absolute inset-0"
          >
            <Image 
              src={images[currentImageIndex]} 
              alt={property.title} 
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-1000"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              referrerPolicy="no-referrer"
              priority={false}
            />
          </motion.div>
        </AnimatePresence>
        
        {images.length > 1 && (
          <div className="absolute inset-0 flex items-center justify-between px-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button 
              onClick={prevImage}
              className="p-1 rounded-full bg-black/30 backdrop-blur-sm text-white hover:bg-black/50 transition z-10"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button 
              onClick={nextImage}
              className="p-1 rounded-full bg-black/30 backdrop-blur-sm text-white hover:bg-black/50 transition z-10"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}

        <div className="absolute top-4 right-4 z-10">
          <Badge variant="outline" className={`rounded-md uppercase tracking-widest px-2 py-1 text-[10px] border-none backdrop-blur-md shadow-sm ${statusColors[property.status]}`}>
            {property.status}
          </Badge>
        </div>
      </div>
      <div className="p-6 flex flex-col flex-grow bg-white relative z-10">
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
