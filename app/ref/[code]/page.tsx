"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function ReferralLanding({
  params,
}: {
  params: { code: string };
}) {
  const [valid, setValid] = useState<boolean | null>(null);

  useEffect(() => {
    fetch(`/api/referral/${params.code}`)
      .then((r) => r.json())
      .then((d) => setValid(!!d.referral))
      .catch(() => setValid(false));
  }, [params.code]);

  return (
    <main className="relative flex h-screen w-full flex-col items-center justify-center overflow-hidden bg-void px-6 text-center">
      <video
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 h-full w-full object-cover"
        poster="/video/solar-poster.jpg"
      >
        <source src="/video/solar-loop.mp4" type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-gradient-to-b from-void/70 via-void/40 to-void/90" />

      <div className="relative z-10 flex flex-col items-center">
        <p className="font-body text-sm text-starlight/70">
          Someone shared their cosmic energy with you.
        </p>
        <h1 className="mt-3 max-w-md font-display text-4xl italic text-starlight sm:text-5xl">
          Discover yours.
        </h1>

        <span className="mt-6 rounded-full border border-dust/40 bg-deepspace/50 px-4 py-1.5 font-mono text-xs text-starlight/80">
          30 days free
        </span>

        {valid === false && (
          <p className="mt-4 font-body text-xs text-red-400">
            This link looks invalid, but you can still start your own free
            trial below.
          </p>
        )}

        <Link
          href="/onboarding"
          className="mt-8 rounded-lg bg-solar px-8 py-4 font-body text-sm font-medium text-[#2A1B08] transition-transform duration-200 hover:scale-[1.03]"
        >
          Start my horoscope
        </Link>
      </div>
    </main>
  );
}