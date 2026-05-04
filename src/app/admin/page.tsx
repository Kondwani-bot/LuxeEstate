'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Check, X, Eye, Search, Filter, RefreshCcw, Trash2, MapPin } from 'lucide-react';
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

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [activeTab, setActiveTab] = useState<'Pending' | 'Approved' | 'Rejected'>('Pending');

  const filteredByStatusProperties = properties.filter(p => 
    p.status === activeTab && 
    (p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
     p.submittedBy.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const stats = {
    pending: properties.filter(p => p.status === 'Pending').length,
    approved: properties.filter(p => p.status === 'Approved').length,
    rejected: properties.filter(p => p.status === 'Rejected').length,
  };

  const handleAction = async (id: string, status: 'Approved' | 'Rejected') => {
    const propertyToUpdate = properties.find(p => p.id === id);
    
    try {
      if (propertyToUpdate?.isMock) {
        alert('This is a SAMPLE property (not in your database) and cannot be approved. Please review a REAL submission from a member.');
        return;
      }

      console.log(`Updating property ${id} to status: ${status}`);
      const { data, error } = await supabase
        .from('properties')
        .update({ status })
        .eq('id', id)
        .select();
        
      if (error) throw error;
      
      if (!data || data.length === 0) {
        throw new Error('Update failed: Database rejected the update. Please ensure you have run the RLS policies SQL in your Supabase dashboard.');
      }

      setProperties(prev => prev.map(p => p.id === id ? { ...p, status } : p));
      if (selectedProperty?.id === id) setSelectedProperty(null);
      alert(`Property ${status.toLowerCase()} successfully!`);
    } catch (err: any) {
      console.error('Failed to update status', err);
      alert(`Error: ${err.message || 'Failed to update status'}`);
    }
  };

  const handleDeleteProperty = async (id: string) => {
    const propertyToDelete = properties.find(p => p.id === id);
    
    if (!confirm(`Are you sure you want to permanently DELETE "${propertyToDelete?.title}"? This action cannot be undone.`)) return;
    
    try {
      if (propertyToDelete?.isMock) {
        const deletedMockIds = JSON.parse(localStorage.getItem('deletedMockIds') || '[]');
        deletedMockIds.push(id);
        localStorage.setItem('deletedMockIds', JSON.stringify(deletedMockIds));
        
        setProperties(prev => prev.filter(p => p.id !== id));
        return;
      }

      const { data, error } = await supabase
        .from('properties')
        .delete()
        .eq('id', id)
        .select();
      
      if (error) throw error;
      
      if (!data || data.length === 0) {
        throw new Error('Deletion failed: The database rejected the request. Please ensure you have run the "Delete" RLS Policy SQL in your Supabase dashboard.');
      }
      
      setProperties(prev => prev.filter(p => p.id !== id));
      if (selectedProperty?.id === id) setSelectedProperty(null);
      alert('Property deleted successfully.');
    } catch (err: any) {
      console.error('Failed to delete property', err);
      alert(`Error: ${err.message || 'Failed to delete property'}`);
    }
  };

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
            <Badge variant="outline" className="rounded-lg border border-red-200 text-red-600 bg-red-50 px-3 py-1 text-[10px] font-bold shadow-sm">
              {stats.pending} Pending Reviews
            </Badge>
            <div className="w-10 h-10 rounded-xl bg-blue-100 border border-blue-200 text-blue-700 flex items-center justify-center font-bold shadow-sm">
              AD
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-8 relative">
          {/* Detailed Image Review Modal/Overlay */}
          {selectedProperty && (
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
              >
                <div className="p-8 border-b border-slate-100 flex justify-between items-start sticky top-0 bg-white z-10">
                  <div className="flex-1 text-center pr-8">
                    <h2 className="text-2xl font-bold text-slate-900">{selectedProperty.title}</h2>
                    <p className="text-sm text-slate-500 flex items-center justify-center gap-1">
                      <MapPin className="w-4 h-4 text-sky-500" />
                      {selectedProperty.location}
                    </p>
                  </div>
                  <button onClick={() => setSelectedProperty(null)} className="p-2 hover:bg-slate-100 rounded-full transition-colors shrink-0">
                    <X className="w-6 h-6" />
                  </button>
                </div>
                <div className="p-8 space-y-8 text-center">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {selectedProperty.images.map((img, i) => (
                      <div key={i} className="aspect-[4/3] rounded-xl overflow-hidden border border-slate-200">
                        <img src={img} alt="" className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                  <div className="bg-slate-50 p-6 rounded-2xl inline-block w-full">
                    <h3 className="font-bold mb-2 uppercase tracking-widest text-[10px] text-slate-500">Description</h3>
                    <p className="text-slate-700 leading-relaxed text-sm max-w-2xl mx-auto">{selectedProperty.description}</p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-4 pt-4 max-w-xl mx-auto">
                    <button 
                      onClick={() => handleAction(selectedProperty.id, 'Approved')}
                      className="flex-1 h-14 bg-green-600 text-white font-bold uppercase tracking-widest text-[10px] rounded-xl hover:bg-green-700 transition-all flex items-center justify-center gap-2"
                    >
                      <Check className="w-4 h-4" /> {selectedProperty.status === 'Approved' ? 'Already Approved' : 'Approve Listing'}
                    </button>
                    <button 
                      onClick={() => handleAction(selectedProperty.id, 'Rejected')}
                      className="flex-1 h-14 bg-red-600 text-white font-bold uppercase tracking-widest text-[10px] rounded-xl hover:bg-red-700 transition-all flex items-center justify-center gap-2"
                    >
                      <X className="w-4 h-4" /> {selectedProperty.status === 'Rejected' ? 'Already Rejected' : 'Reject Listing'}
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}

          <div className="mb-12">
            <div className="flex flex-col items-center text-center gap-6 mb-8">
              <div>
                <h2 className="text-3xl font-bold mb-2 text-slate-900">Property Management</h2>
                <p className="text-slate-500 text-sm">Review, approve, or reject property submissions.</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                <div className="relative flex-1 sm:flex-none">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input 
                    placeholder="Search submissions..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 h-11 rounded-xl border-slate-200 bg-white w-full sm:w-64 shadow-sm focus-visible:ring-sky-500" 
                  />
                </div>
              </div>
            </div>

            <div className="flex border-b border-slate-200 mb-8 gap-8 overflow-x-auto pb-px">
              {(['Pending', 'Approved', 'Rejected'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`pb-4 text-xs font-bold uppercase tracking-[0.2em] transition-all relative ${
                    activeTab === tab ? 'text-sky-600' : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  {tab} ({tab === 'Pending' ? stats.pending : tab === 'Approved' ? stats.approved : stats.rejected})
                  {activeTab === tab && (
                    <motion.div layoutId="activeAdminTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-sky-600" />
                  )}
                </button>
              ))}
            </div>

            <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
              <Table>
                <TableHeader className="bg-slate-50">
                  <TableRow className="border-slate-200">
                    <TableHead className="uppercase tracking-widest text-[10px] py-6 text-slate-500 font-bold px-8">Property</TableHead>
                    <TableHead className="uppercase tracking-widest text-[10px] text-slate-500 font-bold">Location</TableHead>
                    <TableHead className="uppercase tracking-widest text-[10px] text-slate-500 font-bold">Price</TableHead>
                    <TableHead className="uppercase tracking-widest text-[10px] text-slate-500 font-bold">Submitted By</TableHead>
                    <TableHead className="uppercase tracking-widest text-[10px] text-right text-slate-500 font-bold px-8">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredByStatusProperties.length > 0 ? (
                    filteredByStatusProperties.map((property) => (
                      <TableRow key={property.id} className="border-slate-100 hover:bg-slate-50 transition-colors">
                        <TableCell className="py-4 px-8">
                          <div className="flex items-center gap-4">
                            <img src={property.imageUrl} alt="" className="w-12 h-12 object-cover rounded-lg border border-slate-200 whitespace-nowrap" />
                            <div className="flex flex-col">
                              <div className="font-bold text-slate-800 line-clamp-1">{property.title}</div>
                              {property.isMock && (
                                <span className="text-[8px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded uppercase font-bold tracking-tighter w-fit mt-1">Sample Data</span>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-slate-600 font-medium text-sm whitespace-nowrap">{property.location}</TableCell>
                        <TableCell className="font-bold text-sky-600 whitespace-nowrap">K{property.price.toLocaleString()}</TableCell>
                        <TableCell>
                          <div className="text-sm font-semibold text-slate-700 truncate max-w-[150px]">{property.submittedBy}</div>
                          <div className="text-[10px] text-slate-400 font-medium">{new Date(property.submittedAt).toLocaleDateString()}</div>
                        </TableCell>
                        <TableCell className="text-right px-8">
                          <div className="flex justify-end gap-2">
                            <button 
                              onClick={() => setSelectedProperty(property)}
                              className="p-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
                              title="View Details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            {property.status !== 'Approved' && (
                              <button 
                                onClick={() => handleAction(property.id, 'Approved')}
                                className="p-2 border border-slate-200 rounded-lg text-green-600 hover:bg-green-50 hover:border-green-200 transition-colors"
                                title="Approve"
                              >
                                <Check className="w-4 h-4" />
                              </button>
                            )}
                            {property.status !== 'Rejected' && (
                              <button 
                                onClick={() => handleAction(property.id, 'Rejected')}
                                className="p-2 border border-slate-200 rounded-lg text-red-600 hover:bg-red-50 hover:border-red-200 transition-colors"
                                title="Reject"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            )}
                            <button 
                              onClick={() => handleDeleteProperty(property.id)}
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
                      <TableCell colSpan={5} className="text-center py-16 text-slate-500 font-medium">
                        {searchQuery ? "No matching submissions found." : `No ${activeTab.toLowerCase()} properties at this time.`}
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
