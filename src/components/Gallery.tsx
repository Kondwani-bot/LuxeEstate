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

  useEffect(() => {
    if (!isSlideshowActive) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [isSlideshowActive, images.length]);

  const nextImage = () => {
    setIsSlideshowActive(false);
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setIsSlideshowActive(false);
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div className="space-y-4">
      {/* Main Display */}
      <div className="relative aspect-[16/9] overflow-hidden rounded-3xl border border-glass-border group">
        <AnimatePresence mode="wait">
          <motion.img
            key={currentIndex}
            src={images[currentIndex]}
            alt={`Property view ${currentIndex + 1}`}
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.7 }}
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </AnimatePresence>

        {/* Controls */}
        <div className="absolute inset-0 flex items-center justify-between px-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button 
            onClick={prevImage}
            className="w-12 h-12 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:bg-black/60 transition-all"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button 
            onClick={nextImage}
            className="w-12 h-12 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:bg-black/60 transition-all"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>

        {/* Lightbox Trigger */}
        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <Dialog>
            <DialogTrigger asChild>
              <button className="w-10 h-10 rounded-xl bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:bg-black/60 transition-all">
                <Maximize2 className="w-5 h-5" />
              </button>
            </DialogTrigger>
            <DialogContent className="max-w-[95vw] max-h-[95vh] p-0 bg-transparent border-none shadow-none flex items-center justify-center">
              <div className="relative w-full h-full flex items-center justify-center">
                <img 
                  src={images[currentIndex]} 
                  alt="Full view" 
                  className="max-w-full max-h-[90vh] object-contain rounded-xl"
                  referrerPolicy="no-referrer"
                />
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Progress Dots */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
          {images.map((_, i) => (
            <button
              key={i}
              onClick={() => {
                setIsSlideshowActive(false);
                setCurrentIndex(i);
              }}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === currentIndex ? 'w-8 bg-accent' : 'w-2 bg-white/40'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Thumbnails */}
      <div className="grid grid-cols-4 md:grid-cols-6 gap-4">
        {images.map((img, i) => (
          <button
            key={i}
            onClick={() => {
              setIsSlideshowActive(false);
              setCurrentIndex(i);
            }}
            className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all duration-300 ${
              i === currentIndex ? 'border-accent scale-95' : 'border-transparent opacity-60 hover:opacity-100'
            }`}
          >
            <img 
              src={img} 
              alt={`Thumbnail ${i + 1}`} 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </button>
        ))}
      </div>
    </div>
  );
}
