"use client";

import { timelineEntries } from "@/data/timeline";
import { skillGroups, education } from "@/data/resume";

export default function ResumeSection() {
  const workEntries = timelineEntries
    .filter((e) => e.type !== "Education")
    .sort((a, b) => b.startMonth - a.startMonth);

  return (
    <section
      id="resume"
      className="px-6 md:px-12 py-24 max-w-[960px] mx-auto"
      style={{ fontFamily: "var(--font-mono, monospace)" }}
    >
      <p
        className="text-xs tracking-widest uppercase mb-4"
        style={{ color: "var(--color-muted)" }}
      >
        Resume
      </p>
      <h2
        className="text-3xl md:text-4xl font-bold mb-16"
        style={{ fontFamily: "var(--font-mono, monospace)" }}
      >
        Just the data.
      </h2>

      {/* Work History */}
      <div className="mb-16">
        <h3
          className="text-xs tracking-widest uppercase mb-6"
          style={{ color: "var(--color-terracotta)" }}
        >
          Work History
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr
                className="text-left text-xs tracking-wider uppercase"
                style={{ color: "var(--color-muted)" }}
              >
                <th className="pb-3 pr-4 font-normal">Dates</th>
                <th className="pb-3 pr-4 font-normal">Role</th>
                <th className="pb-3 pr-4 font-normal">Company</th>
                <th className="pb-3 font-normal hidden md:table-cell">Location</th>
              </tr>
            </thead>
            <tbody>
              {workEntries.map((entry, i) => (
                <tr
                  key={i}
                  className="border-t"
                  style={{ borderColor: "rgba(45, 42, 38, 0.08)" }}
                >
                  <td
                    className="py-2 pr-4 whitespace-nowrap align-top"
                    style={{ color: "var(--color-muted)" }}
                  >
                    {entry.start} – {entry.end}
                  </td>
                  <td className="py-2 pr-4 align-top">{entry.role}</td>
                  <td className="py-2 pr-4 align-top">{entry.company}</td>
                  <td
                    className="py-2 align-top hidden md:table-cell"
                    style={{ color: "var(--color-muted)" }}
                  >
                    {entry.location}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Skills */}
      <div className="mb-16">
        <h3
          className="text-xs tracking-widest uppercase mb-6"
          style={{ color: "var(--color-terracotta)" }}
        >
          Skills &amp; Tools
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
          {skillGroups.map((group) => (
            <div key={group.category}>
              <p
                className="text-xs uppercase tracking-wider mb-2"
                style={{ color: "var(--color-muted)" }}
              >
                {group.category}
              </p>
              <p className="text-sm leading-relaxed">
                {group.skills.join(" · ")}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Education */}
      <div>
        <h3
          className="text-xs tracking-widest uppercase mb-6"
          style={{ color: "var(--color-terracotta)" }}
        >
          Education
        </h3>
        {education.map((edu) => (
          <div key={edu.institution} className="text-sm">
            <p className="font-bold">{edu.institution}</p>
            <p style={{ color: "var(--color-muted)" }}>
              {edu.degree} · {edu.year} · {edu.location}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
