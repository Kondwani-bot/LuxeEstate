import Image from 'next/image';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, Maximize2, X } from 'lucide-react';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';

interface GalleryProps {
  images: string[];
}

export default function Gallery({ images }: GalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isSlideshowActive, setIsSlideshowActive] = useState(true);

  const galleryImages = images.length > 0 ? images : ['https://picsum.photos/seed/placeholder/1200/800'];

  useEffect(() => {
    if (!isSlideshowActive || galleryImages.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % galleryImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [isSlideshowActive, galleryImages.length]);

  const nextImage = () => {
    setIsSlideshowActive(false);
    setCurrentIndex((prev) => (prev + 1) % galleryImages.length);
  };

  const prevImage = () => {
    setIsSlideshowActive(false);
    setCurrentIndex((prev) => (prev - 1 + galleryImages.length) % galleryImages.length);
  };

  return (
    <div className="space-y-4">
      {/* Main Display */}
      <div className="relative aspect-[16/9] overflow-hidden rounded-3xl border border-slate-200 group shadow-lg">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.6 }}
            className="absolute inset-0"
          >
            <Image
              src={galleryImages[currentIndex]}
              alt={`Property view ${currentIndex + 1}`}
              fill
              priority
              className="object-cover"
              sizes="(max-width: 1200px) 100vw, 1200px"
              referrerPolicy="no-referrer"
              quality={95}
            />
          </motion.div>
        </AnimatePresence>

        {/* Controls */}
        {galleryImages.length > 1 && (
          <div className="absolute inset-0 flex items-center justify-between px-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <button 
              onClick={prevImage}
              className="w-12 h-12 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:bg-black/60 transition-all shadow-xl"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button 
              onClick={nextImage}
              className="w-12 h-12 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:bg-black/60 transition-all shadow-xl"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>
        )}

        {/* Lightbox Trigger */}
        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <Dialog>
            <DialogTrigger render={
              <button className="w-10 h-10 rounded-xl bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:bg-black/60 transition-all shadow-lg">
                <Maximize2 className="w-5 h-5" />
              </button>
            } />
            <DialogContent className="max-w-[95vw] max-h-[95vh] p-0 bg-transparent border-none shadow-none flex items-center justify-center">
              <div className="relative w-full h-[90vh] flex items-center justify-center">
                <Image 
                  src={galleryImages[currentIndex]} 
                  alt="Full view" 
                  fill
                  className="object-contain rounded-xl"
                  referrerPolicy="no-referrer"
                  quality={100}
                />
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Progress Dots */}
        {galleryImages.length > 1 && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
            {galleryImages.map((_, i) => (
              <button
                key={i}
                onClick={() => {
                  setIsSlideshowActive(false);
                  setCurrentIndex(i);
                }}
                className={`h-1.5 rounded-full transition-all duration-300 shadow-sm ${
                  i === currentIndex ? 'w-8 bg-sky-500' : 'w-2 bg-white/60'
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Thumbnails */}
      <div className="grid grid-cols-4 md:grid-cols-6 gap-4">
        {galleryImages.map((img, i) => (
          <button
            key={i}
            onClick={() => {
              setIsSlideshowActive(false);
              setCurrentIndex(i);
            }}
            className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all duration-300 shadow-sm ${
              i === currentIndex ? 'border-sky-500 scale-95' : 'border-transparent opacity-60 hover:opacity-100 hover:scale-105'
            }`}
          >
            <Image 
              src={img} 
              alt={`Thumbnail ${i + 1}`} 
              fill
              className="object-cover"
              sizes="(max-width: 768px) 25vw, 15vw"
              referrerPolicy="no-referrer"
            />
          </button>
        ))}
      </div>
    </div>
  );
}