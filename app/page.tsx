import Link from "next/link";

export default function Home() {
  return (
    <main className="relative h-screen w-full overflow-hidden bg-void">
      {/* Background video — generated via Leonardo AI from the reference
          solar-system image. Drop the exported mp4 at public/video/solar-loop.mp4 */}
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
      <div className="absolute inset-0 bg-gradient-to-r from-void/60 via-transparent to-void/60" />

      <div className="relative z-10 flex h-full w-full flex-col items-center justify-center px-6 text-center">
        <span className="mb-6 rounded-full border border-dust/40 bg-deepspace/50 px-4 py-1.5 font-mono text-xs tracking-wide text-starlight/80 backdrop-blur-sm animate-fadeUp">
          30 days free, no card required
        </span>

        <h1
          className="max-w-3xl font-display text-5xl font-normal leading-[1.1] text-starlight sm:text-6xl md:text-7xl animate-fadeUp"
          style={{ animationDelay: "0.1s", opacity: 0 }}
        >
          Your astrology.
          <br />
          <span className="italic text-solar">Every morning.</span>
        </h1>

        <p
          className="mt-6 max-w-md font-body text-base leading-relaxed text-starlight/70 sm:text-lg animate-fadeUp"
          style={{ animationDelay: "0.25s", opacity: 0 }}
        >
          Personalized guidance, delivered straight to your WhatsApp. No app
          to download, no daily login.
        </p>

        <div
          className="mt-10 animate-fadeUp"
          style={{ animationDelay: "0.4s", opacity: 0 }}
        >
          <Link
            href="/start"
            className="inline-flex items-center justify-center rounded-lg bg-solar px-8 py-4 font-body text-sm font-medium text-[#2A1B08] transition-transform duration-200 hover:scale-[1.03] hover:brightness-105 active:scale-[0.98]"
          >
            Start my free horoscope
          </Link>
        </div>

        <p
          className="mt-5 font-mono text-xs tracking-wide text-dust animate-fadeUp"
          style={{ animationDelay: "0.55s", opacity: 0 }}
        >
          Just WhatsApp. That&apos;s it.
        </p>
      </div>

      <div className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2 animate-drift">
        <div className="h-9 w-5 rounded-full border border-starlight/30">
          <div className="mx-auto mt-1.5 h-1.5 w-1 rounded-full bg-starlight/60" />
        </div>
      </div>
    </main>
  );
}