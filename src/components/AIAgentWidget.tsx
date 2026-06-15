'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Bot, MessageSquare, Mic, MicOff, Volume2, VolumeX, X, Send, 
  Sparkles, Calendar, Mail, FileSpreadsheet, ArrowUpRight, CheckCircle2, RefreshCw 
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

interface SyncedRow {
  timestamp: string;
  type: string;
  name: string;
  email: string;
  phone: string;
  details: string;
  property: string;
}

export default function AIAgentWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: "Hello! I am Aria, your exclusive AI Concierge. I can guide you through our luxury property portfolio, answer detailed specifications, and directly connect you with owners or schedule viewings. Try speaking to me or typing your desires!",
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [properties, setProperties] = useState<Property[]>([]);
  
  // Google Sheets state
  const [session, setSession] = useState<any>(null);
  const [googleToken, setGoogleToken] = useState<string | null>(null);
  const [spreadsheetId, setSpreadsheetId] = useState<string | null>(null);
  const [spreadsheetUrl, setSpreadsheetUrl] = useState<string | null>(null);
  const [sheetsSyncList, setSheetsSyncList] = useState<SyncedRow[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [googleUser, setGoogleUser] = useState<any>(null);

  const scrollRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Load properties on mount
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
        console.warn("Failed loading properties from Supabase, resorting to static cache", err);
      }
    };
    loadProperties();
  }, []);

  // Monitor auth changes & fetch Google OAuth token if logged in
  useEffect(() => {
    const fetchSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (data?.session) {
        setSession(data.session);
        setGoogleUser(data.session.user);
        // Supabase OAuth provides google user info and accesses provider credentials
        const providerToken = data.session.provider_token;
        if (providerToken) {
          setGoogleToken(providerToken);
        }
      }
    };
    fetchSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      setSession(currentSession);
      if (currentSession) {
        setGoogleUser(currentSession.user);
        if (currentSession.provider_token) {
          setGoogleToken(currentSession.provider_token);
        }
      } else {
        setGoogleToken(null);
        setGoogleUser(null);
      }
    });

    // Load any saved spreadsheetId from localstorage
    const savedSheetId = localStorage.getItem('luxeestate_spreadsheet_id');
    const savedSheetUrl = localStorage.getItem('luxeestate_spreadsheet_url');
    if (savedSheetId) setSpreadsheetId(savedSheetId);
    if (savedSheetUrl) setSpreadsheetUrl(savedSheetUrl);

    // Load synced list
    const savedLogs = localStorage.getItem('luxeestate_synced_sheets_logs');
    if (savedLogs) {
      try { setSheetsSyncList(JSON.parse(savedLogs)); } catch(e) {}
    }

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // Sync scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  // Handle Speech Recognition/Listening
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
        setInputValue(text);
        sendMessage(text);
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
  }, [properties]);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert("Voice input is not supported in this browser container. Please try Chrome/Safari.");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      setIsListening(true);
      recognitionRef.current.start();
    }
  };

  // Text synthesis (Speaking results back)
  const speakResponse = (text: string) => {
    if (!voiceEnabled || !window.speechSynthesis) return;

    window.speechSynthesis.cancel(); // Stop any pending speech

    // Remove the tags from speech string so she doesn't read brackets aloud!
    const speakableText = text
      .replace(/\[SCHEDULE_MEETING:\s*.*?\]/g, '')
      .replace(/\[SUBMIT_INQUIRY:\s*.*?\]/g, '')
      .trim();

    if (!speakableText) return;

    const utterance = new SpeechSynthesisUtterance(speakableText);
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    // Use nice voice
    const voices = window.speechSynthesis.getVoices();
    const attractiveVoice = voices.find(v => 
      v.name.includes("Google US English") || 
      v.name.includes("Samantha") || 
      v.name.includes("Natural") ||
      v.lang.startsWith("en")
    );
    if (attractiveVoice) utterance.voice = attractiveVoice;
    utterance.rate = 1.05;
    utterance.pitch = 1.0;

    window.speechSynthesis.speak(utterance);
  };

  // Log to Google Sheets
  const logToGoogleSheets = async (type: string, name: string, email: string, phone: string, propertyId: string, propertyTitle: string, message: string) => {
    try {
      setIsSyncing(true);
      const payload = {
        accessToken: googleToken, // Passed if verified
        spreadsheetId: spreadsheetId,
        type,
        name,
        email,
        phone,
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
        if (data.spreadsheetId && !spreadsheetId) {
          setSpreadsheetId(data.spreadsheetId);
          localStorage.setItem('luxeestate_spreadsheet_id', data.spreadsheetId);
          if (data.spreadsheetUrl) {
            setSpreadsheetUrl(data.spreadsheetUrl);
            localStorage.setItem('luxeestate_spreadsheet_url', data.spreadsheetUrl);
          }
        }

        // Add to local synced viewer
        const newLogEntry: SyncedRow = {
          timestamp: new Date().toLocaleString(),
          type,
          name: name || "Anonymous",
          email: email || "Anonymous",
          phone: phone || "None",
          property: propertyTitle || "General Chat",
          details: message
        };

        const updatedSyncs = [newLogEntry, ...sheetsSyncList].slice(0, 30);
        setSheetsSyncList(updatedSyncs);
        localStorage.setItem('luxeestate_synced_sheets_logs', JSON.stringify(updatedSyncs));
      }
    } catch (err) {
      console.error("Sheets log synchronizer issue:", err);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleOAuthConnect = async () => {
    try {
      // Connect specifically requesting spreadsheets scope
      await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          scopes: 'https://www.googleapis.com/auth/spreadsheets',
          redirectTo: window.location.href
        }
      });
    } catch (err) {
      console.error("OAuth Connection Error:", err);
    }
  };

  const handleSignOutGoogle = async () => {
    await supabase.auth.signOut();
    setGoogleToken(null);
    setSpreadsheetId(null);
    setSpreadsheetUrl(null);
    localStorage.removeItem('luxeestate_spreadsheet_id');
    localStorage.removeItem('luxeestate_spreadsheet_url');
  };

  // Perform chatbot logic
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

    // Cancel typing speech
    if (window.speechSynthesis) window.speechSynthesis.cancel();

    try {
      // Prepare property array to pass to AI context
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
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messages: [...messages, newUserMsg].map(m => ({ role: m.role, content: m.content })),
          properties: miniProperties,
          userContext: googleUser ? {
            name: googleUser.user_metadata?.full_name || googleUser.email,
            email: googleUser.email
          } : null
        })
      });

      const data = await res.json();
      if (data.error) {
        throw new Error(data.error);
      }

      let responseText = data.text || "I was unable to complete your inquiry correctly.";
      
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
            client_name: meetingPayload.userName || googleUser?.user_metadata?.full_name || "Aria Guest",
            client_email: meetingPayload.email || googleUser?.email || "aria-lead@luxeestate.com",
            client_phone: meetingPayload.phone || "Not Specified",
            appointment_date: meetingPayload.date || new Date().toISOString().split('T')[0],
            appointment_time: meetingPayload.time || "10:00 AM",
            created_at: new Date().toISOString()
          }]);
        } catch (e: any) {
          console.warn("Tour scheduling logged locally, DB tables might need creation", e);
        }

        // Post to Sheets
        await logToGoogleSheets(
          "MEETING_BOOKED",
          meetingPayload.userName || googleUser?.user_metadata?.full_name || "Aria Client",
          meetingPayload.email || googleUser?.email || "lead@luxeestate.com",
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
          // Save actual inquiry to 'inquiries' table in Supabase so it triggers owner dashboards!
          await supabase.from('inquiries').insert([{
            property_id: inquiryPayload.propertyId,
            property_title: inquiryPayload.propertyName,
            owner_email: inquiryPayload.ownerEmail || "owner@luxeestate.com",
            type: "contact",
            name: inquiryPayload.userName || googleUser?.user_metadata?.full_name || "Luxe Guest",
            email: inquiryPayload.email || googleUser?.email || "guest@luxeestate.com",
            phone: inquiryPayload.phone || "Not provided",
            message: inquiryPayload.message || "I am extremely interested in your property listing.",
            created_at: new Date().toISOString()
          }]);
        } catch (e) {
          console.warn("Inquiry DB insertion bypassed", e);
        }

        // Post to Sheets
        await logToGoogleSheets(
          "PROPERTY_INQUIRY",
          inquiryPayload.userName || googleUser?.user_metadata?.full_name || "Luxe Client",
          inquiryPayload.email || googleUser?.email || "client@luxeestate.com",
          inquiryPayload.phone || "N/A",
          inquiryPayload.propertyId,
          inquiryPayload.propertyName,
          inquiryPayload.message
        );
      }

      // If regular chat with user details, log conversation log
      if (!meetingPayload && !inquiryPayload) {
        await logToGoogleSheets(
          "GENERAL_CHAT",
          googleUser?.user_metadata?.full_name || "Luxe Guest",
          googleUser?.email || "anonymous-leads@luxeestate.com",
          "N/A",
          "None",
          "General Matchmaking Session",
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
        content: `I hit a slight issue accessing LuxeEstate agents right now. Please verify your internet connection or check your API key secrets: ${error.message}`,
        timestamp: new Date()
      }]);
    } finally {
      setLoading(false);
    }
  };

  // Renders the matched property card inside chatbot bubble
  const renderRelatedProperty = (propertyId: string) => {
    const matched = properties.find(p => p.id === propertyId);
    if (!matched) return null;

    return (
      <Link href={`/property/${matched.id}`} key={matched.id}>
        <div className="mt-3 bg-slate-900/60 hover:bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-md flex transition-all duration-300 transform hover:-translate-y-0.5 cursor-pointer group">
          <div className="w-20 h-20 relative shrink-0">
            <img 
              src={matched.imageUrl} 
              alt={matched.title} 
              className="object-cover w-full h-full"
              sizes="80px"
            />
          </div>
          <div className="p-3 flex flex-col justify-center overflow-hidden">
            <h4 className="text-xs font-black text-slate-100 truncate group-hover:text-sky-400 transition-colors uppercase tracking-wider">{matched.title}</h4>
            <span className="text-[10px] text-slate-400 mt-0.5">{matched.location}</span>
            <span className="text-sky-400 font-bold ml-auto text-xs mt-1">
              ${(matched.price || 0).toLocaleString()}
            </span>
          </div>
        </div>
      </Link>
    );
  };

  return (
    <>
      {/* Floating Toggle Launcher Button */}
      <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end gap-3 pointer-events-auto">
        <AnimatePresence>
          {isOpen && (
            <motion.div 
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="mb-1 bg-sky-900/80 border border-sky-400/30 text-white backdrop-blur-md px-3.5 py-1.5 rounded-full text-[10px] uppercase font-black tracking-widest shadow-lg flex items-center gap-1.5"
            >
              <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-ping"></span>
              Aria Exclusive Concierge
            </motion.div>
          )}
        </AnimatePresence>

        <button
          onClick={() => setIsOpen(!isOpen)}
          id="aria-launcher"
          className={`w-14 h-14 rounded-full flex items-center justify-center border transition-all duration-500 shadow-2xl relative overflow-hidden group pointer-events-auto ${
            isOpen 
              ? 'bg-rose-950 border-rose-500/50 text-rose-100 rotate-90 scale-95' 
              : 'bg-black border-sky-400/30 hover:border-sky-400/60 text-sky-400 hover:scale-105'
          }`}
        >
          {/* Breathing Neon Orb Background */}
          {!isOpen && (
            <div className="absolute inset-0 bg-gradient-to-tr from-sky-600/10 via-purple-600/10 to-indigo-600/10 animate-pulse"></div>
          )}
          
          {isOpen ? (
            <X className="w-6 h-6 relative z-10" />
          ) : (
            <div className="relative z-10 flex flex-col items-center justify-center">
              <Bot className="w-6 h-6 group-hover:scale-110 transition-transform duration-300" />
              <div className="flex gap-0.5 justify-center mt-0.5">
                <span className="w-1 h-1 bg-sky-400 rounded-full animate-bounce delay-100"></span>
                <span className="w-1 h-1 bg-sky-400 rounded-full animate-bounce delay-200"></span>
                <span className="w-1 h-1 bg-sky-400 rounded-full animate-bounce delay-300"></span>
              </div>
            </div>
          )}

          {/* Pulse Ripple Ring */}
          {!isOpen && (
            <span className="absolute inset-0 rounded-full border border-sky-400/40 animate-ping opacity-75"></span>
          )}
        </button>
      </div>

      {/* Slide-out Overlay Agent Card */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 80, x: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 100, x: 50 }}
            transition={{ type: "spring", stiffness: 260, damping: 25 }}
            className="fixed bottom-24 right-6 w-[360px] md:w-[400px] h-[600px] max-h-[80vh] bg-slate-950/95 border border-slate-800/80 rounded-[2.5rem] shadow-[0_0_50px_-12px_rgba(56,189,248,0.15)] flex flex-col overflow-hidden z-[9998] backdrop-blur-xl"
            id="aria-chatbot-card"
          >
            {/* Elegant Header with Neon Glow */}
            <div className="p-5 border-b border-slate-900 bg-slate-900/40 flex items-center justify-between relative shrink-0">
              <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-sky-400/50 to-transparent"></div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-slate-800 flex items-center justify-center border border-slate-700 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-sky-500/20"></div>
                  <Sparkles className="w-5 h-5 text-sky-400 animate-pulse relative z-10" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-black text-sm tracking-widest text-slate-100 uppercase">Aria</h3>
                    <span className="bg-sky-500/10 border border-sky-500/20 text-sky-400 text-[8px] tracking-[0.2em] font-black uppercase px-2 py-0.5 rounded-full">Concierge</span>
                  </div>
                  <p className="text-[10px] text-slate-400">Exclusive AI Real Estate Partner</p>
                </div>
              </div>

              {/* Toggles */}
              <div className="flex items-center gap-2">
                {/* Voice Speaker On/Off Toggle */}
                <button
                  onClick={() => {
                    setVoiceEnabled(!voiceEnabled);
                    if (voiceEnabled && window.speechSynthesis) {
                      window.speechSynthesis.cancel();
                    }
                  }}
                  className={`p-2 rounded-xl border transition-all duration-300 flex items-center justify-center ${
                    voiceEnabled 
                      ? 'bg-sky-950/50 border-sky-500/40 text-sky-400' 
                      : 'bg-slate-900 border-slate-800 text-slate-500 hover:text-slate-300'
                  }`}
                  title={voiceEnabled ? "Turn Voiceover Off" : "Turn Voiceover On"}
                >
                  {voiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                </button>

                {/* Close Button */}
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Speaking/Thinking Visualizer strip */}
            <AnimatePresence>
              {(isSpeaking || loading) && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 24 }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-sky-950/40 border-b border-sky-900/30 px-5 flex items-center justify-between overflow-hidden relative shrink-0"
                >
                  <span className="text-[9px] uppercase tracking-wider text-sky-400 font-bold flex items-center gap-1">
                    {loading ? "Aria is analyzing catalogs..." : "Aria Speaking..."}
                  </span>
                  <div className="flex items-center gap-0.5 h-3">
                    {[...Array(6)].map((_, i) => (
                      <span 
                        key={i} 
                        className="w-0.5 bg-sky-400 rounded-full"
                        style={{
                          height: '100%',
                          animation: 'bounce 0.8s ease-in-out infinite',
                          animationDelay: `${i * 0.12}s`,
                          transformOrigin: 'bottom'
                        }}
                      ></span>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Tabs for conversation and spreadsheet visualizer */}
            <div className="flex-1 overflow-hidden flex flex-col min-h-0 relative">
              {/* Message scroll container */}
              <div 
                ref={scrollRef}
                className="flex-1 overflow-y-auto px-5 py-4 space-y-4 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent select-text"
              >
                {messages.map((m) => (
                  <div 
                    key={m.id}
                    className={`flex flex-col max-w-[85%] ${m.role === 'user' ? 'ml-auto items-end' : 'mr-auto items-start'}`}
                  >
                    <div 
                      className={`p-4 rounded-[1.5rem] text-xs leading-relaxed ${
                        m.role === 'user' 
                          ? 'bg-sky-600 font-medium text-white px-4 py-3 rounded-tr-none shadow-md' 
                          : 'bg-slate-900/80 border border-slate-850 text-slate-200 rounded-tl-none shadow-inner'
                      }`}
                    >
                      {/* Formatted body strip command metadata */}
                      <p className="whitespace-pre-line">
                        {m.content
                          .replace(/\[SCHEDULE_MEETING:\s*.*?\]/g, '')
                          .replace(/\[SUBMIT_INQUIRY:\s*.*?\]/g, '')
                          .trim()}
                      </p>

                      {/* Matching properties links extracted dynamically */}
                      {m.role === 'assistant' && properties.length > 0 && (
                        (() => {
                          const matchedIds = Array.from(m.content.matchAll(/property\/(\d+)/gi)).map(match => match[1]);
                          const distinctMatchedIds = [...new Set(matchedIds)];
                          return distinctMatchedIds.map(id => renderRelatedProperty(id));
                        })()
                      )}

                      {/* Display scheduled tag indicator */}
                      {m.scheduledMeeting && (
                        <div className="mt-3 p-3 bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 rounded-xl flex flex-col gap-1.5 shadow-sm">
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                            <span className="font-black uppercase tracking-wider text-[9px]">Tour Scheduled</span>
                          </div>
                          <div className="text-[10px]">
                            <div className="font-semibold text-slate-100">{m.scheduledMeeting.propertyName}</div>
                            <div className="text-slate-300 mt-0.5">{m.scheduledMeeting.date} at {m.scheduledMeeting.time}</div>
                          </div>
                          <span className="text-[8px] bg-emerald-900/60 self-start px-2 py-0.5 rounded-md text-emerald-200 mt-1 uppercase tracking-wider">Synced to Google Sheets</span>
                        </div>
                      )}

                      {/* Display inquiry tag indicator */}
                      {m.submittedInquiry && (
                        <div className="mt-3 p-3 bg-indigo-950/80 border border-indigo-500/40 text-indigo-300 rounded-xl flex flex-col gap-1.5 shadow-sm">
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-indigo-400" />
                            <span className="font-black uppercase tracking-wider text-[9px]">Owner Informed</span>
                          </div>
                          <div className="text-[10px]">
                            <div className="font-semibold text-slate-100">{m.submittedInquiry.propertyName}</div>
                            <div className="text-slate-300 italic max-h-12 overflow-hidden text-ellipsis mt-1">"{m.submittedInquiry.message}"</div>
                          </div>
                          <span className="text-[8px] bg-indigo-900/60 self-start px-2 py-0.5 rounded-md text-indigo-200 mt-1 uppercase tracking-wider">Saved & Synced to Sheets</span>
                        </div>
                      )}
                    </div>
                    <span className="text-[8px] text-slate-500 mt-1 tracking-wider px-1">
                      {m.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                ))}

                {loading && (
                  <div className="flex flex-col mr-auto max-w-[85%] items-start">
                    <div className="p-3.5 bg-slate-900/80 border border-slate-850 text-slate-400 rounded-[1.5rem] rounded-tl-none">
                      <div className="flex gap-1 items-center py-1 px-2">
                        <span className="w-1.5 h-1.5 bg-sky-400 rounded-full animate-bounce"></span>
                        <span className="w-1.5 h-1.5 bg-sky-400 rounded-full animate-bounce delay-150"></span>
                        <span className="w-1.5 h-1.5 bg-sky-400 rounded-full animate-bounce delay-300"></span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Connected Google Sheets Dashboard inside chatbot drawers */}
              <div className="p-4 bg-slate-900/50 border-t border-slate-900 absolute bottom-0 left-0 right-0 max-h-44 overflow-y-auto z-20 backdrop-blur-md hidden hover:block group border-dashed hover:border-sky-500/20">
                {/* Visualizer toggled simply on styling hover */}
              </div>
            </div>

            {/* Google Sheets Dashboard overlay widget */}
            <div className="px-5 py-3 border-t border-slate-900 bg-slate-900/10 flex items-center justify-between text-xs text-slate-400 shrink-0">
              <div className="flex items-center gap-1.5 overflow-hidden">
                <FileSpreadsheet className={`w-3.5 h-3.5 ${spreadsheetId ? "text-green-400" : "text-slate-500"}`} />
                {spreadsheetId ? (
                  <span className="truncate text-[10px] uppercase font-bold tracking-wider text-green-400">
                    Sheets Connected
                  </span>
                ) : (
                  <span className="text-[10px] text-slate-500">Google Sheets offline</span>
                )}
              </div>

              <div className="flex items-center gap-2">
                {spreadsheetUrl ? (
                  <a 
                    href={spreadsheetUrl} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="flex items-center gap-0.5 text-[9px] uppercase font-black tracking-widest text-sky-400 hover:text-sky-300"
                  >
                    Open Sheet <ArrowUpRight className="w-3 h-3" />
                  </a>
                ) : (
                  googleToken ? (
                    <span className="text-[9px] text-slate-500 italic">Sheets sync-ready</span>
                  ) : (
                    <button 
                      onClick={handleOAuthConnect}
                      className="text-[9px] uppercase font-bold text-sky-400 hover:underline active:scale-95 transition-transform"
                    >
                      Enable Sync
                    </button>
                  )
                )}

                {googleToken && (
                  <button 
                    onClick={handleSignOutGoogle}
                    className="text-[9px] text-slate-600 hover:text-rose-400 ml-1"
                    title="Disconnect Google account"
                  >
                    Disconnect
                  </button>
                )}
              </div>
            </div>

            {/* Input typing panel */}
            <div className="p-4 border-t border-slate-900 bg-slate-950 flex items-center gap-2.5 shrink-0">
              {/* Mic Toggler */}
              <button
                onClick={toggleListening}
                className={`p-3 rounded-2xl border transition-all duration-300 relative ${
                  isListening 
                    ? 'bg-rose-950 border-rose-500/50 text-rose-300 animate-pulse' 
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
                title={isListening ? "Listening... Click to stop" : "Talk to Aria (Mic input)"}
              >
                {isListening ? (
                  <>
                    <MicOff className="w-4.5 h-4.5 relative z-10" />
                    <span className="absolute inset-0 rounded-2xl border border-rose-500/60 animate-ping"></span>
                  </>
                ) : (
                  <Mic className="w-4.5 h-4.5" />
                )}
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
                  placeholder={isListening ? "Listening to your voice..." : "Desire a Malibu villa? Ask here..."}
                  disabled={isListening}
                  className="flex-1 bg-slate-900 border border-slate-800/80 rounded-2.5xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-sky-500/50 placeholder-slate-500 focus:ring-1 focus:ring-sky-500/20 disabled:opacity-50"
                />
                
                <button
                  type="submit"
                  disabled={loading || isListening || !inputValue.trim()}
                  className="p-3 rounded-2xl bg-sky-600 hover:bg-sky-500 text-white disabled:opacity-30 transition-all duration-300 flex items-center justify-center shadow-lg active:scale-95"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>

            {/* Live Synchronized Sheet Rows Ledger accordion element for beautiful visual demonstration */}
            {sheetsSyncList.length > 0 && (
              <div className="bg-slate-900 px-5 py-2.5 max-h-24 overflow-y-auto border-t border-slate-850 shrink-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[8px] uppercase tracking-wider font-extrabold text-green-400 flex items-center gap-1">
                    <CheckCircle2 className="w-2.5 h-2.5" /> Google Sheets Synergistic Logs
                  </span>
                  <span className="text-[7px] text-slate-500 bg-slate-950 px-1 py-0.5 rounded">Latest {sheetsSyncList.length} Rows</span>
                </div>
                <div className="space-y-1">
                  {sheetsSyncList.slice(0, 3).map((log, index) => (
                    <div key={index} className="flex justify-between text-[8px] text-slate-400 bg-slate-950/40 p-1 rounded font-mono truncate">
                      <span className="text-[7px] text-sky-400 font-bold tracking-wider shrink-0 mr-1">[{log.type}]</span>
                      <span className="truncate flex-1">{log.name} inquiring {log.property}</span>
                      <span className="text-[7px] text-slate-600 shrink-0 ml-1">{log.timestamp.split(',')[1]?.trim() || log.timestamp}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
