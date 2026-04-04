"use client";

import { useState, useMemo, useCallback } from "react";
import { buildContentItems, type ContentItem } from "@/data/content";

const EDITABLE_FIELDS: (keyof ContentItem)[] = [
  "description",
  "role",
  "type",
  "industries",
  "city",
  "country",
  "lat",
  "lng",
  "start",
  "end",
  "dateRange",
  "category",
];

const CATEGORY_OPTIONS = [
  "work",
  "art",
  "volunteer",
  "travel",
  "want-to-visit",
  "see",
];

function countNulls(item: ContentItem): number {
  return EDITABLE_FIELDS.filter((f) => item[f] === null).length;
}

export default function ContentQuiz({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const baseItems = useMemo(() => buildContentItems(), []);
  const [edits, setEdits] = useState<Record<string, Partial<ContentItem>>>({});
  const [index, setIndex] = useState(0);
  const [gapsOnly, setGapsOnly] = useState(false);

  const items = useMemo(() => {
    return baseItems.map((item) => ({ ...item, ...edits[item.id] }));
  }, [baseItems, edits]);

  const filtered = useMemo(() => {
    if (!gapsOnly) return items;
    return items.filter((item) => countNulls(item) > 0);
  }, [items, gapsOnly]);

  const current = filtered[index] ?? null;
  const total = filtered.length;

  const setField = useCallback(
    (field: keyof ContentItem, value: string) => {
      if (!current) return;
      setEdits((prev) => {
        const existing = prev[current.id] || {};
        let parsed: unknown = value || null;
        if (field === "lat" || field === "lng") {
          const n = parseFloat(value);
          parsed = isNaN(n) ? null : n;
        } else if (field === "industries") {
          parsed = value
            ? value.split(",").map((s) => s.trim()).filter(Boolean)
            : null;
        }
        return { ...prev, [current.id]: { ...existing, [field]: parsed } };
      });
    },
    [current]
  );

  const handleCopy = useCallback(() => {
    const json = JSON.stringify(items, null, 2);
    navigator.clipboard.writeText(json);
  }, [items]);

  const handleDownload = useCallback(() => {
    const json = JSON.stringify(items, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "content-items.json";
    a.click();
    URL.revokeObjectURL(url);
  }, [items]);

  if (!open) return null;

  const nullCount = current ? countNulls(current) : 0;
  const totalNulls = items.reduce((sum, item) => sum + countNulls(item), 0);

  return (
    <div
      className="fixed inset-0 z-[100] bg-charcoal/95 flex flex-col"
      style={{ backdropFilter: "blur(12px)" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
        <div className="flex items-center gap-4">
          <h2 className="font-serif font-bold text-lg text-white">
            Content Quiz
          </h2>
          <span className="font-mono text-xs text-white/40">
            {total} items &middot; {totalNulls} gaps remaining
          </span>
        </div>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={gapsOnly}
              onChange={(e) => {
                setGapsOnly(e.target.checked);
                setIndex(0);
              }}
              className="accent-[var(--color-terracotta)]"
            />
            <span className="font-mono text-xs text-white/60">
              Only show gaps
            </span>
          </label>
          <button
            onClick={handleCopy}
            className="font-mono text-xs px-3 py-1.5 rounded-full border border-white/20 text-white/70 hover:text-white hover:border-white/40 transition-colors"
          >
            Copy JSON
          </button>
          <button
            onClick={handleDownload}
            className="font-mono text-xs px-3 py-1.5 rounded-full border border-white/20 text-white/70 hover:text-white hover:border-white/40 transition-colors"
          >
            Download
          </button>
          <button
            onClick={onClose}
            className="font-mono text-xs px-3 py-1.5 rounded-full border border-white/20 text-white/70 hover:text-white hover:border-white/40 transition-colors"
          >
            Close
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1 bg-white/5">
        <div
          className="h-full transition-all duration-300"
          style={{
            width: total > 0 ? `${((index + 1) / total) * 100}%` : "0%",
            backgroundColor: "var(--color-terracotta)",
          }}
        />
      </div>

      {/* Content */}
      {current ? (
        <div className="flex-1 overflow-y-auto px-6 py-8 max-w-3xl mx-auto w-full">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="font-mono text-xs text-white/40 mb-1">
                {index + 1} / {total} &middot; {current.source}
              </p>
              <h3 className="font-serif font-bold text-xl text-white">
                {current.label}
              </h3>
            </div>
            {nullCount === 0 && (
              <span className="font-mono text-xs px-3 py-1 rounded-full bg-green-500/20 text-green-400">
                Complete
              </span>
            )}
          </div>

          <div className="grid gap-4">
            {EDITABLE_FIELDS.map((field) => {
              const value = current[field];
              const isNull = value === null;
              const displayValue =
                value === null
                  ? ""
                  : Array.isArray(value)
                    ? value.join(", ")
                    : String(value);

              return (
                <div key={field}>
                  <label className="block font-mono text-xs text-white/50 mb-1">
                    {field}
                    {isNull && (
                      <span className="text-amber-400/70 ml-2">null</span>
                    )}
                  </label>
                  {field === "category" ? (
                    <select
                      value={displayValue}
                      onChange={(e) => setField(field, e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 font-mono text-sm text-white focus:outline-none focus:border-white/30"
                    >
                      <option value="">—</option>
                      {CATEGORY_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      value={displayValue}
                      onChange={(e) => setField(field, e.target.value)}
                      placeholder={isNull ? "Enter value..." : ""}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 font-mono text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-white/30"
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <p className="font-mono text-white/40">No items to show.</p>
        </div>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between px-6 py-4 border-t border-white/10">
        <button
          onClick={() => setIndex((i) => Math.max(0, i - 1))}
          disabled={index === 0}
          className="font-mono text-xs px-4 py-2 rounded-full border border-white/20 text-white/70 hover:text-white hover:border-white/40 transition-colors disabled:opacity-30 disabled:pointer-events-none"
        >
          Prev
        </button>
        <button
          onClick={() => setIndex((i) => Math.min(total - 1, i + 1))}
          disabled={index >= total - 1}
          className="font-mono text-xs px-4 py-2 rounded-full border border-white/20 text-white/70 hover:text-white hover:border-white/40 transition-colors disabled:opacity-30 disabled:pointer-events-none"
        >
          {index >= total - 1 ? "Done" : "Next"}
        </button>
      </div>
    </div>
  );
}
