import { siteConfig } from "@/data/siteConfig";

export default function Footer() {
  return (
    <footer
      id="contact"
      className="px-6 md:px-12 py-16 max-w-[960px] mx-auto w-full"
    >
      <div
        className="border-t pt-12"
        style={{ borderColor: "rgba(45, 42, 38, 0.15)" }}
      >
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
          <div>
            <h2 className="font-serif text-2xl font-bold mb-2">Get in touch</h2>
            <a
              href={`mailto:${siteConfig.email}`}
              className="font-mono text-sm underline underline-offset-4 decoration-1 hover:opacity-70 transition-opacity"
              style={{ color: "var(--color-terracotta)" }}
            >
              {siteConfig.email}
            </a>
          </div>
          <p className="font-mono text-xs" style={{ color: "var(--color-muted)" }}>
            {siteConfig.footer.builtWith}
          </p>
        </div>
      </div>
    </footer>
  );
}
