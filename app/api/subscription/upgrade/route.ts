import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  const { userId } = await req.json();

  if (!userId) {
    return NextResponse.json({ error: "userId is required." }, { status: 400 });
  }

  const supabase = getSupabaseServerClient();

  const { data, error } = await supabase
    .from("subscriptions")
    .upsert(
      { user_id: userId, plan: "PREMIUM", status: "ACTIVE" },
      { onConflict: "user_id" }
    )
    .select()
    .single();

  if (error) {
    console.error("Upgrade error:", error);
    return NextResponse.json(
      { error: "Could not activate premium." },
      { status: 500 }
    );
  }

  return NextResponse.json({ subscription: data, demo: true });
}