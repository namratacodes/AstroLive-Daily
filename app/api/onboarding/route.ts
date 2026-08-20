import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase";

const FREE_ASTRO_API_URL =
  "https://api.freeastroapi.com/api/v2/vedic/chart";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const { name, dob, time, place } = body;

    // ─────────────────────────────────────────────
    // 1. Validate required fields
    // ─────────────────────────────────────────────

    if (!name || !dob || !time || !place) {
      return NextResponse.json(
        {
          success: false,
          error: "All onboarding fields are required.",
        },
        { status: 400 }
      );
    }

    // ─────────────────────────────────────────────
    // 2. Validate and convert DOB
    // User enters: DD/MM/YYYY
    // Database needs: YYYY-MM-DD
    // ─────────────────────────────────────────────

    const dobParts = dob.trim().split("/");

    if (dobParts.length !== 3) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid date format. Please use DD/MM/YYYY.",
        },
        { status: 400 }
      );
    }

    const [dayString, monthString, yearString] = dobParts;

    const day = Number(dayString);
    const month = Number(monthString);
    const year = Number(yearString);

    if (
      !Number.isInteger(day) ||
      !Number.isInteger(month) ||
      !Number.isInteger(year) ||
      day < 1 ||
      day > 31 ||
      month < 1 ||
      month > 12 ||
      year < 1900 ||
      year > new Date().getFullYear()
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid date. Please use a valid DD/MM/YYYY date.",
        },
        { status: 400 }
      );
    }

    const databaseDob = `${yearString}-${monthString.padStart(
      2,
      "0"
    )}-${dayString.padStart(2, "0")}`;

    // ─────────────────────────────────────────────
    // 3. Validate FreeAstroAPI key
    // ─────────────────────────────────────────────

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
    // 4. Supabase client
    // ─────────────────────────────────────────────

    const supabase = getSupabaseServerClient();

    // ─────────────────────────────────────────────
    // 5. Create user
    // ─────────────────────────────────────────────

    const { data: user, error: userError } = await supabase
      .from("users")
      .insert({
        name: name.trim(),
        date_of_birth: databaseDob,
        birth_time: time.trim(),
        birth_place: place.trim(),
        onboarding_completed: true,
      })
      .select(
        "id, name, date_of_birth, birth_time, birth_place, onboarding_completed"
      )
      .single();

    if (userError) {
      console.error("Supabase onboarding error:", userError);

      return NextResponse.json(
        {
          success: false,
          error: userError.message,
        },
        { status: 500 }
      );
    }

    // ─────────────────────────────────────────────
    // 6. Convert birth time
    //
    // Supports:
    // 10:30 AM
    // 10:30 PM
    // 10:30
    // 22:30
    // ─────────────────────────────────────────────

    const birthTime = time.trim();

    const timeMatch = birthTime.match(
      /^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i
    );

    if (!timeMatch) {
      console.error("Invalid birth time:", birthTime);

      return NextResponse.json({
        success: true,
        user,
        astrologyCreated: false,
        message:
          "Your profile was created, but the astrology chart could not be generated because the birth time format is invalid.",
      });
    }

    let birthHour = Number(timeMatch[1]);
    const birthMinute = Number(timeMatch[2]);

    const meridiem = timeMatch[3]?.toUpperCase();

    if (birthHour > 23 || birthMinute > 59) {
      return NextResponse.json(
        {
          success: true,
          user,
          astrologyCreated: false,
          message:
            "Your profile was created, but the birth time is invalid.",
        },
        { status: 200 }
      );
    }

    if (meridiem === "PM" && birthHour !== 12) {
      birthHour += 12;
    }

    if (meridiem === "AM" && birthHour === 12) {
      birthHour = 0;
    }

    // ─────────────────────────────────────────────
    // 7. Call FreeAstroAPI
    // ─────────────────────────────────────────────

    let astrologyCreated = false;

    try {
      const astrologyResponse = await fetch(
        FREE_ASTRO_API_URL,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
            "x-api-key": apiKey,
          },

          body: JSON.stringify({
            year,
            month,
            day: day,

            hour: birthHour,
            minute: birthMinute,

            city: place.trim(),

            tz_str: "AUTO",
            ayanamsha: "lahiri",
            house_system: "whole_sign",
            node_type: "mean",
          }),
        }
      );

      const astrologyData = await astrologyResponse.json();

      if (!astrologyResponse.ok) {
        console.error(
          "FreeAstroAPI error:",
          astrologyData
        );
      } else {
        // ───────────────────────────────────────────
        // 8. Extract astrology information
        // ───────────────────────────────────────────

        const astrology = astrologyData;

        const ascendant =
          astrology?.ascendant?.sign ?? null;

        const nakshatra =
          astrology?.ascendant?.nakshatra?.name ?? null;

        const sunPlanet =
          astrology?.planets?.find(
            (planet: any) => planet.name === "Sun"
          );

        const moonPlanet =
          astrology?.planets?.find(
            (planet: any) => planet.name === "Moon"
          );

        const sunSign =
          sunPlanet?.sign ?? null;

        const moonSign =
          moonPlanet?.sign ?? null;

        // ───────────────────────────────────────────
        // 9. Save astrology profile
        // ───────────────────────────────────────────

        const { error: profileError } =
          await supabase
            .from("astrology_profiles")
            .upsert(
              {
                user_id: user.id,

                sun_sign: sunSign,
                moon_sign: moonSign,
                ascendant,
                nakshatra,

                planetary_data: {
                  planets:
                    astrology?.planets ?? [],

                  metadata:
                    astrology?.metadata ?? {},

                  sade_sati:
                    astrology?.sade_sati ?? null,
                },

                houses_data: {
                  houses:
                    astrology?.houses ?? [],
                },

                updated_at:
                  new Date().toISOString(),
              },
              {
                onConflict: "user_id",
              }
            );

        if (profileError) {
          console.error(
            "Astrology profile save error:",
            profileError
          );
        } else {
          astrologyCreated = true;

          // ─────────────────────────────────────────
          // 10. Save timezone
          // ─────────────────────────────────────────

          const timezone =
            astrology?.metadata?.timezone_used;

          if (timezone) {
            await supabase
              .from("users")
              .update({
                timezone,
              })
              .eq("id", user.id);
          }
        }
      }
    } catch (astrologyError) {
      console.error(
        "FreeAstroAPI request error:",
        astrologyError
      );
    }

    // ─────────────────────────────────────────────
    // 11. Final response
    // ─────────────────────────────────────────────

    return NextResponse.json({
      success: true,

      user,

      astrologyCreated,

      message: astrologyCreated
        ? "Your AstroLive profile and astrology chart are ready."
        : "Your profile was created successfully. Your astrology chart could not be generated right now.",
    });
  } catch (error) {
    console.error("Onboarding API error:", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Something went wrong while creating your profile.",
      },
      { status: 500 }
    );
  }
}