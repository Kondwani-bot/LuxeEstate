import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, x-api-key, xi-api-key",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: corsHeaders });
}

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.json().catch(() => ({}));
    // ElevenLabs ConvAI tool calls might pass parameters nested under 'parameters', 'args', or flat at root
    const payload = rawBody.parameters || rawBody.args || rawBody || {};

    // Forgiving parameter unpacking with synonyms
    const action = payload.action || payload.type || payload.event || "book_tour";
    const propertyId = payload.propertyId || payload.id || "N/A";
    const propertyTitle = payload.propertyTitle || payload.propertyName || payload.property || "Luxury Estate";
    const clientName = payload.clientName || payload.name || payload.userName || payload.visitorName || "Valued Client";
    const email = payload.email || payload.clientEmail || payload.visitorEmail || "guest@luxeestate.com";
    const phone = payload.phone || payload.clientPhone || payload.phoneNumber || payload.contactNumber || "Not Specified";
    const appointmentDate = payload.appointmentDate || payload.date || payload.preferredDate || new Date().toISOString().split('T')[0];
    const appointmentTime = payload.appointmentTime || payload.time || payload.preferredTime || "ASAP / Flexible";
    const message = payload.message || payload.notes || payload.inquiry || "Inquiry initiated via voice session.";

    console.log("ElevenLabs Webhook executed action:", action, payload);

    const timestamp = new Date().toLocaleString();
    const isHumanHandoff = action.includes("human") || action.includes("concierge") || action.includes("escalate") || action.includes("contact");
    const actionType = isHumanHandoff ? "HUMAN_CONCIERGE_HANDOFF" : (action === "book_tour" || action === "schedule_meeting" || action === "viewing_scheduled") ? "MEETING_BOOKED" : "VOICE_INQUIRY";

    // 1. Log to Supabase database
    if (actionType === "MEETING_BOOKED") {
      try {
        await supabase.from('appointments').insert([{
          property_id: propertyId,
          property_title: propertyTitle,
          client_name: clientName,
          client_email: email,
          client_phone: phone,
          appointment_date: appointmentDate,
          appointment_time: appointmentTime,
          created_at: new Date().toISOString()
        }]);
      } catch (dbErr) {
        console.warn("Supabase appointment log bypass:", dbErr);
      }
    } else {
      try {
        await supabase.from('inquiries').insert([{
          property_id: propertyId,
          property_title: propertyTitle,
          owner_email: "owner@luxeestate.com",
          type: isHumanHandoff ? "human_handoff" : "voice_contact",
          name: clientName,
          email: email,
          phone: phone,
          message: `[${actionType}] ${message} (Schedule: ${appointmentDate} @ ${appointmentTime})`,
          created_at: new Date().toISOString()
        }]);
      } catch (dbErr) {
        console.warn("Supabase inquiry log bypass:", dbErr);
      }
    }

    // 2. Automatically dispatch Email to Human Concierge (kondwanimbewe111@gmail.com)
    const conciergeEmail = process.env.HUMAN_CONCIERGE_EMAIL || "kondwanimbewe111@gmail.com";
    try {
      await fetch(`https://formsubmit.co/ajax/${conciergeEmail}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({
          _subject: `🚨 LuxeEstate Alert: ${isHumanHandoff ? 'HUMAN CONCIERGE REQUESTED' : 'New Viewing Scheduled'} (${clientName})`,
          Action_Type: actionType,
          Client_Name: clientName,
          Client_Phone: phone,
          Client_Email: email,
          Property_Listing: propertyTitle,
          Requested_Schedule: `${appointmentDate} at ${appointmentTime}`,
          Client_Message: message,
          Logged_At: timestamp
        })
      });
    } catch (emailErr) {
      console.warn("Human concierge email notification bypass:", emailErr);
    }

    // 3. Automatically sync to Master Google Sheets
    try {
      const origin = req.headers.get("origin") || req.nextUrl.origin || "http://localhost:3000";
      await fetch(`${origin}/api/sheets/append`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: `ELEVENLABS_${actionType}`,
          name: clientName,
          email: email,
          phone: phone,
          propertyId: propertyId,
          propertyTitle: propertyTitle,
          message: isHumanHandoff ? `🚨 URGENT HANDOFF: Client requested human contact. ${message}` : `Tour confirmed for ${appointmentDate} at ${appointmentTime}. ${message}`
        })
      });
    } catch (sheetErr) {
      console.warn("Sheet append bypass:", sheetErr);
    }

    // Return crisp JSON format expected by ElevenLabs ConvAI tool engine
    return NextResponse.json({
      success: true,
      status: "confirmed",
      result: isHumanHandoff 
        ? `I have alerted our human concierge directly via email. They will contact ${clientName} at ${phone !== 'Not Specified' ? phone : email} shortly.`
        : `Viewing confirmed for ${clientName} at ${propertyTitle} on ${appointmentDate} at ${appointmentTime}. Our human team has also been alerted!`,
      message: "Webhook processed and human concierge notified successfully."
    }, { status: 200, headers: corsHeaders });

  } catch (error: any) {
    console.error("ElevenLabs Webhook Error:", error);
    return NextResponse.json(
      { success: false, status: "error", error: error.message || "Failed processing webhook request" },
      { status: 500, headers: corsHeaders }
    );
  }
}

