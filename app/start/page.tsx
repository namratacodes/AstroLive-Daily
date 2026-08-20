import Link from "next/link";
import Navbar from "../components/Navbar";
import HowItWorks from "../components/HowItWorks";
import WhatsappPreview from "../components/WhatsappPreview";
import AIChat from "../components/AIChat";
import CosmicCard from "../components/CosmicCard";
import TrialCTA from "../components/TrialCTA";

export default function Start() {
  return (
    <main className="relative w-full">
      {/* 
        Fixed starfield video sits behind the entire scrollable page.
        Video file:
        public/video/starfield-loop.mp4
      */}
      <video
        autoPlay
        muted
        loop
        playsInline
        className="fixed inset-0 z-0 h-screen w-full object-cover"
        poster="/video/starfield-poster.jpg"
      >
        <source src="/video/starfield-loop.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* Dark overlay above the video */}
      <div className="fixed inset-0 z-0 bg-void/55 pointer-events-none" />

      {/* Navigation */}
      <Navbar />

      {/* Hero Section */}
      <div className="relative z-10 flex h-screen w-full flex-col items-center justify-center px-6 text-center">
        <span className="mb-6 rounded-full border border-dust/40 bg-deepspace/50 px-4 py-1.5 font-mono text-xs tracking-wide text-starlight/80 backdrop-blur-sm">
          30 days free, no card required
        </span>

        <h1 className="max-w-3xl font-display text-5xl font-normal leading-[1.1] text-starlight sm:text-6xl md:text-7xl">
          Your astrology.
          <br />
          <span className="italic text-solar">Every morning.</span>
        </h1>

        <p className="mt-6 max-w-md font-body text-base leading-relaxed text-starlight/70 sm:text-lg">
          Personalized horoscope on WhatsApp.
        </p>

        <Link
          href="/onboarding"
          className="mt-10 inline-flex items-center justify-center rounded-lg bg-solar px-8 py-4 font-body text-sm font-medium text-[#2A1B08] transition-transform duration-200 hover:scale-[1.03]"
        >
          Start on WhatsApp
        </Link>

        <p className="mt-5 font-mono text-xs tracking-wide text-dust">
          No app. No daily login.
        </p>

        {/* Scroll indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-drift">
          <div className="h-9 w-5 rounded-full border border-starlight/30">
            <div className="mx-auto mt-1.5 h-1.5 w-1 rounded-full bg-starlight/60" />
          </div>
        </div>
      </div>

      {/* Remaining Sections */}
      <HowItWorks />
      <WhatsappPreview />
      <AIChat />
      <CosmicCard />
      <TrialCTA />
    </main>
  );
}