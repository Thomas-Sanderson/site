# Hand-off — Case Studies v3 (2026-07-07)

Portfolio site for Thomas (Design Technologist), Next.js 16 App Router + Tailwind, at
`/Users/lixo/devign/site`. This documents the work done this session and sets up the
**next task: simplify & shorten the case-study copy** (details at the bottom).

---

## Working mode (IMPORTANT — read first)

- **Branch:** `local-sandbox`. We do NOT deploy until a whole batch is ready.
- **Push guard is ARMED:** `.git/hooks/pre-push` blocks any push (and therefore any Vercel
  deploy). To deploy later: `mv .git/hooks/pre-push .git/hooks/pre-push.disabled`, then
  `git push origin local-sandbox:main && git branch -f main local-sandbox`, then **re-arm it**.
- **Deploy target:** pushing `local-sandbox:main` triggers Vercel. Live site is currently at the
  last-pushed commit; everything below is **local only**.
- **There are uncommitted changes** in the working tree (see "Repo state"). The user commits on
  their own cadence — don't commit/push unless asked.
- **Dev server:** `npm run dev` → http://localhost:3000 (LAN: http://10.0.0.81:3000).
- **Verify builds with** `npm run build` (prerenders 15 pages) and `npx tsc --noEmit`
  (ignore pre-existing `@next/next/no-img-element` warnings — they're intentional `<img>` uses).
- **Sandbox:** Bash runs sandboxed; use `dangerouslyDisableSandbox: true` for `npm run build`,
  git pushes, Chrome/puppeteer, and file ops outside cwd. `curl localhost` returns 000 in the
  sandbox (network-restricted) — not a server problem.
- **AGENTS.md:** this is a modified Next.js 16 — read `node_modules/next/dist/docs/` before using
  unfamiliar APIs. In practice the case studies are plain JSX + the shared kit, so this rarely bites.

---

## What this project is

Five case studies, each a **bespoke editorial page** (not the old generic template):

| slug | title | domain |
|---|---|---|
| `gab` | Gab | AI care navigator for addiction-treatment admissions (built on the real **Fern Crest** brand of the `melody-engine` app) |
| `couve` | Couve | behavioral-health admissions/revenue EMR concept |
| `chad` | CHAD Rescues Nobody | language-learning puzzle-platformer (has a playable embed) |
| `awqat` | Awqat | Islamic prayer-times app (live moon-phase widget) |
| `paper-cannon` | Paper Cannon | 14-agent research-synthesis pipeline |

**Index order (as of this session): gab → couve → chad → awqat → paper-cannon.**

### Architecture
- **Route:** `src/app/work/[slug]/page.tsx` holds a `BESPOKE` registry mapping slug → component.
  All five slugs are bespoke; anything not listed falls back to the generic `CaseStudyCard`.
- **Data:** `src/data/caseStudies.ts` (order, titles, subtitles, `thumb`, `playUrl`, `embedUrl`).
  The generic-template fields (context/problem/built/matters) still exist but the bespoke pages
  mostly ignore them and hold their own copy inline.
- **Shared kit:** `src/components/casestudies/primitives.tsx` — the design system every case study
  composes from. Exports: `WRAP`, `MEASURE` (className strings), `Eyebrow`, `SectionH2`,
  `BackLink`, `DarkSection` (full-bleed warm-dark band), `SeamBand` (full-bleed cream band),
  `DecisionList` (the "decisions that mattered" key/body grid), `ImpactCallout`, `FigureFrame`,
  and **`StageDiagram`** (the horizontal input→stages→output diagram shared by Gab/PaperCannon/Chad).
  `Reveal` (scroll-reveal) is a separate client component (`Reveal.tsx`).
- **Design tokens** (`src/app/globals.css` `@theme`): cream `#F5F0EB`, charcoal `#2D2A26`,
  terracotta `#C4725A`, teal `#2A6B5A`, muted `#A89F95`, warm-white `#FAF8F5`. Fonts: Libre
  Baskerville (serif), Inter (sans), JetBrains Mono (mono). Dark sections use `#1A1714` bg.
- **Diagrams are real in-page components, not screenshots** (site thesis). Bespoke ones:
  `ReadinessGate` (Couve), `CastRoster`+`CycleDiagram`+`Ledger` (Paper Cannon),
  `TrieDiagram`+`SeasonCity`+`EstimateWalk` (Chad/Couve), `AwqatMoon` (Awqat), `CareFlow` (Gab).
- **Global chrome:** `SiteChrome` adds header + footer to every page (skipped on `/chad`, `/curate`).
  Bespoke case studies render their own `<main className="pt-24 sm:pt-28 pb-4">` starting with `<BackLink/>`.

---

## What was done this session

1. **Built all bespoke case studies** on the shared kit (Gab was the reference; Couve/Paper
   Cannon/Chad built by a parallel worker team; Awqat added by the user). Every diagram is a
   scalable in-page component.
2. **Gab hero = the real Fern Crest Care Navigator.** Sourced from `~/Projects/melody-engine`
   (`brands/fern-crest/config.json`, `nodes.json`, `client/index.html`). The hero "diorama" is a
   two-panel React component: left = faithful Fern Crest chat (paper `#FAF6EE`, white bot bubbles
   with green `#4C7A45` "voice" / amber deterministic left-borders, tan `#D2B48C` user bubbles,
   Rowan, the **real Fern Crest leaf SVG** icon, node-tags); right = a dark "Inspector — what the
   machine heard" panel. Content is the **fuzzy-Aetna capture**: user types "my insurance is
   through my job, aetna i think" → Rowan confirms **in-network (a vetted fact)** but **defers
   exact coverage & cost to a human team member**. Inspector rows show `payer: Aetna ✓`,
   `in-network: yes · vetted`, `coverage · cost: deferred → team member`.
3. **Gab index card** = `public/images/gab/card.webp` (32KB), a 16:10 crop of that diorama's chat,
   wired via `thumb` in `caseStudies.ts`. Generated with headless Chrome + puppeteer-core
   screenshotting the live diorama, then PIL crop→webp (see "Tooling" below).
4. **Awqat moon-phase fix.** `AwqatMoon.tsx` named phases by *cycle quarter* ("Last quarter" at 47%
   lit — contradictory). Rewrote `moonPhaseName(pct, waxing)` to name by *illumination*: new/full at
   0/100, **"waxing/waning half moon" at 50** (dropped confusing "quarter" language per user),
   crescent <50, gibbous ≥50. Label can never contradict the % now.
5. **Reordered case studies** → gab, couve, chad, awqat, paper-cannon (`caseStudies.ts`).
6. **Homepage:** replaced Paper Cannon with CHAD in the "acceleration" era narrative
   (`src/data/eras.ts`); added `linkifyNarrative` in `EraSection.tsx` so **Gab/Couve/CHAD Rescues
   Nobody** in the prose link to their case-study pages; reworked `StoryDoors.tsx` so each named
   case study (Gab/Couve/Chad) is its own link and no Paper Cannon mention remains.

### Earlier in the broader effort (already deployed or committed):
- CHAD game embed is a **click-to-load facade** (`GameEmbed.tsx`) — poster + "Play Demo", iframe
  mounts only on click, sized to the game's native ~16:9 frame.
- Life Map, resume/CV work, scroll-reset fixes, Sudsy→Couve rebrand, footer/email — all prior,
  already on `main`.

---

## Repo state (uncommitted, this session)

Modified: `work/[slug]/page.tsx`, `EraSection.tsx`, `StoryDoors.tsx`, `caseStudies.ts`, `eras.ts`,
and casestudies: `GabCaseStudy`, `ChadCaseStudy`, `CouveCaseStudy`, `ReadinessGate`, `SeasonCity`,
`TrieDiagram`.
New (untracked): `AwqatCaseStudy.tsx`, `AwqatMoon.tsx`, `EstimateWalk.tsx`,
`public/images/gab/card.webp`, `public/images/awqat/`, `public/images/chad/{seasons,times,build-far-side.png}`,
`public/images/couve/{dashboard,pipeline}.png`.

Last local commits (unpushed): `79a7329 feat(gab): rebuild /work/gab v6` … back through the v3 series.

---

## Tooling notes (for visual verification)

- **No headless browser is installed as a dep**, but Chrome exists at
  `/Applications/Google Chrome.app/Contents/MacOS/Google Chrome`. `puppeteer-core` was
  `npm i`'d this session to drive it.
- **Screenshot a page/element** (needs `dangerouslyDisableSandbox`): launch puppeteer-core with
  `executablePath` = that Chrome, `args:['--no-sandbox']`, `waitUntil:'networkidle0'` so webfonts
  load. `page.$('[aria-label^="..."]').screenshot()` grabs one element.
- **Full-page tall capture:** Chrome CLI `--headless=new --screenshot --window-size=W,H`. Trim
  trailing background with PIL by finding the last row with >N non-cream pixels (skip the left ~140px
  — a `ContentFade` gradient bleeds a thin grey strip down the edge in captures; it is NOT a real bug).
- **Lesson learned:** static `--screenshot` can render before fonts settle → false "clipped heading"
  artifacts. To check real layout/overflow, drive puppeteer with `networkidle0` and read
  `document.documentElement.scrollWidth` vs `clientWidth`. Mobile (390px) was verified clean:
  scrollWidth==390, 0 overflowing elements, headings wrap exactly to the 24px gutter.
- **Image ops:** `sips` (macOS) for resize/dimensions; Python **PIL** for crop/webp/quantize.
  No ffmpeg-free video frame tool needed but `ffmpeg`/`ffprobe` ARE installed (used to sample the
  Gab `demo.mp4`).

---

## NEXT TASK — simplify & shorten case-study copy

**Goal:** tighten the prose of the case studies without losing substance. The writing is often
**too dense and allusive** — it uses shorthand aimed at a knowing audience and references concepts
it never actually explains in-prose. Make it clearer and more self-contained; cut length, keep the meat.

### Where the copy lives
All inline in the components (arrays like `DECISIONS`, and JSX `<p>`/`SectionH2` text):
- `GabCaseStudy.tsx` (505 lines — the densest; also has the "problem shipped twice" autopsy)
- `AwqatCaseStudy.tsx` (390)
- `CouveCaseStudy.tsx` (328) · `ChadCaseStudy.tsx` (328) · `PaperCannonCaseStudy.tsx` (309)
- Copy is NOT in `caseStudies.ts` for the bespoke pages — it's in the components. `caseStudies.ts`
  only holds title/subtitle/thumb/urls.

### Known "shorthand to a knowing audience" spots to fix (examples, not exhaustive)
- **Paper Cannon:** "the reindeer" (a drift-detector metaphor) is used before it's explained; "N=1",
  "sycophancy literature (Sharma et al., ICLR 2024)", "Water Cooler / Writing Room / Editing Floor"
  room-names, agent/model-tier jargon (Opus/Sonnet/Haiku), "mediated access is a containment
  boundary." Reads like insider notes.
- **Gab:** "the model is the voice, not the brain," "guardrail / deterministic core / model" layers,
  "vetted content," "micro-capture," "in-network vs deferred coverage" — mostly good but dense and long
  (it's the longest page). The "problem, shipped twice" autopsy could tighten.
- **Couve:** "VOB" (verification of benefits), "PFR", "readiness = one answer not five systems,"
  "contracted rate per payer/level of care" — acronyms and domain terms used without a beat of explanation.
- **CHAD:** "the trie," "encode/decode," "Bloom's taxonomy," "babushka-gated navigation,"
  "spaced repetition" — playful but assumes the reader tracks the pedagogy shorthand.
- **Awqat:** astronomical definitions ("shadow equals its own length"), "madhhab," "tabular Hijri" —
  fine but could add a half-sentence of plain-language grounding.

### Approach suggested for next session
1. **Grill first** (the user's next brief is a judgment task): confirm the target voice/length —
   e.g., "explain every concept the first time it appears, cut ~30–40% length, keep the strongest
   decision per section." Ask whether to keep the editorial section structure (hook → principle →
   decisions → diagram → seeing it run → impact → seam) — it's strong; likely keep structure, tighten prose.
2. Go **one case study at a time** (the user's established rhythm). Show a rendered screenshot after
   each so they can react. Keep diagrams; the diagrams already carry a lot, so prose can lean on them
   and shrink.
3. Preserve: the honest impact framing (NO fabricated metrics — each impact block deliberately marks
   where a real number would go), the Fern Crest fidelity on Gab, and the diagram-over-screenshot thesis.
4. Verify each: `npx tsc --noEmit` + `npm run build`, and screenshot via puppeteer to eyeball.
5. Watch for **curly quotes / em-dashes** — the components use `&rsquo;`, `&mdash;`, `&ldquo;`/`&rdquo;`
   HTML entities in JSX text. Keep that convention. `eras.ts` uses `’`/`—` escapes.

### Do NOT
- Don't push/deploy. Don't re-arm/disarm the hook unless asked. Don't fabricate metrics.
- Don't revert the user's own in-progress edits (they edit these files directly between turns).
- Don't rewrite the shared kit or diagrams to change copy — copy lives in the case-study components.
