import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { getSupabaseServerClient } from "@/lib/supabase";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const { userId } = body;

    // ─────────────────────────────────────────────
    // 1. Validate user
    // ─────────────────────────────────────────────

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          error: "userId is required.",
        },
        { status: 400 }
      );
    }

    // ─────────────────────────────────────────────
    // 2. Check Gemini API key
    // ─────────────────────────────────────────────

    const geminiKey = process.env.GEMINI_API_KEY;

    if (!geminiKey) {
      return NextResponse.json(
        {
          success: false,
          error: "GEMINI_API_KEY is not configured.",
        },
        { status: 500 }
      );
    }

    const supabase = getSupabaseServerClient();

    // ─────────────────────────────────────────────
    // 3. Get user's astrology profile
    // ─────────────────────────────────────────────

    const { data: profile, error: profileError } =
      await supabase
        .from("astrology_profiles")
        .select("*")
        .eq("user_id", userId)
        .single();

    if (profileError || !profile) {
      console.error(
        "Astrology profile error:",
        profileError
      );

      return NextResponse.json(
        {
          success: false,
          error:
            "Astrology profile not found for this user.",
        },
        { status: 404 }
      );
    }

    // ─────────────────────────────────────────────
    // 4. Check if today's horoscope already exists
    // ─────────────────────────────────────────────

    const today = new Date()
      .toISOString()
      .split("T")[0];

    const { data: existingHoroscope } =
      await supabase
        .from("daily_horoscopes")
        .select("*")
        .eq("user_id", userId)
        .eq("horoscope_date", today)
        .maybeSingle();

    if (existingHoroscope) {
      return NextResponse.json({
        success: true,
        cached: true,
        horoscope: existingHoroscope,
      });
    }

    // ─────────────────────────────────────────────
    // 5. Prepare chart information
    // ─────────────────────────────────────────────

    const planetaryData =
      profile.planetary_data ?? {};

    const housesData =
      profile.houses_data ?? {};

    // ─────────────────────────────────────────────
    // 6. Build AI prompt
    // ─────────────────────────────────────────────

    const prompt = `
You are AstroLive's personalized Vedic astrology
horoscope assistant.

Generate a personalized daily horoscope based on
the user's actual birth chart.

Date:
${today}

Core chart:

Sun Sign:
${profile.sun_sign ?? "Unknown"}

Moon Sign:
${profile.moon_sign ?? "Unknown"}

Ascendant:
${profile.ascendant ?? "Unknown"}

Nakshatra:
${profile.nakshatra ?? "Unknown"}

Planetary Data:
${JSON.stringify(planetaryData, null, 2)}

House Data:
${JSON.stringify(housesData, null, 2)}

Instructions:

1. Write a warm, personalized daily horoscope.
2. Base the interpretation on the supplied birth chart.
3. Do not invent planetary positions.
4. Keep the overall horoscope around 120-180 words.
5. Cover:
   - general day
   - emotions
   - opportunities
   - things to be mindful of
6. Write separate sections for:
   - love
   - career
   - finance
   - health
7. Give one lucky number between 1 and 99.
8. Give one lucky color.
9. Do not claim that astrology scientifically predicts the future.
10. Do not give medical, financial, or legal instructions.
11. Keep the tone mystical, positive, modern and conversational.

Return ONLY valid JSON.

The JSON must have exactly this structure:

{
  "horoscope": "string",
  "love": "string",
  "career": "string",
  "finance": "string",
  "health": "string",
  "lucky_number": 7,
  "lucky_color": "Gold"
}
`;

    // ─────────────────────────────────────────────
    // 7. Call Gemini
    // ─────────────────────────────────────────────

    const ai = new GoogleGenAI({
      apiKey: geminiKey,
    });

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const text = response.text;

    if (!text) {
      throw new Error(
        "Gemini returned an empty response."
      );
    }

    // ─────────────────────────────────────────────
    // 8. Parse AI response
    // ─────────────────────────────────────────────

    let horoscopeData;

    try {
      horoscopeData = JSON.parse(text);
    } catch {
      console.error(
        "Invalid Gemini JSON:",
        text
      );

      throw new Error(
        "Gemini returned invalid JSON."
      );
    }

    // ─────────────────────────────────────────────
    // 9. Save horoscope to Supabase
    // ─────────────────────────────────────────────

    const { data: savedHoroscope, error: saveError } =
      await supabase
        .from("daily_horoscopes")
        .insert({
          user_id: userId,

          horoscope_date: today,

          horoscope_text:
            horoscopeData.horoscope,

          love:
            horoscopeData.love,

          career:
            horoscopeData.career,

          finance:
            horoscopeData.finance,

          health:
            horoscopeData.health,

          lucky_number:
            horoscopeData.lucky_number,

          lucky_color:
            horoscopeData.lucky_color,
        })
        .select()
        .single();

    if (saveError) {
      console.error(
        "Horoscope save error:",
        saveError
      );

      return NextResponse.json(
        {
          success: false,
          error:
            "Horoscope was generated but could not be saved.",
        },
        { status: 500 }
      );
    }

    // ─────────────────────────────────────────────
    // 10. Return horoscope
    // ─────────────────────────────────────────────

    return NextResponse.json({
      success: true,
      cached: false,
      horoscope: savedHoroscope,
    });
  } catch (error) {
    console.error(
      "Horoscope API error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to generate horoscope.",
      },
      { status: 500 }
    );
  }
}