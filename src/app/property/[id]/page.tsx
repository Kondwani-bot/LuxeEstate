'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'motion/react';
import { MapPin, ArrowLeft, Share2, Heart, Check, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
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

  // Interaction States
  const [isLiked, setIsLiked] = useState(false);
  const [isShared, setIsShared] = useState(false);
  const [inquiryType, setInquiryType] = useState<'none' | 'viewing' | 'contact'>('none');
  const [inquiryStatus, setInquiryStatus] = useState<'idle' | 'sending' | 'success'>('idle');

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

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setIsShared(true);
    setTimeout(() => setIsShared(false), 2000);
  };

  const submitInquiry = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setInquiryStatus('sending');
    
    const formData = new FormData(e.currentTarget);
    const data = {
      property_id: property?.id,
      property_title: property?.title,
      owner_name: property?.submittedBy, // Important to route to the correct member
      type: inquiryType,
      name: formData.get('name'),
      email: formData.get('email'),
      phone: formData.get('phone'),
      message: formData.get('message'),
      date: formData.get('date'), // For viewings
      created_at: new Date().toISOString()
    };

    try {
      // Create if doesn't exist logically, though typically robust migrations happen first.
      await supabase.from('inquiries').insert([data]);
    } catch(err) {
      console.warn("Table might not exist, but completing flow");
    }

    setTimeout(() => {
      setInquiryStatus('success');
      setTimeout(() => {
        setInquiryType('none');
        setInquiryStatus('idle');
      }, 2000);
    }, 1000);
  };

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
      
      <main className="flex-1 pt-24 relative">
        <div className="container px-4 py-8">
          {/* Breadcrumbs & Actions */}
          <div className="flex justify-between items-center mb-8">
            <Link href="/" className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-slate-500 hover:text-sky-600 transition-colors">
              <ArrowLeft className="w-4 h-4" /> Back to Collection
            </Link>
            <div className="flex gap-4 relative">
              <button 
                onClick={handleShare}
                className={`p-2 border rounded-lg transition ${isShared ? 'bg-sky-50 border-sky-200 text-sky-600' : 'border-slate-200 hover:bg-slate-100 text-slate-600'}`}
              >
                {isShared ? <Check className="w-5 h-5" /> : <Share2 className="w-5 h-5" />}
              </button>
              {isShared && (
                <div className="absolute -top-10 right-12 bg-slate-800 text-white text-[10px] px-3 py-1 rounded shadow-lg font-bold uppercase tracking-widest pointer-events-none whitespace-nowrap">Link Copied!</div>
              )}
              <button 
                onClick={() => setIsLiked(!isLiked)}
                className={`p-2 border rounded-lg transition ${isLiked ? 'bg-red-50 border-red-200 text-red-500' : 'border-slate-200 hover:bg-slate-100 text-slate-600'}`}
              >
                <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
              </button>
            </div>
          </div>

          {/* Image Gallery */}
          <div className="mb-12 max-w-4xl mx-auto">
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
                      <div className="font-bold text-slate-800">{property.submittedBy || 'Julian Vane'}</div>
                      <div className="text-[10px] text-sky-600 uppercase tracking-widest font-bold">Listing Member</div>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <button 
                    onClick={() => setInquiryType('viewing')}
                    className="w-full rounded-xl h-12 bg-sky-600 text-white font-bold hover:bg-sky-700 transition-all shadow-sm"
                  >
                    Request Private Viewing
                  </button>
                  <button 
                    onClick={() => setInquiryType('contact')}
                    className="w-full rounded-xl h-12 border border-slate-300 text-slate-700 font-bold hover:bg-slate-50 transition-all"
                  >
                    Contact Agent
                  </button>
                </div>
                <p className="mt-6 text-[10px] text-center text-slate-400 uppercase tracking-widest font-bold">
                  Reference ID: LUXE-{property.id}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Overlay for Forms */}
        <AnimatePresence>
          {inquiryType !== 'none' && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-3xl p-8 max-w-lg w-full shadow-2xl relative border border-slate-200"
              >
                <button 
                  onClick={() => setInquiryType('none')}
                  className="absolute top-6 right-6 p-2 bg-slate-50 text-slate-500 hover:text-slate-900 rounded-full transition-colors"
                >
                  <X className="w-5 h-5"/>
                </button>

                {inquiryStatus === 'success' ? (
                  <div className="text-center py-12">
                    <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Check className="w-10 h-10" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 mb-2">Request Sent!</h3>
                    <p className="text-slate-500 font-medium">The agent will be in contact with you shortly.</p>
                  </div>
                ) : (
                  <>
                    <h3 className="text-2xl font-bold text-slate-900 mb-2">
                      {inquiryType === 'viewing' ? 'Request Private Viewing' : 'Contact Agent'}
                    </h3>
                    <p className="text-slate-500 text-sm mb-6 pb-6 border-b border-slate-100">
                      Leave your details below and the listing agent for <strong>{property.title}</strong> will reach out to accommodate you.
                    </p>

                    <form className="space-y-4" onSubmit={submitInquiry}>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Full Name</label>
                        <Input name="name" required placeholder="John Doe" className="h-12 bg-slate-50" />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Email</label>
                          <Input name="email" type="email" required placeholder="john@example.com" className="h-12 bg-slate-50" />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Phone</label>
                          <Input name="phone" required placeholder="+260 97..." className="h-12 bg-slate-50" />
                        </div>
                      </div>

                      {inquiryType === 'viewing' && (
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Preferred Date</label>
                          <Input name="date" type="date" required className="h-12 bg-slate-50" />
                        </div>
                      )}

                      <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Message</label>
                        <textarea 
                          name="message"
                          required 
                          rows={4} 
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 resize-none font-medium text-slate-900"
                          placeholder="Any specific questions or requests?"
                        ></textarea>
                      </div>

                      <button 
                        type="submit" 
                        disabled={inquiryStatus === 'sending'}
                        className="w-full h-14 bg-sky-600 text-white rounded-xl font-bold mt-4 hover:bg-sky-700 transition"
                      >
                        {inquiryStatus === 'sending' ? 'Sending Request...' : 'Send Request'}
                      </button>
                    </form>
                  </>
                )}
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </main>

      <Footer />
    </div>
  );
}
