'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Search, Eye, MoreVertical, RefreshCcw, Trash2 } from 'lucide-react';
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

  const fetchAdminProperties = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .order('submitted_at', { ascending: false });

      if (error) throw error;
      
      let formattedData: Property[] = [];
      if (data) {
        formattedData = data.map(p => ({
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
      
      if (formattedData.length === 0) {
        setProperties(MOCK_PROPERTIES
          .filter(p => !deletedMockIds.includes(p.id))
          .map(p => ({ ...p, isMock: true }))
        );
      } else {
        setProperties(formattedData);
      }
    } catch (err) {
      console.error('Error fetching admin properties', err);
      const deletedMockIds = JSON.parse(localStorage.getItem('deletedMockIds') || '[]');
      setProperties(MOCK_PROPERTIES
        .filter(p => !deletedMockIds.includes(p.id))
        .map(p => ({ ...p, isMock: true }))
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminProperties();
  }, []);

  const handleDeleteProperty = async (id: string, title: string, isMock?: boolean) => {
    if (!confirm(`Are you sure you want to permanently DELETE "${title}"? This action cannot be undone.`)) return;
    
    try {
      if (isMock) {
        const deletedMockIds = JSON.parse(localStorage.getItem('deletedMockIds') || '[]');
        deletedMockIds.push(id);
        localStorage.setItem('deletedMockIds', JSON.stringify(deletedMockIds));
        
        setProperties(prev => prev.filter(p => p.id !== id));
        return;
      }

      const { error } = await supabase
        .from('properties')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      setProperties(prev => prev.filter(p => p.id !== id));
      alert('Property deleted successfully.');
    } catch (err: any) {
      console.error('Failed to delete property', err);
      alert(`Error: ${err.message || 'Failed to delete property'}`);
    }
  };

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
            <button 
              onClick={fetchAdminProperties} 
              className="p-2 text-slate-400 hover:text-sky-600 transition-colors"
              title="Refresh Data"
            >
              <RefreshCcw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <Badge variant="outline" className="rounded-lg border border-sky-200 text-sky-600 bg-sky-50 px-3 py-1 text-[10px] font-bold shadow-sm">
              Total Database
            </Badge>
            <div className="w-10 h-10 rounded-xl bg-blue-100 border border-blue-200 text-blue-700 flex items-center justify-center font-bold shadow-sm">
              AD
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8">
            <div>
              <h2 className="text-3xl font-bold mb-2 text-slate-900">All Listings</h2>
              <p className="text-slate-500 text-sm">A complete overview of all properties in the platform.</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
              <div className="relative flex-1 sm:flex-none">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input 
                  placeholder="Search titles or owners..." 
                  className="pl-10 h-11 rounded-xl border-slate-200 bg-white w-full sm:w-64 shadow-sm focus-visible:ring-sky-500"
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
                    <TableHead className="uppercase tracking-widest text-[10px] py-6 text-slate-500 font-bold px-8">Property</TableHead>
                    <TableHead className="uppercase tracking-widest text-[10px] text-slate-500 font-bold">Location</TableHead>
                    <TableHead className="uppercase tracking-widest text-[10px] text-slate-500 font-bold">Price</TableHead>
                    <TableHead className="uppercase tracking-widest text-[10px] text-slate-500 font-bold">Status</TableHead>
                    <TableHead className="uppercase tracking-widest text-[10px] text-slate-500 font-bold">Submitted By</TableHead>
                    <TableHead className="uppercase tracking-widest text-[10px] text-right text-slate-500 font-bold px-8">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProperties.length > 0 ? (
                    filteredProperties.map((property) => (
                      <TableRow key={property.id} className="border-slate-100 hover:bg-slate-50 transition-colors">
                        <TableCell className="py-4 px-8">
                          <div className="flex items-center gap-4">
                            <img src={property.imageUrl} alt="" className="w-12 h-12 object-cover rounded-lg border border-slate-200" />
                            <div className="flex flex-col">
                              <div className="font-bold text-slate-800 line-clamp-1">{property.title}</div>
                              {(property as any).isMock && (
                                <span className="text-[8px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded uppercase font-bold tracking-tighter w-fit mt-1">Sample Data</span>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-slate-600 font-medium text-sm whitespace-nowrap">{property.location}</TableCell>
                        <TableCell className="font-bold text-sky-600 whitespace-nowrap">K{property.price.toLocaleString()}</TableCell>
                         <TableCell>
                          <Badge variant="outline" className={`rounded-lg py-1 px-2 text-[10px] uppercase font-bold border ${property.status === 'Approved' ? 'bg-green-50 text-green-700 border-green-200' : property.status === 'Rejected' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-orange-50 text-orange-700 border-orange-200'}`}>
                            {property.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm font-semibold text-slate-700 truncate max-w-[150px]">{property.submittedBy}</div>
                        </TableCell>
                        <TableCell className="text-right px-8">
                          <div className="flex justify-end gap-2">
                             <button 
                               onClick={() => handleDeleteProperty(property.id, property.title, (property as any).isMock)}
                               className="p-2 border border-slate-200 rounded-lg text-slate-400 hover:text-red-700 hover:bg-red-50 hover:border-red-200 transition-colors"
                               title="Delete Permanently"
                             >
                               <Trash2 className="w-4 h-4" />
                             </button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-16 text-slate-500 font-medium">
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
