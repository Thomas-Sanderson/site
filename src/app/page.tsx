import Nav from "@/components/Nav";
import StickyGantt from "@/components/StickyGantt";
import Hero from "@/components/Hero";
import MapSection from "@/components/MapSection";
import CaseStudySection from "@/components/CaseStudySection";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Nav />
      <StickyGantt />
      <main>
        <Hero />
        <MapSection />
        <CaseStudySection />
      </main>
      <Footer />
    </>
  );
}
