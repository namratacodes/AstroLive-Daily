"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

type ChatMessage = {
  from: "bot" | "user";
  text: string;
};

type Horoscope = {
  horoscope_text: string;
  love: string;
  career: string;
  finance: string;
  health: string;
  lucky_number: number;
  lucky_color: string;
};

function WhatsappSimulator() {
  const params = useSearchParams();
  const urlUserId = params.get("userId") ?? "";

  const [userId, setUserId] = useState(urlUserId);
  const [manualId, setManualId] = useState("");
  const [horoscope, setHoroscope] = useState<Horoscope | null>(null);
  const [streak, setStreak] = useState<number | null>(null);
  const [loadingHoroscope, setLoadingHoroscope] = useState(false);
  const [horoscopeError, setHoroscopeError] = useState("");

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!userId) return;

    window.localStorage.setItem(
      "astrolive_active_user_id",
      userId
    );

    loadHoroscope(userId);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  useEffect(() => {
    if (!urlUserId) {
      const stored = window.localStorage.getItem(
        "astrolive_active_user_id"
      );

      if (stored) {
        setUserId(stored);
      }
    }
  }, [urlUserId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, typing]);

  async function loadHoroscope(id: string) {
    setLoadingHoroscope(true);
    setHoroscopeError("");

    try {
      const res = await fetch("/api/horoscope", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: id,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(
          data.error || "Could not load horoscope."
        );
      }

      setHoroscope(data.horoscope);

      setMessages([
        {
          from: "bot",
          text: `Good morning. Your AstroLive Daily:\n\n${data.horoscope.horoscope_text}`,
        },
      ]);

      fetch("/api/engagement", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: id,
          action: "horoscope_opened",
        }),
      })
        .then((r) => r.json())
        .then((d) => {
          if (d.engagement?.streak_days) {
            setStreak(d.engagement.streak_days);
          }
        })
        .catch(() => {});
    } catch (err) {
      setHoroscopeError(
        err instanceof Error
          ? err.message
          : "Something went wrong."
      );
    } finally {
      setLoadingHoroscope(false);
    }
  }

  async function handleSend() {
    if (!input.trim() || !userId) return;

    const text = input.trim();

    setMessages((m) => [
      ...m,
      {
        from: "user",
        text,
      },
    ]);

    setInput("");
    setTyping(true);

    fetch("/api/engagement", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId,
        action: "questions_asked",
      }),
    }).catch(() => {});

    try {
      const res = await fetch("/api/whatsapp/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          message: text,
        }),
      });

      const data = await res.json();

      setTyping(false);

      setMessages((m) => [
        ...m,
        {
          from: "bot",
          text:
            data.reply ||
            data.error ||
            "Something went wrong.",
        },
      ]);
    } catch {
      setTyping(false);

      setMessages((m) => [
        ...m,
        {
          from: "bot",
          text: "I'm having trouble generating your reading right now. Please try again shortly.",
        },
      ]);
    }
  }

  /* -------------------------------------------------
     No user selected
  ------------------------------------------------- */

  if (!userId) {
    return (
      <main className="relative min-h-screen w-full overflow-hidden bg-void text-starlight">

        <div className="absolute inset-0">
          <div className="absolute left-1/4 top-1/4 h-80 w-80 rounded-full bg-nebula/10 blur-3xl" />
          <div className="absolute bottom-0 right-1/4 h-96 w-96 rounded-full bg-solar/5 blur-3xl" />
        </div>

        <div className="relative z-10 flex min-h-screen items-center justify-center px-4">

          <div className="w-full max-w-md rounded-3xl border border-dust/20 bg-deepspace/70 p-8 text-center backdrop-blur-xl">

            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-solar/10 text-solar">
              ✦
            </div>

            <h1 className="mt-5 font-body text-2xl text-starlight">
              Your Cosmic Space
            </h1>

            <p className="mt-3 font-body text-sm leading-relaxed text-starlight/50">
              We couldn't find an active profile.
              Enter a user ID to open the AstroLive experience.
            </p>

            <input
              value={manualId}
              onChange={(e) => setManualId(e.target.value)}
              placeholder="User ID from Supabase"
              className="mt-6 w-full rounded-xl border border-dust/30 bg-void/60 px-4 py-3 font-mono text-xs text-starlight placeholder:text-starlight/25 focus:border-solar/50 focus:outline-none"
            />

            <button
              onClick={() =>
                manualId.trim() &&
                setUserId(manualId.trim())
              }
              className="mt-3 w-full rounded-xl bg-solar py-3 font-body text-sm font-medium text-[#2A1B08] transition hover:brightness-110"
            >
              Enter Cosmic Space
            </button>

          </div>

        </div>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen w-full overflow-x-hidden bg-void text-starlight">

      {/* Background atmosphere */}
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute left-[10%] top-[15%] h-72 w-72 rounded-full bg-nebula/10 blur-3xl" />
        <div className="absolute right-[10%] top-[35%] h-80 w-80 rounded-full bg-solar/5 blur-3xl" />
        <div className="absolute bottom-[5%] left-[35%] h-96 w-96 rounded-full bg-nebula/5 blur-3xl" />
      </div>

      <div className="relative z-10 min-h-screen w-full">

        {/* Top navigation */}
        <header className="border-b border-dust/10 bg-deepspace/30 backdrop-blur-xl">

          <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-5 py-4 md:px-8">

            <div className="flex items-center gap-3">

              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-solar/10 text-solar">
                ✦
              </div>

              <div>
                <p className="font-body text-sm text-starlight">
                  AstroLive
                </p>

                <p className="font-mono text-[9px] uppercase tracking-[0.25em] text-starlight/30">
                  Cosmic Space
                </p>
              </div>

            </div>

            {streak !== null && streak > 0 && (
              <span className="rounded-full border border-solar/30 bg-solar/5 px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider text-solar">
                {streak} day streak
              </span>
            )}

          </div>

        </header>

        {/* Main content */}
        <div className="mx-auto w-full max-w-7xl px-5 py-10 md:px-8 md:py-16">

          {/* Hero */}
          <section className="text-center">

            <p className="font-mono text-[10px] uppercase tracking-[0.45em] text-solar/60">
              Your Cosmic Space
            </p>

            <h1 className="mt-4 font-body text-4xl font-light tracking-tight text-starlight sm:text-5xl md:text-6xl">
              Today, written in the stars.
            </h1>

            <p className="mx-auto mt-5 max-w-2xl font-body text-sm leading-relaxed text-starlight/45 md:text-base">
              Your personalized horoscope, AI guidance,
              cosmic cards and premium experiences — all in one place.
            </p>

          </section>

          {/* Horoscope */}
          <section className="mx-auto mt-12 w-full max-w-4xl">

            <div className="rounded-3xl border border-dust/20 bg-deepspace/60 p-6 shadow-2xl backdrop-blur-xl md:p-8">

              <div className="flex items-center justify-between">

                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-solar/50">
                    Today's Horoscope
                  </p>

                  <h2 className="mt-2 font-body text-xl text-starlight">
                    Your daily cosmic reading
                  </h2>
                </div>

                {horoscope && (
                  <div className="hidden text-right sm:block">
                    <p className="font-mono text-[9px] uppercase tracking-wider text-starlight/30">
                      Lucky number
                    </p>

                    <p className="mt-1 font-body text-lg text-solar">
                      {horoscope.lucky_number}
                    </p>
                  </div>
                )}

              </div>

              <div className="mt-6 rounded-2xl bg-void/60 p-5">

                {loadingHoroscope ? (
                  <div className="space-y-3">
                    <div className="h-3 w-3/4 animate-pulse rounded bg-starlight/5" />
                    <div className="h-3 w-full animate-pulse rounded bg-starlight/5" />
                    <div className="h-3 w-5/6 animate-pulse rounded bg-starlight/5" />
                  </div>
                ) : horoscopeError ? (
                  <p className="font-body text-sm text-red-400">
                    {horoscopeError}
                  </p>
                ) : horoscope ? (
                  <p className="whitespace-pre-line font-body text-sm leading-7 text-starlight/75">
                    {horoscope.horoscope_text}
                  </p>
                ) : null}

              </div>

              {horoscope && (
                <div className="mt-4 grid grid-cols-2 gap-2 md:grid-cols-4">

                  <div className="rounded-xl border border-dust/10 bg-void/30 p-3">
                    <p className="font-mono text-[9px] uppercase tracking-wider text-starlight/30">
                      Love
                    </p>
                    <p className="mt-1 line-clamp-2 font-body text-xs text-starlight/60">
                      {horoscope.love}
                    </p>
                  </div>

                  <div className="rounded-xl border border-dust/10 bg-void/30 p-3">
                    <p className="font-mono text-[9px] uppercase tracking-wider text-starlight/30">
                      Career
                    </p>
                    <p className="mt-1 line-clamp-2 font-body text-xs text-starlight/60">
                      {horoscope.career}
                    </p>
                  </div>

                  <div className="rounded-xl border border-dust/10 bg-void/30 p-3">
                    <p className="font-mono text-[9px] uppercase tracking-wider text-starlight/30">
                      Finance
                    </p>
                    <p className="mt-1 line-clamp-2 font-body text-xs text-starlight/60">
                      {horoscope.finance}
                    </p>
                  </div>

                  <div className="rounded-xl border border-dust/10 bg-void/30 p-3">
                    <p className="font-mono text-[9px] uppercase tracking-wider text-starlight/30">
                      Health
                    </p>
                    <p className="mt-1 line-clamp-2 font-body text-xs text-starlight/60">
                      {horoscope.health}
                    </p>
                  </div>

                </div>
              )}

            </div>

          </section>

          {/* Cosmic Space actions */}
          <section className="mx-auto mt-10 w-full max-w-5xl">

            <div className="mb-5 text-center">

              <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-starlight/30">
                Explore
              </p>

              <h2 className="mt-2 font-body text-2xl font-light text-starlight">
                Your Cosmic Space
              </h2>

            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">

              {/* Chat */}
              <button
                type="button"
                onClick={() =>
                  document
                    .getElementById("ai-chat")
                    ?.scrollIntoView({
                      behavior: "smooth",
                    })
                }
                className="group rounded-2xl border border-dust/15 bg-deepspace/50 p-6 text-left backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:border-dust/30 hover:bg-deepspace/70"
              >
                <div className="mb-4 text-2xl">
                  💬
                </div>

                <h3 className="font-body text-lg text-starlight">
                  Chat with AI
                </h3>

                <p className="mt-2 font-body text-sm leading-relaxed text-starlight/40">
                  Ask anything about your day,
                  relationships or cosmic journey.
                </p>

                <div className="mt-5 font-mono text-[9px] uppercase tracking-[0.2em] text-starlight/30 transition group-hover:text-solar">
                  Ask the stars →
                </div>
              </button>

              {/* Cosmic Card */}
              <Link
                href={`/cosmic-card?userId=${encodeURIComponent(userId)}`}
                className="group rounded-2xl border border-dust/15 bg-deepspace/50 p-6 text-left backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:border-dust/30 hover:bg-deepspace/70"
              >
                <div className="mb-4 text-2xl">
                  ☄
                </div>

                <h3 className="font-body text-lg text-starlight">
                  Create Cosmic Card
                </h3>

                <p className="mt-2 font-body text-sm leading-relaxed text-starlight/40">
                  Turn today's reading into a
                  shareable cosmic card.
                </p>

                <div className="mt-5 font-mono text-[9px] uppercase tracking-[0.2em] text-starlight/30 transition group-hover:text-solar">
                  Create yours →
                </div>
              </Link>

              {/* Premium */}
              <Link
                href={`/premium?userId=${encodeURIComponent(userId)}`}
                className="group rounded-2xl border border-solar/20 bg-solar/[0.03] p-6 text-left backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:border-solar/40 hover:bg-solar/[0.06]"
              >
                <div className="mb-4 text-2xl text-solar">
                  ✦
                </div>

                <h3 className="font-body text-lg text-starlight">
                  Unlock Premium
                </h3>

                <p className="mt-2 font-body text-sm leading-relaxed text-starlight/40">
                  Unlock deeper readings and a richer
                  cosmic experience.
                </p>

                <div className="mt-5 font-mono text-[9px] uppercase tracking-[0.2em] text-solar/50 transition group-hover:text-solar">
                  Explore premium →
                </div>
              </Link>

            </div>

          </section>

          {/* AI Chat */}
          <section
            id="ai-chat"
            className="mx-auto mt-16 w-full max-w-4xl scroll-mt-8"
          >

            <div className="mb-5 text-center">

              <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-starlight/30">
                Your AI astrologer
              </p>

              <h2 className="mt-2 font-body text-2xl font-light text-starlight">
                Ask the stars
              </h2>

            </div>

            <div className="overflow-hidden rounded-3xl border border-dust/20 bg-deepspace/60 backdrop-blur-xl">

              {/* Chat header */}
              <div className="flex items-center gap-3 border-b border-dust/15 px-5 py-4">

                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-solar/10 text-solar">
                  ✦
                </div>

                <div>
                  <p className="font-body text-sm text-starlight">
                    AstroLive AI
                  </p>

                  <p className="font-mono text-[9px] uppercase tracking-wider text-starlight/30">
                    {typing
                      ? "typing..."
                      : loadingHoroscope
                      ? "reading the stars..."
                      : "online"}
                  </p>
                </div>

              </div>

              {/* Messages */}
              <div className="flex min-h-[400px] max-h-[55vh] flex-col gap-3 overflow-y-auto px-5 py-5">

                {messages.map((m, i) => (
                  <div
                    key={i}
                    className={`max-w-[82%] whitespace-pre-line rounded-2xl px-4 py-3 font-body text-sm leading-relaxed ${
                      m.from === "bot"
                        ? "mr-auto rounded-tl-sm bg-void/70 text-starlight/80"
                        : "ml-auto rounded-tr-sm bg-nebula/20 text-starlight"
                    }`}
                  >
                    {m.text}
                  </div>
                ))}

                {typing && (
                  <div className="mr-auto rounded-2xl rounded-tl-sm bg-void/70 px-4 py-3 font-mono text-xs text-starlight/40">
                    ...
                  </div>
                )}

                <div ref={bottomRef} />

              </div>

              {/* Input */}
              <div className="border-t border-dust/15 p-4">

                <div className="flex gap-2">

                  <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) =>
                      e.key === "Enter" &&
                      handleSend()
                    }
                    placeholder="Ask about your day..."
                    className="min-w-0 flex-1 rounded-xl border border-dust/30 bg-void/60 px-4 py-3 font-body text-sm text-starlight placeholder:text-starlight/25 focus:border-solar/50 focus:outline-none"
                  />

                  <button
                    onClick={handleSend}
                    disabled={typing || !input.trim()}
                    className="rounded-xl bg-solar px-5 py-3 font-body text-sm font-medium text-[#2A1B08] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Send
                  </button>

                </div>

              </div>

            </div>

          </section>

          {/* Bottom navigation */}
          <div className="mx-auto mt-12 flex max-w-4xl justify-center pb-8">

            <Link
              href="/"
              className="font-mono text-[9px] uppercase tracking-[0.25em] text-starlight/25 transition hover:text-starlight/60"
            >
              ← AstroLive
            </Link>

          </div>

        </div>

      </div>

    </main>
  );
}

export default function WhatsappPage() {
  return (
    <Suspense fallback={null}>
      <WhatsappSimulator />
    </Suspense>
  );
}