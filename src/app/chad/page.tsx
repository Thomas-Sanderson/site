"use client";

import { useState, useRef, useEffect } from "react";

const CHAD_PASSCODE = "grib";
const CHAD_STORAGE_KEY = "chad-unlocked";

export default function ChadPage() {
  const [unlocked, setUnlocked] = useState(false);
  const [value, setValue] = useState("");
  const [error, setError] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (sessionStorage.getItem(CHAD_STORAGE_KEY) === "true") {
      setUnlocked(true);
    }
  }, []);

  useEffect(() => {
    if (!unlocked) inputRef.current?.focus();
  }, [unlocked]);

  if (unlocked) {
    return (
      <div
        style={{
          position: "fixed",
          inset: 0,
          background: "#0a0a1a",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <style>{`
          html, body { background: #0a0a1a !important; }
          body::before { display: none !important; }
          [aria-hidden="true"] { background-color: #0a0a1a !important; }
        `}</style>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "8px 16px",
            background: "#1a1a2e",
            borderBottom: "1px solid #2a2a3e",
          }}
        >
          <span style={{ color: "#FFD54F", fontFamily: "monospace", fontSize: 14 }}>
            CHAD RESCUES NOBODY
          </span>
          <a
            href="/"
            style={{
              color: "#888",
              fontFamily: "monospace",
              fontSize: 12,
              textDecoration: "none",
            }}
          >
            back to site
          </a>
        </div>
        <iframe
          src="https://chad-pearl.vercel.app"
          style={{ flex: 1, border: "none", width: "100%", background: "#0a0a1a" }}
          allow="autoplay"
        />
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.toLowerCase() === CHAD_PASSCODE) {
      sessionStorage.setItem(CHAD_STORAGE_KEY, "true");
      setUnlocked(true);
    } else {
      setError(true);
      setValue("");
      inputRef.current?.focus();
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "#1a1a2e",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        gap: 24,
      }}
    >
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 48, marginBottom: 8 }}>&#x1F955;</div>
        <h1
          style={{
            color: "#FFD54F",
            fontFamily: "monospace",
            fontSize: 18,
            letterSpacing: 2,
            marginBottom: 4,
          }}
        >
          CLASSIFIED
        </h1>
        <p
          style={{
            color: "#666",
            fontFamily: "monospace",
            fontSize: 12,
          }}
        >
          You found something. What&apos;s the word?
        </p>
      </div>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => { setValue(e.target.value); setError(false); }}
          placeholder="..."
          style={{
            width: 200,
            background: "transparent",
            border: "none",
            borderBottom: "2px solid #FFD54F33",
            color: "#FFD54F",
            fontFamily: "monospace",
            fontSize: 18,
            textAlign: "center",
            padding: "8px 0",
            outline: "none",
          }}
          autoComplete="off"
        />
        {error && (
          <p style={{ color: "#cc4444", fontFamily: "monospace", fontSize: 12 }}>
            Chad doesn&apos;t know that word.
          </p>
        )}
        <button
          type="submit"
          style={{
            background: "#FFD54F",
            color: "#1a1a2e",
            border: "none",
            borderRadius: 20,
            padding: "8px 24px",
            fontFamily: "monospace",
            fontSize: 12,
            fontWeight: "bold",
            letterSpacing: 2,
            cursor: "pointer",
            textTransform: "uppercase",
          }}
        >
          Enter
        </button>
      </form>
    </div>
  );
}
