# Portfolio Site Restructure — Scroll Cards with Pinned Animations

## Context

The current scroll behavior is broken. We're rewriting **all components** from scratch while keeping the existing data layer intact. The new page uses a card-based scroll system: each section occupies a viewport fold, with some cards capturing scroll to drive internal animations before releasing.

**Strategy:** Same repo, rewrite components. Data files (`src/data/*`), utilities (`src/lib/timeline.ts`), config, and `public/images/` are untouched.

## New Page Order

```
1. Hero (intro card)              — scroll-captured: bio fades, heading shrinks
2. Gantt Chart                    — scroll-captured: rows reveal → collapse → pin as timeline bar
3. Map + Rapid-Fire               — scroll-captured: pins appear chronologically
4. Era: Consulting (2013–2019)    — scroll-captured: staggered narrative, timeline highlights
5. Era: Art + Independence        — same
6. Era: Behavioral Health         — same
7. Era: Acceleration              — same
8. Case Studies                   — standard scroll (intersection reveal)
9. Resume                         — standard scroll (static)
```

## Data Sources (no changes)

| Data             | File                       |
|------------------|----------------------------|
| Timeline entries | `src/data/timeline.ts`     |
| Era narratives   | `src/data/eras.ts`         |
| Map locations    | `src/data/locations.ts`    |
| Gallery images   | `src/data/gallery.json`    |
| Case studies     | `src/data/caseStudies.ts`  |
| Resume/skills    | `src/data/resume.ts`       |
| Content items    | `src/data/content.ts`      |
| Utilities (lerp) | `src/lib/timeline.ts`      |
| Site config      | `src/data/siteConfig.ts`   |

---

## Implementation

### 1. Scroll Engine — `src/lib/useScrollCard.ts` (new)

Shared hook for all card sections:

```ts
useScrollCard(ref, { scrollFuel: '100vh' | '200vh' | '600px' })
→ { progress: 0–1 }
```

- Sentinel div (scroll fuel) + sticky inner — same proven technique, standardized
- `progress` from `getBoundingClientRect()` with passive scroll listener
- No GSAP, no scroll hijacking, no cross-component event coupling

### 2. Hero — `src/components/Hero.tsx` (rewrite from scratch)

- Fixed overlay + 200vh scroll fuel
- Progress phases:
  - 0–0.3: bio fades out + slides up
  - 0.25–0.55: label shrinks + zips left (desktop) / fades (mobile)
  - 0.4–0.7: heading scales down + moves up
- Self-contained — no event listeners for other components

### 3. Gantt Chart — `src/components/GanttTimeline.tsx` (rewrite from scratch)

Scroll fuel: 800px. Three phases:

1. **Reveal (0–0.5):** Rows appear bottom-to-top, staggered opacity/height
2. **Collapse (0.5–0.8):** Rows disappear top-to-bottom, chart compresses to timeline bar
3. **Pin (0.8–1.0):** Timeline bar fully formed, sticks to top

After unpin: timeline bar stays as persistent sticky header via `TimelineBar` component.

Data: `groupByCompany()` from `src/lib/timeline.ts`, `timelineEntries` + `eraLabels` from `src/data/timeline.ts`.

### 4. Pinned Timeline Bar — `src/components/TimelineBar.tsx` (new)

Thin persistent bar appearing after Gantt collapse:
- Era-colored segments proportional to duration (from `eraLabels`)
- Active era highlights as user scrolls through era sections
- Contains nav links (name + section anchors) — replaces Nav component
- Listens to `era-highlight` custom events from EraSection
- `position: sticky; top: 0; z-index: 40`

### 5. Map — `src/components/MapSection.tsx` (rewrite from scratch)

**Rapid-fire chronological animation (scroll-captured):**
- Scroll fuel: 150vh
- Chronologically sorted items from `buildContentItems()` filtered to those with lat/lng
- Pins appear one-by-one as progress 0→1, each with pop-in scale animation
- Timestamp scrubber label shows current date during scroll

**Clustering (replaces broken overlapping bubbles):**
- Grid-based spatial hash: pins within ~50px screen distance form a cluster
- Cross-category clustering (work + art + volunteer in same city = 1 cluster)
- Hover cluster → summary tooltip listing all items
- Click cluster → expands, individual pins fan out with offset, each clickable
- Category pills still work — filtered pins also cluster

**Removed:** parallax offset, gallery overlay (gallery content moves to era sections).

Data: `locations` from `src/data/locations.ts`, `buildContentItems()` from `src/data/content.ts`, D3 geo + topojson.

### 6. Era Sections — `src/components/EraSection.tsx` (rewrite from scratch)

- Scroll fuel: 200vh each
- Enter (0–0.3): staggered reveal — date → title → subtitle → narrative
- Hold (0.3–0.7): fully visible
- Exit (0.7–1.0): fade out + slide
- Dispatches `era-highlight` event with `era.id` for TimelineBar
- If era has `galleryFilter`, renders matching gallery images in a small grid tagged with location

Data: `Era` from `src/data/eras.ts`, gallery from `src/data/gallery.json`.

### 7. Case Studies — `src/components/CaseStudySection.tsx` (minimal changes)

- Keep intersection-observer reveal, no scroll capture
- CaseStudyCard unchanged

### 8. Resume — `src/components/ResumeSection.tsx` (no changes)

### 9. Page Layout — `src/app/page.tsx` (update)

```tsx
<TimelineBar />
<Hero />
<GanttTimeline />
<MapSection />
<EraSection era={eras[0]} />
<EraSection era={eras[1]} />
<EraSection era={eras[2]} />
<EraSection era={eras[3]} />
<CaseStudySection />
<ResumeSection />
<Footer />
```

### 10. Delete / Clean Up

- Delete `src/components/Nav.tsx` (replaced by TimelineBar)
- Remove all `gantt-progress`, `hero-progress` custom events
- Remove `ContentQuiz` from GanttTimeline

---

## Files Summary

**Create:**

| File                             | Purpose                          |
|----------------------------------|----------------------------------|
| `src/lib/useScrollCard.ts`       | Shared scroll-progress hook      |
| `src/components/TimelineBar.tsx` | Persistent pinned timeline + nav |

**Rewrite (delete contents, write fresh — do NOT copy old logic):**

| File                             | Notes                                        |
|----------------------------------|----------------------------------------------|
| `src/components/Hero.tsx`        | Self-contained, useScrollCard                |
| `src/components/GanttTimeline.tsx` | useScrollCard, collapse→TimelineBar handoff |
| `src/components/MapSection.tsx`  | Clustering + chronological rapid-fire        |
| `src/components/EraSection.tsx`  | useScrollCard + era-highlight dispatch        |

**Update:**

| File                             | Notes                            |
|----------------------------------|----------------------------------|
| `src/app/page.tsx`               | New section order, swap Nav→Bar  |

**Delete:**

| File                       | Reason                  |
|----------------------------|-------------------------|
| `src/components/Nav.tsx`   | Replaced by TimelineBar |

---

## Verification

1. `npm run dev` — site loads, no errors
2. Full scroll — each card pins, animates, unpins cleanly
3. Gantt collapse → timeline bar sticks to top
4. Timeline bar highlights active era during era section scroll
5. Map rapid-fire: pins appear chronologically
6. Map clustering: nearby pins group, hover tooltip, click expands
7. Case studies + resume render normally
8. Mobile: graceful degradation (shorter scroll fuel, simpler animations)
