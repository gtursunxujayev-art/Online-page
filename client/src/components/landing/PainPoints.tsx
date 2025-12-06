import { motion } from "framer-motion";
import { MicOff, BrainCircuit, MessageSquareWarning, Users, FileQuestion, UserX } from "lucide-react";
import { useContent } from "@/lib/contentContext";

// Static mapping for icons since we can't store functions in JSON/Context easily if we want it to be serializable for localStorage
// In a real app we might store icon name string and map it.
const iconMap = [MicOff, MessageSquareWarning, BrainCircuit, Users, UserX, FileQuestion];

export default function PainPoints() {
  const { content } = useContent();

  return (
    <section id="pain-points" className="py-24 bg-navy-50 dark:bg-navy-900">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-navy-900 dark:text-white mb-4">
            {content.painPoints.titlePart1} <span className="text-red-500">{content.painPoints.titleHighlight}</span>
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            {content.painPoints.description}
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {content.painPoints.items.map((pain, i) => {
            const Icon = iconMap[i % iconMap.length]; // Fallback to cycling icons if array length changes
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white dark:bg-navy-800 p-8 rounded-2xl shadow-sm hover:shadow-xl transition-all border border-transparent hover:border-gold-500/20 group"
              >
                <div className="w-14 h-14 bg-red-50 dark:bg-red-900/20 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Icon className="w-7 h-7 text-red-500" />
                </div>
                <h3 className="text-xl font-bold text-navy-900 dark:text-white mb-3">
                  {pain.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  {pain.desc}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
