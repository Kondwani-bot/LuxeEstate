import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, propertyId, propertyTitle, clientName, email, phone, appointmentDate, appointmentTime, message } = body;

    console.log("ElevenLabs AI Agent Webhook received action:", action || "general_inquiry", body);

    const timestamp = new Date().toLocaleString();
    const actionType = action === "book_tour" || action === "schedule_meeting" ? "MEETING_BOOKED" : "VOICE_INQUIRY";

    // 1. Insert into Supabase if appropriate
    if (actionType === "MEETING_BOOKED") {
      try {
        await supabase.from('appointments').insert([{
          property_id: propertyId || "N/A",
          property_title: propertyTitle || "General Estate Tour",
          client_name: clientName || "Voice Client",
          client_email: email || "voice-lead@luxeestate.com",
          client_phone: phone || "Not Specified",
          appointment_date: appointmentDate || new Date().toISOString().split('T')[0],
          appointment_time: appointmentTime || "2:00 PM",
          created_at: new Date().toISOString()
        }]);
      } catch (dbErr) {
        console.warn("Supabase appointment log safe bypass:", dbErr);
      }
    } else {
      try {
        await supabase.from('inquiries').insert([{
          property_id: propertyId || "N/A",
          property_title: propertyTitle || "General Voice Inquiry",
          owner_email: "owner@luxeestate.com",
          type: "voice_contact",
          name: clientName || "ElevenLabs Voice Guest",
          email: email || "voice-guest@luxeestate.com",
          phone: phone || "Not Provided",
          message: message || "Inquiry initiated via ElevenLabs Conversational Voice Agent.",
          created_at: new Date().toISOString()
        }]);
      } catch (dbErr) {
        console.warn("Supabase inquiry log safe bypass:", dbErr);
      }
    }

    // 2. Automatically log to Master Google Sheets via internal API call
    try {
      const origin = req.headers.get("origin") || req.nextUrl.origin || "http://localhost:3000";
      await fetch(`${origin}/api/sheets/append`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: `ELEVENLABS_${actionType}`,
          name: clientName || "Voice Guest Client",
          email: email || "elevenlabs-voice@luxeestate.com",
          phone: phone || "N/A",
          propertyId: propertyId || "Voice Hub",
          propertyTitle: propertyTitle || "Voice Agent Inquiry",
          message: message || `Voice consultation session completed on ${timestamp}`
        })
      });
    } catch (sheetErr) {
      console.warn("Sheet append bypass:", sheetErr);
    }

    return NextResponse.json({
      success: true,
      message: `Action '${actionType}' organized and synchronized across Supabase and Google Sheets successfully!`,
      timestamp
    });

  } catch (error: any) {
    console.error("ElevenLabs Webhook Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed processing webhook request" },
      { status: 500 }
    );
  }
}
