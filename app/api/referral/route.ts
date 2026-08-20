import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase";

function generateCode(): string {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}

export async function POST(req: NextRequest) {
  const { userId } = await req.json();

  if (!userId) {
    return NextResponse.json({ error: "userId is required." }, { status: 400 });
  }

  const supabase = getSupabaseServerClient();

  // Reuse an existing code for this user if one already exists,
  // so sharing repeatedly doesn't spawn duplicate codes.
  const { data: existing } = await supabase
    .from("referrals")
    .select("*")
    .eq("referrer_user_id", userId)
    .is("referred_user_id", null)
    .maybeSingle();

  if (existing) {
    return NextResponse.json({ referral: existing });
  }

  let code = generateCode();
  for (let attempt = 0; attempt < 5; attempt++) {
    const { data: clash } = await supabase
      .from("referrals")
      .select("id")
      .eq("referral_code", code)
      .maybeSingle();
    if (!clash) break;
    code = generateCode();
  }

  const { data: created, error } = await supabase
    .from("referrals")
    .insert({
      referrer_user_id: userId,
      referral_code: code,
      status: "PENDING",
    })
    .select()
    .single();

  if (error) {
    console.error("Referral creation error:", error);
    return NextResponse.json(
      { error: "Could not create referral code." },
      { status: 500 }
    );
  }

  return NextResponse.json({ referral: created });
}