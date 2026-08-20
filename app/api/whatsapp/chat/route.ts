import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { getSupabaseServerClient } from "@/lib/supabase";

const TOPICS = [
  "LOVE",
  "CAREER",
  "FINANCE",
  "STUDIES",
  "FAMILY",
  "GENERAL",
  "COMPATIBILITY",
] as const;

function detectTopic(message: string): (typeof TOPICS)[number] {
  const m = message.toLowerCase();
  if (/love|relationship|partner|dating|crush/.test(m)) return "LOVE";
  if (/career|job|work|promotion|interview/.test(m)) return "CAREER";
  if (/money|finance|invest|salary|savings/.test(m)) return "FINANCE";
  if (/study|studies|exam|college|school/.test(m)) return "STUDIES";
  if (/family|parents|mother|father|sibling/.test(m)) return "FAMILY";
  if (/compatib|match|zodiac.*with/.test(m)) return "COMPATIBILITY";
  return "GENERAL";
}

export async function POST(request: Request) {
  try {
    const { userId, message } = await request.json();

    if (!userId || !message) {
      return NextResponse.json(
        { success: false, error: "userId and message are required." },
        { status: 400 }
      );
    }

    const geminiKey = process.env.GEMINI_API_KEY;
    if (!geminiKey) {
      return NextResponse.json(
        { success: false, error: "GEMINI_API_KEY is not configured." },
        { status: 500 }
      );
    }

    const supabase = getSupabaseServerClient();

    const { data: profile, error: profileError } = await supabase
      .from("astrology_profiles")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (profileError || !profile) {
      return NextResponse.json(
        { success: false, error: "Astrology profile not found for this user." },
        { status: 404 }
      );
    }

    const { data: recentConvos } = await supabase
      .from("conversations")
      .select("user_message, ai_response")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(5);

    const topic = detectTopic(message);

    const historyText = (recentConvos ?? [])
      .reverse()
      .map((c) => `User: ${c.user_message}\nAstroLive: ${c.ai_response}`)
      .join("\n\n");

    const prompt = `
You are AstroLive Daily's AI astrology companion, replying inside a WhatsApp conversation.

Rules:
1. Never invent planetary positions or calculations — use only the chart data given below.
2. Use language like "may", "could", "this period may be favorable" — never claim certainty.
3. No medical, legal, or financial advice. No guaranteed predictions.
4. Keep it warm, conversational, under 80 words.
5. Don't push sales messages repeatedly.
6. Never claim to replace a professional astrologer.

User's birth chart:
Sun Sign: ${profile.sun_sign ?? "Unknown"}
Moon Sign: ${profile.moon_sign ?? "Unknown"}
Ascendant: ${profile.ascendant ?? "Unknown"}
Nakshatra: ${profile.nakshatra ?? "Unknown"}

Recent conversation:
${historyText || "(no prior messages)"}

Detected topic: ${topic}

User's new message: "${message}"

Reply as AstroLive Daily would on WhatsApp. Plain text only, no JSON, no markdown.
`;

    const ai = new GoogleGenAI({ apiKey: geminiKey });
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
    });

    const aiText = response.text?.trim();
    if (!aiText) {
      throw new Error("Gemini returned an empty response.");
    }

    const { error: saveError } = await supabase.from("conversations").insert({
      user_id: userId,
      user_message: message,
      ai_response: aiText,
      topic,
    });

    if (saveError) {
      console.error("Conversation save error:", saveError);
    }

    return NextResponse.json({ success: true, reply: aiText, topic });
  } catch (error) {
    console.error("WhatsApp chat API error:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          "I'm having trouble generating your reading right now. Please try again shortly.",
      },
      { status: 500 }
    );
  }
}