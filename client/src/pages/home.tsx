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

export default function Home() {
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
