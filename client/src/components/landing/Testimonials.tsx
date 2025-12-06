import { motion } from "framer-motion";
import { Quote } from "lucide-react";
import { useContent } from "@/lib/contentContext";

export default function Testimonials() {
  const { content } = useContent();

  return (
    <section id="results" className="py-24 bg-navy-900 text-white overflow-hidden relative">
      {/* Background decorations */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gold-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4">
            {content.testimonials.titlePart1} <span className="text-gold-500">{content.testimonials.titleHighlight}</span>
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {content.testimonials.items.map((review, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.2 }}
              className="bg-white/5 backdrop-blur-sm border border-white/10 p-8 rounded-2xl hover:bg-white/10 transition-colors"
            >
              <Quote className="text-gold-500 w-10 h-10 mb-6 opacity-50" />
              <p className="text-gray-300 italic mb-6 leading-relaxed">
                "{review.text}"
              </p>
              <div>
                <h4 className="font-bold text-white text-lg">{review.name}</h4>
                <p className="text-gold-500/80 text-sm">{review.role}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
