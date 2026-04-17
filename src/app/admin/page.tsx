'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Check, X, Eye, Search, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { MOCK_PROPERTIES } from '@/data/mockData';
import Sidebar from '@/components/Sidebar';
import { supabase } from '@/lib/supabase';
import { Property } from '@/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function AdminDashboard() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

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

  const pendingProperties = properties.filter(p => p.status === 'Pending');

  const handleAction = async (id: string, status: 'Approved' | 'Rejected') => {
    try {
      const { error } = await supabase
        .from('properties')
        .update({ status })
        .eq('id', id);
        
      if (error) throw error;
      setProperties(prev => prev.map(p => p.id === id ? { ...p, status } : p));
    } catch (err) {
      console.error('Failed to update status', err);
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900">
      <Sidebar role="admin" />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-20 border-b border-slate-200 bg-white/80 backdrop-blur-md flex items-center justify-between px-8 shadow-sm z-10 shrink-0">
          <h1 className="text-2xl font-bold tracking-tight text-slate-800">Admin Console</h1>
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="rounded-lg border border-red-200 text-red-600 bg-red-50 px-3 py-1 text-[10px] font-bold shadow-sm">
              {pendingProperties.length} Pending Reviews
            </Badge>
            <div className="w-10 h-10 rounded-xl bg-blue-100 border border-blue-200 text-blue-700 flex items-center justify-center font-bold shadow-sm">
              AD
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-8">
          <div className="mb-12">
            <div className="flex justify-between items-end mb-8">
              <div>
                <h2 className="text-3xl font-bold mb-2 text-slate-900">Pending Approvals</h2>
                <p className="text-slate-500 text-sm">Review and manage new property submissions.</p>
              </div>
              <div className="flex gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input placeholder="Search submissions..." className="pl-10 h-10 rounded-xl border-slate-200 bg-white w-64 shadow-sm focus-visible:ring-sky-500" />
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
                    <TableHead className="uppercase tracking-widest text-[10px] text-slate-500 font-bold">Submitted By</TableHead>
                    <TableHead className="uppercase tracking-widest text-[10px] text-right text-slate-500 font-bold">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingProperties.length > 0 ? (
                    pendingProperties.map((property) => (
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
                          <div className="text-sm font-semibold text-slate-700">{property.submittedBy}</div>
                          <div className="text-[10px] text-slate-400 font-medium">{new Date(property.submittedAt).toLocaleDateString()}</div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <button className="p-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors">
                              <Eye className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => handleAction(property.id, 'Approved')}
                              className="p-2 border border-slate-200 rounded-lg text-green-600 hover:bg-green-50 hover:border-green-200 transition-colors"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => handleAction(property.id, 'Rejected')}
                              className="p-2 border border-slate-200 rounded-lg text-red-600 hover:bg-red-50 hover:border-red-200 transition-colors"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-16 text-slate-500 font-medium">
                        No pending submissions at this time.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-6 text-slate-900">Recent Activity</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {properties.filter(p => p.status !== 'Pending').slice(0, 4).map(p => (
                <div key={p.id} className="bg-white border border-slate-200 shadow-sm p-4 rounded-2xl flex items-center gap-4 hover:shadow-md transition-shadow">
                  <div className={`w-2 h-10 rounded-full ${p.status === 'Approved' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <div className="flex-1 overflow-hidden">
                    <div className="text-xs font-bold truncate text-slate-800">{p.title}</div>
                    <div className="text-[10px] uppercase tracking-widest text-slate-500">{p.status}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
