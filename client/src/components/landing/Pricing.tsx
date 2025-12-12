import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { useContent } from "@/lib/contentContext";
import RegistrationModal from "./RegistrationModal";

export default function Pricing() {
  const { content } = useContent();
  const [isRegOpen, setIsRegOpen] = useState(false);

  return (
    <section id="pricing" className="py-24 bg-white dark:bg-navy-950">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-navy-900 dark:text-white mb-4">
            {content.pricing.titlePart1} <span className="text-gold-600">{content.pricing.titleHighlight}</span>
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            {content.pricing.description}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto items-start">
          {content.pricing.plans.map((plan, i) => (
            <div 
              key={i} 
              className={`relative p-8 rounded-3xl transition-all duration-300 flex flex-col ${
                plan.name.includes("VIP") 
                  ? "bg-gradient-to-br from-amber-900 via-yellow-800 to-amber-700 text-white shadow-2xl scale-105 z-10 border-2 border-gold-400 shadow-[0_0_40px_rgba(234,179,8,0.5)]" 
                  : plan.popular
                    ? "bg-navy-900 text-white shadow-2xl scale-105 z-10 border-2 border-gold-500/30 md:-translate-y-4"
                    : "bg-navy-800 text-white shadow-lg border border-navy-700"
              }`}
            >
              {plan.popular && !plan.name.includes("VIP") && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gold-500 text-navy-900 font-bold px-4 py-1 rounded-full text-sm uppercase tracking-wide">
                  Eng ommabop
                </div>
              )}

              {plan.name.includes("VIP") && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gold-500 text-navy-900 font-bold px-6 py-1.5 rounded-full text-sm uppercase tracking-wider shadow-[0_0_15px_rgba(234,179,8,0.6)]">
                  VIP PRESTIGE
                </div>
              )}
              
              <div className="text-center mb-8">
                <h3 className={`text-xl font-bold mb-2 ${plan.name.includes("VIP") ? "text-gold-300" : "text-inherit"}`}>{plan.name.replace(/\s*ONLAYN\s*/i, " ").trim()}</h3>
                <div className={`text-3xl font-serif font-bold mb-2 ${plan.name.includes("VIP") ? "text-white" : "text-inherit"}`}>{plan.price}</div>
                <p className={`text-sm ${plan.name.includes("VIP") ? "text-gold-200" : plan.popular ? "text-gray-300" : "text-gray-300"}`}>
                  {plan.desc}
                </p>
              </div>

              <ul className="space-y-4 mb-8">
                {plan.features.map((feat, j) => (
                  <li key={j} className="flex items-start gap-3 text-left">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                      plan.name.includes("VIP") 
                        ? "bg-gold-400 text-amber-900" 
                        : plan.popular 
                          ? "bg-gold-500 text-navy-900"
                          : "bg-navy-700 text-white"
                    }`}>
                      <Check size={12} strokeWidth={3} />
                    </div>
                    <span className={`text-sm ${plan.name.includes("VIP") ? "text-white" : plan.popular ? "text-gray-200" : "text-gray-300"}`}>{feat}</span>
                  </li>
                ))}
              </ul>

              <Button 
                className={`w-full py-6 rounded-xl font-bold text-lg ${
                  plan.name.includes("VIP")
                    ? "bg-gold-400 hover:bg-gold-300 text-amber-900 shadow-lg" 
                    : plan.popular 
                      ? "bg-gold-500 hover:bg-gold-600 text-navy-900" 
                      : "bg-navy-700 hover:bg-navy-600 text-white"
                }`}
                onClick={() => setIsRegOpen(true)}
              >
                {plan.buttonText}
              </Button>
            </div>
          ))}
        </div>
      </div>
      <RegistrationModal isOpen={isRegOpen} onClose={() => setIsRegOpen(false)} />
    </section>
  );
}
