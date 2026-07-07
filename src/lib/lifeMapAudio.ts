"use client";

// Life Map sound — an event-driven Web Audio "score" for the draw animation.
//
// Brief (v3): EVERY dot makes a sound, and a dot with multiple concentric rings
// (lived + worked + made there …) voices EACH ring — inner→outer — so what you
// hear matches what you see growing. Each ring's TYPE picks the voice
// (home/location = bass; the others = snap / horn / snare / keys), its PITCH
// tracks the place's distance from the current home, and its "time to grow"
// (that mode's months at the place — what sizes the ring) modulates a fading
// envelope: long stays bloom into long, slowly-fading tones; brief visits blip.
// The rings of one dot are lightly staggered so they roll rather than stack.
//
// There is no metronome — the dots are the rhythm, so the pace is the organic
// cadence of the journey. Everything runs through a soft limiter (+ short
// reverb), and every pitch snaps to a D minor-pentatonic scale, so overlapping
// fades stay consonant instead of turning to mud.
//
// Pure/lazy: no AudioContext until enable() is called from a user gesture
// (autoplay policy), and nothing here touches the DOM at import.

import { PLACES, type Mode } from "@/data/lifeGrid";

export interface DotRing {
  /** The ring's type — chooses the voice. */
  mode: Mode;
  /** On-screen growth time in seconds (→ fading-envelope length). */
  growthSec: number;
}

export interface DotEvent {
  placeKey: string;
  /** Current home the dot's distance (→ pitch) is measured from. */
  homeKey: string | null;
  /** Concentric rings, inner→outer — one voice each. */
  rings: DotRing[];
}

export interface LifeMapAudio {
  /** Create/resume the AudioContext. MUST be called from a user gesture. */
  enable: () => Promise<void>;
  /** Disarm and suspend the context (keeps it for re-enable). */
  disable: () => void;
  enabled: () => boolean;
  /** Arm scoring (call when the draw animation starts). */
  start: () => void;
  /** Disarm scoring (call when the draw ends or is interrupted). */
  stop: () => void;
  /** Play one fading note per ring for a dot that just appeared. */
  triggerDot: (d: DotEvent) => void;
  dispose: () => void;
}

// ── Musical constants ──────────────────────────────────────────────────────
const ROOT_MIDI = 62; // D4, the melodic tonic (horn).
const KEYS_MIDI = 74; // D5, the vibraphone octave (learn).
const BASS_MIDI = 38; // D2, the bass tonic (live/home).
// D minor pentatonic over two octaves — the palette every pitch snaps to.
const SCALE = [0, 3, 5, 7, 10, 12, 15, 17, 19, 22];

// Envelope length clamps (seconds): shortest blip → longest fading pad.
const DUR_MIN = 0.22;
const DUR_MAX = 5;
// Gap between a dot's stacked rings so they roll rather than land as one hit.
const RING_STAGGER = 0.06;

const midiToFreq = (m: number) => 440 * Math.pow(2, (m - 69) / 12);
const clamp = (x: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, x));

// ── Geography → normalised distance ────────────────────────────────────────
function haversine(aLat: number, aLon: number, bLat: number, bLon: number): number {
  const R = 6371;
  const dLat = ((bLat - aLat) * Math.PI) / 180;
  const dLon = ((bLon - aLon) * Math.PI) / 180;
  const la1 = (aLat * Math.PI) / 180;
  const la2 = (bLat * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(la1) * Math.cos(la2) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
}

// Largest pairwise distance in the dataset → normaliser for pitch mapping.
const MAX_DIST = (() => {
  const keys = Object.keys(PLACES);
  let max = 1;
  for (let i = 0; i < keys.length; i++) {
    for (let j = i + 1; j < keys.length; j++) {
      const a = PLACES[keys[i]];
      const b = PLACES[keys[j]];
      max = Math.max(max, haversine(a.lat, a.lon, b.lat, b.lon));
    }
  }
  return max;
})();

function distNorm(placeKey: string, homeKey: string | null): number {
  const p = PLACES[placeKey];
  const h = homeKey ? PLACES[homeKey] : null;
  if (!p || !h) return 0;
  return Math.min(1, haversine(p.lat, p.lon, h.lat, h.lon) / MAX_DIST);
}

/** Distance → melodic frequency, snapped to the pentatonic scale. */
function pitchFor(base: number, placeKey: string, homeKey: string | null): number {
  const raw = Math.round(distNorm(placeKey, homeKey) * (SCALE.length - 1));
  const idx = clamp(raw, 0, SCALE.length - 1);
  return midiToFreq(base + SCALE[idx]);
}

// ── Engine ─────────────────────────────────────────────────────────────────
export function createLifeMapAudio(): LifeMapAudio {
  let ctx: AudioContext | null = null;
  let master: GainNode | null = null;
  let wet: GainNode | null = null;
  let on = false;
  let armed = false;

  function makeReverbIR(context: AudioContext): AudioBuffer {
    const len = Math.floor(context.sampleRate * 1.2);
    const buf = context.createBuffer(2, len, context.sampleRate);
    for (let ch = 0; ch < 2; ch++) {
      const d = buf.getChannelData(ch);
      for (let i = 0; i < len; i++) {
        d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3.2);
      }
    }
    return buf;
  }

  async function enable() {
    if (!ctx) {
      const w = window as unknown as {
        AudioContext: typeof AudioContext;
        webkitAudioContext?: typeof AudioContext;
      };
      const Ctor = w.AudioContext ?? w.webkitAudioContext;
      if (!Ctor) return;
      ctx = new Ctor();

      master = ctx.createGain();
      master.gain.value = 0.0001;
      // Soft limiter so overlapping fades glue and never clip into noise.
      const comp = ctx.createDynamicsCompressor();
      comp.threshold.value = -16;
      comp.knee.value = 24;
      comp.ratio.value = 3.4;
      comp.attack.value = 0.004;
      comp.release.value = 0.28;
      master.connect(comp);
      comp.connect(ctx.destination);

      // Short room reverb in parallel.
      const conv = ctx.createConvolver();
      conv.buffer = makeReverbIR(ctx);
      wet = ctx.createGain();
      wet.gain.value = 0.2;
      wet.connect(conv);
      conv.connect(comp);
    }
    if (ctx.state === "suspended") await ctx.resume();
    on = true;
    master!.gain.cancelScheduledValues(ctx.currentTime);
    master!.gain.setTargetAtTime(0.55, ctx.currentTime, 0.05);
  }

  function disable() {
    on = false;
    armed = false;
    if (ctx && ctx.state === "running") ctx.suspend();
  }

  // ── Voices ─────────────────────────────────────────────────────────────────
  function out(node: AudioNode) {
    node.connect(master!);
    if (wet) node.connect(wet);
  }

  // Pitched voices fade over `dur` — the ring's growth time — "as if fading".
  function bass(freq: number, t: number, dur: number, gain = 0.42) {
    if (!ctx || !Number.isFinite(freq)) return;
    const o = ctx.createOscillator();
    o.type = "triangle";
    o.frequency.setValueAtTime(freq * 1.4, t);
    o.frequency.exponentialRampToValueAtTime(freq, t + 0.06);
    const lp = ctx.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.value = 520;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(gain, t + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(lp);
    lp.connect(g);
    out(g);
    o.start(t);
    o.stop(t + dur + 0.05);
  }

  function horn(freq: number, t: number, dur: number, gain = 0.16) {
    if (!ctx || !Number.isFinite(freq)) return;
    const o = ctx.createOscillator();
    o.type = "sawtooth";
    o.frequency.value = freq;
    const vib = ctx.createOscillator();
    vib.frequency.value = 5.2;
    const vibg = ctx.createGain();
    vibg.gain.value = freq * 0.006;
    vib.connect(vibg);
    vibg.connect(o.frequency);
    const bp = ctx.createBiquadFilter();
    bp.type = "bandpass";
    bp.frequency.value = freq * 1.6;
    bp.Q.value = 3.5;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(gain, t + 0.05);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(bp);
    bp.connect(g);
    out(g);
    o.start(t);
    vib.start(t);
    o.stop(t + dur + 0.05);
    vib.stop(t + dur + 0.05);
  }

  function keys(freq: number, t: number, dur: number, gain = 0.15) {
    if (!ctx || !Number.isFinite(freq)) return;
    // Two-sine bell (vibraphone-ish) for the "learn" voice.
    [1, 2.01].forEach((mult, i) => {
      const o = ctx!.createOscillator();
      o.type = "sine";
      o.frequency.value = freq * mult;
      const g = ctx!.createGain();
      const peak = i === 0 ? gain : gain * 0.4;
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(peak, t + 0.006);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.connect(g);
      out(g);
      o.start(t);
      o.stop(t + dur + 0.05);
    });
  }

  function noiseBurst(t: number, seconds: number): AudioBufferSourceNode {
    const len = Math.max(1, Math.floor(ctx!.sampleRate * seconds));
    const buf = ctx!.createBuffer(1, len, ctx!.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    const src = ctx!.createBufferSource();
    src.buffer = buf;
    src.start(t);
    return src;
  }

  // Percussive voices are naturally short; growth only stretches the tail a
  // little (a brief visit snaps, a long stay brushes a touch longer).
  function snap(t: number, dur: number, gain = 0.3) {
    if (!ctx) return;
    const tail = clamp(dur * 0.18, 0.04, 0.14);
    const src = noiseBurst(t, tail);
    const bp = ctx.createBiquadFilter();
    bp.type = "bandpass";
    bp.frequency.value = 2200;
    bp.Q.value = 3;
    const g = ctx.createGain();
    g.gain.setValueAtTime(gain, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + tail);
    src.connect(bp);
    bp.connect(g);
    out(g);
  }

  function snare(t: number, dur: number, gain = 0.16) {
    if (!ctx) return;
    const tail = clamp(dur * 0.4, 0.12, 0.6);
    const src = noiseBurst(t, tail);
    const bp = ctx.createBiquadFilter();
    bp.type = "bandpass";
    bp.frequency.value = 1700;
    bp.Q.value = 1.1;
    const g = ctx.createGain();
    g.gain.setValueAtTime(gain, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + tail);
    src.connect(bp);
    bp.connect(g);
    out(g);
  }

  function playRing(ring: DotRing, placeKey: string, homeKey: string | null, t: number) {
    const dur = clamp(ring.growthSec, DUR_MIN, DUR_MAX);
    switch (ring.mode) {
      case "live":
        bass(pitchFor(BASS_MIDI, placeKey, homeKey), t, dur);
        break;
      case "work":
        horn(pitchFor(ROOT_MIDI, placeKey, homeKey), t, dur);
        break;
      case "learn":
        keys(pitchFor(KEYS_MIDI, placeKey, homeKey), t, dur);
        break;
      case "make":
        snap(t, dur);
        break;
      case "travel":
        snare(t, dur);
        break;
    }
  }

  function triggerDot(d: DotEvent) {
    if (!ctx || !on || !armed) return;
    const base = ctx.currentTime + 0.02;
    // One voice per ring, inner→outer, lightly rolled so all layers are heard.
    d.rings.forEach((ring, i) => {
      playRing(ring, d.placeKey, d.homeKey, base + i * RING_STAGGER);
    });
  }

  return {
    enable,
    disable,
    enabled: () => on,
    start: () => {
      armed = true;
    },
    stop: () => {
      armed = false;
    },
    triggerDot,
    dispose: () => {
      armed = false;
      if (ctx) {
        ctx.close();
        ctx = null;
      }
    },
  };
}
