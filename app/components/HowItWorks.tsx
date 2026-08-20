const steps = [
  {
    n: "01",
    title: "Connect",
    body: "Tap start and say hi on WhatsApp. No app to install, no password to remember.",
  },
  {
    n: "02",
    title: "Personalize",
    body: "Share your name, birth date, time, and place. Takes under a minute.",
  },
  {
    n: "03",
    title: "Receive",
    body: "Your personalized horoscope arrives every morning, ready when you wake up.",
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="relative z-10 px-6 py-28 sm:px-10">
      <h2 className="mb-16 text-center font-display text-3xl italic text-starlight sm:text-4xl">
        How it works
      </h2>
      <div className="mx-auto grid max-w-4xl gap-10 sm:grid-cols-3">
        {steps.map((s) => (
          <div key={s.n} className="text-center sm:text-left">
            <span className="font-mono text-xs text-solar">{s.n}</span>
            <h3 className="mt-2 font-display text-xl text-starlight">
              {s.title}
            </h3>
            <p className="mt-2 font-body text-sm leading-relaxed text-starlight/60">
              {s.body}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}