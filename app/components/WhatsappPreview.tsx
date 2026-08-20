export default function WhatsappPreview() {
  return (
    <section className="relative z-10 px-6 py-28 sm:px-10">
      <h2 className="mb-4 text-center font-display text-3xl italic text-starlight sm:text-4xl">
        Your daily horoscope
      </h2>
      <p className="mb-14 text-center font-body text-sm text-starlight/60">
        Delivered every morning, right where you already are.
      </p>

      <div className="mx-auto max-w-sm rounded-2xl border border-dust/30 bg-deepspace/70 p-5 backdrop-blur-sm">
        <div className="mb-4 flex items-center gap-2 border-b border-dust/20 pb-3">
          <div className="h-8 w-8 rounded-full bg-solar/20" />
          <div>
            <p className="font-body text-sm text-starlight">AstroLive Daily</p>
            <p className="font-mono text-[11px] text-starlight/40">
              online
            </p>
          </div>
        </div>

        <div className="space-y-2 rounded-xl bg-void/50 p-4 font-body text-sm leading-relaxed text-starlight/85">
          <p>Good morning, Hiya.</p>
          <p className="text-starlight/70">Your AstroLive Daily</p>
          <div className="grid grid-cols-2 gap-y-1 font-mono text-xs text-starlight/60">
            <span>Love</span>
            <span className="text-right text-solar">82%</span>
            <span>Career</span>
            <span className="text-right text-solar">76%</span>
            <span>Finance</span>
            <span className="text-right text-solar">68%</span>
            <span>Energy</span>
            <span className="text-right text-solar">84%</span>
          </div>
          <p className="pt-2 text-starlight/70">Today&apos;s guidance</p>
          <p>Take your time before making an important decision.</p>
        </div>

        <button className="mt-4 w-full rounded-lg border border-solar/40 py-2 font-body text-xs text-solar">
          Tell me more
        </button>
      </div>
    </section>
  );
}