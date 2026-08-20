"use client";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";

type Horoscope = {
  love: string;
  career: string;
  finance: string;
  health: string;
  lucky_number: number;
  lucky_color: string;
};

function scoreFromText(text: string): number {
  // Deterministic pseudo-score from the text so the same day always
  // shows the same number instead of re-rolling on every render.
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = (hash << 5) - hash + text.charCodeAt(i);
    hash |= 0;
  }
  return 65 + (Math.abs(hash) % 30); // range 65–94
}

function CosmicCardInner() {
  const params = useSearchParams();
  const userId = params.get("userId") ?? "";

  const [horoscope, setHoroscope] = useState<Horoscope | null>(null);
  const [loading, setLoading] = useState(false);
  const [referralLink, setReferralLink] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    fetch("/api/horoscope", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setHoroscope(d.horoscope);
      })
      .finally(() => setLoading(false));
  }, [userId]);

  async function handleShare() {
    if (!userId) return;
    const res = await fetch("/api/referral", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    });
    const data = await res.json();
    if (data.referral?.referral_code) {
      const link = `${window.location.origin}/ref/${data.referral.referral_code}`;
      setReferralLink(link);
      await navigator.clipboard.writeText(link).catch(() => {});
      setCopied(true);
      fetch("/api/engagement", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, action: "cosmic_cards_shared" }),
      }).catch(() => {});
    }
  }

  if (!userId) {
    return (
      <main className="flex h-screen w-full items-center justify-center bg-void px-4 text-center">
        <p className="font-body text-sm text-starlight/60">
          Open this page with a user id, e.g. /cosmic-card?userId=...
        </p>
      </main>
    );
  }

  const overall = horoscope
    ? Math.round(
        (scoreFromText(horoscope.love) +
          scoreFromText(horoscope.career) +
          scoreFromText(horoscope.health)) /
          3
      )
    : null;

  return (
    <main className="flex h-screen w-full flex-col items-center justify-center gap-6 bg-void px-4">
      <div className="w-64 rounded-2xl border border-solar/30 bg-gradient-to-b from-deepspace to-void p-6 text-center">
        <p className="font-mono text-[11px] tracking-wide text-starlight/50">
          ASTROLIVE
        </p>
        <p className="mt-3 font-body text-xs text-starlight/60">
          My cosmic energy
        </p>

        {loading && (
          <p className="mt-6 font-mono text-xs text-starlight/40">
            reading the stars...
          </p>
        )}

        {horoscope && (
          <>
            <p className="mt-2 font-display text-4xl text-solar">
              {overall}%
            </p>
            <div className="mt-4 space-y-1 font-mono text-xs text-starlight/70">
              <div className="flex justify-between">
                <span>Love</span>
                <span className="text-solar">
                  {scoreFromText(horoscope.love)}%
                </span>
              </div>
              <div className="flex justify-between">
                <span>Career</span>
                <span className="text-solar">
                  {scoreFromText(horoscope.career)}%
                </span>
              </div>
              <div className="flex justify-between">
                <span>Health</span>
                <span className="text-solar">
                  {scoreFromText(horoscope.health)}%
                </span>
              </div>
            </div>
            <p className="mt-4 font-mono text-[10px] text-dust">
              Lucky number {horoscope.lucky_number} · {horoscope.lucky_color}
            </p>
          </>
        )}

        <p className="mt-5 font-body text-[11px] italic text-starlight/50">
          What&apos;s yours?
        </p>
      </div>

      <button
        onClick={handleShare}
        className="rounded-lg bg-solar px-6 py-3 font-body text-sm font-medium text-[#2A1B08]"
      >
        {copied ? "Link copied!" : "Share your cosmic card"}
      </button>

      {referralLink && (
        <p className="max-w-xs break-all text-center font-mono text-[11px] text-starlight/50">
          {referralLink}
        </p>
      )}
    </main>
  );
}

export default function CosmicCardPage() {
  return (
    <Suspense fallback={null}>
      <CosmicCardInner />
    </Suspense>
  );
}