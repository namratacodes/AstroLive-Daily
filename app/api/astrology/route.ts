import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase";

const FREE_ASTRO_API_URL =
  "https://api.freeastroapi.com/api/v2/vedic/chart";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      userId,
      year,
      month,
      day,
      hour,
      minute,
      city,
    } = body;

    if (
      !userId ||
      year === undefined ||
      month === undefined ||
      day === undefined ||
      hour === undefined ||
      minute === undefined ||
      !city
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "userId, birth date, time and city are required.",
        },
        { status: 400 }
      );
    }

    const apiKey = process.env.FREE_ASTRO_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        {
          success: false,
          error: "FreeAstroAPI key is not configured.",
        },
        { status: 500 }
      );
    }

    // ─────────────────────────────────────────────
    // 1. Call FreeAstroAPI
    // ─────────────────────────────────────────────

    const response = await fetch(FREE_ASTRO_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
      },
      body: JSON.stringify({
        year: Number(year),
        month: Number(month),
        day: Number(day),
        hour: Number(hour),
        minute: Number(minute),
        city,
        tz_str: "AUTO",
        ayanamsha: "lahiri",
        house_system: "whole_sign",
        node_type: "mean",
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("FreeAstroAPI error:", data);

      return NextResponse.json(
        {
          success: false,
          error: "FreeAstroAPI request failed.",
          details: data,
        },
        { status: response.status }
      );
    }

    const astrology = data;

    // ─────────────────────────────────────────────
    // 2. Extract important values
    // ─────────────────────────────────────────────

    const ascendant = astrology?.ascendant?.sign ?? null;

    const nakshatra =
      astrology?.ascendant?.nakshatra?.name ?? null;

    const sunPlanet = astrology?.planets?.find(
      (planet: any) => planet.name === "Sun"
    );

    const moonPlanet = astrology?.planets?.find(
      (planet: any) => planet.name === "Moon"
    );

    const sunSign = sunPlanet?.sign ?? null;
    const moonSign = moonPlanet?.sign ?? null;

    // ─────────────────────────────────────────────
    // 3. Save astrology profile
    // ─────────────────────────────────────────────

    const supabase = getSupabaseServerClient();

    const { data: profile, error: profileError } = await supabase
      .from("astrology_profiles")
      .upsert(
        {
          user_id: userId,

          sun_sign: sunSign,
          moon_sign: moonSign,
          ascendant,
          nakshatra,

          planetary_data: {
            planets: astrology?.planets ?? [],
            metadata: astrology?.metadata ?? {},
            sade_sati: astrology?.sade_sati ?? null,
          },

          houses_data: {
            houses: astrology?.houses ?? [],
          },

          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "user_id",
        }
      )
      .select()
      .single();

    if (profileError) {
      console.error(
        "Supabase astrology profile error:",
        profileError
      );

      return NextResponse.json(
        {
          success: false,
          error: "Failed to save astrology profile.",
          details: profileError.message,
        },
        { status: 500 }
      );
    }

    // ─────────────────────────────────────────────
    // 4. Update users table
    // ─────────────────────────────────────────────

    const { error: userError } = await supabase
      .from("users")
      .update({
        latitude: null,
        longitude: null,
        timezone: astrology?.metadata?.timezone_used ?? null,
      })
      .eq("id", userId);

    if (userError) {
      console.error("User update error:", userError);
    }

    // ─────────────────────────────────────────────
    // 5. Return result
    // ─────────────────────────────────────────────

    return NextResponse.json({
      success: true,

      message: "Astrology profile created successfully.",

      profile,
    });
  } catch (error) {
    console.error("Astrology API error:", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Something went wrong.",
      },
      { status: 500 }
    );
  }
}