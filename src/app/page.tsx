import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import GanttTimeline from "@/components/GanttTimeline";
import EraSection from "@/components/EraSection";
import MapSection from "@/components/MapSection";
import GallerySection from "@/components/GallerySection";
import Footer from "@/components/Footer";
import { eras } from "@/data/eras";

export default function Home() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <GanttTimeline />
        <EraSection era={eras[0]} />
        <MapSection />
        <EraSection era={eras[1]} />
        <EraSection era={eras[2]} />
        <EraSection era={eras[3]} />
        <GallerySection />
      </main>
      <Footer />
    </>
  );
}
