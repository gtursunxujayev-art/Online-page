import { motion } from "framer-motion";
import { Calendar, CheckCircle2 } from "lucide-react";

const weeks = [
  {
    week: "1-hafta",
    title: "Poydevor va Psixologiya",
    topics: ["Sahna qo‘rquvi diagnostikasi", "O‘ziga ishonch psixologiyasi", "Notiqlikning oltin qoidalari"]
  },
  {
    week: "2-hafta",
    title: "Ovoz va Tana Tili",
    topics: ["Diafragma orqali nafas olish", "Diksiya va artikulyatsiya", "Jestlar va nigohlar bilan ishlash"]
  },
  {
    week: "3-hafta",
    title: "Nutq Strukturasi",
    topics: ["Fikrni tizimlash (Skelet metodi)", "Kirish, Asosiy qism, Xulosa", "Argumentlash san'ati"]
  },
  {
    week: "4-hafta",
    title: "Storytelling va Ta'sir",
    topics: ["Hikoya so‘zlash (Storytelling)", "Auditoriya bilan ishlash", "Qiyin savollarga javob berish"]
  },
  {
    week: "5-hafta",
    title: "Maxsus Texnikalar",
    topics: ["SPIN va FAB metodlari", "Debatlar va muzokaralar", "Kamera oldida ishlash"]
  },
  {
    week: "6-hafta",
    title: "Yakuniy Imtihon",
    topics: ["Katta sahnadagi chiqish", "Individual feedback", "Sertifikatlash"]
  }
];

export default function Program() {
  return (
    <section id="program" className="py-24 bg-navy-50 dark:bg-navy-900/50">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-navy-900 dark:text-white mb-4">
            6 Haftalik <span className="text-gold-600">Professional Dastur</span>
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Nazariyadan amaliyotga bosqichma-bosqich o‘tish tizimi.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {weeks.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-white dark:bg-navy-800 p-6 rounded-2xl shadow-sm hover:shadow-md transition-all border-l-4 border-gold-500"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-bold text-gold-600 uppercase tracking-wider bg-gold-50 dark:bg-gold-900/20 px-3 py-1 rounded-full">
                  {item.week}
                </span>
                <Calendar className="w-5 h-5 text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-navy-900 dark:text-white mb-4">
                {item.title}
              </h3>
              <ul className="space-y-3">
                {item.topics.map((topic, j) => (
                  <li key={j} className="flex items-start gap-2 text-gray-600 dark:text-gray-400 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-gold-500 mt-0.5 flex-shrink-0" />
                    <span>{topic}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
