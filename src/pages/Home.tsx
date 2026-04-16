import { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { Search, MapPin, Filter, SlidersHorizontal, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MOCK_PROPERTIES } from '@/data/mockData';
import PropertyCard from '@/components/PropertyCard';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterLocation, setFilterLocation] = useState('All');
  const [filterType, setFilterType] = useState('All');
  const [filterMinPrice, setFilterMinPrice] = useState('');
  const [filterMaxPrice, setFilterMaxPrice] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [showFilters, setShowFilters] = useState(false);

  const locations = useMemo(() => ['All', ...new Set(MOCK_PROPERTIES.map(p => p.location.split(',')[0]))], []);
  const types = ['All', 'House', 'Apartment', 'Villa', 'Penthouse'];

  const filteredProperties = useMemo(() => {
    return MOCK_PROPERTIES
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
    <div className="min-h-screen flex flex-col bg-background text-white">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative pt-40 pb-20 px-4 text-center">
        <div className="container relative z-10">
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-5xl md:text-7xl font-bold mb-6 tracking-tight"
          >
            Find your sanctuary.
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-lg md:text-xl mb-12 max-w-2xl mx-auto text-muted-foreground font-medium"
          >
            Discover premium listings curated for modern living. Translucent design meets unparalleled comfort.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="bg-glass backdrop-blur-[20px] p-2 max-w-3xl mx-auto flex flex-col md:flex-row gap-2 border border-glass-border rounded-2xl"
          >
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 w-5 h-5" />
              <Input 
                placeholder="Search by location, price, or property type..." 
                className="luxury-input pl-12 h-14 w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button className="h-14 px-10 rounded-xl bg-accent text-black font-bold hover:bg-accent/90 transition-all">
              Search
            </button>
          </motion.div>
        </div>
      </section>

      {/* Filters & Sorting */}
      <section className="container px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white/5 border border-glass-border hover:bg-white/10 transition-all text-sm font-bold uppercase tracking-widest"
          >
            <Filter className="w-4 h-4" /> {showFilters ? 'Hide Filters' : 'Show Filters'}
          </button>

          <div className="flex items-center gap-4">
            <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Sort By:</span>
            <div className="relative group">
              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="appearance-none bg-white/5 border border-glass-border rounded-xl px-6 py-3 pr-12 text-sm font-bold uppercase tracking-widest focus:outline-none focus:ring-1 focus:ring-accent transition-all cursor-pointer"
              >
                <option value="newest" className="bg-background">Newest First</option>
                <option value="price-low" className="bg-background">Price: Low to High</option>
                <option value="price-high" className="bg-background">Price: High to Low</option>
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            </div>
          </div>
        </div>

        {showFilters && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 md:grid-cols-4 gap-6 p-8 glass-panel rounded-3xl mb-12"
          >
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Location</label>
              <div className="relative">
                <select 
                  value={filterLocation}
                  onChange={(e) => setFilterLocation(e.target.value)}
                  className="w-full appearance-none bg-white/5 border border-glass-border rounded-xl px-4 py-3 pr-10 text-sm font-medium focus:outline-none focus:ring-1 focus:ring-accent transition-all"
                >
                  {locations.map(loc => <option key={loc} value={loc} className="bg-background">{loc}</option>)}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Property Type</label>
              <div className="relative">
                <select 
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="w-full appearance-none bg-white/5 border border-glass-border rounded-xl px-4 py-3 pr-10 text-sm font-medium focus:outline-none focus:ring-1 focus:ring-accent transition-all"
                >
                  {types.map(t => <option key={t} value={t} className="bg-background">{t}</option>)}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Min Price (K)</label>
              <Input 
                type="number" 
                placeholder="Min" 
                value={filterMinPrice}
                onChange={(e) => setFilterMinPrice(e.target.value)}
                className="luxury-input bg-white/5 border border-glass-border rounded-xl px-4 h-12"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Max Price (K)</label>
              <Input 
                type="number" 
                placeholder="Max" 
                value={filterMaxPrice}
                onChange={(e) => setFilterMaxPrice(e.target.value)}
                className="luxury-input bg-white/5 border border-glass-border rounded-xl px-4 h-12"
              />
            </div>
          </motion.div>
        )}

        {/* Property Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProperties.length > 0 ? (
            filteredProperties.map((property, index) => (
              <motion.div
                key={property.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <PropertyCard property={property} />
              </motion.div>
            ))
          ) : (
            <div className="col-span-full py-32 text-center">
              <div className="text-2xl font-bold mb-4">No properties found.</div>
              <p className="text-muted-foreground">Try adjusting your filters or search query.</p>
              <button 
                onClick={() => {
                  setSearchQuery('');
                  setFilterLocation('All');
                  setFilterType('All');
                  setFilterMinPrice('');
                  setFilterMaxPrice('');
                }}
                className="mt-8 btn-glass text-xs font-bold uppercase tracking-widest"
              >
                Clear All Filters
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Featured Quote */}
      <section className="py-32 bg-primary text-primary-foreground text-center px-4">
        <div className="max-w-4xl mx-auto">
          <span className="text-accent uppercase tracking-[0.3em] text-sm mb-8 block">Philosophy</span>
          <h2 className="text-3xl md:text-5xl leading-relaxed italic font-light">
            "Luxury is not about price. It's about the <span className="font-serif">soul</span> of a place and the stories it tells."
          </h2>
          <div className="mt-12 w-12 h-px bg-accent mx-auto"></div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
