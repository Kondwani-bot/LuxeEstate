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
import { supabase } from '@/lib/supabase';
import { Property } from '@/types';

export default function Home() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterLocation, setFilterLocation] = useState('All');
  const [filterType, setFilterType] = useState('All');
  const [filterMinPrice, setFilterMinPrice] = useState('');
  const [filterMaxPrice, setFilterMaxPrice] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const { data, error } = await supabase
          .from('properties')
          .select('*')
          .eq('status', 'Approved');

        if (error) throw error;
        
        if (data) {
          // Map DB columns to our Property type
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
          setProperties(formattedData);
        }
      } catch (err) {
        console.error('Error fetching properties. Falling back to mock data.', err);
        setProperties(MOCK_PROPERTIES); // Fallback if no backend
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
  }, [searchQuery, filterLocation, filterType, filterMinPrice, filterMaxPrice, sortBy]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative pt-48 pb-32 px-4 text-center overflow-hidden">
        {/* Abstract Background Design */}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-10">
          <div className="w-[800px] h-[800px] bg-sky-400 rounded-full blur-3xl absolute top-10 right-10 mix-blend-multiply"></div>
          <div className="w-[600px] h-[600px] bg-blue-600 rounded-full blur-3xl absolute bottom-10 left-10 mix-blend-multiply"></div>
        </div>

        <div className="container relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <h1 className="text-5xl md:text-[5.5rem] leading-tight font-extrabold mb-6 tracking-tight text-slate-900">
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
            className="text-lg md:text-xl mb-12 max-w-2xl mx-auto text-slate-600 font-medium"
          >
            The official portal for verified, compliant, and premium property listings. Promoting sustainable investments and modern living standards.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
            className="bg-white shadow-2xl p-3 max-w-4xl mx-auto flex flex-col md:flex-row gap-3 rounded-2xl border border-slate-100"
          >
            <div className="flex-1 relative flex items-center">
              <Search className="absolute left-5 text-slate-400 w-5 h-5 pointer-events-none" />
              <Input 
                placeholder="Search by location, price, or property type..." 
                className="w-full pl-14 h-14 bg-transparent border-none shadow-none text-lg text-slate-800 placeholder-slate-400 focus-visible:ring-0 focus-visible:border-none focus-visible:outline-none"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="w-px bg-slate-200 hidden md:block my-2"></div>
            <button className="h-14 px-10 rounded-xl bg-gradient-to-r from-blue-800 to-sky-500 text-white font-bold hover:shadow-lg hover:opacity-90 transition-all flex items-center justify-center gap-2">
              <Search className="w-4 h-4" /> Start Search
            </button>
          </motion.div>
        </div>
      </section>

      {/* Filters & Sorting */}
      <section className="container px-4 py-8 relative z-20">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white border border-slate-200 shadow-sm hover:bg-slate-50 transition-all text-sm font-semibold text-slate-700"
          >
            <Filter className="w-4 h-4 text-sky-500" /> {showFilters ? 'Hide Filters' : 'Advanced Filters'}
          </button>

          <div className="flex items-center gap-4">
            <span className="text-xs font-bold uppercase tracking-widest text-slate-500">Sort By:</span>
            <div className="relative group">
              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="appearance-none bg-white border border-slate-200 shadow-sm rounded-xl px-6 py-3 pr-12 text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all cursor-pointer"
              >
                <option value="newest">Newest First</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-20">
          {filteredProperties.length > 0 ? (
            filteredProperties.map((property, index) => (
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
      </section>

      {/* Featured Quote */}
      <section className="py-24 bg-blue-900 text-white text-center px-4 relative overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] mix-blend-overlay"></div>
        <div className="max-w-4xl mx-auto relative z-10">
          <span className="text-sky-400 uppercase tracking-[0.3em] font-bold text-sm mb-6 block">Vision & Mission</span>
          <h2 className="text-3xl md:text-5xl leading-relaxed font-light">
            "We regulate and promote an <span className="font-semibold text-sky-400">inclusive</span> and sustainable sector, ensuring world-class standards."
          </h2>
        </div>
      </section>

      <Footer />
    </div>
  );
}
