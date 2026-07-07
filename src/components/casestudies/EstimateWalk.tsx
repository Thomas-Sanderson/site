"use client";

import { useState } from "react";

/**
 * The live estimate walk — the Couve case study's interactive artifact.
 * Runs the estimator's benefit math in-page: the deductible drains first,
 * coinsurance kicks in, the out-of-pocket max caps the total, and every
 * session after is $0. Three sliders, real arithmetic, no screenshot.
 *
 * Client component (the only one on the page besides Reveal).
 */

const RATE = 800; // $/day at this level of care
const MAX_SESSIONS = 30;

type Row = { from: number; to: number; pay: number; label: string };

function walk(deductible: number, coinsurance: number, oopMax: number) {
  const pays: number[] = [];
  const labels: string[] = [];
  let ded = deductible;
  let oop = oopMax;
  for (let s = 0; s < MAX_SESSIONS && oop > 0; s++) {
    const dedPart = Math.min(ded, RATE);
    let pay = dedPart + (RATE - dedPart) * coinsurance;
    pay = Math.min(pay, oop);
    labels.push(pay === 0 ? "OOP max reached" : dedPart > 0 ? "deductible" : "coinsurance");
    ded -= dedPart;
    oop -= pay;
    pays.push(Math.round(pay));
  }
  const rows: Row[] = [];
  let i = 0;
  while (i < pays.length && rows.length < 5) {
    let j = i;
    while (j + 1 < pays.length && pays[j + 1] === pays[i]) j++;
    rows.push({ from: i + 1, to: j + 1, pay: pays[i], label: labels[i] });
    i = j + 1;
  }
  return { rows, sessions: pays.length, total: Math.round(pays.reduce((a, b) => a + b, 0)), capped: oop <= 0 };
}

const fmt = (n: number) => "$" + n.toLocaleString("en-US");

function Knob({
  label,
  value,
  display,
  min,
  max,
  step,
  onChange,
}: {
  label: string;
  value: number;
  display: string;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <label className="flex justify-between font-mono text-[11.5px] mb-1" style={{ color: "var(--color-muted)" }}>
        {label}
        <output className="font-semibold" style={{ color: "var(--color-charcoal)" }}>{display}</output>
      </label>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        aria-label={label}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full"
        style={{ accentColor: "var(--color-teal)" }}
      />
    </div>
  );
}

export default function EstimateWalk() {
  const [ded, setDed] = useState(800);
  const [coi, setCoi] = useState(25);
  const [oop, setOop] = useState(2000);
  const r = walk(ded, coi / 100, oop);

  return (
    <div
      className="rounded-xl px-6 py-6 sm:px-7 mt-8"
      style={{ backgroundColor: "var(--color-warm-white)", border: "1px solid rgba(45,42,38,0.1)", borderLeft: "3px solid var(--color-teal)" }}
    >
      <p className="font-mono text-[11.5px] font-semibold uppercase tracking-[0.13em] mb-4" style={{ color: "var(--color-teal)" }}>
        ▶ Live — this is math, not a screenshot
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-5 gap-y-3 mb-4">
        <Knob label="Deductible remaining" value={ded} display={fmt(ded)} min={0} max={4000} step={100} onChange={setDed} />
        <Knob label="Coinsurance" value={coi} display={coi + "%"} min={0} max={50} step={5} onChange={setCoi} />
        <Knob label="Out-of-pocket max remaining" value={oop} display={fmt(oop)} min={500} max={8000} step={250} onChange={setOop} />
      </div>

      <div className="rounded-[10px] overflow-hidden" style={{ border: "1px solid rgba(45,42,38,0.1)" }} aria-live="polite">
        {r.rows.map((row) => (
          <div
            key={row.from}
            className="grid grid-cols-[96px_1fr_84px] gap-3.5 items-center px-4 py-2"
            style={{ borderBottom: "1px solid rgba(45,42,38,0.08)" }}
          >
            <div className="font-mono text-[12px] font-medium" style={{ color: "var(--color-charcoal)" }}>
              {row.from === row.to ? row.from : `${row.from}–${row.to}`}
              <small className="block text-[10.5px] font-normal" style={{ color: "var(--color-muted)" }}>{row.label}</small>
            </div>
            <div className="h-[13px] rounded relative overflow-hidden" style={{ backgroundColor: "rgba(42,107,90,0.12)" }}>
              <i className="absolute inset-y-0 left-0 rounded" style={{ width: `${Math.min(100, (row.pay / RATE) * 100)}%`, backgroundColor: "#C0902E" }} />
            </div>
            <div className="font-mono text-[13px] font-semibold text-right" style={{ color: row.pay === 0 ? "var(--color-teal)" : "var(--color-charcoal)" }}>
              {fmt(row.pay)}
              {row.from !== row.to && row.pay > 0 ? " ea" : ""}
            </div>
          </div>
        ))}
        {r.capped && (
          <div className="grid grid-cols-[96px_1fr_84px] gap-3.5 items-center px-4 py-2" style={{ borderBottom: "1px solid rgba(45,42,38,0.08)" }}>
            <div className="font-mono text-[12px] font-medium" style={{ color: "var(--color-charcoal)" }}>
              {r.sessions + 1}+
              <small className="block text-[10.5px] font-normal" style={{ color: "var(--color-muted)" }}>plan pays 100%</small>
            </div>
            <div className="h-[13px] rounded" style={{ backgroundColor: "rgba(42,107,90,0.12)" }} />
            <div className="font-mono text-[13px] font-semibold text-right" style={{ color: "var(--color-teal)" }}>$0</div>
          </div>
        )}
        <div className="flex justify-between items-baseline px-4 py-3" style={{ backgroundColor: "rgba(45,42,38,0.035)" }}>
          <span className="font-mono text-[12px]" style={{ color: "var(--color-muted)" }}>
            Total patient responsibility, knowable on day zero
          </span>
          <b className="font-mono text-[15px]" style={{ color: "var(--color-charcoal)" }}>{fmt(r.total)}</b>
        </div>
      </div>

      <figcaption className="font-mono text-[12.5px] mt-3.5 leading-[1.5]" style={{ color: "var(--color-muted)" }}>
        The estimator&rsquo;s benefit walk, running in this page at a {fmt(RATE)}/day level of care. Drag the sliders —{" "}
        <span style={{ color: "var(--color-charcoal)" }}>the patient&rsquo;s answer updates the way the product computes it.</span>
      </figcaption>
    </div>
  );
}
