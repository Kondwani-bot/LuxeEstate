'use client';

import { useState, useMemo, useEffect } from 'react';
import { motion } from 'motion/react';
import { Search, MapPin, Filter, SlidersHorizontal, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MOCK_PROPERTIES } from '@/data/mockData';
import PropertyCard from '@/components/PropertyCard';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import OnboardingPopup from '@/components/OnboardingPopup';
import { supabase } from '@/lib/supabase';
import { Property } from '@/types';
import Link from 'next/link';

export default function Home() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterLocation, setFilterLocation] = useState('All');
  const [filterType, setFilterType] = useState('All');
  const [filterMinPrice, setFilterMinPrice] = useState('');
  const [filterMaxPrice, setFilterMaxPrice] = useState('');
  const [sortBy, setSortBy] = useState('price-low');
  const [showFilters, setShowFilters] = useState(false);

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
        
        const deletedMockIds = JSON.parse(localStorage.getItem('deletedMockIds') || '[]');
        const dbTitles = new Set(formattedData.map(p => p.title.toLowerCase()));
        const mockToAdd = MOCK_PROPERTIES
          .filter(p => !dbTitles.has(p.title.toLowerCase()) && p.status === 'Approved' && !deletedMockIds.includes(p.id))
          .map(p => ({ ...p, isMock: true }));
        
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
      <OnboardingPopup />
      
      {/* Hero Section */}
      <section className="relative pt-48 pb-32 px-4 text-center overflow-hidden">
        {/* Abstract Background Design */}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-10">
          <div className="w-[800px] h-[800px] bg-sky-400 rounded-full blur-3xl absolute top-10 right-10 mix-blend-multiply"></div>
          <div className="w-[600px] h-[600px] bg-blue-600 rounded-full blur-3xl absolute bottom-10 left-10 mix-blend-multiply"></div>
        </div>

        <div className="container mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <h1 className="text-4xl md:text-[5.5rem] leading-[1.1] font-extrabold mb-6 tracking-tight text-slate-900 px-2">
              Regulatory Excellence <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-800 to-sky-500">
                In Real Estate.
              </span>
            </h1>
          </motion.div>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="text-base md:text-xl mb-8 md:mb-12 max-w-2xl mx-auto text-slate-600 font-medium px-4"
          >
            The official portal for verified, compliant, and premium property listings. Promoting sustainable investments and modern living standards.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
            className="bg-white shadow-2xl p-2 md:p-3 max-w-4xl mx-auto flex flex-col md:flex-row gap-2 md:gap-3 rounded-2xl border border-slate-100"
          >
            <div className="flex-1 relative flex items-center">
              <Search className="absolute left-5 text-slate-400 w-5 h-5 pointer-events-none" />
              <Input 
                placeholder="Search location, price, or type..." 
                className="w-full pl-14 h-12 md:h-14 bg-transparent border-none shadow-none text-base md:text-lg text-slate-800 placeholder-slate-400 focus-visible:ring-0"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="w-px bg-slate-200 hidden md:block my-2"></div>
            <button className="h-12 md:h-14 px-10 rounded-xl bg-gradient-to-r from-blue-800 to-sky-500 text-white font-bold hover:shadow-lg hover:opacity-90 transition-all flex items-center justify-center gap-2 text-sm md:text-base">
              <Search className="w-4 h-4" /> Start Search
            </button>
          </motion.div>
        </div>
      </section>

      {/* Filters & Sorting */}
      <section className="container mx-auto px-4 py-8 relative z-20">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-12">
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white border border-slate-200 shadow-sm hover:bg-slate-50 transition-all text-xs font-bold uppercase tracking-widest text-slate-700"
          >
            <Filter className="w-4 h-4 text-sky-500" /> {showFilters ? 'Hide Filters' : 'Advanced Filters'}
          </button>

          <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6 w-full md:w-auto">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 block text-center">Sort By</span>
            <div className="flex bg-white p-1 rounded-xl border border-slate-200 shadow-sm overflow-x-auto w-full md:w-auto no-scrollbar">
              {[
                { id: 'newest', label: 'Newest' },
                { id: 'price-low', label: 'Price: Low' },
                { id: 'price-high', label: 'Price: High' }
              ].map((option) => (
                <button
                  key={option.id}
                  onClick={() => setSortBy(option.id)}
                  className={`flex-1 md:flex-none whitespace-nowrap px-4 py-2.5 text-[9px] md:text-[10px] font-bold uppercase tracking-widest rounded-lg transition-all ${
                    sortBy === option.id 
                      ? 'bg-slate-900 text-white shadow-md' 
                      : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Using AnimatePresence would be better here but standard conditional is fine for now */}
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-12">
          {loading ? (
            <div className="col-span-full py-32 text-center bg-white rounded-3xl border border-slate-100 shadow-sm">
              <div className="text-2xl font-bold mb-4 text-slate-800 animate-pulse">Loading properties...</div>
              <p className="text-slate-500">Please wait while we fetch the latest listings.</p>
            </div>
          ) : filteredProperties.length > 0 ? (
            filteredProperties.slice(0, 6).map((property, index) => (
              <motion.div
                key={property.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
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
          )}
        </div>

        {filteredProperties.length > 6 && (
          <div className="flex justify-center pb-20">
            <Link href="/collections">
              <button className="px-10 py-4 bg-white border border-slate-200 rounded-2xl font-bold text-slate-800 hover:bg-slate-50 transition-all shadow-sm flex items-center gap-3 group">
                View All {filteredProperties.length} Properties
                <ChevronDown className="w-4 h-4 text-sky-500 group-hover:translate-y-1 transition-transform" />
              </button>
            </Link>
          </div>
        )}
      </section>

      {/* Featured Quote */}
      <section className="py-24 bg-slate-900 text-white text-center px-4 relative overflow-hidden group">
        <div className="absolute inset-0 z-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] mix-blend-overlay"></div>
        
        {/* Star effects */}
        <div className="absolute top-1/4 left-1/4 w-2 h-2 rounded-full bg-white blur-[1px] opacity-0 group-hover:opacity-100 transition-opacity duration-1000 animate-ping"></div>
        <div className="absolute top-3/4 left-1/3 w-1 h-1 rounded-full bg-white opacity-0 group-hover:opacity-80 transition-opacity duration-700 animate-ping" style={{ animationDelay: '0.2s' }}></div>
        <div className="absolute top-1/3 right-1/4 w-1.5 h-1.5 rounded-full bg-sky-300 opacity-0 group-hover:opacity-100 transition-opacity duration-1000 animate-ping" style={{ animationDelay: '0.5s' }}></div>
        <div className="absolute top-2/3 right-1/3 w-2 h-2 rounded-full bg-sky-200 blur-[1px] opacity-0 group-hover:opacity-60 transition-opacity duration-1000 animate-ping" style={{ animationDelay: '0.8s' }}></div>
        <div className="absolute bottom-1/4 right-1/2 w-1.5 h-1.5 rounded-full bg-white opacity-0 group-hover:opacity-90 transition-opacity duration-500 animate-ping" style={{ animationDelay: '0.3s' }}></div>

        <motion.div 
          className="max-w-3xl mx-auto relative z-10 cursor-default"
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          <span className="text-sky-400 uppercase tracking-[0.3em] font-bold text-[10px] mb-4 block group-hover:text-sky-300 transition-colors duration-500">Vision & Mission</span>
          <h2 className="text-lg md:text-xl leading-relaxed font-light text-white group-hover:text-sky-100 transition-colors duration-500">
            "We regulate and promote an <span className="font-semibold text-sky-400 group-hover:text-sky-300 transition-colors">inclusive</span> and sustainable sector, ensuring world-class standards."
          </h2>
        </motion.div>
      </section>

      <Footer />
    </div>
  );
}
