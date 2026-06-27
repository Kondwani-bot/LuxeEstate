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
      <h1>LuxeEstate Exclusive Real Estate Knowledge Base</h1>
      <p><strong>Platform:</strong> LuxeEstate Luxury Real Estate Matchmaking Hub</p>
      <p><strong>Catalog Updated:</strong> ${updatedAt}</p>
      <p><strong>Total Active Properties:</strong> ${list.length}</p>
    </header>

    <section id="agent-grounding-instructions">
      <h2>Conversational AI Agent Grounding Instructions</h2>
      <p>You are Aria, the exclusive AI Voice Concierge for LuxeEstate. You speak warmly, concisely, and professionally.</p>
      <p>When clients ask about available houses, prices, locations, or amenities, consult the live property listings documented below.</p>
      <p>If a client expresses interest in booking a private showing, viewing, or estate tour: accurately collect their <strong>Full Name</strong>, <strong>Email or Phone Number</strong>, <strong>Preferred Date/Time</strong>, and the <strong>Property Title</strong>. Once collected, inform them you are organizing the booking and execute your automated webhook tool.</p>
    </section>

    <section id="active-property-catalog">
      <h2>Available Luxury Listings & Estates</h2>
      ${list.length === 0 ? '<p>No properties currently listed in database.</p>' : list.map((p: any) => `
      <div class="listing" id="prop-${p.id}">
        <h3>${p.title || 'Luxury Estate'} <span class="badge">$${(p.price || 0).toLocaleString()}</span></h3>
        <p><strong>Location:</strong> ${p.location || 'Prime Location'}</p>
        <p><strong>Property Type:</strong> ${p.type || 'Residence'} | <strong>Status:</strong> ${p.status || 'Available'}</p>
        <p><strong>Overview:</strong> ${p.description || 'Exclusive luxury residence.'}</p>
        ${p.features && Array.isArray(p.features) && p.features.length > 0 ? `
        <p><strong>Key Amenities & Features:</strong></p>
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

