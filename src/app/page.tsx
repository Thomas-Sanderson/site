import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import GanttTimeline from "@/components/GanttTimeline";
import MapSection from "@/components/MapSection";
import CaseStudySection from "@/components/CaseStudySection";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <GanttTimeline />
        <MapSection />
        <CaseStudySection />
      </main>
      <Footer />
    </>
  );
}
