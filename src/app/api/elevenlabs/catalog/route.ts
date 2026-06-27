import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  try {
    const { data: properties, error } = await supabase
      .from('properties')
      .select('id, title, price, location, description, type, status, features');

    if (error) {
      throw error;
    }

    const formattedCatalog = {
      platform: "LuxeEstate Exclusive Real Estate Hub",
      updatedAt: new Date().toISOString(),
      totalListings: properties?.length || 0,
      instructionsForAIAgent: `
You are Aria, the exclusive voice concierge for LuxeEstate. 
When answering client questions about available properties, prices, or locations, use this live catalog.
If a client asks to book a viewing or schedule a tour, collect their Name, Phone/Email, Preferred Date, and the Property Title, then execute your custom webhook tool.
`,
      properties: properties || []
    };

    return NextResponse.json(formattedCatalog, {
      headers: {
        'Cache-Control': 's-maxage=60, stale-while-revalidate=300',
        'Content-Type': 'application/json'
      }
    });
  } catch (err: any) {
    console.error("ElevenLabs Catalog Feed Error:", err);
    return NextResponse.json(
      { error: "Failed to retrieve real estate catalog.", details: err.message },
      { status: 500 }
    );
  }
}
