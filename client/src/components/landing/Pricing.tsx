import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

const plans = [
  {
    name: "Online",
    price: "1,500,000 so‘m",
    desc: "Masofadan turib o‘qish uchun",
    features: ["6 hafta online darslar", "Uyga vazifalar", "Telegram yopiq guruh", "Sertifikat"],
    popular: false
  },
  {
    name: "Offline",
    price: "2,500,000 so‘m",
    desc: "Jonli muloqot va amaliyot",
    features: ["6 hafta offline darslar", "Kamera qarshisida ishlash", "Individual feedback", "Networking", "Sertifikat"],
    popular: true
  },
  {
    name: "VIP",
    price: "5,000,000 so‘m",
    desc: "Shaxsiy mentorlik",
    features: ["Offline darslar", "Shaxsiy mentor biriktiriladi", "Biznesga moslashtirilgan dastur", "Tushlik mentor bilan", "VIP Sertifikat"],
    popular: false
  }
];

export default function Pricing() {
  return (
    <section id="pricing" className="py-24 bg-white dark:bg-navy-950">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-navy-900 dark:text-white mb-4">
            Kurs <span className="text-gold-600">Narxlari</span>
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            O‘zingizga mos ta’lim formatini tanlang
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto items-center">
          {plans.map((plan, i) => (
            <div 
              key={i} 
              className={`relative p-8 rounded-3xl transition-all duration-300 ${
                plan.popular 
                  ? "bg-navy-900 text-white shadow-2xl scale-105 z-10 border-2 border-gold-500" 
                  : "bg-white dark:bg-navy-800 text-navy-900 dark:text-white shadow-lg border border-gray-100 dark:border-navy-700"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gold-500 text-navy-900 font-bold px-4 py-1 rounded-full text-sm uppercase tracking-wide">
                  Eng ommabop
                </div>
              )}
              
              <div className="text-center mb-8">
                <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                <div className="text-3xl font-serif font-bold mb-2">{plan.price}</div>
                <p className={`text-sm ${plan.popular ? "text-gray-300" : "text-gray-500 dark:text-gray-400"}`}>
                  {plan.desc}
                </p>
              </div>

              <ul className="space-y-4 mb-8">
                {plan.features.map((feat, j) => (
                  <li key={j} className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
                      plan.popular ? "bg-gold-500 text-navy-900" : "bg-navy-100 dark:bg-navy-700 text-navy-900 dark:text-white"
                    }`}>
                      <Check size={12} strokeWidth={3} />
                    </div>
                    <span className="text-sm">{feat}</span>
                  </li>
                ))}
              </ul>

              <Button 
                className={`w-full py-6 rounded-xl font-bold text-lg ${
                  plan.popular 
                    ? "bg-gold-500 hover:bg-gold-600 text-navy-900" 
                    : "bg-navy-900 hover:bg-navy-800 text-white dark:bg-white dark:text-navy-900 dark:hover:bg-gray-200"
                }`}
              >
                Tanlash
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
