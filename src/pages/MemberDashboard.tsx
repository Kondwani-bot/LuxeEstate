import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Plus, Search, Filter, MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MOCK_PROPERTIES } from '@/data/mockData';
import Sidebar from '@/components/Sidebar';
import Navbar from '@/components/Navbar';
import PropertyCard from '@/components/PropertyCard';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

export default function MemberDashboard() {
  const [activeTab, setActiveTab] = useState('listings');
  const myListings = MOCK_PROPERTIES.filter(p => p.submittedBy === 'John Member');

  return (
    <div className="flex h-screen bg-background text-white">
      <Sidebar role="member" />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-20 border-b border-glass-border bg-black/20 backdrop-blur-md flex items-center justify-between px-8">
          <h1 className="text-2xl font-bold tracking-tight">Member Dashboard</h1>
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <div className="text-sm font-medium">John Member</div>
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Premium Member</div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center border border-accent/30">
              <span className="text-accent font-bold">JM</span>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-8">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="flex justify-between items-center mb-8">
              <TabsList className="bg-white/5 border border-glass-border rounded-xl h-auto p-1 gap-2">
                <TabsTrigger 
                  value="listings" 
                  className="rounded-lg data-[state=active]:bg-accent data-[state=active]:text-black px-6 py-2 uppercase tracking-widest text-[10px] font-bold transition-all"
                >
                  My Listings
                </TabsTrigger>
                <TabsTrigger 
                  value="submit" 
                  className="rounded-lg data-[state=state=active]:bg-accent data-[state=active]:text-black px-6 py-2 uppercase tracking-widest text-[10px] font-bold transition-all"
                >
                  Submit Property
                </TabsTrigger>
              </TabsList>
              
              {activeTab === 'listings' && (
                <div className="flex gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input placeholder="Search my listings..." className="pl-10 h-10 rounded-xl border-glass-border bg-white/5 w-64" />
                  </div>
                  <button onClick={() => setActiveTab('submit')} className="rounded-xl h-10 px-6 bg-accent text-black font-bold text-[10px] uppercase tracking-widest flex items-center gap-2">
                    <Plus className="w-4 h-4" /> New Listing
                  </button>
                </div>
              )}
            </div>

            <TabsContent value="listings" className="mt-0 outline-none">
              {myListings.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {myListings.map((property) => (
                    <div key={property.id}>
                      <PropertyCard property={property} />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-24 glass-panel rounded-3xl border-dashed">
                  <div className="text-muted-foreground mb-4">You haven't submitted any properties yet.</div>
                  <button onClick={() => setActiveTab('submit')} className="btn-glass text-xs uppercase tracking-widest font-bold">Start Your First Listing</button>
                </div>
              )}
            </TabsContent>

            <TabsContent value="submit" className="mt-0 outline-none">
              <div className="max-w-3xl mx-auto glass-panel p-10 rounded-3xl shadow-2xl">
                <h2 className="text-3xl font-bold mb-8">Property Submission</h2>
                <form className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <Label className="uppercase tracking-widest text-[10px] text-muted-foreground">Property Title</Label>
                      <Input placeholder="e.g. Oceanfront Modern Villa" className="luxury-input bg-white/5 border border-glass-border rounded-xl px-4 h-12" />
                    </div>
                    <div className="space-y-2">
                      <Label className="uppercase tracking-widest text-[10px] text-muted-foreground">Price (Kwacha)</Label>
                      <Input type="number" placeholder="e.g. 2500000" className="luxury-input bg-white/5 border border-glass-border rounded-xl px-4 h-12" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="uppercase tracking-widest text-[10px] text-muted-foreground">Location</Label>
                    <Input placeholder="e.g. Beverly Hills, CA" className="luxury-input bg-white/5 border border-glass-border rounded-xl px-4 h-12" />
                  </div>

                  <div className="space-y-2">
                    <Label className="uppercase tracking-widest text-[10px] text-muted-foreground">Image URL</Label>
                    <Input placeholder="https://images.unsplash.com/..." className="luxury-input bg-white/5 border border-glass-border rounded-xl px-4 h-12" />
                  </div>

                  <div className="space-y-2">
                    <Label className="uppercase tracking-widest text-[10px] text-muted-foreground">Description</Label>
                    <Textarea placeholder="Describe the property's unique features and history..." className="luxury-input bg-white/5 border border-glass-border rounded-xl px-4 py-3 min-h-[150px]" />
                  </div>

                  <div className="pt-4 flex justify-end gap-4">
                    <button type="button" variant="ghost" onClick={() => setActiveTab('listings')} className="text-xs uppercase tracking-widest font-bold text-muted-foreground hover:text-white transition-colors">Cancel</button>
                    <button type="submit" className="rounded-xl px-12 h-12 bg-accent text-black font-bold uppercase tracking-widest text-[10px]">Submit for Review</button>
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
