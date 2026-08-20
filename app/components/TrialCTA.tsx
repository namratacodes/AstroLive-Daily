import Link from "next/link";

export default function TrialCTA() {
  return (
    <>
      <section
        id="start"
        className="relative z-10 flex flex-col items-center px-6 py-32 text-center sm:px-10"
      >
        <span className="mb-5 rounded-full border border-dust/40 bg-deepspace/50 px-4 py-1.5 font-mono text-xs text-starlight/70">
          30 days free
        </span>
        <h2 className="max-w-lg font-display text-3xl italic text-starlight sm:text-4xl">
          Start your free trial
        </h2>
        <p className="mt-4 max-w-sm font-body text-sm text-starlight/60">
          Daily horoscope, AI conversation, and cosmic cards. Free for 30
          days, no card required.
        </p>
        <Link
          href="/onboarding"
          className="mt-8 rounded-lg bg-solar px-8 py-4 font-body text-sm font-medium text-[#2A1B08] transition-transform duration-200 hover:scale-[1.03]"
        >
          Start my free trial
        </Link>
      </section>

      <footer className="relative z-10 border-t border-dust/20 px-6 py-10 text-center sm:px-10">
        <p className="font-display italic text-starlight">AstroLive</p>
        <p className="mt-1 font-body text-xs text-starlight/50">
          Astrology that comes to you.
        </p>
      </footer>
    </>
  );
}