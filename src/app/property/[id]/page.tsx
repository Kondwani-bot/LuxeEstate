'use client';

import { use } from 'react';
import Link from 'next/link';
import { motion } from 'motion/react';
import { MapPin, ArrowLeft, Share2, Heart, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MOCK_PROPERTIES } from '@/data/mockData';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

import Gallery from '@/components/Gallery';

export default function PropertyDetails({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const property = MOCK_PROPERTIES.find(p => p.id === id);

  if (!property) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-white">
        <div className="text-center">
          <h2 className="text-3xl mb-4 font-bold">Property Not Found</h2>
          <Link href="/">
            <button className="btn-glass">Return Home</button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background text-white">
      <Navbar />
      
      <main className="flex-1 pt-24">
        <div className="container px-4 py-8">
          {/* Breadcrumbs & Actions */}
          <div className="flex justify-between items-center mb-8">
            <Link href="/" className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-muted-foreground hover:text-white transition-colors">
              <ArrowLeft className="w-4 h-4" /> Back to Collection
            </Link>
            <div className="flex gap-4">
              <button className="btn-glass p-2"><Share2 className="w-5 h-5" /></button>
              <button className="btn-glass p-2"><Heart className="w-5 h-5" /></button>
            </div>
          </div>

          {/* Image Gallery */}
          <div className="mb-12">
            <Gallery images={property.images} />
          </div>

          {/* Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
            <div className="lg:col-span-2">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h1 className="text-4xl md:text-5xl font-bold mb-2">{property.title}</h1>
                  <div className="flex items-center gap-2 text-muted-foreground font-medium">
                    <MapPin className="w-4 h-4" /> {property.location}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-accent mb-1">K{property.price.toLocaleString()}</div>
                  <Badge variant="outline" className="rounded-lg border-none bg-accent/20 text-accent uppercase tracking-widest px-3 py-1 text-[10px] font-bold">Approved</Badge>
                </div>
              </div>

              <div className="h-px bg-glass-border my-8"></div>

              <div className="mb-12">
                <div className="flex items-center gap-4 mb-6">
                  <div className="px-4 py-2 rounded-xl bg-white/5 border border-glass-border text-xs font-bold uppercase tracking-widest">
                    {property.type}
                  </div>
                </div>
                <h3 className="text-xl font-bold uppercase tracking-widest mb-4">Description</h3>
                <p className="text-muted-foreground leading-relaxed font-medium">
                  {property.description}
                </p>
              </div>

              <div className="mb-12">
                <h3 className="text-xl font-bold uppercase tracking-widest mb-6">Features & Amenities</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-y-4">
                  {property.features.map((feature, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded-full bg-accent/20 flex items-center justify-center">
                        <Check className="w-3 h-3 text-accent" />
                      </div>
                      <span className="text-sm font-medium">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar / Contact */}
            <div className="lg:col-span-1">
              <div className="sticky top-32 glass-panel p-8 rounded-3xl shadow-2xl">
                <h3 className="text-xl font-bold mb-6">Inquire About This Property</h3>
                <div className="space-y-4 mb-8">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-white/10 overflow-hidden border border-glass-border">
                      <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=agent" alt="Agent" />
                    </div>
                    <div>
                      <div className="font-bold">Julian Vane</div>
                      <div className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Senior Portfolio Manager</div>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <button className="w-full rounded-xl h-12 bg-accent text-black font-bold hover:bg-accent/90 transition-all">Request Private Viewing</button>
                  <button className="btn-glass w-full h-12 font-bold">Contact Agent</button>
                </div>
                <p className="mt-6 text-[10px] text-center text-muted-foreground uppercase tracking-widest font-bold">
                  Reference ID: LUM-{property.id}
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
