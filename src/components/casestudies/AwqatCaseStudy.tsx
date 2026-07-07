import Reveal from "./Reveal";
import AwqatMoon from "./AwqatMoon";
import {
  WRAP,
  MEASURE,
  Eyebrow,
  SectionH2,
  BackLink,
  DarkSection,
  SeamBand,
  DecisionList,
  FigureFrame,
  StageDiagram,
  type Stage,
} from "./primitives";

/**
 * Bespoke editorial layout for the AWQAT case study — a zero-dependency,
 * retro-pixel prayer clock that computes its five daily times from solar
 * geometry on-device and drives a living pixel sky from the same engine.
 * Follows the house structure (hook → problem → principle → decisions →
 * seeing it → evidence → boundaries → close). All screenshots are captures
 * of the real app; the moon widget runs the app's real phase math live.
 */

const PIPELINE: Stage[] = [
  {
    tag: "Solar core",
    role: "Closed-form, no lookup tables",
    color: "#C99A4A",
    items: ["Julian day → mean anomaly & ecliptic longitude", "Solar declination", "Equation of time"],
  },
  {
    tag: "Angle rules",
    role: "One question per prayer",
    color: "#CF7A45",
    items: [
      "Fajr / Isha: twilight depression angles",
      "Dhuhr: solar noon · Maghrib: sunset",
      "Asr: shadow = length ×1 (or ×2, Hanafi)",
    ],
  },
  {
    tag: "Localization",
    role: "UTC until the very end",
    color: "#5C7C9E",
    items: ["All roots solved in UTC", "Rendered through Intl time zones", "High-latitude fallback rules"],
  },
];

const DECISIONS = [
  {
    k: "Zero runtime\ndependencies",
    h: "The dependency list is the attack surface, so the list is empty.",
    p: "The production bundle is one sectioned module of vanilla ES — 18 KB gzipped — driving a static HTML shell. Vite and jsdom exist only at build and test time. There is nothing to phone home, nothing to expire, nothing to audit but the source itself. For an app people build a daily practice around, boring longevity is a feature.",
  },
  {
    k: "UTC until\nthe very end",
    h: "Every time is solved in UTC; localization is a display concern.",
    p: "The solar math never touches local time. Each prayer is a root-finding question — at what hour does the sun reach this angle? — answered in UTC, per method, per madhhab, and rendered through Intl time zones only at the last moment. Seven calculation methods (ISNA, MWL, Egyptian, Umm al-Qura, Karachi, Tehran, Jafari) are just different pairs of twilight angles; the Hanafi Asr is a one-line change to a shadow factor.",
  },
  {
    k: "The clock face\nis the sky",
    h: "If the app computes the sun, the app should show the sun.",
    p: "The same engine that sets the times drives a pixel scene above them. The sun's screen position comes from the actual fraction of daylight elapsed — not an animation loop. The palette blends continuously through dawn, day, dusk, and night; the mosque windows light at Maghrib; and the moon renders at its real synodic phase, waxing on the right, waning on the left, earthshine on the dark side.",
  },
  {
    k: "Honesty lives\nin the interface",
    h: "A prayer app carries real responsibility, so the disclaimers ship on every view — not in the fine print.",
    p: "Every card carries its astronomical definition — \"when an object's shadow equals its own length\" — and the footer names the method, madhhab, coordinates, and time zone that produced the numbers. Congregational times are explicitly deferred to the local masjid. Tabular Hijri dates are labeled estimates that can differ from moon sighting. The app can always answer why.",
  },
];

/** Light-theme framed screenshot for grid layouts (FigureFrame, minus the top margin). */
function GridFigure({ src, alt, caption }: { src: string; alt: string; caption: React.ReactNode }) {
  return (
    <figure className="m-0">
      <div
        className="rounded-xl overflow-hidden border p-2.5"
        style={{ borderColor: "rgba(45,42,38,0.08)", backgroundColor: "var(--color-warm-white)" }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={alt} className="block w-full rounded-md" style={{ imageRendering: "pixelated" }} loading="lazy" />
      </div>
      <figcaption className="font-mono text-[12.5px] mt-3 leading-[1.5]" style={{ color: "var(--color-muted)" }}>
        {caption}
      </figcaption>
    </figure>
  );
}

export default function AwqatCaseStudy() {
  return (
    <main className="pt-24 sm:pt-28 pb-4">
      <div className={WRAP}>
        <BackLink />
      </div>

      {/* HERO */}
      <Reveal as="section" className="pt-10 pb-10">
        <div className={WRAP}>
          <Eyebrow>Case study — Local-first astronomy in the browser</Eyebrow>
          <h1 className="font-serif font-bold leading-[0.98] tracking-[-0.02em]" style={{ fontSize: "clamp(52px,9vw,88px)" }}>
            AWQAT
          </h1>
          <p className="font-mono text-[15px] mt-3" style={{ color: "var(--color-muted)", maxWidth: "58ch" }}>
            أوقات — &ldquo;times.&rdquo; A retro-pixel prayer clock that computes the day&rsquo;s five
            prayers from solar geometry, then draws the sky it just calculated.
          </p>
          <div className={`${MEASURE} mt-10 pt-8 border-t`} style={{ borderColor: "rgba(45,42,38,0.1)" }}>
            <p className="leading-[1.5]" style={{ fontSize: "clamp(20px,2.4vw,24px)", color: "var(--color-charcoal)" }}>
              Most prayer apps are thin clients for somebody else&rsquo;s API — they phone home for a
              timetable, wrap it in ads, and go blank on airplane mode. But prayer times aren&rsquo;t a
              database. They&rsquo;re astronomy — a closed-form calculation that&rsquo;s been solvable
              with pencil and paper for centuries.
            </p>
            <p className="mt-5 text-[17px] leading-relaxed" style={{ color: "var(--color-charcoal)" }}>
              AWQAT does the whole thing on-device, in vanilla JavaScript with zero runtime
              dependencies, fully offline. And then it goes one step further: the clock face is a
              living pixel scene, driven by the same solar engine that set the times.
            </p>
          </div>
          <FigureFrame
            src="/images/awqat/today.png"
            alt="AWQAT Today view — pixel mosque under an afternoon sky, countdown to Maghrib, and five prayer cards with times and astronomical definitions"
            pixelated
            caption={
              <>
                <span style={{ color: "var(--color-charcoal)" }}>The Today view, live.</span> The sun sits where it
                actually is for 5:12 PM; the timeline at the mosque&rsquo;s feet marks each prayer; every card shows
                the astronomical definition behind its time. Asr is current — Maghrib is 3:18:59 away.
              </>
            }
          />
        </div>
      </Reveal>

      {/* THE REAL PROBLEM */}
      <Reveal as="section" className="py-14">
        <div className={WRAP}>
          <div className={MEASURE}>
            <Eyebrow>The real problem</Eyebrow>
            <SectionH2>Prayer times are astronomy. Astronomy runs fine on a phone.</SectionH2>
            <p className="text-[17px] leading-relaxed mb-4">
              Fajr begins when the sun is a fixed angle below the horizon. Dhuhr is solar noon. Asr
              is a shadow-length ratio. Maghrib is sunset; Isha, deeper twilight. Given a date, a
              latitude, and a longitude, all five fall out of the solar declination and the equation
              of time — the same two quantities printed on the back of every almanac.
            </p>
            <p className="text-[17px] leading-relaxed mb-4">
              The existing options ignore that. The API apps need connectivity, show ads, and ship
              your location upstream to display numbers they can&rsquo;t explain. The printed masjid
              timetable is beautifully reliable — for one city, one calculation method, one year.
              Travel, or follow a different school on Asr, and you&rsquo;re back to searching.
            </p>
            <p className="text-[17px] leading-relaxed">
              When the computation is centuries old and fits in your pocket, the respectful move is
              to do it on the device — offline, private, and explained.
            </p>
          </div>
        </div>
      </Reveal>

      {/* THE PRINCIPLE — dark */}
      <DarkSection>
        <Reveal>
          <div className={WRAP}>
            <div className={MEASURE}>
              <Eyebrow tone="amber">The principle</Eyebrow>
              <p
                className="font-serif font-semibold leading-[1.06] tracking-[-0.02em] mb-5"
                style={{ fontSize: "clamp(30px,5vw,52px)", color: "#ECE7DD" }}
              >
                One engine: sun position → angles → <em style={{ color: "#fff" }}>your clock</em>.
              </p>
              <p className="text-[17px] leading-relaxed" style={{ color: "#CFCBD6" }}>
                The core is a few dozen lines of celestial mechanics. From the Julian day it derives
                the sun&rsquo;s declination and the equation of time; each prayer is then a
                root-finding question — <em>at what hour does the sun reach this angle?</em> —
                answered per method, per madhhab, entirely in UTC, and localized only at the moment
                it&rsquo;s drawn.
              </p>
            </div>
            <div className="mt-12">
              <StageDiagram
                inputLabel={<>Date +<br />lat / lng</>}
                outputLabel={<>Five times<br />on screen</>}
                stages={PIPELINE}
                band={{
                  label: "The living sky · same numbers",
                  text: "The scene isn't an animation loop. The sun's position, the palette blend, the window light at dusk, and the moon's phase are all derived from the same computed times — the sky is the calculation, drawn.",
                }}
                ariaLabel="Pipeline: date and coordinates enter the solar core, which feeds per-prayer angle rules, which produce localized times — and the same numbers drive the pixel sky."
              />
            </div>
          </div>
        </Reveal>
      </DarkSection>

      {/* THE DECISIONS */}
      <Reveal as="section" className="py-14">
        <div className={WRAP}>
          <div className={`${MEASURE} mb-2`}>
            <Eyebrow>The decisions that mattered</Eyebrow>
            <SectionH2>Four calls shaped everything else.</SectionH2>
          </div>
          <DecisionList items={DECISIONS} />
        </div>
      </Reveal>

      {/* THE LIVING SKY */}
      <Reveal as="section" className="py-14">
        <div className={WRAP}>
          <div className={MEASURE}>
            <Eyebrow>Seeing it run</Eyebrow>
            <SectionH2>Four frames, one screen, hours apart.</SectionH2>
            <p className="text-[17px] leading-relaxed">
              These are real captures of the same view across a single day — not mockups, not
              alternate themes. The palette blends continuously between phases; the countdown and
              period label track the actual prayer windows; the timeline segment for the current
              prayer stays lit.
            </p>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 mt-9">
            <GridFigure
              src="/images/awqat/sky-fajr.png"
              alt="Fajr — deep orange dawn gradient behind the pixel mosque, waning moon still up, 4:25 AM"
              caption={<><span style={{ color: "var(--color-charcoal)" }}>Fajr · 4:25 AM.</span> The dawn band builds while last night&rsquo;s moon hangs on; sunrise is 1:14:58 out.</>}
            />
            <GridFigure
              src="/images/awqat/sky-dhuhr.png"
              alt="Dhuhr — full daylight, pixel sun near the top of its computed arc, 1:25 PM"
              caption={<><span style={{ color: "var(--color-charcoal)" }}>Dhuhr · 1:25 PM.</span> Just past solar noon — the sun tops out exactly where the equation of time says it should.</>}
            />
            <GridFigure
              src="/images/awqat/sky-maghrib.png"
              alt="Moments before Maghrib — orange-to-violet sunset, sun touching the horizon, countdown at 2 minutes 59 seconds"
              caption={<><span style={{ color: "var(--color-charcoal)" }}>Maghrib − 00:02:59.</span> The sun&rsquo;s disc meets the horizon as the countdown runs out.</>}
            />
            <GridFigure
              src="/images/awqat/sky-night.png"
              alt="Night — starfield over the darkened mosque, gibbous moon overhead at its real phase, windows lit, 11:30 PM"
              caption={<><span style={{ color: "var(--color-charcoal)" }}>Isha · 11:30 PM.</span> Stars out, windows lit — and the moon drawn at its real phase for the date.</>}
            />
          </div>
          <AwqatMoon />
        </div>
      </Reveal>

      {/* LEARN MODE */}
      <Reveal as="section" className="py-14">
        <div className={WRAP}>
          <div className={MEASURE}>
            <Eyebrow>Learn mode</Eyebrow>
            <SectionH2>Tap any prayer card, and the clock becomes a teacher.</SectionH2>
            <p className="text-[17px] leading-relaxed">
              Every prayer opens into a step-by-step walkthrough — Maghrib unfolds into 29 steps
              across its three rak&rsquo;ah. A pixel figure demonstrates each posture while the
              recitation appears one line at a time: Arabic, transliteration, meaning. Narration
              plays per line — real committed Qur&rsquo;an recordings first, generated dhikr clips
              second, the device&rsquo;s Arabic voice as a last resort — highlighting the active card
              and turning pages by itself. A single incrementing token guards every audio callback,
              so pause, skip, and close cancel cleanly with no orphaned sound.
            </p>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 mt-9">
            <GridFigure
              src="/images/awqat/learn-sujud.png"
              alt="Learn mode — pixel figure in sujud on a prayer rug, step 7 of 29, tasbih line shown in Arabic, transliteration, and English, marked recite ×3"
              caption={<><span style={{ color: "var(--color-charcoal)" }}>Sujud, step 7 of 29.</span> Posture on the left, one line per card on the right, RECITE ×3 tracking repetitions. The dusk in the pixel window matches the real sky — it&rsquo;s Maghrib.</>}
            />
            <GridFigure
              src="/images/awqat/learn-fatiha.png"
              alt="Learn mode — Surah Al-Fatiha step showing the Bismillah as a single card with Arabic, transliteration, and translation, page 1 of 7"
              caption={<><span style={{ color: "var(--color-charcoal)" }}>One ayah per page.</span> Al-Fatiha splits into seven cards paged in step with the audio; a manual flip never interrupts playback.</>}
            />
          </div>
        </div>
      </Reveal>

      {/* THE CALENDAR */}
      <Reveal as="section" className="py-14">
        <div className={WRAP}>
          <div className={MEASURE}>
            <Eyebrow>The calendar</Eyebrow>
            <SectionH2>Two calendars, one table — and a year you can see.</SectionH2>
            <p className="text-[17px] leading-relaxed">
              The Hijri calendar is arithmetic too: the tabular reckoning cycles 11 leap years
              through every 30, so Gregorian ↔ Hijri conversion is pure integer math — the same
              zero-dependency rule as the solar engine. AWQAT runs both side by side and charts the
              whole year&rsquo;s daylight, so you can watch Fajr and Isha breathe with the seasons.
            </p>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 mt-9">
            <GridFigure
              src="/images/awqat/month.png"
              alt="Month view — July 2026 with Hijri dates for Muharram and Safar 1448 and all five prayer times for every day"
              caption={<><span style={{ color: "var(--color-charcoal)" }}>Month.</span> The printed masjid timetable, generated on the spot for your coordinates and method — today in gold, Fridays marked.</>}
            />
            <GridFigure
              src="/images/awqat/year.png"
              alt="Year view — dawn-to-dusk chart for 2026 showing seasonal drift of night, twilight, and daylight bands, plus important Islamic dates"
              caption={<><span style={{ color: "var(--color-charcoal)" }}>Year.</span> Night, twilight, and daylight bands drifting across 2026 — with Ramadan, both Eids, and Ashura each carrying a &ldquo;tabular estimate&rdquo; honesty label.</>}
            />
          </div>
        </div>
      </Reveal>

      {/* THE EVIDENCE — dark */}
      <DarkSection>
        <Reveal>
          <div className={WRAP}>
            <div className={MEASURE}>
              <Eyebrow tone="amber">The evidence</Eyebrow>
              <SectionH2 light>Small enough to read. Tested like it matters.</SectionH2>
              <p className="text-[17px] leading-relaxed" style={{ color: "#CFCBD6" }}>
                The whole app is one sectioned module driving a static HTML shell. The seven test
                suites don&rsquo;t mock it — they load the real module into jsdom and drive it end to
                end: full Learn-mode playback runs, pagination contracts, moon-phase math pinned to
                known new and full moons, sun-arc continuity across day boundaries. Any change to the
                DOM contract or the audio queue has to update the tests in the same commit.
              </p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5 mt-10">
              {[
                ["0", "runtime dependencies"],
                ["18 KB", "gzipped JavaScript"],
                ["1", "module drives it all"],
                ["7", "headless test suites"],
                ["7", "calculation methods"],
                ["100%", "offline after load"],
              ].map(([n, l]) => (
                <div
                  key={l}
                  className="rounded-[10px] px-3 py-5 text-center"
                  style={{ backgroundColor: "#211E1A", border: "1px solid rgba(255,255,255,0.08)" }}
                >
                  <div className="font-serif text-[26px] font-bold leading-none mb-2" style={{ color: "#C99A4A" }}>{n}</div>
                  <div className="font-mono text-[10.5px] uppercase tracking-[0.06em] leading-[1.5]" style={{ color: "rgba(255,255,255,0.5)" }}>{l}</div>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </DarkSection>

      {/* THE BOUNDARIES */}
      <Reveal as="section" className="py-14">
        <div className={WRAP}>
          <div className={MEASURE}>
            <Eyebrow>The boundaries</Eyebrow>
            <SectionH2>What it deliberately defers to people.</SectionH2>
            <p className="text-[17px] leading-relaxed mb-4">
              Congregational times. Jama&rsquo;ah and Jumu&rsquo;ah are set by the local masjid, and
              the app says so on every view — it computes when prayer <em>becomes due</em>, not when
              the community gathers. The tabular Hijri calendar can differ a day or two from moon
              sighting, so every date wears an estimate label and a ±2-day adjustment lives in
              settings.
            </p>
            <p className="text-[17px] leading-relaxed">
              And the narration is a pronunciation aid, not a substitute for instruction — the Learn
              overlay itself tells you that proper recitation (tajwid) is learned from a teacher.
              The software knows the edge of its competence and points past it.
            </p>
          </div>
        </div>
      </Reveal>

      {/* THE POINT / SEAM */}
      <SeamBand>
        <Reveal>
          <div className={WRAP}>
            <div className={MEASURE}>
              <Eyebrow>The point</Eyebrow>
              <SectionH2>Local-first isn&rsquo;t a constraint. It&rsquo;s a design position.</SectionH2>
              <p className="text-[17px] leading-relaxed">
                AWQAT went from a single-file prototype to a tested, shipping app in four feature
                commits — small enough that one person can hold the whole thing in their head, and
                boring enough, in the best sense, to still work untouched in ten years. The pattern
                generalizes: wherever the underlying data is deterministic — tides, seasons, sky
                events, timetables of any celestial kind — the computation belongs on the device,
                and the interface should be able to answer <em>why</em>.
              </p>
            </div>
          </div>
        </Reveal>
      </SeamBand>
    </main>
  );
}
