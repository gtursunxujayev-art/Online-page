import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Menu, X, Phone } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Muammolar", href: "#pain-points" },
    { name: "Metodika", href: "#methodology" },
    { name: "Dastur", href: "#program" },
    { name: "Mentorlar", href: "#mentors" },
    { name: "Natijalar", href: "#results" },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/80 dark:bg-navy-900/80 backdrop-blur-md shadow-sm py-4"
          : "bg-transparent py-6"
      }`}
    >
      <div className="container mx-auto px-4 flex items-center justify-between">
        {/* Logo */}
        <a href="#" className="text-2xl font-serif font-bold tracking-tight text-navy-900 dark:text-white">
          Najot Nur <span className="text-gold-600">Notiqlik</span>
        </a>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              className={`text-sm font-medium transition-colors hover:text-gold-600 ${
                scrolled ? "text-navy-900 dark:text-white" : "text-navy-900 dark:text-white"
              }`}
            >
              {link.name}
            </a>
          ))}
          <Button className="bg-gold-500 hover:bg-gold-600 text-navy-900 font-semibold rounded-full px-6">
            Kursga yozilish
          </Button>
        </div>

        {/* Mobile Toggle */}
        <button
          className="md:hidden text-navy-900 dark:text-white"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white dark:bg-navy-900 border-t border-gray-100 dark:border-navy-800"
          >
            <div className="flex flex-col p-4 gap-4">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className="text-navy-900 dark:text-white font-medium py-2"
                  onClick={() => setIsOpen(false)}
                >
                  {link.name}
                </a>
              ))}
              <Button className="w-full bg-gold-500 hover:bg-gold-600 text-navy-900 font-semibold">
                Kursga yozilish
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
