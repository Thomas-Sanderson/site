import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import MapSection from "@/components/MapSection";
import GanttTimeline from "@/components/GanttTimeline";
import EraSection from "@/components/EraSection";
import CaseStudySection from "@/components/CaseStudySection";
import ResumeSection from "@/components/ResumeSection";
import Footer from "@/components/Footer";
import { eras } from "@/data/eras";

export default function Home() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <MapSection />
        <GanttTimeline />
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
