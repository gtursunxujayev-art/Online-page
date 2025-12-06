import { motion } from "framer-motion";
import { Check, Mic, Brain, Sparkles, Volume2, Timer } from "lucide-react";

const methods = [
  {
    icon: Brain,
    title: "Psixologik tayyorgarlik",
    desc: "Sahna qo‘rquvini yo‘qotish bo‘yicha maxsus psixologik mashqlar va texnikalar."
  },
  {
    icon: Volume2,
    title: "Ovoz va Diksiya",
    desc: "Notiq ovozini qurish, to‘g‘ri nafas olish, pauza va ritmni boshqarish."
  },
  {
    icon: Timer,
    title: "30 Sekund Qoidasi",
    desc: "Fikrni 30 sekundda aniq, lo‘nda va ta’sirchan ifodalash metodlari."
  },
  {
    icon: Sparkles,
    title: "Storytelling",
    desc: "Empatiya uyg‘otish, hikoya qilish va auditoriyani ishontirish san'ati."
  }
];

export default function Methodology() {
  return (
    <section id="methodology" className="py-24 bg-white dark:bg-navy-950 overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <div className="inline-block px-4 py-1 rounded-full bg-navy-50 text-navy-900 text-sm font-bold uppercase tracking-wider">
              Bizning yondashuv
            </div>
            
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-navy-900 dark:text-white leading-tight">
              Biz sizni qanday <span className="text-gold-600">o‘zgartiramiz?</span>
            </h2>
            
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Nazariya va amaliyotning mukammal uyg‘unligi. Biz shunchaki leksiya o‘qimaymiz, biz sizni haqiqiy notiqqa aylantiramiz.
            </p>

            <div className="grid sm:grid-cols-2 gap-6 pt-4">
              {methods.map((item, i) => (
                <div key={i} className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gold-100 dark:bg-gold-900/20 flex items-center justify-center text-gold-600">
                    <item.icon size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-navy-900 dark:text-white mb-1">{item.title}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative"
          >
            {/* Abstract Visual Representation of Transformation */}
            <div className="relative aspect-square md:aspect-[4/3] bg-navy-900 rounded-3xl overflow-hidden shadow-2xl">
               <div className="absolute inset-0 bg-gradient-to-br from-navy-800 to-black opacity-80" />
               <div className="absolute inset-0 flex items-center justify-center">
                 <div className="text-center p-8">
                   <div className="text-6xl font-bold text-gold-500 mb-2">1000+</div>
                   <div className="text-xl text-white font-medium">Muvaffaqiyatli bitiruvchilar</div>
                   <div className="mt-8 flex justify-center gap-2">
                     {[1,2,3,4,5].map(n => (
                       <div key={n} className="w-2 h-2 rounded-full bg-white/20" />
                     ))}
                   </div>
                 </div>
               </div>
               
               {/* Floating cards */}
               <motion.div 
                 animate={{ y: [0, -10, 0] }}
                 transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                 className="absolute top-10 right-10 bg-white p-4 rounded-xl shadow-lg max-w-[200px]"
               >
                 <div className="flex items-center gap-2 mb-2">
                   <div className="w-2 h-2 bg-green-500 rounded-full" />
                   <span className="text-xs font-bold text-navy-900">Natija</span>
                 </div>
                 <p className="text-xs text-gray-600">"Endi sahnada o‘zimni erkin his qilaman!"</p>
               </motion.div>

               <motion.div 
                 animate={{ y: [0, 15, 0] }}
                 transition={{ repeat: Infinity, duration: 5, ease: "easeInOut", delay: 1 }}
                 className="absolute bottom-10 left-10 bg-white p-4 rounded-xl shadow-lg max-w-[200px]"
               >
                  <div className="flex items-center gap-2 mb-2">
                   <div className="w-2 h-2 bg-gold-500 rounded-full" />
                   <span className="text-xs font-bold text-navy-900">Texnika</span>
                 </div>
                 <p className="text-xs text-gray-600">SPIN va FAB metodlari orqali sotuvlarim oshdi.</p>
               </motion.div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
