"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";

type Message = {
  from: "bot" | "user";
  text: string;
};

const questions = [
  {
    key: "name",
    bot: "Welcome to AstroLive Daily. I'll send you your personalized horoscope every morning. Your first 30 days are free. Let's personalize your experience. What's your name?",
    placeholder: "e.g. Hiya",
  },
  {
    key: "dob",
    bot: (name: string) => `Nice to meet you, ${name}. What's your date of birth?`,
    placeholder: "e.g. 15/05/2003",
  },
  {
    key: "time",
    bot: () => "What time were you born?",
    placeholder: "e.g. 10:30 AM",
  },
  {
    key: "place",
    bot: () => "Where were you born?",
    placeholder: "e.g. Ahmedabad, India",
  },
];

export default function Onboarding() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [step, setStep] = useState(0);
  const [input, setInput] = useState("");
  const [error, setError] = useState("");
  const [typing, setTyping] = useState(false);
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [newUserId, setNewUserId] = useState<string | null>(null);

  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, typing]);

  useEffect(() => {
    askQuestion(0, {});

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function askQuestion(
    index: number,
    currentAnswers: Record<string, string>
  ) {
    if (index >= questions.length) {
      return;
    }

    const q = questions[index];

    const text =
      typeof q.bot === "function"
        ? q.bot(currentAnswers.name)
        : q.bot;

    setTyping(true);

    setTimeout(() => {
      setTyping(false);

      setMessages((m) => [
        ...m,
        {
          from: "bot",
          text,
        },
      ]);
    }, 700);
  }

  async function saveOnboarding(
    finalAnswers: Record<string, string>
  ) {
    setSaving(true);
    setError("");

    try {
      const response = await fetch("/api/onboarding", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(finalAnswers),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.error || "Failed to create your profile."
        );
      }

      const id =
        data.user?.id ??
        data.userId ??
        data.id ??
        data.data?.id ??
        null;

      if (id) {
        setNewUserId(id);
      }

      setMessages((m) => [
        ...m,
        {
          from: "bot",
          text: "Your AstroLive profile is ready. Your 30-day free journey has started. Your first personalized horoscope arrives tomorrow morning.",
        },
      ]);

      setDone(true);
    } catch (err) {
      console.error("Onboarding save error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setSaving(false);
    }
  }

  function handleSend() {
    if (saving) return;

    if (!input.trim()) {
      setError("Type an answer first.");
      return;
    }

    setError("");

    const q = questions[step];

    const nextAnswers = {
      ...answers,
      [q.key]: input.trim(),
    };

    setAnswers(nextAnswers);

    setMessages((m) => [
      ...m,
      {
        from: "user",
        text: input.trim(),
      },
    ]);

    setInput("");

    const next = step + 1;

    setStep(next);

    if (next >= questions.length) {
      saveOnboarding(nextAnswers);
      return;
    }

    askQuestion(next, nextAnswers);
  }

  return (
    <main className="relative min-h-screen w-full overflow-hidden bg-void text-starlight">

      {/* Cosmic background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/4 top-1/4 h-72 w-72 rounded-full bg-nebula/10 blur-3xl" />
        <div className="absolute bottom-0 right-1/4 h-96 w-96 rounded-full bg-solar/5 blur-3xl" />
      </div>

      {/* Main full-screen layout */}
      <div className="relative z-10 flex min-h-screen w-full items-center justify-center px-4 py-8 md:px-8">

        <div className="w-full max-w-4xl">

          {/* Heading */}
          <div className="mb-8 text-center md:mb-10">

            <p className="font-mono text-[10px] uppercase tracking-[0.45em] text-solar/60">
              Enter the universe
            </p>

            <h1 className="mt-3 font-body text-3xl font-light tracking-tight text-starlight sm:text-4xl md:text-5xl">
              Discover your cosmic map
            </h1>

            <p className="mx-auto mt-4 max-w-xl font-body text-sm leading-relaxed text-starlight/45">
              Tell us a little about yourself so we can create
              your personalized AstroLive experience.
            </p>

          </div>

          {/* WhatsApp-style conversation */}
          <div className="mx-auto flex w-full max-w-2xl flex-col overflow-hidden rounded-3xl border border-dust/20 bg-deepspace/70 shadow-2xl backdrop-blur-xl">

            {/* Header */}
            <div className="flex items-center gap-3 border-b border-dust/20 px-5 py-4">

              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-solar/10">
                <span className="text-sm text-solar">
                  ✦
                </span>
              </div>

              <div>
                <p className="font-body text-sm text-starlight">
                  AstroLive Daily
                </p>

                <p className="font-mono text-[10px] uppercase tracking-wider text-starlight/35">
                  {typing
                    ? "typing..."
                    : saving
                    ? "creating profile..."
                    : "online"}
                </p>
              </div>

            </div>

            {/* Messages */}
            <div className="flex min-h-[420px] max-h-[55vh] flex-col gap-3 overflow-y-auto px-5 py-5">

              {messages.map((m, i) => (
                <div
                  key={i}
                  className={`max-w-[82%] rounded-2xl px-4 py-3 font-body text-sm leading-relaxed ${
                    m.from === "bot"
                      ? "mr-auto rounded-tl-sm bg-void/70 text-starlight/85"
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

              {saving && (
                <div className="mr-auto rounded-2xl rounded-tl-sm bg-void/70 px-4 py-3 font-mono text-xs text-starlight/40">
                  Creating your AstroLive profile...
                </div>
              )}

              <div ref={bottomRef} />

            </div>

            {/* Input */}
            {!done ? (
              <div className="border-t border-dust/20 px-5 py-4">

                <div className="flex gap-2">

                  <input
                    value={input}
                    disabled={saving}
                    onChange={(e) => {
                      setInput(e.target.value);

                      if (error) {
                        setError("");
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleSend();
                      }
                    }}
                    placeholder={
                      questions[step]?.placeholder
                    }
                    className="min-w-0 flex-1 rounded-xl border border-dust/30 bg-void/60 px-4 py-3 font-body text-sm text-starlight placeholder:text-starlight/25 focus:border-solar/50 focus:outline-none disabled:opacity-50"
                  />

                  <button
                    onClick={handleSend}
                    disabled={saving}
                    className="rounded-xl bg-solar px-5 py-3 font-body text-sm font-medium text-[#2A1B08] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {saving ? "..." : "Send"}
                  </button>

                </div>

                {error && (
                  <p className="mt-2 font-body text-xs text-red-400">
                    {error}
                  </p>
                )}

              </div>
            ) : (
              <div className="border-t border-dust/20 px-5 py-5 text-center">

                <span className="inline-block rounded-full border border-solar/40 px-4 py-2 font-mono text-[10px] uppercase tracking-wider text-solar">
                  30-day free trial activated
                </span>

                {newUserId ? (
                  <Link
                    href={`/whatsapp?userId=${encodeURIComponent(newUserId)}`}
                    className="mt-4 block w-full rounded-xl bg-solar py-3 font-body text-sm font-medium text-[#2A1B08] transition hover:brightness-110"
                  >
                    Enter Your Cosmic Space →
                  </Link>
                ) : (
                  <p className="mt-3 font-mono text-[11px] text-starlight/40">
                    Profile saved — check the onboarding response.
                  </p>
                )}

              </div>
            )}

          </div>

        </div>

      </div>
    </main>
  );
}