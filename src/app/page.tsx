import TimelineBar from "@/components/TimelineBar";
import Hero from "@/components/Hero";
import GanttTimeline from "@/components/GanttTimeline";
import MapSection from "@/components/MapSection";
import EraSection from "@/components/EraSection";
import CaseStudySection from "@/components/CaseStudySection";
import ResumeSection from "@/components/ResumeSection";
import Footer from "@/components/Footer";
import ScrollNext from "@/components/ScrollNext";
import { eras } from "@/data/eras";

export default function Home() {
  return (
    <>
      <TimelineBar />
      <main>
        <Hero />
        <GanttTimeline />
        <ScrollNext href="#map" label="World" />
        <MapSection />
        <ScrollNext href="#era-consulting" label="Eras" />
        <EraSection era={eras[0]} />
        <ScrollNext href="#era-art" />
        <EraSection era={eras[1]} />
        <ScrollNext href="#era-behavioral-health" />
        <EraSection era={eras[2]} />
        <ScrollNext href="#era-acceleration" />
        <EraSection era={eras[3]} />
        <ScrollNext href="#case-studies" label="Case Studies" />
        <CaseStudySection />
        <ScrollNext href="#resume" label="Resume" />
        <ResumeSection />
        <ScrollNext href="#contact" label="Get in Touch" />
      </main>
      <Footer />
    </>
  );
}
