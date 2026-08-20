"use client";
import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="fixed top-0 z-50 flex w-full items-center justify-between px-6 py-5 backdrop-blur-sm sm:px-10">
      <span className="font-display text-lg italic text-starlight">
        AstroLive <span className="text-solar not-italic">Daily</span>
      </span>
      <div className="flex items-center gap-6">
        <Link
          href="#how-it-works"
          className="hidden font-body text-sm text-starlight/70 transition-colors hover:text-starlight sm:block"
        >
          How it works
        </Link>
        <Link
          href="#start"
          className="rounded-md border border-solar/50 px-4 py-2 font-body text-sm text-solar transition-colors hover:bg-solar hover:text-[#2A1B08]"
        >
          Start free
        </Link>
      </div>
    </nav>
  );
}