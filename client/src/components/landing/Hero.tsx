import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { CheckCircle, Play } from "lucide-react";
import heroImage from "@assets/generated_images/a_confident_speaker_on_a_modern_stage_with_warm_lighting..png";

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src={heroImage}
          alt="Confident Speaker"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-navy-900/90 via-navy-900/70 to-navy-900/40" />
      </div>

      <div className="container mx-auto px-4 relative z-10 grid md:grid-cols-2 gap-12 items-center">
        {/* Text Content */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-white space-y-8"
        >
          <div className="inline-block px-4 py-1 rounded-full bg-gold-500/20 border border-gold-500/30 text-gold-500 text-sm font-semibold tracking-wider uppercase">
            Professional Notiqlik Kursi
          </div>
          
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif font-bold leading-tight">
            So‘z qudrati bilan <span className="text-gold-500 italic">dunyoni</span> zabt eting
          </h1>
          
          <p className="text-lg md:text-xl text-gray-200 max-w-lg leading-relaxed">
            Hayajonni yengib, fikrlaringizni tizimli va ta’sirchan yetkazishni o‘rganing. 
            6 hafta ichida o‘zgarishni his qiling.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <Button size="lg" className="bg-gold-500 hover:bg-gold-600 text-navy-900 font-bold text-lg px-8 h-14 rounded-full shadow-[0_0_20px_rgba(234,179,8,0.3)] hover:shadow-[0_0_30px_rgba(234,179,8,0.5)] transition-all">
              Hoziroq ro‘yxatdan o‘ting
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 hover:text-white font-medium text-lg px-8 h-14 rounded-full backdrop-blur-sm">
              <Play className="mr-2 h-5 w-5 fill-current" /> Dastur bilan tanishish
            </Button>
          </div>

          {/* Promises List */}
          <div className="pt-8 grid gap-3">
            {[
              "His hayajon va qo‘rquvni yo‘qotish",
              "Fikrlarimni tizimli yetkazish",
              "Ishonchli, ravon va ta’sirchan nutq"
            ].map((item, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + (i * 0.1) }}
                className="flex items-center gap-3 text-gray-100"
              >
                <CheckCircle className="text-gold-500 w-5 h-5 flex-shrink-0" />
                <span className="font-medium">{item}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Visual Element (Optional: Could be a floating card or just empty to let BG shine) */}
        <div className="hidden md:flex justify-end relative">
             {/* Abstract decorative elements could go here */}
        </div>
      </div>
      
      {/* Scroll Down Indicator */}
      <motion.div 
        animate={{ y: [0, 10, 0] }}
        transition={{ repeat: Infinity, duration: 2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/50"
      >
        <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center pt-2">
          <div className="w-1 h-2 bg-white/50 rounded-full" />
        </div>
      </motion.div>
    </section>
  );
}
