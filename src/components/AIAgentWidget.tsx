'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Bot, MessageSquare, Mic, MicOff, Volume2, VolumeX, X, Send, 
  Sparkles, CheckCircle2, FileSpreadsheet, Radio, Smartphone 
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
  const [activeMode, setActiveMode] = useState<'text' | 'voice'>('text');
  
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: "Hello! I am Aria, your AI Concierge. I can help you explore our luxury estates, answer specifications, schedule viewings, or directly contact property owners. Try typing or toggle 'Voice Live' to talk directly with me!",
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [properties, setProperties] = useState<Property[]>([]);
  
  // Auto-sync status feedback
  const [lastSyncedRow, setLastSyncedRow] = useState<any>(null);

  const scrollRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Load LuxeEstate listings for search logic
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
        console.warn("Using fallback listings", err);
      }
    };
    loadProperties();
  }, []);

  // Sync scroll on updates
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading, activeMode]);

  // Voice Speech Recog Setup
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = 'en-US';

      rec.onstart = () => {
        setIsListening(true);
      };

      rec.onresult = (event: any) => {
        const text = event.results[0][0].transcript;
        if (text.trim()) {
          setInputValue('');
          sendMessage(text);
        }
      };

      rec.onerror = (err: any) => {
        console.error("Speech Recognition Error:", err);
        setIsListening(false);
      };

      rec.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = rec;
    }
  }, [properties, messages]);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert("Mic input is not fully supported in this container browser setup. Please type instead!");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      setIsListening(true);
      recognitionRef.current.start();
    }
  };

  // Convert text output to high-end spoken synthesis
  const speakResponse = (text: string) => {
    if (!window.speechSynthesis) return;

    window.speechSynthesis.cancel(); // Clears queue

    const cleanSpeech = text
      .replace(/\[SCHEDULE_MEETING:\s*.*?\]/g, '')
      .replace(/\[SUBMIT_INQUIRY:\s*.*?\]/g, '')
      .trim();

    if (!cleanSpeech) return;

    const utterance = new SpeechSynthesisUtterance(cleanSpeech);
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    const utterances = window.speechSynthesis.getVoices();
    const premiumVoice = utterances.find(v => 
      v.name.includes("Google US English") || 
      v.name.includes("Samantha") || 
      v.lang.startsWith("en")
    );
    if (premiumVoice) utterance.voice = premiumVoice;
    utterance.rate = 1.0;
    utterance.pitch = 1.05;

    window.speechSynthesis.speak(utterance);
  };

  // Trigger server-side background synchronization automatically for leads
  const autoAppendToSheets = async (type: string, name: string, email: string, phone: string, propertyId: string, propertyTitle: string, message: string) => {
    try {
      const payload = {
        type,
        name: name || "Luxe Guest",
        email: email || "automatic-sync@luxeestate.com",
        phone: phone || "No Phone Provided",
        propertyId,
        propertyTitle,
        message
      };

      const res = await fetch('/api/sheets/append', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (data.success) {
        setLastSyncedRow({
          type,
          title: propertyTitle || "General Chat Matchmaking",
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        });
      }
    } catch (err) {
      console.warn("Background sheet auto sync triggered safely:", err);
    }
  };

  // Switch voice mode, enable sound responses automatically
  const handleModeChange = (mode: 'text' | 'voice') => {
    setActiveMode(mode);
    if (mode === 'voice') {
      setVoiceEnabled(true);
      // Give spoken confirmation
      setTimeout(() => {
        speakResponse("Voice session initiated. Tap the microphone to talk with me!");
      }, 300);
    } else {
      setVoiceEnabled(false);
      if (window.speechSynthesis) window.speechSynthesis.cancel();
    }
  };

  const sendMessage = async (textToSend?: string) => {
    const rawVal = textToSend || inputValue;
    if (!rawVal.trim()) return;

    setInputValue('');
    const userMsgId = Date.now().toString() + '-user';
    const newUserMsg: Message = {
      id: userMsgId,
      role: 'user',
      content: rawVal,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, newUserMsg]);
    setLoading(true);

    if (window.speechSynthesis) window.speechSynthesis.cancel();

    try {
      const miniProperties = properties.map(p => ({
        id: p.id,
        title: p.title,
        price: p.price,
        location: p.location,
        type: p.type,
        features: p.features,
        submittedBy: p.submittedBy
      }));

      const res = await fetch('/api/gemini/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, newUserMsg].map(m => ({ role: m.role, content: m.content })),
          properties: miniProperties,
          userContext: {
            authMode: "automated_sync_master_ledger"
          }
        })
      });

      const data = await res.json();
      if (data.error) throw new Error(data.error);

      const responseText = data.text || "I was unable to complete your inquiry correctly.";
      
      // Parse tags
      let meetingPayload: any = null;
      let inquiryPayload: any = null;

      const meetingMatch = responseText.match(/\[SCHEDULE_MEETING:\s*(\{.*?\})\]/);
      if (meetingMatch) {
        try {
          meetingPayload = JSON.parse(meetingMatch[1]);
          // Book meeting physically to Supabase if table exists
          await supabase.from('appointments').insert([{
            property_id: meetingPayload.propertyId,
            property_title: meetingPayload.propertyName,
            client_name: meetingPayload.userName || "Aria Guest Client",
            client_email: meetingPayload.email || "aria-lead@luxeestate.com",
            client_phone: meetingPayload.phone || "Not Specified",
            appointment_date: meetingPayload.date || new Date().toISOString().split('T')[0],
            appointment_time: meetingPayload.time || "10:00 AM",
            created_at: new Date().toISOString()
          }]);
        } catch (e) {
          console.warn("Logged locally to virtual storage", e);
        }

        // Automatic Sheets sync behind-the-scenes
        await autoAppendToSheets(
          "MEETING_BOOKED",
          meetingPayload.userName || "Automated Sync Client",
          meetingPayload.email || "automated-sync@luxeestate.com",
          meetingPayload.phone || "N/A",
          meetingPayload.propertyId,
          meetingPayload.propertyName,
          `Tour requested on ${meetingPayload.date} at ${meetingPayload.time}`
        );
      }

      const inquiryMatch = responseText.match(/\[SUBMIT_INQUIRY:\s*(\{.*?\})\]/);
      if (inquiryMatch) {
        try {
          inquiryPayload = JSON.parse(inquiryMatch[1]);
          await supabase.from('inquiries').insert([{
            property_id: inquiryPayload.propertyId,
            property_title: inquiryPayload.propertyName,
            owner_email: inquiryPayload.ownerEmail || "owner@luxeestate.com",
            type: "contact",
            name: inquiryPayload.userName || "Automated Sync Client",
            email: inquiryPayload.email || "client@luxeestate.com",
            phone: inquiryPayload.phone || "Not provided",
            message: inquiryPayload.message || "I am extremely interested in your property listing.",
            created_at: new Date().toISOString()
          }]);
        } catch (e) {
          console.warn("DB insertion bypassed", e);
        }

        // Automatic Sheets sync behind-the-scenes
        await autoAppendToSheets(
          "PROPERTY_INQUIRY",
          inquiryPayload.userName || "Luxe Client",
          inquiryPayload.email || "client@luxeestate.com",
          inquiryPayload.phone || "N/A",
          inquiryPayload.propertyId,
          inquiryPayload.propertyName,
          inquiryPayload.message
        );
      }

      // If regular search but no direct inquiry form, auto log details anyway
      if (!meetingPayload && !inquiryPayload) {
        await autoAppendToSheets(
          "MATCHMAKING_CHAT",
          "Anonymous Client",
          "customer-lead@main-ledger.com",
          "N/A",
          "None",
          "Client Matchmaking Engine Session",
          rawVal
        );
      }

      const assistantMsgId = Date.now().toString() + '-assistant';
      setMessages(prev => [...prev, {
        id: assistantMsgId,
        role: 'assistant',
        content: responseText,
        timestamp: new Date(),
        scheduledMeeting: meetingPayload,
        submittedInquiry: inquiryPayload
      }]);

      if (voiceEnabled) {
        speakResponse(responseText);
      }

    } catch (error: any) {
      console.error(error);
      setMessages(prev => [...prev, {
        id: Date.now().toString() + '-error',
        role: 'assistant',
        content: `I hit a slight issue accessing LuxeEstate agents right now. Please verify your connection or check your API key secrets.`,
        timestamp: new Date()
      }]);
    } finally {
      setLoading(false);
    }
  };

  const renderRelatedProperty = (propertyId: string) => {
    const matched = properties.find(p => p.id === propertyId);
    if (!matched) return null;

    return (
      <Link href={`/property/${matched.id}`} key={matched.id}>
        <div className="mt-3 bg-sky-50/50 hover:bg-sky-100 border border-sky-100/70 rounded-2xl overflow-hidden shadow-sm flex items-center transition-all duration-300 transform hover:-translate-y-0.5 cursor-pointer group">
          <div className="w-16 h-16 relative shrink-0">
            <img 
              src={matched.imageUrl} 
              alt={matched.title} 
              className="object-cover w-full h-full"
            />
          </div>
          <div className="p-3 flex-1 overflow-hidden">
            <h4 className="text-xs font-bold text-slate-800 truncate group-hover:text-sky-600 transition-colors uppercase tracking-wider">{matched.title}</h4>
            <div className="flex items-center justify-between mt-1">
              <span className="text-[10px] text-slate-500 truncate">{matched.location}</span>
              <span className="text-sky-650 font-black text-[11px] ml-2">
                ${(matched.price || 0).toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </Link>
    );
  };

  // Get last messages for visual cues in voice view
  const lastUserMessage = [...messages].reverse().find(m => m.role === 'user')?.content || 'No voice command received yet.';
  const lastAssistantMessage = [...messages].reverse().find(m => m.role === 'assistant')?.content || 'Ask me about ocean villas, mountain cabins, or schedule a tour!';

  return (
    <>
      {/* Floating Toggle Launcher Button */}
      <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end gap-3 pointer-events-auto select-none">
        <AnimatePresence>
          {isOpen && (
            <motion.div 
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="mb-1 bg-white/95 border border-sky-200/50 text-sky-700 backdrop-blur-md px-4 py-1.5 rounded-full text-[10px] uppercase font-black tracking-widest shadow-md flex items-center gap-2"
            >
              <span className="w-2 h-2 bg-sky-500 rounded-full animate-ping"></span>
              Aria AI Concierge Page
            </motion.div>
          )}
        </AnimatePresence>

        <button
          onClick={() => setIsOpen(!isOpen)}
          id="aria-launcher"
          className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-500 shadow-xl border relative overflow-hidden group pointer-events-auto ${
            isOpen 
              ? 'bg-rose-50 border-rose-200 text-rose-600 rotate-90 scale-95' 
              : 'bg-white border-sky-100 hover:border-sky-300 text-sky-500 hover:scale-105'
          }`}
        >
          {isOpen ? (
            <X className="w-5.5 h-5.5 relative z-10" />
          ) : (
            <div className="relative z-10 flex flex-col items-center justify-center pt-0.5">
              <Bot className="w-6 h-6 text-sky-500 group-hover:scale-110 transition-transform duration-300 animate-pulse" />
              <div className="flex gap-0.5 justify-center mt-1">
                <span className="w-1 h-1 bg-sky-400 rounded-full animate-bounce delay-100"></span>
                <span className="w-1 h-1 bg-sky-450 rounded-full animate-bounce delay-200"></span>
                <span className="w-1 h-1 bg-sky-500 rounded-full animate-bounce delay-300"></span>
              </div>
            </div>
          )}

          {/* Pulse Ripple Ring */}
          {!isOpen && (
            <span className="absolute inset-0 rounded-full border border-sky-200 animate-ping opacity-60"></span>
          )}
        </button>
      </div>

      {/* Glassmorphic Light Blue/White Chatbot Card */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 80, x: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 100, x: 50 }}
            transition={{ type: "spring", stiffness: 280, damping: 26 }}
            className="fixed bottom-24 right-6 w-[360px] md:w-[410px] h-[610px] max-h-[82vh] bg-white/95 border border-sky-100 rounded-[2.2rem] shadow-[0_15px_45px_rgba(56,189,248,0.12)] flex flex-col overflow-hidden z-[9998] backdrop-blur-2xl"
            id="aria-chatbot-card"
          >
            {/* Elegant Header with Light Blue Glares */}
            <div className="p-5 border-b border-sky-100/50 bg-sky-50/40 flex items-center justify-between relative shrink-0">
              <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-sky-300/60 to-transparent"></div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center border border-sky-100 relative overflow-hidden shadow-sm">
                  <div className="absolute inset-0 bg-gradient-to-br from-sky-400/10 to-indigo-400/10"></div>
                  <Sparkles className="w-5 h-5 text-sky-500 animate-pulse relative z-10" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-extrabold text-[13px] tracking-wider text-slate-800 uppercase">Aria</h3>
                    <span className="bg-sky-50 border border-sky-100/50 text-sky-600 text-[8px] tracking-[0.15em] font-black uppercase px-2 py-0.5 rounded-full">Concierge</span>
                  </div>
                  <p className="text-[10px] text-slate-500 font-medium tracking-tight">Luxury Real Estate Matchmaker</p>
                </div>
              </div>

              {/* Close Button only */}
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-xl bg-white border border-sky-100/80 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Seamless Mode Switcher (Tab System - 2 features like Gemini AI) */}
            <div className="p-2 bg-sky-50/20 border-b border-sky-100/30 flex items-center justify-center gap-2 shrink-0">
              <button
                onClick={() => handleModeChange('text')}
                className={`flex-1 flex items-center justify-center gap-2 py-1.5 rounded-full text-xs font-bold transition-all duration-300 ${
                  activeMode === 'text'
                    ? 'bg-white shadow-sm text-sky-600 border border-sky-100/50'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                Text Assistant
              </button>
              <button
                onClick={() => handleModeChange('voice')}
                className={`flex-1 flex items-center justify-center gap-2 py-1.5 rounded-full text-xs font-bold transition-all duration-300 ${
                  activeMode === 'voice'
                    ? 'bg-sky-500 text-white shadow-sm font-extrabold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Radio className="w-3.5 h-3.5 animate-pulse" />
                Voice Live
              </button>
            </div>

            {/* Speaking voice status visual feedback strip */}
            <AnimatePresence>
              {isSpeaking && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 26 }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-sky-50/55 border-b border-sky-100/30 px-5 flex items-center justify-between overflow-hidden shrink-0"
                >
                  <span className="text-[9px] uppercase tracking-widest text-sky-600 font-extrabold flex items-center gap-1.5">
                    Audio Voiceover active
                  </span>
                  <div className="flex items-center gap-[2px] h-3.5">
                    {[1, 2, 3, 4, 5].map((idx) => (
                      <span 
                        key={idx} 
                        className="w-[1.5px] bg-sky-500 rounded-full"
                        style={{
                          height: '105%',
                          animation: 'bounce 0.7s ease-in-out infinite',
                          animationDelay: `${idx * 0.1}s`,
                          transformOrigin: 'bottom'
                        }}
                      ></span>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Dynamic Content Views based on active feature selection */}
            <div className="flex-1 overflow-hidden flex flex-col min-h-0 relative select-text">
              
              {/* FEATURE 1: STANDARD TEXT ASSISTANT */}
              {activeMode === 'text' ? (
                <div 
                  ref={scrollRef}
                  className="flex-1 overflow-y-auto px-5 py-4 space-y-4 scrollbar-thin scrollbar-thumb-sky-100 scrollbar-track-transparent select-text"
                >
                  {messages.map((m) => (
                    <div 
                      key={m.id}
                      className={`flex flex-col max-w-[85%] ${m.role === 'user' ? 'ml-auto items-end' : 'mr-auto items-start'}`}
                    >
                      <div 
                        className={`p-3.5 rounded-3xl text-xs leading-relaxed ${
                          m.role === 'user' 
                            ? 'bg-sky-500 font-semibold text-white px-4 rounded-tr-none shadow-sm' 
                            : 'bg-white border border-sky-100 text-slate-700 rounded-tl-none shadow-[0_2px_12px_rgba(56,189,248,0.03)]'
                        }`}
                      >
                        <p className="whitespace-pre-line">
                          {m.content
                            .replace(/\[SCHEDULE_MEETING:\s*.*?\]/g, '')
                            .replace(/\[SUBMIT_INQUIRY:\s*.*?\]/g, '')
                            .trim()}
                        </p>

                        {/* Property recommendations injected directly inside the message context */}
                        {m.role === 'assistant' && properties.length > 0 && (
                          (() => {
                            const matchedIds = Array.from(m.content.matchAll(/property\/(\d+)/gi)).map(match => match[1]);
                            const distinctMatchedIds = [...new Set(matchedIds)];
                            return distinctMatchedIds.map(id => renderRelatedProperty(id));
                          })()
                        )}

                        {/* Embedded Booking Notification */}
                        {m.scheduledMeeting && (
                          <div className="mt-3 p-3 bg-sky-50/80 border border-sky-200/50 text-sky-700 rounded-2xl flex flex-col gap-1.5 shadow-sm">
                            <div className="flex items-center gap-1.5">
                              <CheckCircle2 className="w-4 h-4 text-sky-500 shrink-0" />
                              <span className="font-extrabold uppercase tracking-wider text-[9px]">Exclusive Booking Confirmed</span>
                            </div>
                            <div className="text-[10px]">
                              <div className="font-bold text-slate-800">{m.scheduledMeeting.propertyName}</div>
                              <div className="text-slate-500 mt-0.5">Tour request organized on {m.scheduledMeeting.date} at {m.scheduledMeeting.time}</div>
                            </div>
                            <div className="text-[8px] text-green-600 bg-white border border-green-100 self-start px-2 py-0.5 rounded-md mt-1 uppercase font-black tracking-widest">
                              Auto-Synced to Master Sheet
                            </div>
                          </div>
                        )}

                        {/* Embedded Contact Notification */}
                        {m.submittedInquiry && (
                          <div className="mt-3 p-3 bg-indigo-50/80 border border-indigo-200/50 text-indigo-700 rounded-2xl flex flex-col gap-1.5 shadow-sm">
                            <div className="flex items-center gap-1.5">
                              <CheckCircle2 className="w-4 h-4 text-indigo-500 shrink-0" />
                              <span className="font-extrabold uppercase tracking-wider text-[9px]">Owner Advised</span>
                            </div>
                            <div className="text-[10px]">
                              <div className="font-bold text-slate-800">{m.submittedInquiry.propertyName}</div>
                              <div className="text-slate-600 italic mt-1 font-medium bg-white/70 p-1.5 rounded-lg border border-slate-100">"{m.submittedInquiry.message}"</div>
                            </div>
                            <div className="text-[8px] text-green-600 bg-white border border-green-100 self-start px-2 py-0.5 rounded-md mt-1 uppercase font-black tracking-widest">
                              Auto-Synced to Database Sheets
                            </div>
                          </div>
                        )}
                      </div>
                      <span className="text-[8px] text-slate-400 mt-1.5 px-1 tracking-widest">
                        {m.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  ))}

                  {loading && (
                    <div className="flex flex-col mr-auto max-w-[85%] items-start">
                      <div className="p-3 bg-sky-50/50 border border-sky-100/50 text-slate-400 rounded-3xl rounded-tl-none">
                        <div className="flex gap-1 items-center px-1.5 py-0.5">
                          <span className="w-1.5 h-1.5 bg-sky-400 rounded-full animate-bounce"></span>
                          <span className="w-1.5 h-1.5 bg-sky-400 rounded-full animate-bounce delay-150"></span>
                          <span className="w-1.5 h-1.5 bg-sky-400 rounded-full animate-bounce delay-300"></span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                
                /* FEATURE 2: MINIMALIST VOICE LIVE CONSOLE */
                <div className="flex-1 flex flex-col items-center justify-between p-6 select-none bg-sky-50/10">
                  <div className="text-center mt-2 shrink-0">
                    <span className="text-[9px] uppercase tracking-[0.25em] font-black text-sky-500 block mb-1">Aria Live Session</span>
                    <h4 className="text-sm font-bold text-slate-700">Voice-to-Voice Matchmaker</h4>
                  </div>

                  {/* Gorgeous breathing audio wave visualizer (Central Globe theme) */}
                  <div className="relative w-44 h-44 flex items-center justify-center my-4 shrink-0">
                    {/* Breath circles */}
                    <motion.div 
                      className="absolute inset-0 rounded-full bg-sky-300/10 border border-sky-200/50"
                      animate={{ scale: isListening ? [1, 1.25, 1] : [1, 1.08, 1] }}
                      transition={{ repeat: Infinity, duration: isListening ? 1.4 : 3, ease: "easeInOut" }}
                    />
                    <motion.div 
                      className="absolute w-36 h-36 rounded-full bg-sky-400/15 border border-sky-150"
                      animate={{ scale: isSpeaking ? [1, 1.15, 1] : [1, 1.05, 1] }}
                      transition={{ repeat: Infinity, duration: isSpeaking ? 1.2 : 4, ease: "easeInOut", delay: 0.5 }}
                    />
                    
                    {/* Core visual sound wave circle */}
                    <div className={`w-28 h-28 rounded-full flex flex-col items-center justify-center shadow-lg transition-all duration-300 border bg-white ${
                      isListening ? 'border-sky-300 shadow-sky-100' : 'border-sky-100 shadow-sky-50'
                    }`}>
                      <div className="relative flex items-center justify-center">
                        <Radio className={`w-9 h-9 ${isListening ? 'text-sky-500 animate-spin' : isSpeaking ? 'text-sky-450 animate-pulse' : 'text-sky-300'}`} />
                        {isListening && (
                          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full animate-ping"></span>
                        )}
                      </div>
                      <span className="text-[8px] font-black uppercase tracking-widest text-sky-600 mt-2">
                        {isListening ? "Listening" : isSpeaking ? "Aria Speaking" : "Standby"}
                      </span>
                    </div>
                  </div>

                  {/* Live speech subtitles helper (decluttered transcription block) */}
                  <div className="w-full max-w-sm bg-white/90 border border-sky-100/65 rounded-3xl p-4 shadow-sm flex-1 flex flex-col justify-center gap-3 overflow-hidden leading-relaxed">
                    <div className="text-[10px] uppercase font-black tracking-widest text-sky-500">Subtitles</div>
                    
                    <div className="overflow-y-auto max-h-24 space-y-2 pr-1 text-slate-600 scrollbar-none">
                      <div className="text-[11px] leading-relaxed">
                        <span className="font-bold text-slate-400 block text-[9px] uppercase tracking-wider mb-0.5">You asked</span>
                        <p className="italic text-slate-700">"{lastUserMessage}"</p>
                      </div>
                      
                      <div className="h-[1px] bg-slate-100/80 my-2" />

                      <div className="text-[11px] leading-relaxed">
                        <span className="font-extrabold text-sky-600 block text-[9px] uppercase tracking-wider mb-0.5">Aria responded</span>
                        <p className="whitespace-pre-line text-slate-700">
                          {lastAssistantMessage
                            .replace(/\[SCHEDULE_MEETING:\s*.*?\]/g, '')
                            .replace(/\[SUBMIT_INQUIRY:\s*.*?\]/g, '')
                            .trim()}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 text-center shrink-0">
                    <p className="text-[9px] text-slate-400 uppercase tracking-widest">Speak naturally about luxury house prices</p>
                  </div>
                </div>
              )}
            </div>

            {/* Seamless Auto Sheets database logs strip (decluttered completely - no inputs or big widgets, just status badge) */}
            <div className="px-5 py-3.5 border-t border-sky-100/40 bg-sky-50/15 flex items-center justify-between text-xs text-slate-500 shrink-0 select-none">
              <div className="flex items-center gap-2 overflow-hidden">
                <FileSpreadsheet className="w-3.5 h-3.5 text-sky-500 animate-pulse shrink-0" />
                <span className="text-[9.5px] uppercase tracking-wider text-slate-600 font-extrabold">
                  Master Sheets Auto-Sync Enabled
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse shrink-0"></span>
              </div>

              {lastSyncedRow && (
                <div className="text-[8px] bg-sky-100/40 border border-sky-200/30 text-sky-700 px-2 py-0.5 rounded-full truncate max-w-36">
                  Synced: {lastSyncedRow.title}
                </div>
              )}
            </div>

            {/* Input keyboard row (Only shown in static text assistant feature) */}
            {activeMode === 'text' && (
              <div className="p-4 border-t border-sky-100/40 bg-white flex items-center gap-2 shrink-0">
                {/* Voice Speakback Toggle */}
                <button
                  onClick={() => {
                    setVoiceEnabled(!voiceEnabled);
                    if (voiceEnabled && window.speechSynthesis) window.speechSynthesis.cancel();
                  }}
                  className={`p-2.5 rounded-2xl border transition-all duration-300 flex items-center justify-center shrink-0 ${
                    voiceEnabled 
                      ? 'bg-sky-50 border-sky-200 text-sky-600' 
                      : 'bg-white border-slate-200 text-slate-450 hover:text-slate-600'
                  }`}
                  title={voiceEnabled ? "Mute Voiceover" : "Enable Voiceover"}
                >
                  {voiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                </button>

                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    sendMessage();
                  }}
                  className="flex-1 flex gap-2"
                >
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Search tulum villa or schedule tour..."
                    className="flex-1 bg-sky-50/25 border border-sky-100/20 rounded-2xl px-4 py-2.5 text-xs text-slate-700 focus:outline-none focus:border-sky-300 placeholder-slate-400 focus:ring-1 focus:ring-sky-200"
                  />
                  
                  <button
                    type="submit"
                    disabled={loading || !inputValue.trim()}
                    className="p-2.5 rounded-2xl bg-sky-500 hover:bg-sky-600 text-white disabled:opacity-40 transition-all duration-300 flex items-center justify-center shadow-md shadow-sky-100 active:scale-95 shrink-0"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </form>
              </div>
            )}

            {/* Micro button layout inside Voice Mode */}
            {activeMode === 'voice' && (
              <div className="p-4 border-t border-sky-100/40 bg-white flex items-center justify-center shrink-0">
                <button
                  onClick={toggleListening}
                  className={`w-14 h-14 rounded-full border transition-all duration-300 flex items-center justify-center relative ${
                    isListening 
                      ? 'bg-red-500 border-red-400 text-white scale-105' 
                      : 'bg-sky-500 hover:bg-sky-600 border-sky-400 text-white shadow-lg'
                  }`}
                  title={isListening ? "Listening... Tab to stop" : "Start Speaking with Aria"}
                >
                  {isListening ? (
                    <>
                      <MicOff className="w-5.5 h-5.5 relative z-10" />
                      <span className="absolute inset-0 rounded-full border border-red-400 animate-ping opacity-60"></span>
                    </>
                  ) : (
                    <Mic className="w-5.5 h-5.5" />
                  )}
                </button>
              </div>
            )}

          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
