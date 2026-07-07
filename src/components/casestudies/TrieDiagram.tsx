"use client";

/**
 * The real CHAD trie, reproduced — not a stylized approximation. This mirrors
 * the game's actual `ShoutMenu` component, which runs one WASD-driven trie in
 * two directions:
 *
 *   ENCODE ("SHOUT A WORD")  — a live prefix trie of the words you know. Each
 *     branch sits on W (top) / A (left) / D (right); S cycles siblings. You
 *     drill letter-by-letter (path bar: К → О → Н → В → …) until one word
 *     remains and is shouted. This is how you spell a destination or a can.
 *
 *   DECODE ("READ THE SIGN") — you read a Cyrillic street sign by picking each
 *     letter's sound on W/A/D (S shuffles). The progress row lights green as you
 *     go; the sign resolves to its pronunciation.
 *
 * The whole section is a toggle between the two. A physical W-A-S-D key cluster
 * accompanies the animation, lighting up in time with each scripted keypress.
 * Colors, the ". w ." / "a s d" grid, the amber-on-navy panel, the key badges —
 * all lifted from the shipped game so the panel reads as the game, dropped into
 * the cream editorial page. Auto-plays; freezes to a legible still frame under
 * prefers-reduced-motion.
 */

import { useEffect, useMemo, useRef, useState } from "react";

type KeyId = "w" | "a" | "s" | "d";

// ── Game palette (lifted from ShoutMenu.tsx) ───────────────────────────
const AMBER = "#FFD54F";
const GREEN = "#4CAF50";
const PANEL = "#1a1a2e";
const TILE = "#2a2a3e";
const TILE_BORDER = "#3a3a4e";
const BADGE = "#3a3a4e";
const BADGE_BORDER = "#4a4a5e";
const MUTED = "#666";

// ─────────────────────────────────────────────────────────────────────
// DECODE — READ THE SIGN.  УЛ. ПОБЕДЫ  →  "ool. pah-BYEH-dih" (Victory St.)
// Each step: the correct sound plus two plausible wrong sounds drawn from the
// same phonetic neighborhood, exactly as the game's wrongSoundsFor() does.
// ─────────────────────────────────────────────────────────────────────
type DecodeStep = {
  letter: string;
  opts: { k: KeyId; s: string; correct?: boolean }[];
};
const DECODE_WORD = "ПОБЕДЫ";
const DECODE_PRON = "ool. pah-BYEH-dih";
const DECODE_TRANS = "Pobedy St. — “Victory”";
const DECODE_STEPS: DecodeStep[] = [
  { letter: "П", opts: [{ k: "w", s: "B" }, { k: "a", s: "P", correct: true }, { k: "d", s: "D" }] },
  { letter: "О", opts: [{ k: "w", s: "oh", correct: true }, { k: "a", s: "ah" }, { k: "d", s: "oo" }] },
  { letter: "Б", opts: [{ k: "w", s: "D" }, { k: "a", s: "G" }, { k: "d", s: "B", correct: true }] },
  { letter: "Е", opts: [{ k: "w", s: "yeh", correct: true }, { k: "a", s: "yo" }, { k: "d", s: "ee" }] },
  { letter: "Д", opts: [{ k: "w", s: "T" }, { k: "a", s: "D", correct: true }, { k: "d", s: "B" }] },
  { letter: "Ы", opts: [{ k: "w", s: "eh" }, { k: "a", s: "ah" }, { k: "d", s: "ih", correct: true }] },
];

type DecodeFrame = {
  solved: number; // letters already lit green
  step: DecodeStep;
  pressed: KeyId | null;
  correctKey: KeyId;
  ms: number;
};
type DecodeDone = { done: true; ms: number };

function buildDecodeFrames(): (DecodeFrame | DecodeDone)[] {
  const frames: (DecodeFrame | DecodeDone)[] = [];
  DECODE_STEPS.forEach((step, i) => {
    const correctKey = step.opts.find((o) => o.correct)!.k;
    frames.push({ solved: i, step, pressed: null, correctKey, ms: 950 });
    frames.push({ solved: i, step, pressed: correctKey, correctKey, ms: 700 });
  });
  frames.push({ done: true, ms: 2200 });
  return frames;
}

// ─────────────────────────────────────────────────────────────────────
// ENCODE — SHOUT A WORD.  Drill the prefix trie of learned grocery words.
// Groups by next character sit on W/A/D; S cycles siblings. Here we spell
// КОНВЕРТ ("envelope") out of {КЕФИР, КОЛБАСА, КОНФЕТА, КОНВЕРТ, ЛОЖКА, МОЛОКО} —
// four levels deep, since КОН- is shared by three words before В/Ф splits them.
// ─────────────────────────────────────────────────────────────────────
type Word = { cyr: string; en: string };
type Branch = { k: KeyId; letter: string; words: Word[] } | null;
type EncodeFrame = {
  path: string[];
  branches: { w: Branch; a: Branch; d: Branch };
  sLabel: "NEXT" | "BACK";
  pressed: KeyId | null;
  shout?: Word; // resolved single word → shouted
  ms: number;
};

const W = (cyr: string, en: string): Word => ({ cyr, en });

const ENCODE_FRAMES: EncodeFrame[] = [
  // Level 1 — first letters К / Л / М. Drill straight into К (no cycling first).
  {
    path: [],
    branches: {
      w: { k: "w", letter: "К", words: [W("КЕФИР", "kefir"), W("КОЛБАСА", "sausage"), W("КОНФЕТА", "candy"), W("КОНВЕРТ", "envelope")] },
      a: { k: "a", letter: "Л", words: [W("ЛОЖКА", "spoon")] },
      d: { k: "d", letter: "М", words: [W("МОЛОКО", "milk")] },
    },
    sLabel: "NEXT",
    pressed: null,
    ms: 1500,
  },
  {
    path: [],
    branches: {
      w: { k: "w", letter: "К", words: [W("КЕФИР", "kefir"), W("КОЛБАСА", "sausage"), W("КОНФЕТА", "candy"), W("КОНВЕРТ", "envelope")] },
      a: { k: "a", letter: "Л", words: [W("ЛОЖКА", "spoon")] },
      d: { k: "d", letter: "М", words: [W("МОЛОКО", "milk")] },
    },
    sLabel: "NEXT",
    pressed: "w", // drill into К
    ms: 900,
  },
  // Level 2 — К → { Е (КЕФИР) | О (КОЛБАСА, КОНФЕТА, КОНВЕРТ) }. Take О.
  {
    path: ["К"],
    branches: {
      w: { k: "w", letter: "Е", words: [W("КЕФИР", "kefir")] },
      a: { k: "a", letter: "О", words: [W("КОЛБАСА", "sausage"), W("КОНФЕТА", "candy"), W("КОНВЕРТ", "envelope")] },
      d: null,
    },
    sLabel: "BACK",
    pressed: null,
    ms: 1400,
  },
  {
    path: ["К"],
    branches: {
      w: { k: "w", letter: "Е", words: [W("КЕФИР", "kefir")] },
      a: { k: "a", letter: "О", words: [W("КОЛБАСА", "sausage"), W("КОНФЕТА", "candy"), W("КОНВЕРТ", "envelope")] },
      d: null,
    },
    sLabel: "BACK",
    pressed: "a", // drill into О
    ms: 900,
  },
  // Level 3 — КО → { Л (КОЛБАСА) | Н (КОНФЕТА, КОНВЕРТ) }. Take Н.
  {
    path: ["К", "О"],
    branches: {
      w: { k: "w", letter: "Л", words: [W("КОЛБАСА", "sausage")] },
      a: { k: "a", letter: "Н", words: [W("КОНФЕТА", "candy"), W("КОНВЕРТ", "envelope")] },
      d: null,
    },
    sLabel: "BACK",
    pressed: null,
    ms: 1400,
  },
  {
    path: ["К", "О"],
    branches: {
      w: { k: "w", letter: "Л", words: [W("КОЛБАСА", "sausage")] },
      a: { k: "a", letter: "Н", words: [W("КОНФЕТА", "candy"), W("КОНВЕРТ", "envelope")] },
      d: null,
    },
    sLabel: "BACK",
    pressed: "a", // drill into Н
    ms: 900,
  },
  // Level 4 — КОН → { В (КОНВЕРТ) | Ф (КОНФЕТА) }. Take В → one word left.
  {
    path: ["К", "О", "Н"],
    branches: {
      w: { k: "w", letter: "В", words: [W("КОНВЕРТ", "envelope")] },
      a: { k: "a", letter: "Ф", words: [W("КОНФЕТА", "candy")] },
      d: null,
    },
    sLabel: "BACK",
    pressed: null,
    ms: 1400,
  },
  {
    path: ["К", "О", "Н"],
    branches: {
      w: { k: "w", letter: "В", words: [W("КОНВЕРТ", "envelope")] },
      a: { k: "a", letter: "Ф", words: [W("КОНФЕТА", "candy")] },
      d: null,
    },
    sLabel: "BACK",
    pressed: "w", // КОНВЕРТ is the only word left → shouted
    ms: 900,
  },
  // Resolved → shouted.
  {
    path: ["К", "О", "Н", "В"],
    branches: { w: null, a: null, d: null },
    sLabel: "BACK",
    pressed: null,
    shout: W("КОНВЕРТ", "envelope"),
    ms: 2400,
  },
];

// ─────────────────────────────────────────────────────────────────────
// Physical W-A-S-D key cluster that lights with each scripted press.
// ─────────────────────────────────────────────────────────────────────
function KeyCluster({ active }: { active: KeyId | null }) {
  const cap = (id: KeyId, label: string) => {
    const on = active === id;
    return (
      <div
        style={{
          width: 34,
          height: 34,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 7,
          fontFamily: "monospace",
          fontSize: 14,
          fontWeight: "bold",
          background: on ? AMBER : TILE,
          color: on ? PANEL : "#8a8aa0",
          border: `2px solid ${on ? AMBER : TILE_BORDER}`,
          boxShadow: on ? `0 0 0 4px rgba(255,213,79,0.18)` : "none",
          transform: on ? "translateY(1px)" : "none",
          transition: "all 0.12s ease",
        }}
      >
        {label}
      </div>
    );
  };
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
      {cap("w", "W")}
      <div style={{ display: "flex", gap: 4 }}>
        {cap("a", "A")}
        {cap("s", "S")}
        {cap("d", "D")}
      </div>
    </div>
  );
}

// Shared inline styles (from the game) ─────────────────────────────────
const badge: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  width: 22,
  height: 22,
  borderRadius: 5,
  background: BADGE,
  color: "#888",
  fontSize: 11,
  fontWeight: "bold",
  fontFamily: "monospace",
  border: `1px solid ${BADGE_BORDER}`,
  flexShrink: 0,
};
const tileBtn = (on: boolean): React.CSSProperties => ({
  display: "flex",
  alignItems: "center",
  gap: 6,
  background: on ? "#2a2a40" : TILE,
  border: `2px solid ${on ? AMBER : TILE_BORDER}`,
  borderRadius: 10,
  padding: "6px 12px",
  transition: "border-color 0.15s, background 0.15s",
});

// ── DECODE renderer ────────────────────────────────────────────────────
function DecodePanel({ frame }: { frame: DecodeFrame | DecodeDone }) {
  const done = "done" in frame;
  const letters = [...DECODE_WORD];
  const solved = done ? letters.length : frame.solved;
  const current = done ? -1 : frame.solved;

  return (
    <div>
      <div style={{ color: MUTED, fontSize: 11, fontFamily: "monospace", marginBottom: 12 }}>
        {done ? "You read it." : "Sound it out — pick each letter’s sound (W/A/D, S to shuffle)"}
      </div>

      {/* progress row */}
      <div style={{ display: "flex", justifyContent: "center", gap: 4, marginBottom: 12, flexWrap: "wrap" }}>
        {letters.map((ch, i) => {
          const lit = i < solved || done;
          const cur = i === current;
          return (
            <span
              key={i}
              style={{
                fontFamily: "monospace",
                fontSize: 24,
                fontWeight: "bold",
                padding: "2px 4px",
                borderRadius: 4,
                color: lit ? GREEN : cur ? AMBER : "#555",
                borderBottom: cur ? `2px solid ${AMBER}` : "2px solid transparent",
                transition: "color 0.2s",
              }}
            >
              {ch}
            </span>
          );
        })}
      </div>

      {done ? (
        <div style={{ textAlign: "center", padding: "18px 0 6px" }}>
          <div style={{ color: GREEN, fontFamily: "monospace", fontSize: 22, fontWeight: "bold" }}>{DECODE_PRON}</div>
          <div style={{ color: "#aaa", fontFamily: "monospace", fontSize: 14, marginTop: 6, fontStyle: "italic" }}>
            {DECODE_TRANS}
          </div>
        </div>
      ) : (
        <>
          {/* big current letter */}
          <div style={{ textAlign: "center", color: AMBER, fontFamily: "monospace", fontSize: 60, fontWeight: "bold", margin: "2px 0 12px", lineHeight: 1 }}>
            {frame.step.letter}
          </div>

          {/* sound options on ". w ." / "a s d" */}
          <div
            style={{
              display: "grid",
              gridTemplateAreas: `". w ." "a s d"`,
              gridTemplateColumns: "1fr auto 1fr",
              gap: 8,
              justifyItems: "center",
            }}
          >
            {frame.step.opts.map((o) => {
              const on = frame.pressed === o.k;
              return (
                <button key={o.k} style={{ ...tileBtn(on), gridArea: o.k, cursor: "default" }} tabIndex={-1} aria-hidden>
                  <span style={badge}>{o.k.toUpperCase()}</span>
                  <span style={{ color: AMBER, fontSize: 18, fontWeight: "bold", fontFamily: "monospace" }}>{o.s}</span>
                </button>
              );
            })}
            <div style={{ gridArea: "s" }}>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 4,
                  background: TILE,
                  border: `2px solid ${TILE_BORDER}`,
                  borderRadius: 10,
                  padding: "6px 14px",
                }}
              >
                <span style={badge}>S</span>
                <span style={{ color: "#888", fontSize: 10, fontFamily: "monospace", letterSpacing: 1 }}>SHUFFLE</span>
              </div>
            </div>
          </div>

          {/* feedback */}
          <div style={{ minHeight: 22, textAlign: "center", marginTop: 12 }}>
            {frame.pressed && (
              <span style={{ color: GREEN, fontFamily: "monospace", fontSize: 14 }}>
                {frame.step.letter} = “{frame.step.opts.find((o) => o.correct)!.s}” ✓
              </span>
            )}
          </div>
        </>
      )}
    </div>
  );
}

// ── ENCODE renderer ────────────────────────────────────────────────────
function BranchColumn({ b, pressed }: { b: Branch; pressed: KeyId | null }) {
  if (!b) return <div style={{ minHeight: 40 }} />;
  const on = pressed === b.k;
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
      <button style={{ ...tileBtn(on), cursor: "default" }} tabIndex={-1} aria-hidden>
        <span style={badge}>{b.k.toUpperCase()}</span>
        <span style={{ color: AMBER, fontSize: 22, fontWeight: "bold", fontFamily: "monospace" }}>{b.letter}</span>
      </button>
      <div style={{ display: "flex", flexDirection: "column", gap: 3, width: "100%" }}>
        {b.words.map((w) => (
          <div
            key={w.cyr}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 8,
              background: "#22223a",
              border: "1px solid #2a2a3e",
              borderRadius: 6,
              padding: "4px 9px",
            }}
          >
            <span style={{ color: AMBER, fontWeight: "bold", fontSize: 13, fontFamily: "monospace" }}>{w.cyr}</span>
            <span style={{ color: "#777", fontSize: 10, fontStyle: "italic", fontFamily: "monospace" }}>{w.en}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function EncodePanel({ frame }: { frame: EncodeFrame }) {
  const pathDisplay = frame.path.length ? frame.path.join(" → ") + " → …" : "";
  return (
    <div>
      {pathDisplay ? (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            color: AMBER,
            fontSize: 14,
            fontFamily: "monospace",
            fontWeight: "bold",
            letterSpacing: 2,
            marginBottom: 6,
          }}
        >
          <span style={{ ...badge, width: 26, height: 22, color: AMBER, borderColor: TILE_BORDER, background: TILE }}>←</span>
          <span>{pathDisplay}</span>
        </div>
      ) : null}
      <div style={{ color: MUTED, fontSize: 11, fontFamily: "monospace", marginBottom: 12 }}>
        {frame.path.length === 0 ? "Navigate with W/A/D, cycle with S" : "Drill deeper — one word left to shout"}
      </div>

      {frame.shout ? (
        <div style={{ textAlign: "center", padding: "16px 0 6px" }}>
          <div style={{ color: MUTED, fontSize: 11, fontFamily: "monospace", marginBottom: 8, letterSpacing: 1 }}>SHOUTED</div>
          <div style={{ color: AMBER, fontFamily: "monospace", fontSize: 30, fontWeight: "bold", letterSpacing: 2 }}>
            «{frame.shout.cyr}!»
          </div>
          <div style={{ color: "#aaa", fontFamily: "monospace", fontSize: 14, marginTop: 6, fontStyle: "italic" }}>
            {frame.shout.en}
          </div>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateAreas: `". w ." "a s d"`,
            gridTemplateColumns: "1fr auto 1fr",
            gap: 10,
            justifyItems: "center",
            alignItems: "start",
          }}
        >
          <div style={{ gridArea: "w", minWidth: 108 }}>
            <BranchColumn b={frame.branches.w} pressed={frame.pressed} />
          </div>
          <div style={{ gridArea: "a", minWidth: 108 }}>
            <BranchColumn b={frame.branches.a} pressed={frame.pressed} />
          </div>
          <div style={{ gridArea: "d", minWidth: 108 }}>
            <BranchColumn b={frame.branches.d} pressed={frame.pressed} />
          </div>
          <div style={{ gridArea: "s", alignSelf: "start" }}>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 4,
                background: frame.pressed === "s" ? "#2a2a40" : TILE,
                border: `2px solid ${frame.pressed === "s" ? AMBER : TILE_BORDER}`,
                borderRadius: 10,
                padding: "6px 16px",
                transition: "all 0.15s",
              }}
            >
              <span style={badge}>S</span>
              <span style={{ color: "#888", fontSize: 10, fontFamily: "monospace", letterSpacing: 1 }}>{frame.sLabel}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Section: toggle + panel + key cluster ──────────────────────────────
export default function TrieDiagram() {
  const [mode, setMode] = useState<"decode" | "encode">("decode");
  const [idx, setIdx] = useState(0);
  const [reduced, setReduced] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [minH, setMinH] = useState(0);

  const decodeFrames = useMemo(() => buildDecodeFrames(), []);
  const frames = mode === "decode" ? decodeFrames : ENCODE_FRAMES;

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const on = () => setReduced(mq.matches);
    mq.addEventListener?.("change", on);
    return () => mq.removeEventListener?.("change", on);
  }, []);

  // Reset when switching modes
  useEffect(() => {
    setIdx(0);
  }, [mode]);

  // Drive the animation
  useEffect(() => {
    if (reduced) return;
    if (timer.current) clearTimeout(timer.current);
    const frame = frames[idx]!;
    const ms = (frame as { ms: number }).ms;
    timer.current = setTimeout(() => setIdx((i) => (i + 1) % frames.length), ms);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [idx, frames, reduced]);

  // Lock the module to its tallest frame so it never jumps height while the
  // animation cycles (short "done"/"shout" frames vs. the tall picker frame).
  // Intentionally runs after every render to measure the current frame; it only
  // ever grows minH, so it converges after one cycle (no update loop).
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;
    const h = el.offsetHeight;
    setMinH((prev) => (h > prev ? h : prev));
  });

  // Re-measure from scratch on resize, since content reflows at different widths.
  useEffect(() => {
    const onResize = () => setMinH(0);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Under reduced motion, park on a representative mid-word still.
  const shown = reduced ? (mode === "decode" ? decodeFrames[5]! : ENCODE_FRAMES[6]!) : frames[idx]!;
  const activeKey: KeyId | null =
    "pressed" in shown ? (shown as { pressed: KeyId | null }).pressed : null;

  const seg = (m: "decode" | "encode", label: string, sub: string) => {
    const on = mode === m;
    return (
      <button
        onClick={() => setMode(m)}
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          gap: 1,
          padding: "7px 14px",
          borderRadius: 9,
          border: `1px solid ${on ? AMBER : TILE_BORDER}`,
          background: on ? "rgba(255,213,79,0.12)" : "transparent",
          cursor: "pointer",
          textAlign: "left",
          transition: "all 0.15s",
        }}
      >
        <span style={{ fontFamily: "monospace", fontSize: 13, fontWeight: "bold", letterSpacing: 1, color: on ? AMBER : "#9a9ab0" }}>
          {label}
        </span>
        <span style={{ fontFamily: "monospace", fontSize: 10.5, color: on ? "#c9c9d8" : MUTED }}>{sub}</span>
      </button>
    );
  };

  return (
    <div className="mt-2">
      {/* Game-styled panel dropped into the editorial page */}
      <div
        style={{
          background: PANEL,
          border: `2px solid ${AMBER}`,
          borderRadius: 16,
          padding: "18px 20px 20px",
        }}
      >
        {/* Toggle header */}
        <div style={{ display: "flex", alignItems: "stretch", justifyContent: "space-between", gap: 12, marginBottom: 14 }}>
          <div style={{ display: "flex", gap: 8, flex: 1 }}>
            {seg("decode", "DECODE", "read the sign · letter → sound")}
            {seg("encode", "ENCODE", "shout a word · sound → letter")}
          </div>
        </div>

        {/* Title mirrors the game screen */}
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 8, flexWrap: "wrap", gap: 6 }}>
          <h3 style={{ color: AMBER, fontSize: 16, fontWeight: "bold", letterSpacing: 2, margin: 0, fontFamily: "monospace" }}>
            {mode === "decode" ? "READ THE SIGN" : "SHOUT A WORD"}
          </h3>
          <span style={{ color: "#555", fontFamily: "monospace", fontSize: 10.5, letterSpacing: 1 }}>
            one trie · both directions
          </span>
        </div>

        {/* Live screen + key cluster */}
        <div
          style={{ display: "flex", gap: 18, alignItems: "center", flexWrap: "wrap" }}
          role="img"
          aria-label="The CHAD trie, both directions. In Decode (Read the Sign), the Cyrillic sign ПОБЕДЫ is read letter by letter by choosing each letter's sound on the W, A and D keys, resolving to 'ool. pah-BYEH-dih' — Victory Street. In Encode (Shout a Word), a prefix trie of known words is drilled with W, A and D while S cycles siblings, drilling К → О → Н → В until only КОНВЕРТ (envelope) remains and is shouted."
        >
          <div
            ref={contentRef}
            style={{ flex: "1 1 280px", minWidth: 0, minHeight: minH || undefined }}
          >
            {mode === "decode" ? (
              <DecodePanel frame={shown as DecodeFrame | DecodeDone} />
            ) : (
              <EncodePanel frame={shown as EncodeFrame} />
            )}
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, margin: "0 auto" }}>
            <KeyCluster active={reduced ? null : activeKey} />
            <span style={{ color: "#555", fontFamily: "monospace", fontSize: 9.5, letterSpacing: 1 }}>
              {reduced ? "controls" : "watch the keys"}
            </span>
          </div>
        </div>
      </div>

      <p className="font-mono text-[12.5px] tracking-[0.03em] mt-3.5 mb-0 leading-[1.5]" style={{ color: "var(--color-muted)" }}>
        Decoded prefixes stick.{" "}
        <span style={{ color: "var(--color-terracotta)" }}>
          Read <b className="font-semibold">ПОБЕ-</b> off one sign and the same trie already knows the branch
        </span>{" "}
        &mdash; so spelling it back to travel there costs almost nothing.
      </p>
    </div>
  );
}
