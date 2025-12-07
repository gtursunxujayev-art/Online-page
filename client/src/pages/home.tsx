import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import PainPoints from "@/components/landing/PainPoints";
import Methodology from "@/components/landing/Methodology";
import Program from "@/components/landing/Program";
import Mentors from "@/components/landing/Mentors";
import Testimonials from "@/components/landing/Testimonials";
import Pricing from "@/components/landing/Pricing";
import FAQ from "@/components/landing/FAQ";
import Footer from "@/components/landing/Footer";
import { useEffect } from "react";
import { useLocation } from "wouter";

export default function Home({ params }: { params?: { section?: string } }) {
  const [location] = useLocation();

  useEffect(() => {
    // Check either params or direct location hash/path logic if needed
    // But since we use hash routing, params.section is populated by the Route path="/:section"
    
    if (params?.section) {
      // Small timeout to ensure DOM is ready if it's a fresh mount
      setTimeout(() => {
        const element = document.getElementById(params.section!);
        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
        }
      }, 100);
    }
  }, [params?.section, location]);

  return (
    <div className="min-h-screen bg-white dark:bg-navy-950 font-sans text-navy-900 dark:text-gray-100">
      <Navbar />
      <Hero />
      <PainPoints />
      <Methodology />
      <Program />
      <Mentors />
      <Testimonials />
      <Pricing />
      <FAQ />
      <Footer />
    </div>
  );
}
