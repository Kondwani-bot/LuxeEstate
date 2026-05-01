'use client';

import { useState, useMemo, useEffect } from 'react';
import { motion } from 'motion/react';
import { Search, Filter, ChevronDown } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { MOCK_PROPERTIES } from '@/data/mockData';
import PropertyCard from '@/components/PropertyCard';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { supabase } from '@/lib/supabase';
import { Property } from '@/types';

export default function CollectionsPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterLocation, setFilterLocation] = useState('All');
  const [filterType, setFilterType] = useState('All');
  const [filterMinPrice, setFilterMinPrice] = useState('');
  const [filterMaxPrice, setFilterMaxPrice] = useState('');
  const [sortBy, setSortBy] = useState('price-low');
  const [showFilters, setShowFilters] = useState(true);

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('properties')
          .select('*')
          .eq('status', 'Approved');

        if (error) throw error;
        
        const formattedData: Property[] = (data || []).map(p => ({
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
        
        const dbTitles = new Set(formattedData.map(p => p.title.toLowerCase()));
        const mockToAdd = MOCK_PROPERTIES.filter(p => !dbTitles.has(p.title.toLowerCase()) && p.status === 'Approved');
        
        setProperties([...formattedData, ...mockToAdd]);
      } catch (err) {
        console.error('Error fetching properties:', err);
        setProperties(MOCK_PROPERTIES.filter(p => p.status === 'Approved'));
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, []);

  const locations = useMemo(() => ['All', ...new Set(properties.map(p => p.location.split(',')[0]))], [properties]);
  const types = ['All', 'House', 'Apartment', 'Villa', 'Penthouse'];

  const filteredProperties = useMemo(() => {
    return properties
      .filter(p => p.status === 'Approved')
      .filter(p => {
        const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                             p.location.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesLocation = filterLocation === 'All' || p.location.includes(filterLocation);
        const matchesType = filterType === 'All' || p.type === filterType;
        const matchesMinPrice = filterMinPrice === '' || p.price >= Number(filterMinPrice);
        const matchesMaxPrice = filterMaxPrice === '' || p.price <= Number(filterMaxPrice);
        return matchesSearch && matchesLocation && matchesType && matchesMinPrice && matchesMaxPrice;
      })
      .sort((a, b) => {
        if (sortBy === 'price-low') return a.price - b.price;
        if (sortBy === 'price-high') return b.price - a.price;
        if (sortBy === 'newest') return new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime();
        return 0;
      });
  }, [properties, searchQuery, filterLocation, filterType, filterMinPrice, filterMaxPrice, sortBy]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Navbar />
      
      <section className="pt-40 pb-12 px-4 bg-white border-b border-slate-200">
        <div className="container px-4">
          <h1 className="text-4xl font-extrabold mb-4 tracking-tight text-slate-900">Property Collections</h1>
          <p className="text-slate-500 font-medium">Browse our full catalog of premium and verified real estate listings.</p>
        </div>
      </section>

      {/* Filters & Sorting */}
      <section className="container px-4 py-8 relative z-20 flex-1">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white border border-slate-200 shadow-sm hover:bg-slate-50 transition-all text-sm font-semibold text-slate-700"
          >
            <Filter className="w-4 h-4 text-sky-500" /> {showFilters ? 'Hide Filters' : 'Advanced Filters'}
          </button>

          <div className="flex flex-col md:flex-row items-center gap-4">
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input 
                 placeholder="Search name or area..." 
                 className="pl-10 bg-white border-slate-200 h-10 w-full rounded-xl focus-visible:ring-sky-500"
                 value={searchQuery}
                 onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="flex bg-white p-1 rounded-xl border border-slate-200 shadow-sm overflow-hidden h-10 items-center">
              {[
                { id: 'newest', label: 'Newest' },
                { id: 'price-low', label: 'Price: Low-High' },
                { id: 'price-high', label: 'Price: High-Low' }
              ].map((option) => (
                <button
                  key={option.id}
                  onClick={() => setSortBy(option.id)}
                  className={`px-3 py-1.5 text-[9px] font-bold uppercase tracking-widest rounded-lg transition-all h-full flex items-center ${
                    sortBy === option.id 
                      ? 'bg-sky-600 text-white shadow-sm' 
                      : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {showFilters && (
          <motion.div 
            initial={{ opacity: 0, height: 0, overflow: 'hidden' }}
            animate={{ opacity: 1, height: 'auto' }}
            className="bg-white shadow-xl rounded-3xl mb-12 border border-slate-100"
          >
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 p-8">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Location</label>
                <div className="relative">
                  <select 
                    value={filterLocation}
                    onChange={(e) => setFilterLocation(e.target.value)}
                    className="w-full appearance-none bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 pr-10 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all cursor-pointer"
                  >
                    {locations.map(loc => <option key={loc} value={loc}>{loc}</option>)}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Property Type</label>
                <div className="relative">
                  <select 
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="w-full appearance-none bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 pr-10 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all cursor-pointer"
                  >
                    {types.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Min Price (K)</label>
                <Input 
                  type="number" 
                  placeholder="Min" 
                  value={filterMinPrice}
                  onChange={(e) => setFilterMinPrice(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-4 h-[46px] font-medium focus-visible:ring-sky-500"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Max Price (K)</label>
                <Input 
                  type="number" 
                  placeholder="Max" 
                  value={filterMaxPrice}
                  onChange={(e) => setFilterMaxPrice(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-4 h-[46px] font-medium focus-visible:ring-sky-500"
                />
              </div>
            </div>
          </motion.div>
        )}

        {/* Property Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-20">
          {!loading ? (
             filteredProperties.length > 0 ? (
              filteredProperties.map((property, index) => (
                <motion.div
                  key={property.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1, ease: 'easeOut' }}
                >
                  <PropertyCard property={property} />
                </motion.div>
              ))
            ) : (
              <div className="col-span-full py-32 text-center bg-white rounded-3xl border border-slate-100 shadow-sm">
                <div className="text-2xl font-bold mb-4 text-slate-800">No properties found.</div>
                <p className="text-slate-500">Try adjusting your filters or search query.</p>
                <button 
                  onClick={() => {
                    setSearchQuery('');
                    setFilterLocation('All');
                    setFilterType('All');
                    setFilterMinPrice('');
                    setFilterMaxPrice('');
                  }}
                  className="mt-8 px-6 py-3 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition-colors"
                >
                  Clear All Filters
                </button>
              </div>
            )
          ) : (
             <div className="col-span-full py-32 text-center text-slate-500">Loading catalog...</div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
