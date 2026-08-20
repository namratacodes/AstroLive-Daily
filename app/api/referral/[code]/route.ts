import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase";

export async function GET(
  _req: NextRequest,
  { params }: { params: { code: string } }
) {
  const supabase = getSupabaseServerClient();

  const { data, error } = await supabase
    .from("referrals")
    .select("*")
    .eq("referral_code", params.code)
    .single();

  if (error || !data) {
    return NextResponse.json(
      { error: "Referral code not found." },
      { status: 404 }
    );
  }

  return NextResponse.json({ referral: data });
}