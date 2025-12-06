import { Button } from "@/components/ui/button";
import { Facebook, Instagram, Send, Phone } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-navy-900 text-white pt-20 pb-8 border-t border-white/10">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          
          {/* Brand */}
          <div>
            <a href="#" className="text-2xl font-serif font-bold tracking-tight text-white block mb-6">
              Najot Nur <span className="text-gold-500">Notiqlik</span>
            </a>
            <p className="text-gray-400 leading-relaxed mb-6">
              Bizning maqsadimiz - har bir insonning o‘z fikrini erkin va ishonchli yetkaza olishiga ko‘maklashish.
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-gold-500 hover:text-navy-900 transition-all">
                <Instagram size={20} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-gold-500 hover:text-navy-900 transition-all">
                <Facebook size={20} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-gold-500 hover:text-navy-900 transition-all">
                <Send size={20} />
              </a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-bold text-lg mb-6">Foydali havolalar</h4>
            <ul className="space-y-4 text-gray-400">
              <li><a href="#program" className="hover:text-gold-500 transition-colors">Kurs dasturi</a></li>
              <li><a href="#mentors" className="hover:text-gold-500 transition-colors">Mentorlar</a></li>
              <li><a href="#results" className="hover:text-gold-500 transition-colors">Natijalar</a></li>
              <li><a href="#pricing" className="hover:text-gold-500 transition-colors">Narxlar</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-bold text-lg mb-6">Bog‘lanish</h4>
            <ul className="space-y-4 text-gray-400">
              <li className="flex items-center gap-3">
                <Phone size={18} className="text-gold-500" />
                <span>+998 71 200 11 22</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-2 h-2 bg-gold-500 rounded-full" />
                <span>Toshkent sh., Chilonzor tumani</span>
              </li>
            </ul>
          </div>

          {/* CTA */}
          <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
            <h4 className="font-bold text-lg mb-2">Savollaringiz bormi?</h4>
            <p className="text-gray-400 text-sm mb-4">Telefon raqamingizni qoldiring, biz sizga aloqaga chiqamiz.</p>
            <div className="space-y-3">
              <input 
                type="text" 
                placeholder="+998 90 123 45 67" 
                className="w-full bg-navy-950 border border-white/20 rounded-lg px-4 py-3 text-white placeholder:text-gray-600 focus:border-gold-500 focus:outline-none"
              />
              <Button className="w-full bg-gold-500 hover:bg-gold-600 text-navy-900 font-bold">
                Yuborish
              </Button>
            </div>
          </div>

        </div>

        <div className="border-t border-white/10 pt-8 text-center text-gray-500 text-sm">
          &copy; {new Date().getFullYear()} Najot Nur Notiqlik Markazi. Barcha huquqlar himoyalangan.
        </div>
      </div>
    </footer>
  );
}
