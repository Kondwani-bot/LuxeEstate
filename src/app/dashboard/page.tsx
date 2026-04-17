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

export default function MemberDashboard() {
  const [activeTab, setActiveTab] = useState('listings');
  const [user, setUser] = useState<any>(null);
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

  const myListings = MOCK_PROPERTIES.filter(p => p.submittedBy === 'John Member');

  const stats = [
    { label: 'Total Listings', value: myListings.length, icon: MoreVertical },
    { label: 'Pending Review', value: myListings.filter(p => p.status === 'Pending').length, icon: Filter },
    { label: 'Approved', value: myListings.filter(p => p.status === 'Approved').length, icon: Plus },
  ];

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  const displayName = user?.user_metadata?.full_name || 'John Member';
  const displayInitials = displayName.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase();

  return (
    <div className="flex h-screen bg-background text-white">
      <Sidebar role="member" />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-20 border-b border-glass-border bg-black/20 backdrop-blur-md flex items-center justify-between px-8 shrink-0">
          <div>
            <h1 className="text-xl font-bold tracking-tight">Member Dashboard</h1>
            <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Manage your property portfolio</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <div className="text-sm font-medium">{displayName}</div>
              <div className="text-[10px] uppercase tracking-widest text-accent">Premium Member</div>
            </div>
            {user?.user_metadata?.avatar_url ? (
              <img src={user.user_metadata.avatar_url} alt={displayName} className="w-10 h-10 rounded-xl border border-accent/20 object-cover" />
            ) : (
              <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center border border-accent/20">
                <span className="text-accent font-bold">{displayInitials}</span>
              </div>
            )}
            <button onClick={handleSignOut} className="ml-4 text-muted-foreground hover:text-white transition-colors" title="Sign Out">
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
                className="glass-panel p-6 rounded-2xl border border-glass-border flex items-center justify-between"
              >
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">{stat.label}</p>
                  <p className="text-3xl font-bold">{stat.value}</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                  <stat.icon className="w-5 h-5 text-accent/50" />
                </div>
              </motion.div>
            ))}
          </section>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-8">
              <TabsList className="bg-white/5 border border-glass-border rounded-xl h-auto p-1 gap-1">
                <TabsTrigger 
                  value="listings" 
                  className="rounded-lg data-[state=active]:bg-accent data-[state=active]:text-black px-6 py-2.5 uppercase tracking-widest text-[10px] font-bold transition-all"
                >
                  My Listings
                </TabsTrigger>
                <TabsTrigger 
                  value="submit" 
                  className="rounded-lg data-[state=active]:bg-accent data-[state=active]:text-black px-6 py-2.5 uppercase tracking-widest text-[10px] font-bold transition-all"
                >
                  Submit Property
                </TabsTrigger>
              </TabsList>
              
              {activeTab === 'listings' && (
                <div className="flex gap-3 w-full sm:w-auto">
                  <div className="relative flex-1 sm:flex-none">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input placeholder="Search listings..." className="pl-10 h-11 rounded-xl border-glass-border bg-white/5 w-full sm:w-64 focus:ring-accent/20" />
                  </div>
                  <button onClick={() => setActiveTab('submit')} className="rounded-xl h-11 px-6 bg-accent text-black font-bold text-[10px] uppercase tracking-widest flex items-center gap-2 hover:bg-accent/90 transition-all shrink-0">
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
                <div className="text-center py-32 glass-panel rounded-3xl border-dashed border-2 border-white/10">
                  <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Search className="w-8 h-8 text-muted-foreground/50" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">No properties found</h3>
                  <p className="text-muted-foreground mb-8 max-w-xs mx-auto text-sm">You haven't submitted any properties to our collection yet.</p>
                  <button onClick={() => setActiveTab('submit')} className="btn-glass text-[10px] uppercase tracking-widest font-bold px-8 py-3">Start Your First Listing</button>
                </div>
              )}
            </TabsContent>

            <TabsContent value="submit" className="mt-0 outline-none">
              <div className="max-w-4xl mx-auto glass-panel p-1 p-md-10 rounded-3xl shadow-2xl overflow-hidden">
                <div className="bg-white/5 p-8 md:p-12 border-b border-glass-border">
                  <h2 className="text-3xl font-bold mb-2">Property Submission</h2>
                  <p className="text-muted-foreground text-sm">Provide detailed information to help our team review your listing faster.</p>
                </div>
                
                <form className="p-8 md:p-12 space-y-12">
                  {/* Section 1: Basic Info */}
                  <div className="space-y-6">
                    <div className="flex items-center gap-4 mb-2">
                      <div className="w-8 h-8 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center text-accent text-xs font-bold">01</div>
                      <h3 className="text-sm uppercase tracking-[0.2em] font-bold">General Information</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-2">
                        <Label className="uppercase tracking-widest text-[10px] text-muted-foreground">Property Title</Label>
                        <Input placeholder="e.g. Oceanfront Modern Villa" className="luxury-input bg-white/5 border border-glass-border rounded-xl px-4 h-12 focus:border-accent/50" />
                      </div>
                      <div className="space-y-2">
                        <Label className="uppercase tracking-widest text-[10px] text-muted-foreground">Price (Kwacha)</Label>
                        <Input type="number" placeholder="e.g. 2500000" className="luxury-input bg-white/5 border border-glass-border rounded-xl px-4 h-12 focus:border-accent/50" />
                      </div>
                    </div>
                  </div>

                  {/* Section 2: Location & Media */}
                  <div className="space-y-6">
                    <div className="flex items-center gap-4 mb-2">
                      <div className="w-8 h-8 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center text-accent text-xs font-bold">02</div>
                      <h3 className="text-sm uppercase tracking-[0.2em] font-bold">Location & Media</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-2">
                        <Label className="uppercase tracking-widest text-[10px] text-muted-foreground">Location</Label>
                        <Input placeholder="e.g. Beverly Hills, CA" className="luxury-input bg-white/5 border border-glass-border rounded-xl px-4 h-12 focus:border-accent/50" />
                      </div>
                      <div className="space-y-2">
                        <Label className="uppercase tracking-widest text-[10px] text-muted-foreground">Main Image URL</Label>
                        <Input placeholder="https://images.unsplash.com/..." className="luxury-input bg-white/5 border border-glass-border rounded-xl px-4 h-12 focus:border-accent/50" />
                      </div>
                    </div>
                  </div>

                  {/* Section 3: Details */}
                  <div className="space-y-6">
                    <div className="flex items-center gap-4 mb-2">
                      <div className="w-8 h-8 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center text-accent text-xs font-bold">03</div>
                      <h3 className="text-sm uppercase tracking-[0.2em] font-bold">Property Details</h3>
                    </div>
                    <div className="space-y-2">
                      <Label className="uppercase tracking-widest text-[10px] text-muted-foreground">Description</Label>
                      <Textarea placeholder="Describe the property's unique features, history, and amenities..." className="luxury-input bg-white/5 border border-glass-border rounded-xl px-4 py-4 min-h-[180px] focus:border-accent/50 resize-none" />
                    </div>
                  </div>

                  <div className="pt-8 flex flex-col sm:flex-row justify-end gap-4 border-t border-glass-border">
                    <button type="button" onClick={() => setActiveTab('listings')} className="h-12 px-8 text-[10px] uppercase tracking-widest font-bold text-muted-foreground hover:text-white transition-colors">Discard Draft</button>
                    <button type="submit" className="rounded-xl px-12 h-12 bg-accent text-black font-bold uppercase tracking-widest text-[10px] hover:bg-accent/90 transition-all shadow-lg shadow-accent/10">Submit for Review</button>
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
