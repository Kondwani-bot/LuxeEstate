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
    <div className="flex h-screen bg-background text-white">
      <Sidebar role="admin" />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-20 border-b border-glass-border bg-black/20 backdrop-blur-md flex items-center justify-between px-8">
          <h1 className="text-2xl font-bold tracking-tight">Admin Console</h1>
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="rounded-lg border-none text-red-400 bg-red-500/20 px-3 py-1 text-[10px] font-bold">
              {pendingProperties.length} Pending Reviews
            </Badge>
            <div className="w-10 h-10 rounded-xl bg-primary text-black flex items-center justify-center font-bold">
              AD
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-8">
          <div className="mb-12">
            <div className="flex justify-between items-end mb-8">
              <div>
                <h2 className="text-3xl font-bold mb-2">Pending Approvals</h2>
                <p className="text-muted-foreground text-sm">Review and manage new property submissions.</p>
              </div>
              <div className="flex gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input placeholder="Search submissions..." className="pl-10 h-10 rounded-xl border-glass-border bg-white/5 w-64" />
                </div>
              </div>
            </div>

            <div className="glass-panel rounded-3xl overflow-hidden shadow-2xl">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent border-glass-border">
                    <TableHead className="uppercase tracking-widest text-[10px] py-6 text-muted-foreground font-bold">Property</TableHead>
                    <TableHead className="uppercase tracking-widest text-[10px] text-muted-foreground font-bold">Location</TableHead>
                    <TableHead className="uppercase tracking-widest text-[10px] text-muted-foreground font-bold">Price</TableHead>
                    <TableHead className="uppercase tracking-widest text-[10px] text-muted-foreground font-bold">Submitted By</TableHead>
                    <TableHead className="uppercase tracking-widest text-[10px] text-right text-muted-foreground font-bold">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingProperties.length > 0 ? (
                    pendingProperties.map((property) => (
                      <TableRow key={property.id} className="border-glass-border hover:bg-white/5">
                        <TableCell className="py-4">
                          <div className="flex items-center gap-4">
                            <img src={property.imageUrl} alt="" className="w-12 h-12 object-cover rounded-lg" />
                            <div className="font-medium">{property.title}</div>
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">{property.location}</TableCell>
                        <TableCell className="font-bold text-accent">K{property.price.toLocaleString()}</TableCell>
                        <TableCell>
                          <div className="text-sm">{property.submittedBy}</div>
                          <div className="text-[10px] text-muted-foreground">{property.submittedAt}</div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <button className="btn-glass p-2 hover:text-accent">
                              <Eye className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => handleAction(property.id, 'Approved')}
                              className="btn-glass p-2 hover:text-green-400"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => handleAction(property.id, 'Rejected')}
                              className="btn-glass p-2 hover:text-red-400"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                        No pending submissions at this time.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-6">Recent Activity</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {properties.filter(p => p.status !== 'Pending').slice(0, 4).map(p => (
                <div key={p.id} className="glass-panel p-4 rounded-2xl flex items-center gap-4">
                  <div className={`w-2 h-10 rounded-full ${p.status === 'Approved' ? 'bg-green-400' : 'bg-red-400'}`}></div>
                  <div>
                    <div className="text-xs font-bold truncate w-32">{p.title}</div>
                    <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{p.status}</div>
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
