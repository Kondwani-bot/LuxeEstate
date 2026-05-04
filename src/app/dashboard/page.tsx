'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { motion } from 'motion/react';
import { Plus, Search, Filter, MoreVertical, LogOut, Trash2 } from 'lucide-react';
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
import { useRouter, useSearchParams } from 'next/navigation';
import { Property } from '@/types';

function DashboardContent() {
  const searchParams = useSearchParams();
  const initialTab = searchParams.get('tab') === 'submit' ? 'submit' : 'listings';
  const [activeTab, setActiveTab] = useState(initialTab);
  const [user, setUser] = useState<any>(null);
  const [myListings, setMyListings] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [mainImagePreview, setMainImagePreview] = useState<string | null>(null);
  const [slideshowPreviews, setSlideshowPreviews] = useState<string[]>([]);
  const router = useRouter();

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        syncMember(session.user);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user);
        syncMember(session.user);
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const syncMember = async (authUser: any) => {
    try {
      const { data: existing } = await supabase
        .from('members')
        .select('id')
        .eq('id', authUser.id)
        .single();
      
      if (!existing) {
        await supabase.from('members').insert({
          id: authUser.id,
          email: authUser.email,
          full_name: authUser.user_metadata?.full_name || authUser.email?.split('@')[0],
          created_at: new Date().toISOString()
        });
      }
    } catch (err) {
      console.error('Error syncing member data', err);
    }
  };

  useEffect(() => {
    const fetchUserProperties = async () => {
      if (!user) return;
      try {
        const { data, error } = await supabase
          .from('properties')
          .select('*')
          .eq('submitted_by', user.email); 

        if (error) throw error;
        let fetchedData: Property[] = [];
        if (data) {
          fetchedData = data.map(p => ({
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
        }

        const deletedMockIds = JSON.parse(localStorage.getItem('deletedMockIds') || '[]');
        
        // If the user has zero real properties, show some "Demo" mock properties
        // but mark them so the user isn't confused.
        if (fetchedData.length === 0) {
          setMyListings(MOCK_PROPERTIES
            .filter(p => p.submittedBy === 'John Member' && !deletedMockIds.includes(p.id))
            .map(p => ({ ...p, isMock: true }))
          );
        } else {
          setMyListings(fetchedData);
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

  const handleMainImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (mainImagePreview) URL.revokeObjectURL(mainImagePreview);
      setMainImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSlideshowChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      slideshowPreviews.forEach(url => URL.revokeObjectURL(url));
      const newPreviews = Array.from(files).map(file => URL.createObjectURL(file));
      setSlideshowPreviews(newPreviews);
    }
  };

  const handleDeleteProperty = async (id: string) => {
    const propertyToDel = myListings.find(p => p.id === id);
    if (!confirm(`Are you sure you want to remove "${propertyToDel?.title}"? This action cannot be undone.`)) return;
    
    try {
      if (propertyToDel?.isMock) {
        const deletedMockIds = JSON.parse(localStorage.getItem('deletedMockIds') || '[]');
        deletedMockIds.push(id);
        localStorage.setItem('deletedMockIds', JSON.stringify(deletedMockIds));
        
        setMyListings(prev => prev.filter(p => p.id !== id));
        return;
      }

      const { data, error } = await supabase
        .from('properties')
        .delete()
        .eq('id', id)
        .select();
      
      if (error) throw error;

      if (!data || data.length === 0) {
        throw new Error('Deletion failed: The database rejected the request. Please ensure you have run the "Delete" RLS Policy SQL in your Supabase dashboard.');
      }

      setMyListings(prev => prev.filter(p => p.id !== id));
    } catch (err: any) {
      console.error('Error deleting property:', err);
      alert(err.message || 'Failed to delete property from database.');
    }
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
    const description = formData.get('description') as string;
    const mainImageFile = formData.get('mainImage') as File;
    const slideshowFiles = formData.getAll('slideshowImages') as File[];

    let finalMainUrl = '';
    const finalSlideshowUrls: string[] = [];

    const uploadImage = async (file: File) => {
      if (!file || file.size === 0) return null;
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
      const filePath = `properties/${user.id}/${fileName}`;
      
      try {
        const { data, error } = await supabase.storage
          .from('property-images')
          .upload(filePath, file);

        if (error) {
          console.error('Storage upload failed:', error);
          return null;
        }

        const { data: { publicUrl } } = supabase.storage
          .from('property-images')
          .getPublicUrl(filePath);
          
        return publicUrl;
      } catch (err) {
        return null;
      }
    };

    try {
      // 1. Upload Main Image
      if (mainImageFile && mainImageFile.size > 0) {
        const uploadedMain = await uploadImage(mainImageFile);
        if (uploadedMain) {
          finalMainUrl = uploadedMain;
        } else {
          throw new Error('Image upload failed. Please ensure your Supabase Storage has a "property-images" bucket and public access policies.');
        }
      } else {
        throw new Error('Main image is required.');
      }

      // 2. Upload Slideshow Images
      for (const file of slideshowFiles) {
        if (file && file.size > 0) {
          const uploaded = await uploadImage(file);
          if (uploaded) {
            finalSlideshowUrls.push(uploaded);
          }
        }
      }

      if (finalSlideshowUrls.length === 0) {
        finalSlideshowUrls.push(finalMainUrl);
      }

      const { data, error } = await supabase
        .from('properties')
        .insert([
          {
            title,
            description,
            price,
            location,
            image_url: finalMainUrl,
            images: finalSlideshowUrls,
            type: 'House',
            status: 'Pending',
            submitted_by: user.email,
            features: []
          }
        ])
        .select();

      if (error) throw error;
      
      setMainImagePreview(null);
      setSlideshowPreviews([]);

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
        (e.target as HTMLFormElement).reset();
      }
    } catch (error: any) {
      console.error('Error adding property: ', error);
      alert(error.message || 'Failed to submit listing.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const displayName = user?.user_metadata?.full_name || user?.email || 'John Member';
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
                      <div className="mt-4 flex justify-end">
                        <button 
                          onClick={() => handleDeleteProperty(property.id)}
                          className="text-[10px] font-bold text-red-500 uppercase tracking-widest hover:text-red-700 transition-all py-2 px-4 bg-white border border-red-100 rounded-xl hover:bg-red-50 flex items-center gap-2 shadow-sm"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Remove Listing
                        </button>
                      </div>
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
                    <div className="space-y-2">
                      <Label className="uppercase tracking-widest text-[10px] text-slate-500 font-bold">Location</Label>
                      <Input name="location" required placeholder="e.g. Lusaka, Zambia" className="bg-white border border-slate-200 rounded-xl px-4 h-12 focus-visible:ring-sky-500 text-slate-900 shadow-sm" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-4">
                        <div className="border-2 border-dashed border-slate-200 p-6 rounded-2xl bg-slate-50 hover:bg-slate-100 transition-colors text-center relative group min-h-[140px] flex flex-col items-center justify-center">
                          {mainImagePreview ? (
                            <div className="relative w-full h-32 mb-2">
                              <img src={mainImagePreview} alt="Preview" className="w-full h-full object-cover rounded-lg" />
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg">
                                <span className="text-[10px] text-white font-bold uppercase tracking-widest">Change Photo</span>
                              </div>
                            </div>
                          ) : (
                            <>
                              <Label className="uppercase tracking-widest text-[10px] text-sky-600 font-bold cursor-pointer inline-block mt-2">Upload Main Image</Label>
                              <p className="text-xs text-slate-400 mt-1">Select a featured cover photo (JPG/PNG)</p>
                            </>
                          )}
                          <Input 
                            type="file" 
                            name="mainImage" 
                            accept="image/*" 
                            required 
                            onChange={handleMainImageChange}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <div className="border-2 border-dashed border-slate-200 p-6 rounded-2xl bg-slate-50 hover:bg-slate-100 transition-colors text-center relative group min-h-[140px] flex flex-col items-center justify-center">
                          {slideshowPreviews.length > 0 ? (
                            <div className="grid grid-cols-3 gap-2 w-full mb-2">
                              {slideshowPreviews.slice(0, 3).map((src, i) => (
                                <div key={i} className="relative h-12">
                                  <img src={src} alt="" className="w-full h-full object-cover rounded-md" />
                                  {i === 2 && slideshowPreviews.length > 3 && (
                                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center rounded-md text-[10px] text-white font-bold">
                                      +{slideshowPreviews.length - 3}
                                    </div>
                                  )}
                                </div>
                              ))}
                              <div className="col-span-3 absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg">
                                <span className="text-[10px] text-white font-bold uppercase tracking-widest">Add/Change Photos</span>
                              </div>
                            </div>
                          ) : (
                            <>
                              <Label className="uppercase tracking-widest text-[10px] text-sky-600 font-bold cursor-pointer inline-block mt-2">Upload Slideshow Photos</Label>
                              <p className="text-xs text-slate-400 mt-1">Select multiple high-res interior photos</p>
                            </>
                          )}
                          <Input 
                            type="file" 
                            name="slideshowImages" 
                            multiple 
                            accept="image/*" 
                            required 
                            onChange={handleSlideshowChange}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                          />
                        </div>
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

export default function MemberDashboard() {
  return (
    <Suspense fallback={<div className="p-8 text-center bg-slate-50 min-h-screen text-slate-500">Loading dashboard...</div>}>
      <DashboardContent />
    </Suspense>
  );
}
