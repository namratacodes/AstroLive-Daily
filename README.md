# AstroLive Daily
**Your astrology. Every morning.**

Built for **AstroHack 2026: Build the Next Universe**

🔗 **Live demo:** https://astro-live-daily.vercel.app/

---

## The problem

AstroLive today is a **pull** product: users must remember it exists, open the platform, and actively seek out a consultation. That creates three structural weaknesses:

- **No organic growth loop.** Nothing about using AstroLive naturally produces a new user.
- **No habit formation.** There's no reason to open the app on a random Tuesday if nothing is happening there.
- **Revenue is capped to active-seeking users** — anyone who doesn't proactively return generates nothing.

## The solution

AstroLive Daily flips the model from pull to **push**: astrology is delivered to the user every morning on WhatsApp, instead of requiring them to come looking for it.

```
Daily WhatsApp horoscope → AI conversation → Shareable Cosmic Card → Friend joins → Daily habit
```

- **Habit** — a personalized horoscope arrives every morning, tied to a visible day-streak
- **Conversational AI** — users can reply and ask real follow-up questions ("what about my career today?") and get a grounded answer, not a generic script
- **Structural virality** — every horoscope produces a shareable Cosmic Card with a referral link baked in
- **Monetization** — 30 days free, then a premium tier; the free trial itself is the acquisition funnel

## Architecture

```
Landing page
   ↓
Onboarding (WhatsApp-style chat, collects name / DOB / birth time / place)
   ↓
/api/onboarding → Supabase (users, subscriptions)
   ↓
/api/astrology → FreeAstroAPI → Supabase (astrology_profiles)
   ↓
/api/horoscope → Gemini → Supabase (daily_horoscopes, cached per day)
   ↓
WhatsApp simulator (real horoscope + real AI chat, Gemini-backed)
   ↓
Engagement, streaks, Cosmic Cards, referrals
```

## Tech stack

| Layer | Choice |
|---|---|
| Frontend | Next.js 14, React, TypeScript, Tailwind CSS |
| Backend | Next.js API routes |
| Database | Supabase (PostgreSQL) |
| Astrology | FreeAstroAPI |
| AI | Google Gemini |
| Deployment | Vercel |
| Automation | Vercel Cron |

## Running locally

```bash
npm install
cp .env.example .env.local   # fill in your own keys
npm run dev
```

Required environment variables — see `.env.example`. Never commit `.env.local`.

## Key routes

| Route | What it does |
|---|---|
| `/` | Landing page |
| `/start` | Scrollable marketing page |
| `/onboarding` | Collects birth details, creates the user + trial |
| `/whatsapp?userId=` | WhatsApp-style simulator — real horoscope, real AI chat |
| `/cosmic-card?userId=` | Shareable card + referral link generation |
| `/ref/[code]` | Landing page for a friend arriving via referral |
| `/premium?userId=` | Mock premium upgrade (demo mode, no real payment) |
| `/api/cron/daily-horoscope` | Automation — generates today's horoscope for every active user |

---

## Why a WhatsApp simulator instead of real WhatsApp delivery

This is a **prototype built for a hackathon deadline, not a production end product** — and that distinction directly shaped this decision.

Real delivery via Meta's WhatsApp Cloud API was scoped and actively attempted: a Meta developer account and app were created, and the WhatsApp product was added. However, the associated Business Portfolio was blocked by Meta's own trust and verification system — first an account-age restriction, then an advertising-eligibility restriction — both of which Meta's own guidance indicates can take multiple days to resolve through their appeal process. That timeline is fundamentally incompatible with a same-day hackathon submission, and it's an external gatekeeping process, not a technical gap in our implementation.

Given that constraint, we made a deliberate scope decision rather than a compromise: build a fully functional **WhatsApp-styled simulator using entirely real backend data**. The horoscope shown is the actual cached Gemini output generated from that user's actual birth chart, and the AI replies are live Gemini calls grounded in real astrology data and conversation history — not scripted or hardcoded text. The only thing simulated is the delivery channel itself (browser instead of an actual phone's WhatsApp), not the intelligence or data behind it.

Critically, the system is architected so this is a **swap, not a rebuild**: the simulator's send/receive endpoints can be replaced by Meta's Cloud API webhook without touching the astrology, AI, or database layers at all. Real WhatsApp delivery is the top item under Future Enhancements below, precisely because the hard part — the personalization engine — is already done.

## Why premium upgrade is mocked instead of a real payment integration

Same reasoning applies here. Integrating a real payment processor (Razorpay, Stripe, etc.) means handling live transactions, webhooks, refund logic, and compliance considerations — none of which are relevant to demonstrating the actual product idea being pitched: that a proactive, habit-forming, AI-personalized astrology experience creates a natural free-to-paid conversion path.

For this prototype, `/premium?userId=` calls a mock endpoint that flips the user's subscription status to `PREMIUM` in Supabase directly — no card details, no real transaction, clearly labeled "Demo Mode" in the UI at every step. This lets the **product flow and monetization logic** (30-day free trial → premium upsell, gated at the moment habit has already formed) be fully demonstrated and evaluated, without spending scarce hackathon time on payment-gateway plumbing that doesn't change the core idea being judged.

## Future enhancements

If this moved beyond prototype stage, the priority order would be:

1. **Real WhatsApp delivery (Meta Cloud API)** — swap the simulator's endpoints for Meta's webhook once business verification clears; architecture is already built to support this without touching the AI/astrology/database layers.
2. **Real payment integration** — replace the mock `/api/subscription/upgrade` endpoint with Razorpay or Stripe, including proper webhook handling for renewals, failures, and cancellations.
3. **Dedicated/self-hosted astrology engine** — move off the free third-party astrology API to a dedicated or self-hosted ephemeris service for better reliability, rate limits, and control over calculation accuracy at scale.
4. **Native share-sheet integration for Cosmic Cards** — currently generates a link and copies it to clipboard; a real rendered shareable image with native mobile share-sheet support would likely improve share-through rates further.
5. **Proper authentication** — the current identity model is WhatsApp-id / demo-id based; a production version needs real session handling, especially for any web-based account or dashboard surfaces.
6. **Topic-specific premium content** — conversation topic detection (love, career, finance, etc.) is already tracked; a production version could use this to power topic-specific deep-dive content as a premium upsell.
7. **Push notification fallback** — for users who haven't yet joined via WhatsApp, a web-push or email fallback channel to keep the daily habit loop alive during onboarding.

## AI tools used in building this project

- **Google Gemini** — used at runtime by the product itself, to generate personalized daily horoscopes and AI conversation replies from structured astrology data (not to invent astrological facts — see the system prompt constraints in `app/api/horoscope/route.ts` and `app/api/whatsapp/chat/route.ts`).
- **Leonardo AI** — used to generate the background video animations (solar system and starfield loops) from reference images.

## External data sources

- **FreeAstroAPI** — Vedic astrology calculations (ascendant, planetary positions, houses, nakshatra)

## Notes for judges

- The WhatsApp screens are a **simulator**, not a chat mockup — the horoscope shown is pulled live from Supabase (generated by Gemini from real astrology data), and the AI replies are live Gemini calls, not scripted responses.
- Real Meta WhatsApp Cloud API integration was pursued but blocked by Meta's business-account verification process during the submission window; this is documented above and in the full project report, along with the reasoning behind the fallback decision.
- Premium upgrade is intentionally mocked for the same prototype-scope reason — see "Why premium upgrade is mocked" above.

## Authors

- **Hiya Porwal**
- **Namrata Singh**
