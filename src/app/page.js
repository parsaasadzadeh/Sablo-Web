import Header from "@/components/landing/Header";
import HeroSection from "@/components/landing/HeroSection";
import StatsSection from "@/components/landing/StatsSection";
import FeaturesSection from "@/components/landing/FeaturesSection";
import TestimonialsSection from "@/components/landing/TestimonialsSection";
import CtaSection from "@/components/landing/CtaSection";
import Footer from "@/components/landing/Footer";

export default function Home() {
  return (
    <div dir="rtl" lang="fa" className="min-h-screen bg-[#F7F4EE] font-sans text-[#26241F]">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Vazirmatn:wght@400;500;600;700;800&display=swap');
        .font-sans { font-family: 'Vazirmatn', sans-serif; }
        .tabular { font-feature-settings: "tnum"; }
      `}</style>

      <Header />

      <main className="max-w-6xl mx-auto px-6 py-12 md:py-20">
        <HeroSection />
        <StatsSection />
        <FeaturesSection />
        <TestimonialsSection />
        <CtaSection />
      </main>

      <Footer />
    </div>
  );
}