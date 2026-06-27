import Link from "next/link";

export const metadata = {
  title: "CHAD RESCUES NOBODY",
};

export default function ChadPage() {
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
        <Link
          href="/work/chad"
          style={{
            color: "#888",
            fontFamily: "monospace",
            fontSize: 12,
            textDecoration: "none",
          }}
        >
          back to case study
        </Link>
      </div>
      <iframe
        src="https://chad-pearl.vercel.app"
        title="CHAD RESCUES NOBODY"
        style={{ flex: 1, border: "none", width: "100%", background: "#0a0a1a" }}
        allow="autoplay"
      />
    </div>
  );
}
