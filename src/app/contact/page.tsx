'use client';

import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { motion } from 'motion/react';
import { Mail, Phone, MapPin, Send } from 'lucide-react';
import { Input } from '@/components/ui/input';

export default function ContactPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Navbar />
      
      {/* Header */}
      <section className="pt-48 pb-12 px-4 text-center">
        <div className="container max-w-3xl mx-auto">
           <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-4xl md:text-5xl font-extrabold mb-4 tracking-tight text-slate-900">
              Get in Touch
            </h1>
            <p className="text-lg text-slate-500 font-medium leading-relaxed">
              We are here to assist with your portfolio inquiries, partnership opportunities, and regulatory compliance queries.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12 flex-1">
        <div className="container px-4 max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16">
          
          {/* Contact Details */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            <h2 className="text-2xl font-bold uppercase tracking-widest text-slate-800 border-b border-slate-200 pb-4">Contact Information</h2>
            
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-sky-50 flex items-center justify-center shrink-0">
                <MapPin className="text-sky-600 w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-slate-900">Headquarters</h3>
                <p className="text-slate-500 mt-1">Luxe Estate Tower, Floor 14<br />Lusaka, Central Business District</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-sky-50 flex items-center justify-center shrink-0">
                <Mail className="text-sky-600 w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-slate-900">Email Us</h3>
                <p className="text-slate-500 mt-1">inquiries@luxeestate.com<br />regulatory@luxeestate.com</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-sky-50 flex items-center justify-center shrink-0">
                <Phone className="text-sky-600 w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-slate-900">Call Us</h3>
                <p className="text-slate-500 mt-1">+260 211 123 456<br />Mon-Fri, 08:00 AM - 05:00 PM</p>
              </div>
            </div>
          </motion.div>

          {/* Contact Form */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="bg-white p-8 md:p-10 rounded-2xl border border-slate-200 shadow-xl"
          >
             <h2 className="text-2xl font-bold mb-6 text-slate-900">Send a Message</h2>
             <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="space-y-2">
                   <label className="text-xs font-bold uppercase tracking-widest text-slate-500">First Name</label>
                   <Input placeholder="John" className="h-12 bg-slate-50 font-medium" />
                 </div>
                 <div className="space-y-2">
                   <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Last Name</label>
                   <Input placeholder="Doe" className="h-12 bg-slate-50 font-medium" />
                 </div>
               </div>
               <div className="space-y-2">
                 <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Email Address</label>
                 <Input type="email" placeholder="john@company.com" className="h-12 bg-slate-50 font-medium" />
               </div>
               <div className="space-y-2">
                 <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Subject</label>
                 <Input placeholder="How can we help?" className="h-12 bg-slate-50 font-medium" />
               </div>
               <div className="space-y-2">
                 <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Message</label>
                 <textarea 
                   rows={5} 
                   className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-medium focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all resize-none"
                   placeholder="Your message details..."
                 ></textarea>
               </div>
               <button type="submit" className="w-full h-14 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-2">
                 <Send className="w-4 h-4" /> Send Request
               </button>
             </form>
          </motion.div>

        </div>
      </section>

      <Footer />
    </div>
  );
}
