"use client";

import { useState, useEffect, useRef, type ReactNode } from "react";

const PASSCODE = process.env.NEXT_PUBLIC_SITE_PASSCODE;
const STORAGE_KEY = "site-unlocked";

export default function PasscodeGate({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const [value, setValue] = useState("");
  const [error, setError] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
    if (!PASSCODE || sessionStorage.getItem(STORAGE_KEY) === "true") {
      setUnlocked(true);
    }
  }, []);

  useEffect(() => {
    if (mounted && !unlocked) {
      document.body.style.overflow = "hidden";
      inputRef.current?.focus();
      return () => {
        document.body.style.overflow = "";
      };
    }
  }, [mounted, unlocked]);

  if (!mounted) return null;
  if (unlocked) return <>{children}</>;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value === PASSCODE) {
      sessionStorage.setItem(STORAGE_KEY, "true");
      document.body.style.overflow = "";
      setUnlocked(true);
    } else {
      setError(true);
      setValue("");
      inputRef.current?.focus();
    }
  };

  return (
    <div
      style={{ position: "fixed", inset: 0, zIndex: 10000 }}
      className="flex items-center justify-center bg-cream"
    >
      <form onSubmit={handleSubmit} className="flex flex-col items-center gap-6">
        <h1 className="font-serif text-2xl text-charcoal">Thomas</h1>
        <p className="font-mono text-xs tracking-widest uppercase text-muted">
          Enter passcode to continue
        </p>
        <input
          ref={inputRef}
          type="password"
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            setError(false);
          }}
          className="w-64 bg-transparent text-center font-mono text-lg text-charcoal border-b-2 border-charcoal/30 focus:border-terracotta outline-none pb-2 transition-colors"
          autoComplete="off"
        />
        {error && (
          <p className="font-mono text-xs text-terracotta">Incorrect passcode</p>
        )}
        <button
          type="submit"
          className="px-6 py-2 bg-terracotta text-cream font-mono text-xs uppercase tracking-widest rounded-full hover:opacity-90 transition-opacity"
        >
          Enter
        </button>
      </form>
    </div>
  );
}
