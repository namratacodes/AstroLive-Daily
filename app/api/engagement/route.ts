import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase";

type EngagementAction =
  | "horoscope_opened"
  | "questions_asked"
  | "cosmic_cards_shared"
  | "website_clicks"
  | "referral_signups";

const VALID_ACTIONS: EngagementAction[] = [
  "horoscope_opened",
  "questions_asked",
  "cosmic_cards_shared",
  "website_clicks",
  "referral_signups",
];

function isYesterday(dateStr: string | null): boolean {
  if (!dateStr) return false;
  const last = new Date(dateStr);
  const now = new Date();
  const diffMs = now.setHours(0, 0, 0, 0) - new Date(last).setHours(0, 0, 0, 0);
  const diffDays = diffMs / (1000 * 60 * 60 * 24);
  return diffDays === 1;
}

function isToday(dateStr: string | null): boolean {
  if (!dateStr) return false;
  const last = new Date(dateStr);
  const now = new Date();
  return (
    last.getFullYear() === now.getFullYear() &&
    last.getMonth() === now.getMonth() &&
    last.getDate() === now.getDate()
  );
}

export async function POST(req: NextRequest) {
  const { userId, action } = await req.json();

  if (!userId || !action || !VALID_ACTIONS.includes(action)) {
    return NextResponse.json(
      { error: "userId and a valid action are required." },
      { status: 400 }
    );
  }

  const supabase = getSupabaseServerClient();

  const { data: existing, error: fetchError } = await supabase
    .from("engagement")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (fetchError) {
    console.error("Engagement fetch error:", fetchError);
    return NextResponse.json(
      { error: "Could not load engagement record." },
      { status: 500 }
    );
  }

  const now = new Date().toISOString();

  // Streak logic: only recalculated when the horoscope is opened, since
  // that's the one true "did they show up today" signal.
  let streak = existing?.streak_days ?? 0;
  if (action === "horoscope_opened") {
    if (isToday(existing?.last_active_at ?? null)) {
      // already counted today, leave streak as-is
    } else if (isYesterday(existing?.last_active_at ?? null)) {
      streak += 1;
    } else {
      streak = 1; // missed a day (or first ever visit) — restart
    }
  }

  const update = {
    user_id: userId,
    horoscope_sent: existing?.horoscope_sent ?? 0,
    horoscope_opened:
      (existing?.horoscope_opened ?? 0) + (action === "horoscope_opened" ? 1 : 0),
    questions_asked:
      (existing?.questions_asked ?? 0) + (action === "questions_asked" ? 1 : 0),
    cosmic_cards_shared:
      (existing?.cosmic_cards_shared ?? 0) +
      (action === "cosmic_cards_shared" ? 1 : 0),
    website_clicks:
      (existing?.website_clicks ?? 0) + (action === "website_clicks" ? 1 : 0),
    referral_signups:
      (existing?.referral_signups ?? 0) +
      (action === "referral_signups" ? 1 : 0),
    streak_days: streak,
    last_active_at: now,
  };

  const { data: saved, error: upsertError } = await supabase
    .from("engagement")
    .upsert(update, { onConflict: "user_id" })
    .select()
    .single();

  if (upsertError) {
    console.error("Engagement upsert error:", upsertError);
    return NextResponse.json(
      { error: "Could not update engagement." },
      { status: 500 }
    );
  }

  return NextResponse.json({ engagement: saved });
}