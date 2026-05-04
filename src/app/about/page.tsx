'use client';

import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { motion } from 'motion/react';
import { ShieldCheck, TrendingUp, Globe, Building } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative pt-48 pb-20 px-4 text-center overflow-hidden">
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-10">
          <div className="w-[600px] h-[600px] bg-sky-400 rounded-full blur-3xl absolute top-10 right-20 mix-blend-multiply"></div>
        </div>

        <div className="container relative z-10 max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-4xl md:text-6xl font-extrabold mb-6 tracking-tight text-slate-900">
              Transforming How We <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-800 to-sky-500">View Real Estate.</span>
            </h1>
          </motion.div>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-lg md:text-xl text-slate-600 font-medium leading-relaxed"
          >
            Luxe Estate is a premium regulatory portal setting the standard for verified, 
            luxurious, and transparent property portfolios. Our mission is to bridge 
            high-end real estate developers with discerning clientele around the globe securely.
          </motion.p>
        </div>
      </section>

      {/* Core Pillars */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold uppercase tracking-widest text-center mb-16 text-slate-800">Our Core Pillars</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: <ShieldCheck className="w-8 h-8 text-sky-500" />, title: 'Verification', desc: 'Strict regulatory oversight ensures all properties meet elite standards.' },
              { icon: <Building className="w-8 h-8 text-sky-500" />, title: 'Premium Portfolios', desc: 'Curating the most sought-after housing markets globally.' },
              { icon: <TrendingUp className="w-8 h-8 text-sky-500" />, title: 'Sustainable Growth', desc: 'Promoting eco-friendly infrastructures in high-density areas.' },
              { icon: <Globe className="w-8 h-8 text-sky-500" />, title: 'Global Transparency', desc: 'Offering a seamless experience to both local and international investors.' }
            ].map((pillar, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                className="p-8 bg-slate-50 border border-slate-100 rounded-2xl flex flex-col items-center text-center hover:shadow-lg transition-shadow"
              >
                <div className="p-4 bg-sky-50 rounded-xl mb-6">{pillar.icon}</div>
                <h3 className="text-xl font-bold mb-4 text-slate-900">{pillar.title}</h3>
                <p className="text-slate-500 leading-relaxed font-sm font-medium">{pillar.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team/Story Section Demo */}
      <section className="py-24 bg-blue-900 text-white text-center px-4 relative overflow-hidden">
         <div className="absolute inset-0 z-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] mix-blend-overlay"></div>
         <div className="max-w-4xl mx-auto relative z-10">
           <span className="text-sky-400 uppercase tracking-[0.3em] font-bold text-sm mb-6 block">Our Vision</span>
           <h2 className="text-3xl md:text-5xl leading-relaxed font-light text-white">
             "To be the authoritative hub for exclusive real estate, where <span className="font-semibold text-sky-400">trust</span> meets luxury."
           </h2>
         </div>
      </section>

      <Footer />
    </div>
  );
}
