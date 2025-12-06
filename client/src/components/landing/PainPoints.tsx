import { motion } from "framer-motion";
import { MicOff, BrainCircuit, MessageSquareWarning, Users, FileQuestion, UserX } from "lucide-react";

const pains = [
  {
    icon: MicOff,
    title: "Sahnada hayajon",
    desc: "Odamlar oldida gapirganda hayajon bosadi, qo'l-oyoq qaltiraydi."
  },
  {
    icon: MessageSquareWarning,
    title: "So‘zlar chalkashligi",
    desc: "Gapirayotganda so‘zlar esdan chiqadi yoki chalkashib ketadi."
  },
  {
    icon: BrainCircuit,
    title: "Fikrni strukturalash qiyin",
    desc: "Miyadagi g'oyalarni tartibli va tushunarli qilib yetkaza olmaysiz."
  },
  {
    icon: Users,
    title: "Yig‘ilishlarda jimlik",
    desc: "Ishdagi yig‘ilishlarda o'z fikringizni aytishga tortinasiz."
  },
  {
    icon: UserX,
    title: "O‘ziga ishonchsizlik",
    desc: "Intervyu, taqdimot va sotuvlarda o‘ziga bo'lgan ishonch yetishmaydi."
  },
  {
    icon: FileQuestion,
    title: "Ta'sirsiz nutq",
    desc: "Gapirganingizda odamlar sizni tinglamaydi yoki tez zerikib qoladi."
  }
];

export default function PainPoints() {
  return (
    <section id="pain-points" className="py-24 bg-navy-50 dark:bg-navy-900">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-navy-900 dark:text-white mb-4">
            Sizga tanish <span className="text-red-500">muammolarmi?</span>
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Ko‘pchilik iqtidorli mutaxassislar aynan shu to‘siqlar sababli o‘z potensialini to‘liq namoyon eta olmaydilar.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {pains.map((pain, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-white dark:bg-navy-800 p-8 rounded-2xl shadow-sm hover:shadow-xl transition-all border border-transparent hover:border-gold-500/20 group"
            >
              <div className="w-14 h-14 bg-red-50 dark:bg-red-900/20 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <pain.icon className="w-7 h-7 text-red-500" />
              </div>
              <h3 className="text-xl font-bold text-navy-900 dark:text-white mb-3">
                {pain.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                {pain.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
