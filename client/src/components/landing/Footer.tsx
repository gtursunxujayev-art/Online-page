import { Button } from "@/components/ui/button";
import { Facebook, Instagram, Send, Phone } from "lucide-react";
import { useContent } from "@/lib/contentContext";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";

export default function Footer() {
  const { content } = useContent();
  const [phone, setPhone] = useState("");
  const { toast } = useToast();

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "");
    if (value.length <= 9) {
      setPhone(value);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (phone.length !== 9) {
      toast({
        title: "Xatolik",
        description: "Telefon raqam 9 ta raqamdan iborat bo'lishi kerak",
        variant: "destructive"
      });
      return;
    }

    try {
      const response = await api.leads.create({ 
        name: "Sayt orqali murojaat",
        phone: `+998${phone}`, 
        job: "Footer kontakt forma",
        source: 'footer'
      });

      const data = await response.json();

      if (data.success || data.savedLocally) {
        toast({
          title: "Muvaffaqiyatli yuborildi!",
          description: "Ma'lumotlaringiz qabul qilindi. Tez orada menejerlarimiz siz bilan bog'lanishadi.",
        });
        setPhone("");
      } else {
        toast({
          title: "Xatolik",
          description: data.message || "Ma'lumot yuborishda xatolik yuz berdi",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error submitting lead:", error);
      toast({
        title: "Xatolik",
        description: "Ma'lumot yuborishda xatolik yuz berdi. Iltimos qaytadan urinib ko'ring.",
        variant: "destructive"
      });
    }
  };

  return (
    <footer className="bg-navy-900 text-white pt-20 pb-8 border-t border-white/10">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          
          {/* Brand */}
          <div>
            <a href="#" className="text-2xl font-serif font-bold tracking-tight text-white block mb-6">
              {content.footer.brandText} <span className="text-gold-500 text-[22px]">{content.footer.brandHighlight}</span>
            </a>
            <p className="text-gray-400 leading-relaxed mb-6">
              {content.footer.description}
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
              {content.navbar.links.slice(0, 4).map((link, i) => (
                 <li key={i}><a href={link.href} className="hover:text-gold-500 transition-colors">{link.name}</a></li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-bold text-lg mb-6">Bog‘lanish</h4>
            <ul className="space-y-4 text-gray-400">
              <li className="flex items-center gap-3">
                <Phone size={18} className="text-gold-500" />
                <span>{content.footer.phone}</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-2 h-2 bg-gold-500 rounded-full" />
                <span>{content.footer.address}</span>
              </li>
            </ul>
          </div>

          {/* CTA */}
          <div className="bg-white/5 p-5 rounded-2xl border border-white/10 min-w-0">
            <h4 className="font-bold text-base mb-2">{content.footer.ctaTitle}</h4>
            <p className="text-gray-400 text-sm mb-3">{content.footer.ctaDesc}</p>
            <form onSubmit={handleSubmit} className="space-y-2">
              <div className="flex items-center gap-2 min-w-0">
                <span className="bg-navy-950 px-2 py-2 rounded-lg border border-white/20 text-xs text-gray-400 flex-shrink-0">
                  +998
                </span>
                <input 
                  type="tel" 
                  value={phone}
                  onChange={handlePhoneChange}
                  placeholder="90 123 45 67" 
                  className="flex-1 min-w-0 bg-navy-950 border border-white/20 rounded-lg px-3 py-2 text-white text-sm placeholder:text-gray-600 focus:border-gold-500 focus:outline-none"
                  data-testid="input-footer-phone"
                  required
                />
              </div>
              <Button 
                type="submit" 
                className="w-full bg-gold-500 hover:bg-gold-600 text-navy-900 font-bold text-sm py-2"
                data-testid="button-footer-submit"
              >
                {content.footer.ctaButton}
              </Button>
            </form>
          </div>

        </div>

        <div className="border-t border-white/10 pt-8 text-center text-gray-500 text-sm">
          &copy; {new Date().getFullYear()} {content.footer.copyright}
        </div>
      </div>
    </footer>
  );
}
