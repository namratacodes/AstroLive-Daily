export default function AIChat() {
  return (
    <section className="relative z-10 px-6 py-28 sm:px-10">
      <h2 className="mb-4 text-center font-display text-3xl italic text-starlight sm:text-4xl">
        Ask, and it answers
      </h2>
      <p className="mb-14 text-center font-body text-sm text-starlight/60">
        Reply to your horoscope like you would a friend.
      </p>

      <div className="mx-auto flex max-w-md flex-col gap-3">
        <div className="ml-auto max-w-[75%] rounded-2xl rounded-tr-sm bg-nebula/20 px-4 py-2.5 font-body text-sm text-starlight">
          Should I focus on my career today?
        </div>
        <div className="mr-auto max-w-[85%] rounded-2xl rounded-tl-sm bg-deepspace/70 px-4 py-2.5 font-body text-sm leading-relaxed text-starlight/85">
          Today may be a good time for planning and communication. If
          you&apos;re considering a major decision, gather information
          before acting.
        </div>
        <button className="mx-auto mt-2 rounded-lg border border-solar/40 px-5 py-2 font-body text-xs text-solar">
          Explore full reading
        </button>
      </div>
    </section>
  );
}