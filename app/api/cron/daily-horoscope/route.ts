import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase";

/**
 * Daily automation — Phase 7.
 *
 * Does NOT duplicate horoscope-generation logic. It finds every user whose
 * trial/subscription is active, then calls the existing /api/horoscope
 * endpoint for each one (same code path as manual testing), so the caching
 * behavior you already verified stays exactly the same here.
 *
 * Trigger this via Vercel Cron once deployed (see vercel.json), or manually
 * during the hackathon with the PowerShell command below.
 */
export async function GET(req: NextRequest) {
  // Optional shared-secret check so this can't be hit by randoms once deployed.
  const secret = req.nextUrl.searchParams.get("secret");
  if (process.env.CRON_SECRET && secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const supabase = getSupabaseServerClient();

  const { data: activeSubs, error } = await supabase
    .from("subscriptions")
    .select("user_id, status")
    .in("status", ["FREE_TRIAL", "ACTIVE"]);

  if (error) {
    console.error("Cron: failed to load active subscriptions:", error);
    return NextResponse.json(
      { error: "Could not load active users." },
      { status: 500 }
    );
  }

  const userIds = (activeSubs ?? []).map((s) => s.user_id);
  const origin = req.nextUrl.origin;

  const results = await Promise.allSettled(
    userIds.map(async (userId) => {
      const res = await fetch(`${origin}/api/horoscope`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `Failed for ${userId}`);
      return { userId, cached: data.cached ?? null };
    })
  );

  const succeeded = results.filter((r) => r.status === "fulfilled").length;
  const failed = results
    .map((r, i) =>
      r.status === "rejected"
        ? { userId: userIds[i], error: (r as PromiseRejectedResult).reason?.message }
        : null
    )
    .filter(Boolean);

  return NextResponse.json({
    total_active_users: userIds.length,
    succeeded,
    failed_count: failed.length,
    failed,
  });
}