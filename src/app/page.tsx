import Hero from "@/components/Hero";
import EraSection from "@/components/EraSection";
import MapSection from "@/components/MapSection";
import StoryDoors from "@/components/StoryDoors";
import ScrollNext from "@/components/ScrollNext";
import { eras } from "@/data/eras";

export default function Home() {
  return (
    <>
      <main>
        <Hero />
        <EraSection era={eras[0]} />
        <EraSection era={eras[1]} />
        <EraSection era={eras[2]} />
        <EraSection era={eras[3]} />
        <MapSection />
        <StoryDoors />
      </main>
      <ScrollNext />
    </>
  );
}
