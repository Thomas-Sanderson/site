"use client";

import { useState } from "react";

/**
 * Click-to-load game embed (facade pattern). Until the user clicks Play, we
 * render only a static poster — the <iframe> (and the game it boots: canvas,
 * audio context, asset loading, network round-trip) is NOT mounted, so the case
 * study stays light and nothing runs in the background. Because the click is a
 * real user gesture, the game's audio is allowed to start. Sized to the game's
 * own frame (its native ~16:9 aspect, capped at native width) rather than
 * stretched full-bleed.
 */
export default function GameEmbed({
  src,
  poster,
  title,
}: {
  src: string;
  poster?: string;
  title: string;
}) {
  const [loaded, setLoaded] = useState(false);

  return (
    <div
      className="overflow-hidden rounded-xl border"
      style={{
        borderColor: "rgba(45, 42, 38, 0.08)",
        width: "100%",
        maxWidth: 1000, // game's native width — don't upscale past it
        aspectRatio: "1000 / 577", // game's native frame
      }}
    >
      {loaded ? (
        <iframe
          src={src}
          title={`${title} — playable demo`}
          className="block w-full h-full"
          style={{ border: 0 }}
          allow="autoplay; fullscreen; gamepad"
        />
      ) : (
        <button
          type="button"
          onClick={() => setLoaded(true)}
          aria-label={`Play the ${title} demo`}
          className="group relative block w-full h-full cursor-pointer"
        >
          {poster && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={poster}
              alt=""
              className="absolute inset-0 w-full h-full object-cover"
            />
          )}
          <span className="absolute inset-0 flex items-center justify-center bg-black/30 transition-colors group-hover:bg-black/20">
            <span
              className="inline-flex items-center gap-2 font-mono text-xs tracking-widest uppercase px-5 py-2.5 rounded-full transition-transform group-hover:scale-105"
              style={{ backgroundColor: "var(--color-terracotta)", color: "var(--color-warm-white)" }}
            >
              <span aria-hidden>&#9654;</span> Play Demo
            </span>
          </span>
        </button>
      )}
    </div>
  );
}
