import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': "aistudio-build",
    },
  },
});

export async function POST(req: NextRequest) {
  try {
    const { messages, properties, userContext } = await req.json();

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY is not defined in the workspace secrets manually." },
        { status: 500 }
      );
    }

    const systemInstruction = `
You are "Aria", the highly exclusive AI Estate Concierge for LuxeEstate.
LuxeEstate is an ultra-luxury real estate hub containing premium listings around the globe (Malibu, Tuscany, Manhattan, Alps, Bora Bora, Portland, Palm Springs).

Your goals:
1. Converse with elegance, high-end warmth, and luxury.
2. Keep your answers concise, engaging, and readable—since they will also be read aloud via voiceover to the user.
3. Suggest properties from the provided catalog that match the user's requirements (budget, location, type, features).
4. Direct the user to specific luxury properties, highlighting terms beautifully.
5. If the user wants to schedule a tour/meeting or contact an owner, tell them you are organizing it, and print one of these special tag instructions at the END of your message (after a double newline):
   - For Tour/Meeting request:
     [SCHEDULE_MEETING: {"propertyId": "PROPERTY_ID", "propertyName": "PROPERTY_TITLE", "date": "PREFERRED_DATE_OR_NONE", "time": "TIME_OR_NONE", "userName": "USER_NAME", "email": "USER_EMAIL", "phone": "USER_PHONE"}]
   - For General Inquiry:
     [SUBMIT_INQUIRY: {"propertyId": "PROPERTY_ID", "propertyName": "PROPERTY_TITLE", "ownerEmail": "OWNER_EMAIL", "message": "DETAILED_INQUIRY_MESSAGE", "userName": "USER_NAME", "email": "USER_EMAIL", "phone": "USER_PHONE"}]

Available Properties Catalog:
${JSON.stringify(properties, null, 2)}

User's Authenticated Details (if any):
${JSON.stringify(userContext || {}, null, 2)}

Guidelines:
- Match their vibes carefully. If they ask for something beachy, point them to Malibu or Bora Bora.
- If they ask for a budget of "under 5 million", exclude properties above 5M.
- If no direct match exists, elegantly point that out and propose the next closest luxury alternative.
- Do NOT output markdown code blocks for the brackets commands like [SCHEDULE_MEETING: ...], put them inline as raw text at the very bottom of your response so our system can capture them seamlessly.
`;

    // Convert messages into parts or standard text format
    const contents = messages.map((m: any) => ({
      role: m.role === "user" ? "user" : "model",
      parts: [{ text: m.content }],
    }));

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    return NextResponse.json({
      text: response.text,
    });
  } catch (error: any) {
    console.error("Gemini API error:", error);
    return NextResponse.json(
      { error: "Failed to generate AI response. Make sure GEMINI_API_KEY is configured." },
      { status: 500 }
    );
  }
}
