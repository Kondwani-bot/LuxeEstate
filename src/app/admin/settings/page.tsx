'use client';

import React, { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

function SimpleToggle({ defaultChecked = false }: { defaultChecked?: boolean }) {
  const [checked, setChecked] = useState(defaultChecked);
  return (
    <button 
      onClick={() => setChecked(!checked)}
      className={`w-11 h-6 rounded-full transition-colors relative ${checked ? 'bg-sky-500' : 'bg-slate-200'}`}
    >
      <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
    </button>
  );
}

export default function AdminSettings() {
  return (
    <div className="flex h-screen bg-slate-50 text-slate-900">
      <Sidebar role="admin" />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-20 border-b border-slate-200 bg-white/80 backdrop-blur-md flex items-center justify-between px-8 shadow-sm z-10 shrink-0">
          <h1 className="text-2xl font-bold tracking-tight text-slate-800">Admin Console</h1>
          <div className="flex items-center gap-4">
             <div className="w-10 h-10 rounded-xl bg-blue-100 border border-blue-200 text-blue-700 flex items-center justify-center font-bold shadow-sm">
              AD
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-8">
           <div className="mb-8">
              <h2 className="text-3xl font-bold mb-2 text-slate-900">Platform Settings</h2>
              <p className="text-slate-500 text-sm">Manage core configuration and application parameters.</p>
           </div>

           <div className="max-w-4xl space-y-6">
              {/* General Settings */}
              <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                <h3 className="text-lg font-bold mb-6 text-slate-800 border-b border-slate-100 pb-4">General Configuration</h3>
                
                <div className="space-y-6">
                  <div className="grid gap-2">
                    <Label className="text-xs font-bold uppercase tracking-widest text-slate-500">Platform Name</Label>
                    <Input defaultValue="Luxe Estate" className="h-12 bg-slate-50 rounded-xl font-medium max-w-md" />
                  </div>
                  <div className="grid gap-2">
                    <Label className="text-xs font-bold uppercase tracking-widest text-slate-500">Support Email</Label>
                    <Input defaultValue="support@luxeestate.com" className="h-12 bg-slate-50 rounded-xl font-medium max-w-md" />
                  </div>
                </div>
              </div>

              {/* Preferences */}
              <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                <h3 className="text-lg font-bold mb-6 text-slate-800 border-b border-slate-100 pb-4">Preferences</h3>
                
                <div className="space-y-6">
                  <div className="flex items-center justify-between py-2 border-b border-slate-50">
                    <div>
                      <h4 className="font-bold text-sm text-slate-900">Auto-Approve Trusted Members</h4>
                      <p className="text-xs text-slate-500 mt-1">Automatically approve property submissions from verified agents.</p>
                    </div>
                    <SimpleToggle />
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-slate-50">
                    <div>
                      <h4 className="font-bold text-sm text-slate-900">Email Notifications</h4>
                      <p className="text-xs text-slate-500 mt-1">Receive daily digests of new property submissions.</p>
                    </div>
                    <SimpleToggle defaultChecked />
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <div>
                      <h4 className="font-bold text-sm text-slate-900">Maintenance Mode</h4>
                      <p className="text-xs text-slate-500 mt-1">Temporarily disable public access to the platform.</p>
                    </div>
                    <SimpleToggle />
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <button className="h-12 px-8 bg-sky-600 text-white rounded-xl font-bold uppercase tracking-widest text-[10px] hover:bg-sky-700 transition-colors shadow-sm">
                  Save Changes
                </button>
              </div>
           </div>
        </main>
      </div>
    </div>
  );
}
