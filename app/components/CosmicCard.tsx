export default function CosmicCard() {
  return (
    <section className="relative z-10 px-6 py-28 sm:px-10">
      <h2 className="mb-4 text-center font-display text-3xl italic text-starlight sm:text-4xl">
        Cosmic cards
      </h2>
      <p className="mb-14 text-center font-body text-sm text-starlight/60">
        Share your energy. A friend clicks through, and the loop continues.
      </p>

      <div className="mx-auto w-64 rounded-2xl border border-solar/30 bg-gradient-to-b from-deepspace to-void p-6 text-center">
        <p className="font-mono text-[11px] tracking-wide text-starlight/50">
          ASTROLIVE
        </p>
        <p className="mt-3 font-body text-xs text-starlight/60">
          My cosmic energy
        </p>
        <p className="mt-2 font-display text-4xl text-solar">87%</p>
        <div className="mt-4 space-y-1 font-mono text-xs text-starlight/70">
          <div className="flex justify-between">
            <span>Love</span>
            <span className="text-solar">92%</span>
          </div>
          <div className="flex justify-between">
            <span>Career</span>
            <span className="text-solar">87%</span>
          </div>
          <div className="flex justify-between">
            <span>Energy</span>
            <span className="text-solar">81%</span>
          </div>
        </div>
        <p className="mt-5 font-body text-[11px] italic text-starlight/50">
          What&apos;s yours?
        </p>
      </div>

      <p className="mt-8 text-center font-mono text-xs text-dust">
        share → friend clicks → friend joins
      </p>
    </section>
  );
}