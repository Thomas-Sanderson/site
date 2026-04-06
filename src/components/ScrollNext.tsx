export default function ScrollNext({ href, label = "Continue" }: { href: string; label?: string }) {
  return (
    <div className="flex justify-center py-8">
      <a
        href={href}
        className="group flex flex-col items-center gap-1 font-mono text-[10px] tracking-widest uppercase transition-opacity hover:opacity-70"
        style={{ color: "var(--color-muted)" }}
      >
        {label}
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          className="transition-transform group-hover:translate-y-0.5"
        >
          <path
            d="M8 3v9m0 0l-3.5-3.5M8 12l3.5-3.5"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </a>
    </div>
  );
}
