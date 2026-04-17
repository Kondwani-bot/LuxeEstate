'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { motion } from 'motion/react';
import { MapPin, ArrowLeft, Share2, Heart, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MOCK_PROPERTIES } from '@/data/mockData';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Gallery from '@/components/Gallery';
import { supabase } from '@/lib/supabase';
import { Property } from '@/types';

export default function PropertyDetails({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const { data, error } = await supabase
          .from('properties')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;
        
        if (data) {
          setProperty({
            id: data.id,
            title: data.title,
            description: data.description,
            price: data.price,
            location: data.location,
            imageUrl: data.image_url,
            images: data.images || [],
            type: data.type as any,
            status: data.status as any,
            submittedBy: data.submitted_by || '',
            submittedAt: data.submitted_at,
            features: data.features || []
          });
        }
      } catch (err) {
        console.error('Error fetching. Searching mock data', err);
        const mockMatch = MOCK_PROPERTIES.find(p => p.id === id);
        if (mockMatch) setProperty(mockMatch);
      } finally {
        setLoading(false);
      }
    };
    fetchProperty();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-900">
        <div className="text-xl animate-pulse font-semibold">Loading property details...</div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 text-slate-900">
        <div className="text-center">
          <h2 className="text-3xl mb-4 font-bold">Property Not Found</h2>
          <Link href="/">
            <button className="px-6 py-3 bg-sky-600 text-white rounded-xl font-bold hover:bg-sky-700 transition">Return Home</button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Navbar />
      
      <main className="flex-1 pt-24">
        <div className="container px-4 py-8">
          {/* Breadcrumbs & Actions */}
          <div className="flex justify-between items-center mb-8">
            <Link href="/" className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-slate-500 hover:text-sky-600 transition-colors">
              <ArrowLeft className="w-4 h-4" /> Back to Collection
            </Link>
            <div className="flex gap-4">
              <button className="p-2 border border-slate-200 rounded-lg hover:bg-slate-100 text-slate-600 transition"><Share2 className="w-5 h-5" /></button>
              <button className="p-2 border border-slate-200 rounded-lg hover:bg-slate-100 text-slate-600 transition"><Heart className="w-5 h-5" /></button>
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
                  <h1 className="text-4xl md:text-5xl font-bold mb-2 text-slate-900">{property.title}</h1>
                  <div className="flex items-center gap-2 text-slate-500 font-medium">
                    <MapPin className="w-4 h-4 text-sky-500" /> {property.location}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-sky-600 mb-1">K{property.price.toLocaleString()}</div>
                  <Badge variant="outline" className="rounded-lg border-none bg-green-100 text-green-700 uppercase tracking-widest px-3 py-1 text-[10px] font-bold">Approved</Badge>
                </div>
              </div>

              <div className="h-px bg-slate-200 my-8"></div>

              <div className="mb-12">
                <div className="flex items-center gap-4 mb-6">
                  <div className="px-4 py-2 rounded-xl bg-slate-100 border border-slate-200 text-xs font-bold uppercase tracking-widest text-slate-700">
                    {property.type}
                  </div>
                </div>
                <h3 className="text-xl font-bold uppercase tracking-widest mb-4 text-slate-800">Description</h3>
                <p className="text-slate-600 leading-relaxed font-medium">
                  {property.description}
                </p>
              </div>

              <div className="mb-12">
                <h3 className="text-xl font-bold uppercase tracking-widest mb-6 text-slate-800">Features & Amenities</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-y-4">
                  {property.features.map((feature, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded-full bg-sky-100 flex items-center justify-center">
                        <Check className="w-3 h-3 text-sky-600" />
                      </div>
                      <span className="text-sm font-medium text-slate-700">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar / Contact */}
            <div className="lg:col-span-1">
              <div className="sticky top-32 bg-white border border-slate-200 p-8 rounded-3xl shadow-lg">
                <h3 className="text-xl font-bold mb-6 text-slate-900">Inquire About This Property</h3>
                <div className="space-y-4 mb-8">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-slate-100 overflow-hidden border border-slate-200">
                      <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=agent" alt="Agent" />
                    </div>
                    <div>
                      <div className="font-bold text-slate-800">Julian Vane</div>
                      <div className="text-[10px] text-sky-600 uppercase tracking-widest font-bold">Senior Portfolio Manager</div>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <button className="w-full rounded-xl h-12 bg-sky-600 text-white font-bold hover:bg-sky-700 transition-all shadow-sm">Request Private Viewing</button>
                  <button className="w-full rounded-xl h-12 border border-slate-300 text-slate-700 font-bold hover:bg-slate-50 transition-all">Contact Agent</button>
                </div>
                <p className="mt-6 text-[10px] text-center text-slate-400 uppercase tracking-widest font-bold">
                  Reference ID: LUXE-{property.id}
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
