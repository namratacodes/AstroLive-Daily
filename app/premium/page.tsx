"use client";
import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";

function PremiumInner() {
  const params = useSearchParams();
  const userId = params.get("userId") ?? "";
  const [activated, setActivated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleUpgrade() {
    if (!userId) {
      setError("Missing user id in the URL.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/subscription/upgrade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong.");
      setActivated(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex h-screen w-full flex-col items-center justify-center bg-void px-6 text-center">
      <span className="rounded-full border border-dust/40 bg-deepspace/50 px-4 py-1.5 font-mono text-xs text-starlight/70">
        Demo mode — no real payment
      </span>
      <h1 className="mt-6 font-display text-3xl italic text-starlight sm:text-4xl">
        AstroLive Premium
      </h1>
      <ul className="mt-6 space-y-2 font-body text-sm text-starlight/70">
        <li>More detailed readings</li>
        <li>Unlimited AI questions</li>
        <li>Advanced compatibility reports</li>
        <li>Weekly and monthly deep dives</li>
      </ul>

      {!activated ? (
        <button
          onClick={handleUpgrade}
          disabled={loading}
          className="mt-10 rounded-lg bg-solar px-8 py-4 font-body text-sm font-medium text-[#2A1B08] disabled:opacity-60"
        >
          {loading ? "Activating..." : "Continue Premium"}
        </button>
      ) : (
        <p className="mt-10 rounded-full border border-solar/40 px-4 py-1.5 font-mono text-xs text-solar">
          Premium activated — Demo Mode
        </p>
      )}

      {error && (
        <p className="mt-3 font-body text-xs text-red-400">{error}</p>
      )}
    </main>
  );
}

export default function PremiumPage() {
  return (
    <Suspense fallback={null}>
      <PremiumInner />
    </Suspense>
  );
}