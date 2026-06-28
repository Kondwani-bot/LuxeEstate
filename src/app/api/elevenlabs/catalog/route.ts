import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  try {
    const format = req.nextUrl.searchParams.get("format");
    
    const { data: properties, error } = await supabase
      .from('properties')
      .select('id, title, price, location, description, type, status, features');

    if (error) {
      throw error;
    }

    const list = properties || [];
    const updatedAt = new Date().toLocaleString();

    // If explicitly requesting JSON format
    if (format === "json") {
      return NextResponse.json({
        platform: "LuxeEstate Exclusive Real Estate Hub",
        updatedAt,
        totalListings: list.length,
        properties: list
      });
    }

    // Default: Clean HTML article format specifically formatted for ElevenLabs & Mozilla Readability scraper
    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>LuxeEstate Live Knowledge Base & Catalog</title>
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; max-w: 800px; margin: 2rem auto; padding: 0 1rem; color: #1a202c; }
    h1, h2, h3 { color: #0f172a; }
    .listing { border-bottom: 1px solid #e2e8f0; padding: 1.5rem 0; }
    .badge { background: #e0f2fe; color: #0369a1; padding: 0.2rem 0.6rem; border-radius: 4px; font-weight: bold; font-size: 0.85rem; }
    ul { padding-left: 1.25rem; }
  </style>
</head>
<body>
  <article>
    <header>
      <h1>LuxeEstate Real Estate Knowledge Base</h1>
      <p><strong>Platform:</strong> LuxeEstate Friendly Real Estate Matchmaking Hub</p>
      <p><strong>Catalog Updated:</strong> ${updatedAt}</p>
      <p><strong>Total Active Properties:</strong> ${list.length}</p>
    </header>

    <section id="agent-grounding-instructions">
      <h2>Conversational AI Agent Grounding Instructions</h2>
      <p>You are Aria, the friendly AI Voice Assistant for LuxeEstate.</p>
      <p><strong>CRITICAL TONE & LANGUAGE RULE:</strong> You must speak in simple, clear, everyday English. Do not use big, fancy, snobby, or hard words. Talk warmly, kindly, and politely so that anyone—whether a young first-time renter or a wealthy buyer—feels 100% welcome and comfortable. Keep your answers short, helpful, and easy to understand.</p>
      
      <h3>How to handle house tours & tools:</h3>
      <p>When clients ask about available houses, prices, locations, or bedrooms, tell them the live property listings written below.</p>
      <p><strong>1. Booking a Viewing / House Tour:</strong> If a client wants to visit or see a house, ask for their: <strong>Name</strong>, <strong>Phone Number or Email</strong>, <strong>Preferred Date and Time</strong>, and which <strong>House Title</strong> they like. Once they tell you, say <em>"Awesome! I am booking your house tour right now."</em> and IMMEDIATELY execute your webhook tool (e.g. <code>lux-webhook</code> or <code>viewing_scheduled</code>).</p>
      <p><strong>2. Contacting a Human Agent:</strong> If a client wants to speak to a real human person, ask for their <strong>Name</strong> and <strong>Phone Number or Email</strong>. Once they give it, say <em>"I have sent an urgent email alert to our human team. Admin Kondwani will call or email you shortly!"</em> and IMMEDIATELY execute your webhook tool.</p>
    </section>

    <section id="active-property-catalog">
      <h2>Available Homes & Luxury Estates</h2>
      ${list.length === 0 ? '<p>No properties currently listed in database.</p>' : list.map((p: any) => `
      <div class="listing" id="prop-${p.id}">
        <h3>${p.title || 'Luxury Home'} <span class="badge">$${(p.price || 0).toLocaleString()}</span></h3>
        <p><strong>Location:</strong> ${p.location || 'Prime Location'}</p>
        <p><strong>Property Type:</strong> ${p.type || 'Residence'} | <strong>Status:</strong> ${p.status || 'Available'}</p>
        <p><strong>Overview:</strong> ${p.description || 'Exclusive luxury home.'}</p>
        ${p.features && Array.isArray(p.features) && p.features.length > 0 ? `
        <p><strong>Key Features:</strong></p>
        <ul>
          ${p.features.map((f: string) => `<li>${f}</li>`).join('')}
        </ul>` : ''}
      </div>`).join('')}
    </section>
  </article>
</body>
</html>`;

    return new NextResponse(htmlContent, {
      status: 200,
      headers: {
        'Cache-Control': 's-maxage=60, stale-while-revalidate=300',
        'Content-Type': 'text/html; charset=utf-8'
      }
    });

  } catch (err: any) {
    console.error("ElevenLabs Catalog Feed Error:", err);
    return new NextResponse(`<h1>Error loading catalog</h1><p>${err.message}</p>`, {
      status: 500,
      headers: { 'Content-Type': 'text/html; charset=utf-8' }
    });
  }
}

