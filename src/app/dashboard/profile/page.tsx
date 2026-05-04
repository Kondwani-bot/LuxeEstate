'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { User, Phone, Mail, MapPin, Save, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Sidebar from '@/components/Sidebar';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function MemberProfile() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState({
    full_name: '',
    phone: '',
    address: '',
    email: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/');
        return;
      }
      setUser(session.user);
      fetchProfile(session.user.id, session.user.email);
    };

    checkUser();
  }, [router]);

  const fetchProfile = async (userId: string, email: string | undefined) => {
    try {
      const { data, error } = await supabase
        .from('members')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        setProfile({
          full_name: data.full_name || '',
          phone: data.phone || '',
          address: data.address || '',
          email: data.email || email || ''
        });
      } else {
        // Initial state for new user
        setProfile(prev => ({ ...prev, email: email || '' }));
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!profile.full_name || !profile.phone) {
      setMessage({ type: 'error', text: 'Full name and phone number are required.' });
      return;
    }

    setSaving(true);
    setMessage(null);

    try {
      const { error } = await supabase
        .from('members')
        .upsert({
          id: user.id,
          email: user.email,
          full_name: profile.full_name,
          phone: profile.phone,
          address: profile.address,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      
      // Auto redirect to dashboard after a short delay if they just completed it
      setTimeout(() => {
        router.push('/dashboard');
      }, 1500);
    } catch (err: any) {
      console.error('Error saving profile:', err);
      setMessage({ type: 'error', text: err.message || 'Failed to update profile.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex bg-slate-50 min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600"></div>
      </div>
    );
  }

  const isProfileComplete = profile.full_name && profile.phone;

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900">
      <Sidebar role="member" />

      <div className="flex-1 overflow-y-auto">
        <header className="h-20 border-b border-slate-200 bg-white/80 backdrop-blur-md flex items-center justify-between px-8 sticky top-0 z-10">
          <h1 className="text-2xl font-bold tracking-tight text-slate-800">Your Profile</h1>
          {isProfileComplete && (
            <Button 
              variant="outline" 
              onClick={() => router.push('/dashboard')}
              className="rounded-xl border-slate-200 text-slate-600 font-bold text-xs"
            >
              Back to Dashboard
            </Button>
          )}
        </header>

        <main className="max-w-3xl mx-auto p-8">
          {!isProfileComplete && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-sky-50 border border-sky-100 p-4 rounded-2xl flex items-start gap-4 mb-8"
            >
              <div className="p-2 bg-sky-200 rounded-lg text-sky-700">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sky-900 text-sm">Action Required: Profile Incomplete</h3>
                <p className="text-sky-700 text-xs mt-1">
                  Please provide your full name and phone number to access your control panel and list properties.
                </p>
              </div>
            </motion.div>
          )}

          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-8 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 rounded-2xl bg-sky-100 flex items-center justify-center text-sky-600">
                  <User className="w-10 h-10" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-800">{profile.full_name || 'New Member'}</h2>
                  <p className="text-slate-500 text-sm flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5" /> {profile.email}
                  </p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSave} className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block ml-1">Full Name *</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input 
                      required
                      placeholder="e.g. John Doe"
                      className="pl-10 h-12 rounded-xl border-slate-200 focus-visible:ring-sky-500"
                      value={profile.full_name}
                      onChange={e => setProfile(prev => ({ ...prev, full_name: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block ml-1">Phone Number *</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input 
                      required
                      placeholder="e.g. +260 971 000 000"
                      type="tel"
                      className="pl-10 h-12 rounded-xl border-slate-200 focus-visible:ring-sky-500"
                      value={profile.phone}
                      onChange={e => setProfile(prev => ({ ...prev, phone: e.target.value }))}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block ml-1">Current Address</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                  <textarea 
                    placeholder="Where are you currently located?"
                    className="w-full min-h-[100px] pl-10 pr-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all text-sm"
                    value={profile.address}
                    onChange={e => setProfile(prev => ({ ...prev, address: e.target.value }))}
                  />
                </div>
              </div>

              {message && (
                <div className={`p-4 rounded-xl text-sm font-medium ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
                  {message.text}
                </div>
              )}

              <div className="pt-4">
                <Button 
                  type="submit" 
                  disabled={saving}
                  className="w-full h-12 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold flex items-center justify-center gap-2 shadow-lg shadow-slate-200"
                >
                  {saving ? (
                    <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                  ) : (
                    <>
                      <Save className="w-4 h-4" /> Save Profile Details
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>

          <div className="mt-8 text-center">
            <p className="text-slate-400 text-[10px] uppercase font-bold tracking-widest">
              Lush Real Estate Member Network • Account Verification Required
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}
