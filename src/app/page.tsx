import TimelineBar from "@/components/TimelineBar";
import Hero from "@/components/Hero";
import GanttTimeline from "@/components/GanttTimeline";
import MapSection from "@/components/MapSection";
import EraSection from "@/components/EraSection";
import CaseStudySection from "@/components/CaseStudySection";
import ResumeSection from "@/components/ResumeSection";
import Footer from "@/components/Footer";
import { eras } from "@/data/eras";

export default function Home() {
  return (
    <>
      <TimelineBar />
      <main>
        <Hero />
        <GanttTimeline />
        <MapSection />
        <EraSection era={eras[0]} />
        <EraSection era={eras[1]} />
        <EraSection era={eras[2]} />
        <EraSection era={eras[3]} />
        <CaseStudySection />
        <ResumeSection />
      </main>
      <Footer />
    </>
  );
}
