'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Bot, Radio, X, Send, Sparkles, CheckCircle2, FileSpreadsheet, 
  Copy, ExternalLink, Settings, Mic, MicOff, Volume2, VolumeX, MessageSquare, ArrowRight, ShieldCheck, Database
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Property } from '@/types';
import Link from 'next/link';

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  scheduledMeeting?: any;
  submittedInquiry?: any;
}

export default function AIAgentWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'agent' | 'architecture'>('agent');
  
  // ElevenLabs Agent ID Configuration
  const [agentId, setAgentId] = useState<string>('');
  const [inputAgentId, setInputAgentId] = useState<string>('');
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  // Fallback Simulation State (when testing before pasting ElevenLabs ID)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: "Welcome to LuxeEstate. I am Aria, your AI Voice Concierge. Connect your ElevenLabs Conversational Voice Agent or try our Instant Voice Simulation below to explore villas, pricing, and book private showings!",
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [properties, setProperties] = useState<Property[]>([]);
  const [lastSyncedNotification, setLastSyncedNotification] = useState<string | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Load saved ElevenLabs Agent ID on mount
  useEffect(() => {
    const envAgentId = process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID;
    const localAgentId = localStorage.getItem('luxeestate_elevenlabs_agent_id');
    const activeId = localAgentId || envAgentId || '';
    if (activeId) {
      setAgentId(activeId);
      setInputAgentId(activeId);
    }
  }, []);

  // Dynamically load ElevenLabs ConvAI widget script when agentId is present
  useEffect(() => {
    if (!agentId) return;

    const existingScript = document.querySelector('script[src="https://elevenlabs.io/convai-widget/index.js"]');
    if (!existingScript) {
      const script = document.createElement('script');
      script.src = 'https://elevenlabs.io/convai-widget/index.js';
      script.async = true;
      script.type = 'text/javascript';
      script.onload = () => setIsScriptLoaded(true);
      document.body.appendChild(script);
    } else {
      setIsScriptLoaded(true);
    }
  }, [agentId]);

  // Load properties for simulation catalog
  useEffect(() => {
    const loadProperties = async () => {
      try {
        const { data } = await supabase.from('properties').select('*');
        if (data && data.length > 0) {
          const formatted: Property[] = data.map(p => ({
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
          setProperties(formatted);
        }
      } catch (err) {
        console.warn("Using default listings", err);
      }
    };
    loadProperties();
  }, []);

  // Sync scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading, activeTab]);

  // Speech Recog for fallback simulation
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = 'en-US';

      rec.onstart = () => setIsListening(true);
      rec.onresult = (e: any) => {
        const text = e.results[0][0].transcript;
        if (text.trim()) {
          setInputValue('');
          sendSimulationMessage(text);
        }
      };
      rec.onerror = () => setIsListening(false);
      rec.onend = () => setIsListening(false);

      recognitionRef.current = rec;
    }
  }, [properties, messages]);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert("Mic input is restricted in this container browser preview. Please type below!");
      return;
    }
    if (isListening) recognitionRef.current.stop();
    else {
      setIsListening(true);
      recognitionRef.current.start();
    }
  };

  const speakResponse = (text: string) => {
    if (!voiceEnabled || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const cleanSpeech = text
      .replace(/\[SCHEDULE_MEETING:\s*.*?\]/g, '')
      .replace(/\[SUBMIT_INQUIRY:\s*.*?\]/g, '')
      .trim();
    if (!cleanSpeech) return;

    const utt = new SpeechSynthesisUtterance(cleanSpeech);
    utt.onstart = () => setIsSpeaking(true);
    utt.onend = () => setIsSpeaking(false);
    utt.onerror = () => setIsSpeaking(false);
    const voices = window.speechSynthesis.getVoices();
    const bestVoice = voices.find(v => v.name.includes("Google US English") || v.name.includes("Samantha"));
    if (bestVoice) utt.voice = bestVoice;
    utt.rate = 1.0;
    utt.pitch = 1.05;
    window.speechSynthesis.speak(utt);
  };

  // Background sync for fallback simulation
  const autoAppendToSheets = async (type: string, name: string, email: string, phone: string, propertyId: string, propertyTitle: string, message: string) => {
    try {
      const payload = { type, name: name || "Voice Client", email: email || "voice-sync@luxeestate.com", phone: phone || "N/A", propertyId, propertyTitle, message };
      const res = await fetch('/api/sheets/append', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        setLastSyncedNotification(`Auto-Synced: ${propertyTitle || 'Consultation Log'}`);
        setTimeout(() => setLastSyncedNotification(null), 5000);
      }
    } catch (err) {
      console.warn("Background auto sync handled safely", err);
    }
  };

  const sendSimulationMessage = async (textToSend?: string) => {
    const rawVal = textToSend || inputValue;
    if (!rawVal.trim()) return;

    setInputValue('');
    const userMsgId = Date.now().toString() + '-user';
    const newUserMsg: Message = { id: userMsgId, role: 'user', content: rawVal, timestamp: new Date() };
    setMessages(prev => [...prev, newUserMsg]);
    setLoading(true);

    if (window.speechSynthesis) window.speechSynthesis.cancel();

    try {
      const miniProps = properties.map(p => ({ id: p.id, title: p.title, price: p.price, location: p.location, type: p.type, features: p.features }));
      const res = await fetch('/api/gemini/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, newUserMsg].map(m => ({ role: m.role, content: m.content })),
          properties: miniProps,
          userContext: { authMode: "automated_sync_master_ledger" }
        })
      });

      const data = await res.json();
      if (data.error) throw new Error(data.error);

      const responseText = data.text || "I apologize, I could not complete your inquiry.";
      
      let meetingPayload: any = null;
      let inquiryPayload: any = null;

      const meetMatch = responseText.match(/\[SCHEDULE_MEETING:\s*(\{.*?\})\]/);
      if (meetMatch) {
        try {
          meetingPayload = JSON.parse(meetMatch[1]);
          await supabase.from('appointments').insert([{
            property_id: meetingPayload.propertyId,
            property_title: meetingPayload.propertyName,
            client_name: meetingPayload.userName || "Voice Client",
            client_email: meetingPayload.email || "client@luxeestate.com",
            client_phone: meetingPayload.phone || "Not provided",
            appointment_date: meetingPayload.date || new Date().toISOString().split('T')[0],
            appointment_time: meetingPayload.time || "10:00 AM"
          }]);
        } catch (e) {}

        await autoAppendToSheets("MEETING_BOOKED", meetingPayload.userName || "Voice Guest", meetingPayload.email || "client@luxeestate.com", meetingPayload.phone || "N/A", meetingPayload.propertyId, meetingPayload.propertyName, `Tour scheduled on ${meetingPayload.date} at ${meetingPayload.time}`);
      }

      const inqMatch = responseText.match(/\[SUBMIT_INQUIRY:\s*(\{.*?\})\]/);
      if (inqMatch) {
        try {
          inquiryPayload = JSON.parse(inqMatch[1]);
          await supabase.from('inquiries').insert([{
            property_id: inquiryPayload.propertyId,
            property_title: inquiryPayload.propertyName,
            owner_email: "owner@luxeestate.com",
            type: "contact",
            name: inquiryPayload.userName || "Voice Guest",
            email: inquiryPayload.email || "client@luxeestate.com",
            message: inquiryPayload.message
          }]);
        } catch (e) {}

        await autoAppendToSheets("PROPERTY_INQUIRY", inquiryPayload.userName || "Voice Guest", inquiryPayload.email || "client@luxeestate.com", inquiryPayload.phone || "N/A", inquiryPayload.propertyId, inquiryPayload.propertyName, inquiryPayload.message);
      }

      if (!meetingPayload && !inquiryPayload) {
        await autoAppendToSheets("VOICE_CONSULTATION", "Voice Guest", "consultation@luxeestate.com", "N/A", "None", "Matchmaking Session", rawVal);
      }

      const assistId = Date.now().toString() + '-assistant';
      setMessages(prev => [...prev, { id: assistId, role: 'assistant', content: responseText, timestamp: new Date(), scheduledMeeting: meetingPayload, submittedInquiry: inquiryPayload }]);
      if (voiceEnabled) speakResponse(responseText);

    } catch (err: any) {
      setMessages(prev => [...prev, { id: Date.now().toString() + '-err', role: 'assistant', content: `Connection standby. Please verify your network secrets.`, timestamp: new Date() }]);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAgentId = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanId = inputAgentId.trim();
    setAgentId(cleanId);
    localStorage.setItem('luxeestate_elevenlabs_agent_id', cleanId);
    setActiveTab('agent');
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedUrl(label);
    setTimeout(() => setCopiedUrl(null), 2500);
  };

  const getAbsoluteUrl = (path: string) => {
    if (typeof window !== 'undefined') {
      return `${window.location.origin}${path}`;
    }
    return `https://your-domain.com${path}`;
  };

  return (
    <>
      {/* Floating Concierge Launcher (Warm Light Blue & White Aesthetic) */}
      <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end gap-3 pointer-events-auto select-none">
        <AnimatePresence>
          {isOpen && (
            <motion.div 
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="mb-1 bg-white border border-sky-100 text-sky-700 backdrop-blur-md px-4 py-1.5 rounded-full text-[10px] uppercase font-black tracking-widest shadow-md flex items-center gap-2"
            >
              <span className="w-2 h-2 bg-sky-500 rounded-full animate-ping"></span>
              ElevenLabs AI Voice Concierge
            </motion.div>
          )}
        </AnimatePresence>

        <button
          onClick={() => setIsOpen(!isOpen)}
          id="aria-launcher"
          className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-500 shadow-xl border relative overflow-hidden group pointer-events-auto ${
            isOpen 
              ? 'bg-rose-50 border-rose-200 text-rose-600 rotate-90 scale-95' 
              : 'bg-white border-sky-100 hover:border-sky-300 text-sky-500 hover:scale-105 shadow-sky-100/50'
          }`}
        >
          {isOpen ? (
            <X className="w-5 h-5 relative z-10" />
          ) : (
            <div className="relative z-10 flex flex-col items-center justify-center pt-0.5">
              <Radio className="w-6 h-6 text-sky-500 group-hover:scale-110 transition-transform duration-300 animate-pulse" />
              <div className="flex gap-0.5 justify-center mt-1">
                <span className="w-1 h-1 bg-sky-400 rounded-full animate-bounce delay-100"></span>
                <span className="w-1 h-1 bg-sky-500 rounded-full animate-bounce delay-200"></span>
                <span className="w-1 h-1 bg-sky-600 rounded-full animate-bounce delay-300"></span>
              </div>
            </div>
          )}
          {!isOpen && <span className="absolute inset-0 rounded-full border border-sky-200 animate-ping opacity-50"></span>}
        </button>
      </div>

      {/* Glassmorphic Light Blue/White Main Dialog Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 70, x: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 80, x: 40 }}
            transition={{ type: "spring", stiffness: 300, damping: 28 }}
            className="fixed bottom-24 right-6 w-[360px] md:w-[420px] h-[610px] max-h-[82vh] bg-white/95 border border-sky-100 rounded-[2.2rem] shadow-[0_15px_50px_rgba(56,189,248,0.15)] flex flex-col overflow-hidden z-[9998] backdrop-blur-2xl"
            id="elevenlabs-agent-card"
          >
            {/* Header with Warm Light Blue Glaze */}
            <div className="p-5 border-b border-sky-100 bg-gradient-to-r from-sky-50/70 via-white to-sky-50/70 flex items-center justify-between shrink-0 select-none">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center border border-sky-100 shadow-sm relative overflow-hidden">
                  <div className="absolute inset-0 bg-sky-400/10"></div>
                  <Radio className="w-5 h-5 text-sky-500 animate-pulse relative z-10" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-black text-[13px] tracking-wider text-slate-800 uppercase">Aria Voice</h3>
                    <span className="bg-sky-50 border border-sky-200 text-sky-600 text-[8px] tracking-[0.15em] font-extrabold uppercase px-2 py-0.5 rounded-full">ElevenLabs</span>
                  </div>
                  <p className="text-[10px] text-slate-500 font-medium">Conversational AI Concierge</p>
                </div>
              </div>

              {/* Navigation Switch */}
              <div className="flex items-center gap-1.5 bg-sky-50/60 p-1 rounded-xl border border-sky-100">
                <button
                  onClick={() => setActiveTab('agent')}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${
                    activeTab === 'agent' ? 'bg-white text-sky-600 shadow-sm border border-sky-100' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Agent
                </button>
                <button
                  onClick={() => setActiveTab('architecture')}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all flex items-center gap-1 ${
                    activeTab === 'architecture' ? 'bg-sky-500 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'
                  }`}
                  title="Data Sync Blueprint & Setup Guide"
                >
                  <Settings className="w-3 h-3" /> Setup
                </button>
              </div>
            </div>

            {/* Content Tabs */}
            <div className="flex-1 overflow-hidden flex flex-col min-h-0 relative">
              
              {/* TAB 1: ELEVENLABS VOICE AGENT OR SIMULATION */}
              {activeTab === 'agent' ? (
                <div className="flex-1 flex flex-col items-center justify-between p-6 overflow-y-auto">
                  
                  {agentId ? (
                    /* ELEVENLABS OFFICIAL CONVAI WIDGET CONTAINER */
                    <div className="w-full flex-1 flex flex-col items-center justify-center text-center my-4">
                      <div className="mb-4">
                        <span className="inline-flex items-center gap-1.5 bg-green-50 text-green-700 border border-green-200 text-[10px] uppercase font-extrabold px-3 py-1 rounded-full">
                          <ShieldCheck className="w-3 h-3 text-green-600" /> ElevenLabs Agent Connected
                        </span>
                        <p className="text-[11px] text-slate-500 mt-2">Tap below to initiate live ultra-realistic voice session</p>
                      </div>

                      {/* Official custom element tag */}
                      <div className="p-4 bg-sky-50/40 rounded-3xl border border-sky-100 shadow-inner w-full flex items-center justify-center min-h-[160px]">
                        {React.createElement('elevenlabs-convai', { 'agent-id': agentId })}
                      </div>

                      <div className="mt-6 text-[10px] text-slate-400 max-w-xs">
                        Connected to Agent ID: <span className="font-mono text-slate-600">{agentId}</span>. 
                        <button onClick={() => setActiveTab('architecture')} className="text-sky-500 hover:underline block mx-auto mt-1 font-bold">
                          Configure Data Catalog & Webhooks &rarr;
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* INSTANT SIMULATION & CONNECT GUIDE (When agentId is not configured yet) */
                    <div className="w-full flex-1 flex flex-col justify-between">
                      <div className="text-center mt-2">
                        <span className="text-[9px] uppercase tracking-[0.25em] font-black text-sky-500 block mb-1">ElevenLabs Ready</span>
                        <h4 className="text-sm font-extrabold text-slate-800">Experience Ultra-Warm Voice Live</h4>
                        <p className="text-[11px] text-slate-500 mt-1 max-w-xs mx-auto">
                          We designed a seamless bridge so ElevenLabs automatically scrapes your property catalog & saves client leads!
                        </p>
                      </div>

                      {/* Voice wave visualizer orb */}
                      <div className="relative w-36 h-36 mx-auto flex items-center justify-center my-4 select-none">
                        <motion.div className="absolute inset-0 rounded-full bg-sky-100/50 border border-sky-200" animate={{ scale: isListening ? [1, 1.25, 1] : [1, 1.06, 1] }} transition={{ repeat: Infinity, duration: 2 }} />
                        <motion.div className="absolute w-28 h-28 rounded-full bg-sky-200/30 border border-sky-300/40" animate={{ scale: isSpeaking ? [1, 1.15, 1] : [1, 1.04, 1] }} transition={{ repeat: Infinity, duration: 1.5 }} />
                        
                        <button
                          onClick={toggleListening}
                          className={`w-24 h-24 rounded-full flex flex-col items-center justify-center shadow-lg transition-all duration-300 border relative z-10 active:scale-95 ${
                            isListening ? 'bg-red-500 border-red-400 text-white animate-pulse' : 'bg-gradient-to-tr from-sky-500 to-sky-400 hover:from-sky-600 hover:to-sky-500 border-sky-300 text-white shadow-sky-200'
                          }`}
                          title="Click to speak instantly"
                        >
                          {isListening ? <MicOff className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
                          <span className="text-[8px] font-black uppercase tracking-widest mt-1">
                            {isListening ? "Listening" : isSpeaking ? "Speaking" : "Tap to Talk"}
                          </span>
                        </button>
                      </div>

                      {/* Simulation Subtitle Block */}
                      <div className="bg-sky-50/50 border border-sky-100 rounded-2xl p-3 text-center">
                        <div className="flex items-center justify-center gap-2 mb-2">
                          <button onClick={() => setVoiceEnabled(!voiceEnabled)} className={`px-2.5 py-1 rounded-full text-[9px] font-bold uppercase transition-colors flex items-center gap-1 ${voiceEnabled ? 'bg-sky-500 text-white' : 'bg-white border border-sky-100 text-slate-500'}`}>
                            {voiceEnabled ? <Volume2 className="w-3 h-3" /> : <VolumeX className="w-3 h-3" />} Voice Simulation {voiceEnabled ? 'ON' : 'OFF'}
                          </button>
                        </div>
                        <p className="text-[11px] text-slate-700 italic">"{messages[messages.length - 1]?.content.replace(/\[.*?\]/g, '').trim()}"</p>
                      </div>

                      {/* Quick input field to test or link */}
                      <form onSubmit={(e) => { e.preventDefault(); sendSimulationMessage(); }} className="mt-3 flex gap-2">
                        <input type="text" value={inputValue} onChange={e => setInputValue(e.target.value)} placeholder="Ask about Malibu villa prices..." className="flex-1 bg-white border border-sky-200/80 rounded-xl px-3.5 py-2 text-xs text-slate-700 focus:outline-none focus:border-sky-400 placeholder-slate-400" />
                        <button type="submit" disabled={loading || !inputValue.trim()} className="p-2 rounded-xl bg-sky-500 text-white disabled:opacity-40"><Send className="w-4 h-4" /></button>
                      </form>

                      <div className="mt-4 pt-3 border-t border-sky-100 text-center">
                        <button onClick={() => setActiveTab('architecture')} className="text-xs font-bold text-sky-600 hover:text-sky-700 inline-flex items-center gap-1">
                          Paste your ElevenLabs Agent ID to switch voice &rarr;
                        </button>
                      </div>
                    </div>
                  )}

                </div>
              ) : (

                /* TAB 2: ELEVENLABS DATA ACCESS & ARCHITECTURE BLUEPRINT (Answering User's Exact Question!) */
                <div className="flex-1 overflow-y-auto p-6 space-y-5 text-slate-700 select-text scrollbar-thin scrollbar-thumb-sky-100">
                  
                  <div className="bg-gradient-to-br from-sky-500 to-indigo-600 rounded-3xl p-5 text-white shadow-md">
                    <span className="text-[9px] uppercase tracking-widest font-black text-sky-200 block mb-1">Architecture Ideas & Strategy</span>
                    <h4 className="text-base font-extrabold">How ElevenLabs Gets Your Data</h4>
                    <p className="text-xs text-sky-100 mt-1.5 leading-relaxed">
                      ElevenLabs agents can be far more powerful than basic chatbots when connected to our **Dynamic Knowledge Feed** and **Automated Sync Webhooks**!
                    </p>
                  </div>

                  {/* STEP 1: CONNECT AGENT ID */}
                  <div className="bg-white border border-sky-100 rounded-3xl p-4 shadow-sm">
                    <div className="flex items-center gap-2 text-sky-600 font-black text-xs uppercase tracking-wider mb-2">
                      <ShieldCheck className="w-4 h-4" /> 1. Connect Your Agent ID
                    </div>
                    <p className="text-[11px] text-slate-500 mb-3">
                      Create a Conversational AI agent in ElevenLabs, copy its Agent ID (`agent_...`), and paste it here:
                    </p>
                    <form onSubmit={handleSaveAgentId} className="flex gap-2">
                      <input 
                        type="text" 
                        value={inputAgentId} 
                        onChange={e => setInputAgentId(e.target.value)} 
                        placeholder="agent_xxxxxxxxxxxxxxxx" 
                        className="flex-1 bg-sky-50/50 border border-sky-200 rounded-xl px-3 py-1.5 text-xs font-mono text-slate-800 focus:outline-none focus:border-sky-500"
                      />
                      <button type="submit" className="px-4 py-1.5 bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs rounded-xl shadow-sm transition-all active:scale-95">
                        Save ID
                      </button>
                    </form>
                  </div>

                  {/* STEP 2: KNOWLEDGE BASE FEED (Catalog Access) */}
                  <div className="bg-white border border-sky-100 rounded-3xl p-4 shadow-sm">
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2 text-sky-600 font-black text-xs uppercase tracking-wider">
                        <Database className="w-4 h-4" /> 2. Live Catalog Feed URL
                      </div>
                      <span className="text-[8px] bg-sky-100 text-sky-700 px-2 py-0.5 rounded font-black uppercase">Auto-Refresh</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mb-2.5 leading-relaxed">
                      In ElevenLabs dashboard &rarr; **Knowledge Base** &rarr; **Add URL**. Paste this link so the agent automatically learns all Malibu villas, prices, and amenities live:
                    </p>
                    <div className="flex items-center gap-2 bg-sky-50/70 p-2 rounded-xl border border-sky-100 font-mono text-[10px] text-slate-700">
                      <span className="truncate flex-1">{getAbsoluteUrl('/api/elevenlabs/catalog')}</span>
                      <button onClick={() => copyToClipboard(getAbsoluteUrl('/api/elevenlabs/catalog'), 'catalog')} className="p-1.5 bg-white hover:bg-sky-100 text-sky-600 rounded-lg border border-sky-200 shrink-0 transition-colors" title="Copy Catalog URL">
                        {copiedUrl === 'catalog' ? <CheckCircle2 className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                      <a href="/api/elevenlabs/catalog" target="_blank" rel="noreferrer" className="p-1.5 bg-white hover:bg-sky-100 text-slate-500 rounded-lg border border-sky-200 shrink-0" title="Test View JSON Feed">
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>

                  {/* STEP 3: SERVER WEBHOOK FOR AUTOMATED MASTER SHEETS SYNC */}
                  <div className="bg-white border border-sky-100 rounded-3xl p-4 shadow-sm">
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2 text-indigo-600 font-black text-xs uppercase tracking-wider">
                        <FileSpreadsheet className="w-4 h-4" /> 3. Automated Sheets Webhook
                      </div>
                      <span className="text-[8px] bg-green-100 text-green-700 px-2 py-0.5 rounded font-black uppercase">Auto-Sync</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mb-2.5 leading-relaxed">
                      In ElevenLabs &rarr; **Tools** &rarr; **Add Webhook Tool**. Name it `book_estate_tour` and set the POST target URL to:
                    </p>
                    <div className="flex items-center gap-2 bg-indigo-50/60 p-2 rounded-xl border border-indigo-100 font-mono text-[10px] text-slate-700">
                      <span className="truncate flex-1">{getAbsoluteUrl('/api/elevenlabs/webhook')}</span>
                      <button onClick={() => copyToClipboard(getAbsoluteUrl('/api/elevenlabs/webhook'), 'webhook')} className="p-1.5 bg-white hover:bg-indigo-100 text-indigo-600 rounded-lg border border-indigo-200 shrink-0 transition-colors" title="Copy Webhook URL">
                        {copiedUrl === 'webhook' ? <CheckCircle2 className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-2 italic">
                      *When a client speaks to ElevenLabs to book a tour, our server webhook intercepts it, saves to Supabase, and logs directly to your Master Google Sheet automatically!
                    </p>
                  </div>

                  <div className="text-center pt-2">
                    <button onClick={() => setActiveTab('agent')} className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-2xl shadow-md transition-all">
                      Return to Voice Assistant &rarr;
                    </button>
                  </div>

                </div>
              )}
            </div>

            {/* Bottom Status Indicator (Master Automated Sheet Sync Banner) */}
            <div className="px-5 py-3 border-t border-sky-100 bg-sky-50/40 flex items-center justify-between text-xs text-slate-500 shrink-0 select-none">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse shrink-0"></span>
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-600">
                  Master Sheets Auto-Sync Active
                </span>
              </div>
              
              {lastSyncedNotification && (
                <span className="text-[9px] font-semibold text-sky-600 bg-white border border-sky-200 px-2 py-0.5 rounded-full animate-bounce">
                  {lastSyncedNotification}
                </span>
              )}
            </div>

          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
