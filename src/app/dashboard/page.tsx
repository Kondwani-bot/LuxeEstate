'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Plus, Search, Filter, MoreVertical, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MOCK_PROPERTIES } from '@/data/mockData';
import Sidebar from '@/components/Sidebar';
import Navbar from '@/components/Navbar';
import PropertyCard from '@/components/PropertyCard';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Property } from '@/types';

export default function MemberDashboard() {
  const [activeTab, setActiveTab] = useState('listings');
  const [user, setUser] = useState<any>(null);
  const [myListings, setMyListings] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user);
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const fetchUserProperties = async () => {
      if (!user) return;
      try {
        const { data, error } = await supabase
          .from('properties')
          .select('*')
          .eq('submitted_by', user.user_metadata?.full_name || 'John Member'); // Temporarily matching mock data logic until full real auth names are configured

        if (error) throw error;
        if (data) {
          const formattedData: Property[] = data.map(p => ({
            id: p.id,
            title: p.title,
            description: p.description,
            price: p.price,
            location: p.location,
            imageUrl: p.image_url,
            images: p.images || [],
            type: p.type as any,
            status: p.status as any,
            submittedBy: p.submitted_by || '',
            submittedAt: p.submitted_at,
            features: p.features || []
          }));
          setMyListings(formattedData);
        }
      } catch (err) {
        console.error('Error fetching user properties', err);
        setMyListings(MOCK_PROPERTIES.filter(p => p.submittedBy === 'John Member'));
      } finally {
        setLoading(false);
      }
    };

    fetchUserProperties();
  }, [user]);

  const stats = [
    { label: 'Total Listings', value: myListings.length, icon: MoreVertical },
    { label: 'Pending Review', value: myListings.filter(p => p.status === 'Pending').length, icon: Filter },
    { label: 'Approved', value: myListings.filter(p => p.status === 'Approved').length, icon: Plus },
  ];

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  const handlePropertySubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) {
      alert("You need to be logged in to submit a property");
      return;
    }

    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    const title = formData.get('title') as string;
    const price = Number(formData.get('price'));
    const location = formData.get('location') as string;
    const imageUrl = formData.get('imageUrl') as string;
    const description = formData.get('description') as string;

    try {
      const { data, error } = await supabase
        .from('properties')
        .insert([
          {
            title,
            description,
            price,
            location,
            image_url: imageUrl,
            images: [imageUrl],
            type: 'House', // Defaulting for simple form
            status: 'Pending',
            submitted_by: user.user_metadata?.full_name || 'John Member',
            features: []
          }
        ])
        .select();

      if (error) throw error;
      
      // Update UI manually using mapped type properties rather than waiting for next poll to load visual
      if (data && data.length > 0) {
        const newProperty: Property = {
          id: data[0].id,
          title: data[0].title,
          description: data[0].description,
          price: data[0].price,
          location: data[0].location,
          imageUrl: data[0].image_url,
          images: data[0].images || [],
          type: data[0].type as any,
          status: data[0].status as any,
          submittedBy: data[0].submitted_by || '',
          submittedAt: data[0].submitted_at,
          features: data[0].features || []
        };
        setMyListings(prev => [newProperty, ...prev]);
        setActiveTab('listings');
        (e.target as HTMLFormElement).reset(); // Reset form
      }
    } catch (error) {
      console.error('Error adding document: ', error);
      alert('Failed to submit listing. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const displayName = user?.user_metadata?.full_name || 'John Member';
  const displayInitials = displayName.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase();

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900">
      <Sidebar role="member" />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-20 border-b border-slate-200 bg-white/80 backdrop-blur-md flex items-center justify-between px-8 shrink-0 shadow-sm z-10">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-800">Member Dashboard</h1>
            <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">Manage your property portfolio</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <div className="text-sm font-bold text-slate-800">{displayName}</div>
              <div className="text-[10px] uppercase tracking-widest text-sky-600">Premium Member</div>
            </div>
            {user?.user_metadata?.avatar_url ? (
              <img src={user.user_metadata.avatar_url} alt={displayName} className="w-10 h-10 rounded-xl border border-slate-200 shadow-sm object-cover" />
            ) : (
              <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center border border-blue-200 shadow-sm">
                <span className="text-blue-700 font-bold">{displayInitials}</span>
              </div>
            )}
            <button onClick={handleSignOut} className="ml-4 text-slate-400 hover:text-red-500 transition-colors" title="Sign Out">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-8 space-y-10">
          {/* Stats Overview */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {stats.map((stat, i) => (
              <motion.div 
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-white shadow-sm p-6 rounded-2xl border border-slate-100 flex items-center justify-between"
              >
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-slate-500 mb-1">{stat.label}</p>
                  <p className="text-3xl font-bold text-slate-900">{stat.value}</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center border border-slate-100">
                  <stat.icon className="w-5 h-5 text-sky-500" />
                </div>
              </motion.div>
            ))}
          </section>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-8">
              <TabsList className="bg-white border border-slate-200 rounded-xl h-auto p-1 gap-1 shadow-sm">
                <TabsTrigger 
                  value="listings" 
                  className="rounded-lg data-[state=active]:bg-sky-600 data-[state=active]:text-white px-6 py-2.5 uppercase tracking-widest text-[10px] font-bold transition-all text-slate-500 hover:text-slate-900"
                >
                  My Listings
                </TabsTrigger>
                <TabsTrigger 
                  value="submit" 
                  className="rounded-lg data-[state=active]:bg-sky-600 data-[state=active]:text-white px-6 py-2.5 uppercase tracking-widest text-[10px] font-bold transition-all text-slate-500 hover:text-slate-900"
                >
                  Submit Property
                </TabsTrigger>
              </TabsList>
              
              {activeTab === 'listings' && (
                <div className="flex gap-3 w-full sm:w-auto">
                  <div className="relative flex-1 sm:flex-none">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input placeholder="Search listings..." className="pl-10 h-11 rounded-xl border-slate-200 bg-white w-full sm:w-64 focus-visible:ring-sky-500 text-slate-900 shadow-sm" />
                  </div>
                  <button onClick={() => setActiveTab('submit')} className="rounded-xl h-11 px-6 bg-sky-600 text-white font-bold text-[10px] uppercase tracking-widest flex items-center gap-2 hover:bg-sky-700 transition-all shrink-0">
                    <Plus className="w-4 h-4" /> New Listing
                  </button>
                </div>
              )}
            </div>

            <TabsContent value="listings" className="mt-0 outline-none">
              {myListings.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {myListings.map((property, i) => (
                    <motion.div 
                      key={property.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.05 }}
                    >
                      <PropertyCard property={property} />
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-32 bg-white rounded-3xl border-dashed border-2 border-slate-200 shadow-sm">
                  <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 border border-slate-100">
                    <Search className="w-8 h-8 text-slate-400" />
                  </div>
                  <h3 className="text-xl font-bold mb-2 text-slate-900">No properties found</h3>
                  <p className="text-slate-500 mb-8 max-w-xs mx-auto text-sm">You haven't submitted any properties to our collection yet.</p>
                  <button onClick={() => setActiveTab('submit')} className="border border-slate-200 bg-slate-50 hover:bg-slate-100 text-[10px] uppercase tracking-widest font-bold px-8 py-3 rounded-lg text-slate-700 transition-colors">Start Your First Listing</button>
                </div>
              )}
            </TabsContent>

            <TabsContent value="submit" className="mt-0 outline-none">
              <div className="max-w-4xl mx-auto bg-white border border-slate-200 rounded-3xl shadow-lg overflow-hidden">
                <div className="bg-slate-50 p-8 md:p-12 border-b border-slate-200">
                  <h2 className="text-3xl font-bold mb-2 text-slate-900">Property Submission</h2>
                  <p className="text-slate-500 text-sm">Provide detailed information to help our team review your listing faster.</p>
                </div>
                
                <form className="p-8 md:p-12 space-y-12" onSubmit={handlePropertySubmit}>
                  {/* Section 1: Basic Info */}
                  <div className="space-y-6">
                    <div className="flex items-center gap-4 mb-2">
                      <div className="w-8 h-8 rounded-lg bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-600 text-xs font-bold shadow-sm">01</div>
                      <h3 className="text-sm uppercase tracking-[0.2em] font-bold text-slate-800">General Information</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-2">
                        <Label className="uppercase tracking-widest text-[10px] text-slate-500 font-bold">Property Title</Label>
                        <Input name="title" required placeholder="e.g. Oceanfront Modern Villa" className="bg-white border border-slate-200 rounded-xl px-4 h-12 focus-visible:ring-sky-500 text-slate-900 shadow-sm" />
                      </div>
                      <div className="space-y-2">
                        <Label className="uppercase tracking-widest text-[10px] text-slate-500 font-bold">Price (Kwacha)</Label>
                        <Input type="number" name="price" required placeholder="e.g. 2500000" className="bg-white border border-slate-200 rounded-xl px-4 h-12 focus-visible:ring-sky-500 text-slate-900 shadow-sm" />
                      </div>
                    </div>
                  </div>

                  {/* Section 2: Location & Media */}
                  <div className="space-y-6">
                    <div className="flex items-center gap-4 mb-2">
                      <div className="w-8 h-8 rounded-lg bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-600 text-xs font-bold shadow-sm">02</div>
                      <h3 className="text-sm uppercase tracking-[0.2em] font-bold text-slate-800">Location & Media</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-2">
                        <Label className="uppercase tracking-widest text-[10px] text-slate-500 font-bold">Location</Label>
                        <Input name="location" required placeholder="e.g. Lusaka, Zambia" className="bg-white border border-slate-200 rounded-xl px-4 h-12 focus-visible:ring-sky-500 text-slate-900 shadow-sm" />
                      </div>
                      <div className="space-y-2">
                        <Label className="uppercase tracking-widest text-[10px] text-slate-500 font-bold">Main Image URL</Label>
                        <Input name="imageUrl" required placeholder="https://images.unsplash.com/..." className="bg-white border border-slate-200 rounded-xl px-4 h-12 focus-visible:ring-sky-500 text-slate-900 shadow-sm" />
                      </div>
                    </div>
                  </div>

                  {/* Section 3: Details */}
                  <div className="space-y-6">
                    <div className="flex items-center gap-4 mb-2">
                      <div className="w-8 h-8 rounded-lg bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-600 text-xs font-bold shadow-sm">03</div>
                      <h3 className="text-sm uppercase tracking-[0.2em] font-bold text-slate-800">Property Details</h3>
                    </div>
                    <div className="space-y-2">
                      <Label className="uppercase tracking-widest text-[10px] text-slate-500 font-bold">Description</Label>
                      <Textarea name="description" required placeholder="Describe the property's unique features, history, and amenities..." className="bg-white border border-slate-200 rounded-xl px-4 py-4 min-h-[180px] focus-visible:ring-sky-500 text-slate-900 shadow-sm resize-none" />
                    </div>
                  </div>

                  <div className="pt-8 flex flex-col sm:flex-row justify-end gap-4 border-t border-slate-200">
                    <button type="button" onClick={() => setActiveTab('listings')} className="h-12 px-8 text-[10px] uppercase tracking-widest font-bold text-slate-500 hover:text-slate-900 transition-colors">Discard Draft</button>
                    <button type="submit" disabled={isSubmitting} className="rounded-xl px-12 h-12 bg-sky-600 text-white font-bold uppercase tracking-widest text-[10px] hover:bg-sky-700 transition-all shadow-md disabled:opacity-50">
                      {isSubmitting ? 'Submitting...' : 'Submit for Review'}
                    </button>
                  </div>
                </form>
              </div>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
}
