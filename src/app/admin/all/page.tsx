'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Search, Eye, MoreVertical } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import Sidebar from '@/components/Sidebar';
import { supabase } from '@/lib/supabase';
import { Property } from '@/types';
import { MOCK_PROPERTIES } from '@/data/mockData';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function AdminAllListings() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchAdminProperties = async () => {
      try {
        const { data, error } = await supabase
          .from('properties')
          .select('*');

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
          setProperties(formattedData);
        }
      } catch (err) {
        console.error('Error fetching admin properties', err);
        setProperties(MOCK_PROPERTIES);
      } finally {
        setLoading(false);
      }
    };

    fetchAdminProperties();
  }, []);

  const filteredProperties = properties.filter(p => 
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.submittedBy.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900">
      <Sidebar role="admin" />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-20 border-b border-slate-200 bg-white/80 backdrop-blur-md flex items-center justify-between px-8 shadow-sm z-10 shrink-0">
          <h1 className="text-2xl font-bold tracking-tight text-slate-800">Admin Console</h1>
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="rounded-lg border border-sky-200 text-sky-600 bg-sky-50 px-3 py-1 text-[10px] font-bold shadow-sm">
              Total Database
            </Badge>
            <div className="w-10 h-10 rounded-xl bg-blue-100 border border-blue-200 text-blue-700 flex items-center justify-center font-bold shadow-sm">
              AD
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-8">
          <div className="flex justify-between items-end mb-8">
            <div>
              <h2 className="text-3xl font-bold mb-2 text-slate-900">All Listings</h2>
              <p className="text-slate-500 text-sm">A complete overview of all properties in the platform.</p>
            </div>
            <div className="flex gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input 
                  placeholder="Search titles or owners..." 
                  className="pl-10 h-10 rounded-xl border-slate-200 bg-white w-64 shadow-sm focus-visible:ring-sky-500"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
             <Table>
                <TableHeader className="bg-slate-50">
                  <TableRow className="border-slate-200">
                    <TableHead className="uppercase tracking-widest text-[10px] py-6 text-slate-500 font-bold">Property</TableHead>
                    <TableHead className="uppercase tracking-widest text-[10px] text-slate-500 font-bold">Location</TableHead>
                    <TableHead className="uppercase tracking-widest text-[10px] text-slate-500 font-bold">Price</TableHead>
                    <TableHead className="uppercase tracking-widest text-[10px] text-slate-500 font-bold">Status</TableHead>
                    <TableHead className="uppercase tracking-widest text-[10px] text-slate-500 font-bold">Submitted By</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProperties.length > 0 ? (
                    filteredProperties.map((property) => (
                      <TableRow key={property.id} className="border-slate-100 hover:bg-slate-50 transition-colors">
                        <TableCell className="py-4">
                          <div className="flex items-center gap-4">
                            <img src={property.imageUrl} alt="" className="w-12 h-12 object-cover rounded-lg border border-slate-200" />
                            <div className="font-bold text-slate-800">{property.title}</div>
                          </div>
                        </TableCell>
                        <TableCell className="text-slate-600 font-medium text-sm">{property.location}</TableCell>
                        <TableCell className="font-bold text-sky-600">K{property.price.toLocaleString()}</TableCell>
                         <TableCell>
                          <Badge variant="outline" className={`rounded-lg py-1 px-2 text-[10px] uppercase font-bold border ${property.status === 'Approved' ? 'bg-green-50 text-green-700 border-green-200' : property.status === 'Rejected' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-orange-50 text-orange-700 border-orange-200'}`}>
                            {property.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm font-semibold text-slate-700">{property.submittedBy}</div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-16 text-slate-500 font-medium">
                        No properties found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
          </div>
        </main>
      </div>
    </div>
  );
}
