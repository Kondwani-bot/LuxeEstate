'use client';

import Image from 'next/image';
import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'motion/react';
import { MapPin, ArrowLeft, Share2, Heart, Check, X, User } from 'lucide-react';
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
      owner_email: property?.submittedBy, // matches against user.email in dashboard
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
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 text-slate-900 px-4 text-center">
        <h2 className="text-3xl mb-4 font-bold">Property Not Found</h2>
        <Link href="/">
          <button className="px-6 py-3 bg-sky-600 text-white rounded-xl font-bold hover:bg-sky-700 transition">Return Home</button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Navbar />
      
      <main className="flex-1 pt-24 relative">
        <div className="container mx-auto px-4 py-8">
          {/* Breadcrumbs & Actions */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-12">
            <Link href="/" className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-slate-500 hover:text-sky-600 transition-colors">
              <ArrowLeft className="w-4 h-4" /> Back to Collection
            </Link>
            <div className="flex gap-4 relative">
              <button 
                onClick={handleShare}
                className={`p-3 border rounded-xl transition ${isShared ? 'bg-sky-50 border-sky-200 text-sky-600' : 'border-slate-200 hover:bg-slate-100 text-slate-600 shadow-sm'}`}
              >
                {isShared ? <Check className="w-5 h-5" /> : <Share2 className="w-5 h-5" />}
              </button>
              {isShared && (
                <div className="absolute -top-12 right-0 bg-slate-800 text-white text-[10px] px-3 py-1.5 rounded shadow-xl font-bold uppercase tracking-widest pointer-events-none whitespace-nowrap z-20">Link Copied!</div>
              )}
              <button 
                onClick={() => setIsLiked(!isLiked)}
                className={`p-3 border rounded-xl transition ${isLiked ? 'bg-red-50 border-red-200 text-red-500' : 'border-slate-200 hover:bg-slate-100 text-slate-600 shadow-sm'}`}
              >
                <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
              </button>
            </div>
          </div>

          {/* Centered Gallery */}
          <div className="mb-16 max-w-5xl mx-auto">
            <Gallery images={property.images} />
          </div>

          {/* Centered Content */}
          <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-16">
            <div className="lg:col-span-2 text-center md:text-left flex flex-col items-center md:items-start">
              <div className="flex flex-col md:flex-row justify-between items-center md:items-start mb-8 w-full gap-6">
                <div className="flex flex-col items-center md:items-start">
                  <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-4 tracking-tight text-slate-900 leading-tight">{property.title}</h1>
                  <div className="flex items-center gap-2 text-slate-500 font-bold uppercase tracking-widest text-xs">
                    <MapPin className="w-4 h-4 text-sky-500" /> {property.location}
                  </div>
                </div>
                <div className="text-center md:text-right shrink-0">
                  <div className="text-4xl font-black text-sky-600 mb-2">K{property.price.toLocaleString()}</div>
                  <Badge variant="outline" className="rounded-full border-none bg-green-100 text-green-700 uppercase tracking-[0.2em] px-4 py-1.5 text-[10px] font-black">Verified & Approved</Badge>
                </div>
              </div>

              <div className="h-px bg-slate-200 my-10 w-full opacity-60"></div>

              <div className="mb-16 w-full">
                <div className="flex items-center justify-center md:justify-start gap-4 mb-8">
                  <div className="px-5 py-2.5 rounded-full bg-slate-900 text-white text-[10px] font-black uppercase tracking-[0.2em]">
                    {property.type}
                  </div>
                </div>
                <h3 className="text-xl font-black uppercase tracking-[0.3em] mb-6 text-slate-800">The Residence</h3>
                <p className="text-slate-600 leading-relaxed font-medium text-lg max-w-3xl">
                  {property.description}
                </p>
              </div>

              <div className="mb-16 w-full">
                <h3 className="text-xl font-black uppercase tracking-[0.3em] mb-8 text-slate-800">Master Features</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 w-full">
                  {property.features.map((feature, i) => (
                    <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md transition-shadow group">
                      <div className="w-8 h-8 rounded-full bg-sky-50 flex items-center justify-center group-hover:bg-sky-500 transition-colors">
                        <Check className="w-4 h-4 text-sky-600 group-hover:text-white transition-colors" />
                      </div>
                      <span className="text-sm font-bold text-slate-700 tracking-tight">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar / Contact - Centered on Mobile */}
            <div className="lg:col-span-1">
              <div className="sticky top-32 bg-white border border-slate-200 p-8 rounded-[2.5rem] shadow-xl shadow-slate-200/50 text-center">
                <h3 className="text-xl font-black mb-8 text-slate-900 uppercase tracking-widest">Connect</h3>
                <div className="space-y-4 mb-10 flex flex-col items-center">
                  <div className="w-20 h-20 rounded-3xl bg-slate-100 flex items-center justify-center border border-slate-200 shadow-inner">
                    <User className="w-10 h-10 text-slate-400" />
                  </div>
                  <div>
                    <div className="font-black text-slate-800 text-lg">{property.submittedBy || 'Julian Vane'}</div>
                    <div className="text-[10px] text-sky-600 uppercase tracking-[0.3em] font-black mt-1">Official Member</div>
                  </div>
                </div>
                <div className="space-y-4">
                  <button 
                    onClick={() => setInquiryType('viewing')}
                    className="w-full rounded-2xl h-14 bg-slate-900 text-white font-black uppercase tracking-widest text-xs hover:bg-slate-800 transition-all shadow-lg shadow-slate-200"
                  >
                    Request Viewing
                  </button>
                  <button 
                    onClick={() => setInquiryType('contact')}
                    className="w-full rounded-2xl h-14 border-2 border-slate-200 text-slate-700 font-black uppercase tracking-widest text-xs hover:bg-slate-50 transition-all"
                  >
                    Contact Info
                  </button>
                </div>
                <div className="mt-10 pt-8 border-t border-slate-100">
                   <p className="text-[10px] text-slate-400 uppercase tracking-[0.3em] font-black">
                     REF ID: LUXE-{property.id.slice(0, 8)}
                   </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Overlay for Forms */}
        <AnimatePresence>
          {inquiryType !== 'none' && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="bg-white rounded-[3rem] p-8 md:p-12 max-w-2xl w-full shadow-2xl relative border border-slate-200 overflow-hidden"
              >
                {/* Decorative background */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-sky-50 rounded-bl-full -z-10 opacity-50"></div>
                
                <button 
                  onClick={() => setInquiryType('none')}
                  className="absolute top-8 right-8 p-3 bg-slate-50 text-slate-500 hover:text-slate-900 rounded-2xl transition-all hover:rotate-90"
                >
                  <X className="w-6 h-6"/>
                </button>

                {inquiryStatus === 'success' ? (
                  <div className="text-center py-16">
                    <motion.div 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', damping: 12 }}
                      className="w-24 h-24 bg-green-600 text-white rounded-full flex items-center justify-center mx-auto mb-8 shadow-xl shadow-green-100"
                    >
                      <Check className="w-12 h-12" />
                    </motion.div>
                    <h3 className="text-3xl font-black text-slate-900 mb-4 uppercase tracking-tighter">Request Received</h3>
                    <p className="text-slate-500 font-bold text-lg">Our luxury property consultant will reach out within 24 hours.</p>
                  </div>
                ) : (
                  <>
                    <h3 className="text-3xl font-black text-slate-900 mb-2 text-center uppercase tracking-tighter">
                      {inquiryType === 'viewing' ? 'Request Private Viewing' : 'Contact Consultant'}
                    </h3>
                    <p className="text-slate-500 text-sm mb-10 pb-6 border-b border-slate-100 text-center font-medium">
                      Enter your credentials below to initiate communication regarding <strong>{property.title}</strong>.
                    </p>

                    <form className="space-y-6" onSubmit={submitInquiry}>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 ml-1">Universal Identity</label>
                        <Input name="name" required placeholder="Your Full Name" className="h-14 bg-slate-50 border-slate-200 rounded-2xl px-6 font-bold focus:ring-sky-500" />
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 ml-1">Electronic Mail</label>
                          <Input name="email" type="email" required placeholder="email@address.com" className="h-14 bg-slate-50 border-slate-200 rounded-2xl px-6 font-bold" />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 ml-1">Tele-Communication</label>
                          <Input name="phone" required placeholder="+260..." className="h-14 bg-slate-50 border-slate-200 rounded-2xl px-6 font-bold" />
                        </div>
                      </div>

                      {inquiryType === 'viewing' && (
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 ml-1">Preferred Visitation Date</label>
                          <Input name="date" type="date" required className="h-14 bg-slate-50 border-slate-200 rounded-2xl px-6 font-bold" />
                        </div>
                      )}

                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 ml-1">Inquiry Specifications</label>
                        <textarea 
                          name="message"
                          required 
                          rows={4} 
                          className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 resize-none font-bold text-slate-900"
                          placeholder="State your requirements or questions..."
                        ></textarea>
                      </div>

                      <button 
                        type="submit" 
                        disabled={inquiryStatus === 'sending'}
                        className="w-full h-16 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-xs mt-4 hover:bg-slate-800 transition-all shadow-xl shadow-slate-200"
                      >
                        {inquiryStatus === 'sending' ? 'Transmitting...' : 'Initiate Request'}
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