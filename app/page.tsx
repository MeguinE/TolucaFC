import Hero from "@/components/hero";

import Footer from "@/components/footer";

import TrainingSection from "@/components/training-section.client";

import AboutSection from "@/components/about-section";

import PlayerRegistrationForm from "@/components/player-registration-form";
import { Suspense } from "react";
export default function Home() {
  return (
    <main className="min-h-screen flex flex-col">
      {/* NAV FULL WIDTH *

      {/* HERO FULL WIDTH */}
      <Hero />
      <AboutSection />
      <Suspense
        fallback={
          <section className="w-full py-20 bg-[#070708] text-white">
            <div className="mx-auto max-w-7xl px-6 md:px-10">
              <div className="rounded-3xl border border-white/10 bg-white/5 p-8">
                <div className="h-6 w-56 bg-white/10 rounded mb-4" />
                <div className="h-4 w-full bg-white/10 rounded mb-2" />
                <div className="h-4 w-2/3 bg-white/10 rounded" />
              </div>
            </div>
          </section>
        }
      >
        <TrainingSection />
      </Suspense>
      <PlayerRegistrationForm />
      <Footer />
    </main>
  );
}
