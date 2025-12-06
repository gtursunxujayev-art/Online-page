import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";

// Define the shape of our content
export interface ContentState {
  navbar: {
    logoText: string;
    logoHighlight: string;
    ctaText: string;
    links: { name: string; href: string }[];
  };
  hero: {
    badge: string;
    titlePart1: string;
    titleHighlight: string;
    titlePart2: string;
    description: string;
    ctaPrimary: string;
    ctaSecondary: string;
    promises: string[];
    heroImage: string;
  };
  painPoints: {
    titlePart1: string;
    titleHighlight: string;
    description: string;
    items: { title: string; desc: string }[];
  };
  methodology: {
    badge: string;
    titlePart1: string;
    titleHighlight: string;
    description: string;
    items: { title: string; desc: string }[];
    statCount: string;
    statLabel: string;
  };
  program: {
    titlePart1: string;
    titleHighlight: string;
    description: string;
    weeks: { week: string; title: string; topics: string[] }[];
  };
  mentors: {
    titlePart1: string;
    titleHighlight: string;
    description: string;
    items: { name: string; role: string; bio: string; image: string }[];
  };
  testimonials: {
    titlePart1: string;
    titleHighlight: string;
    items: { name: string; role: string; text: string }[];
  };
  pricing: {
    titlePart1: string;
    titleHighlight: string;
    description: string;
    plans: { 
      name: string; 
      price: string; 
      desc: string; 
      features: string[]; 
      popular: boolean;
      buttonText: string;
    }[];
  };
  faq: {
    titlePart1: string;
    titleHighlight: string;
    items: { question: string; answer: string }[];
  };
  footer: {
    brandText: string;
    brandHighlight: string;
    description: string;
    phone: string;
    address: string;
    ctaTitle: string;
    ctaDesc: string;
    ctaButton: string;
    copyright: string;
  };
}

// Initial Default State
// Note: User provided specific URLs. If these are viewer links (ibb.co/...), they might not display correctly in img tags without direct linking (i.ibb.co/...).
// Using provided URLs as requested.

export const defaultContent: ContentState = {
  navbar: {
    logoText: "Najot Nur",
    logoHighlight: "Notiqlik",
    ctaText: "Kursga yozilish",
    links: [
      { name: "Muammolar", href: "#pain-points" },
      { name: "Metodika", href: "#methodology" },
      { name: "Dastur", href: "#program" },
      { name: "Mentorlar", href: "#mentors" },
      { name: "Natijalar", href: "#results" },
    ]
  },
  hero: {
    badge: "Professional Notiqlik Kursi",
    titlePart1: "So‘z qudrati bilan",
    titleHighlight: "dunyoni",
    titlePart2: "zabt eting",
    description: "Hayajonni yengib, fikrlaringizni tizimli va ta’sirchan yetkazishni o‘rganing. 6 hafta ichida o‘zgarishni his qiling.",
    ctaPrimary: "Hoziroq ro‘yxatdan o‘ting",
    ctaSecondary: "Dastur bilan tanishish",
    promises: [
      "His hayajon va qo‘rquvni yo‘qotish",
      "Fikrlarimni tizimli yetkazish",
      "Ishonchli, ravon va ta’sirchan nutq"
    ],
    heroImage: "https://i.ibb.co/3ySvdQ0t/photo-2025-12-06-18-38-33.jpg"
  },
  painPoints: {
    titlePart1: "Sizga tanish",
    titleHighlight: "muammolarmi?",
    description: "Ko‘pchilik iqtidorli mutaxassislar aynan shu to‘siqlar sababli o‘z potensialini to‘liq namoyon eta olmaydilar.",
    items: [
      { title: "Sahnada hayajon", desc: "Odamlar oldida gapirganda hayajon bosadi, qo'l-oyoq qaltiraydi." },
      { title: "So‘zlar chalkashligi", desc: "Gapirayotganda so‘zlar esdan chiqadi yoki chalkashib ketadi." },
      { title: "Fikrni strukturalash qiyin", desc: "Miyadagi g'oyalarni tartibli va tushunarli qilib yetkaza olmaysiz." },
      { title: "Yig‘ilishlarda jimlik", desc: "Ishdagi yig‘ilishlarda o'z fikringizni aytishga tortinasiz." },
      { title: "O‘ziga ishonchsizlik", desc: "Intervyu, taqdimot va sotuvlarda o‘ziga bo'lgan ishonch yetishmaydi." },
      { title: "Ta'sirsiz nutq", desc: "Gapirganingizda odamlar sizni tinglamaydi yoki tez zerikib qoladi." }
    ]
  },
  methodology: {
    badge: "Bizning yondashuv",
    titlePart1: "Biz sizni qanday",
    titleHighlight: "o‘zgartiramiz?",
    description: "Nazariya va amaliyotning mukammal uyg‘unligi. Biz shunchaki leksiya o‘qimaymiz, biz sizni haqiqiy notiqqa aylantiramiz.",
    items: [
      { title: "Psixologik tayyorgarlik", desc: "Sahna qo‘rquvini yo‘qotish bo‘yicha maxsus psixologik mashqlar va texnikalar." },
      { title: "Ovoz va Diksiya", desc: "Notiq ovozini qurish, to‘g‘ri nafas olish, pauza va ritmni boshqarish." },
      { title: "30 Sekund Qoidasi", desc: "Fikrni 30 sekundda aniq, lo‘nda va ta’sirchan ifodalash metodlari." },
      { title: "Storytelling", desc: "Empatiya uyg‘otish, hikoya qilish va auditoriyani ishontirish san'ati." }
    ],
    statCount: "1000+",
    statLabel: "Muvaffaqiyatli bitiruvchilar"
  },
  program: {
    titlePart1: "6 Haftalik",
    titleHighlight: "Professional Dastur",
    description: "Nazariyadan amaliyotga bosqichma-bosqich o‘tish tizimi.",
    weeks: [
      { week: "1-hafta", title: "Poydevor va Psixologiya", topics: ["Sahna qo‘rquvi diagnostikasi", "O‘ziga ishonch psixologiyasi", "Notiqlikning oltin qoidalari"] },
      { week: "2-hafta", title: "Ovoz va Tana Tili", topics: ["Diafragma orqali nafas olish", "Diksiya va artikulyatsiya", "Jestlar va nigohlar bilan ishlash"] },
      { week: "3-hafta", title: "Nutq Strukturasi", topics: ["Fikrni tizimlash (Skelet metodi)", "Kirish, Asosiy qism, Xulosa", "Argumentlash san'ati"] },
      { week: "4-hafta", title: "Storytelling va Ta'sir", topics: ["Hikoya so‘zlash (Storytelling)", "Auditoriya bilan ishlash", "Qiyin savollarga javob berish"] },
      { week: "5-hafta", title: "Maxsus Texnikalar", topics: ["SPIN va FAB metodlari", "Debatlar va muzokaralar", "Kamera oldida ishlash"] },
      { week: "6-hafta", title: "Yakuniy Imtihon", topics: ["Katta sahnadagi chiqish", "Individual feedback", "Sertifikatlash"] }
    ]
  },
  mentors: {
    titlePart1: "Tajribali",
    titleHighlight: "Mentorlar",
    description: "Sizga o‘z sohasining eng kuchli mutaxassislari ustozlik qiladi.",
    items: [
      { name: "Aziz Rahimov", role: "Bosh Mentor", bio: "20+ yil tajribaga ega notiq. Xalqaro konferensiyalar spikeri. 5000+ o‘quvchilarni o‘qitgan.", image: "https://i.ibb.co/rKdWnFw8/photo-2025-12-06-18-49-59.jpg" },
      { name: "Malika Karimova", role: "Biznes Trener", bio: "Psixologiya fanlari nomzodi. Katta kompaniyalar rahbarlari uchun shaxsiy konsultant.", image: "https://i.ibb.co/b4Cwqnz/photo-2025-12-06-18-51-08.jpg" }
    ]
  },
  testimonials: {
    titlePart1: "O‘quvchilarimiz",
    titleHighlight: "Natijalari",
    items: [
      { name: "Jasur Abdullayev", role: "Tadbirkor", text: "Kursdan oldin mijozlar bilan gaplashishga qiynalar edim. Hozir har qanday uchrashuvda o‘zimni ishonchli his qilaman. Savdom 2 barobar oshdi." },
      { name: "Nargiza Usmonova", role: "Marketing Menejeri", text: "Ishdagi prezentatsiyalar men uchun qo‘rqinchli tush edi. Najot Nur kursi menga nafaqat texnikalarni, balki ichki xotirjamlikni berdi." },
      { name: "Sardor Tursunov", role: "Student", text: "Diplom himoyasida a’lo baho oldim! Oldinlari auditoriya oldida tili aylanmay qoladigan bola edim. Rahmat ustozlar!" }
    ]
  },
  pricing: {
    titlePart1: "Kurs",
    titleHighlight: "Narxlari",
    description: "O‘zingizga mos ta’lim formatini tanlang",
    plans: [
      { name: "Online", price: "1,500,000 so‘m", desc: "Masofadan turib o‘qish uchun", features: ["6 hafta online darslar", "Uyga vazifalar", "Telegram yopiq guruh", "Sertifikat"], popular: false, buttonText: "Tanlash" },
      { name: "Offline", price: "2,500,000 so‘m", desc: "Jonli muloqot va amaliyot", features: ["6 hafta offline darslar", "Kamera qarshisida ishlash", "Individual feedback", "Networking", "Sertifikat"], popular: true, buttonText: "Tanlash" },
      { name: "VIP", price: "5,000,000 so‘m", desc: "Shaxsiy mentorlik", features: ["Offline darslar", "Shaxsiy mentor biriktiriladi", "Biznesga moslashtirilgan dastur", "Tushlik mentor bilan", "VIP Sertifikat"], popular: false, buttonText: "Tanlash" }
    ]
  },
  faq: {
    titlePart1: "Ko‘p beriladigan",
    titleHighlight: "savollar",
    items: [
      { question: "Kurs kimlar uchun mo‘ljallangan?", answer: "Kurs tadbirkorlar, rahbarlar, talabalar va o‘z nutqini rivojlantirmoqchi bo‘lgan barcha uchun mo‘ljallangan. Yosh chegarasi 16+." },
      { question: "Darslarni o‘tkazib yuborsam nima bo‘ladi?", answer: "Barcha darslar yozib olinadi va platformaga yuklanadi. Siz istalgan vaqtda qayta ko‘rishingiz mumkin. Ammo amaliy mashg‘ulotlarda qatnashish tavsiya etiladi." },
      { question: "To‘lovni bo‘lib to‘lasa bo‘ladimi?", answer: "Ha, albatta. To‘lovni 2 ga bo‘lib to‘lash imkoniyati mavjud." },
      { question: "Kurs yakunida sertifikat beriladimi?", answer: "Ha, kursni muvaffaqiyatli tamomlagan va imtihondan o‘tgan o‘quvchilarga rasmiy sertifikat topshiriladi." }
    ]
  },
  footer: {
    brandText: "Najot Nur",
    brandHighlight: "Notiqlik",
    description: "Bizning maqsadimiz - har bir insonning o‘z fikrini erkin va ishonchli yetkaza olishiga ko‘maklashish.",
    phone: "+998 71 200 11 22",
    address: "Toshkent sh., Chilonzor tumani",
    ctaTitle: "Savollaringiz bormi?",
    ctaDesc: "Telefon raqamingizni qoldiring, biz sizga aloqaga chiqamiz.",
    ctaButton: "Yuborish",
    copyright: "Najot Nur Notiqlik Markazi. Barcha huquqlar himoyalangan."
  }
};

const ContentContext = createContext<{
  content: ContentState;
  updateContent: (newContent: Partial<ContentState>) => void;
}>({
  content: defaultContent,
  updateContent: () => {},
});

export const ContentProvider = ({ children }: { children: ReactNode }) => {
  const [content, setContent] = useState<ContentState>(() => {
    const saved = localStorage.getItem("site_content");
    // Check if the saved content has the new fields (simple migration check)
    // If not, merge with default to ensure new fields exist
    if (saved) {
        const parsed = JSON.parse(saved);
        if (!parsed.hero.heroImage) {
            return { ...defaultContent, ...parsed, hero: { ...defaultContent.hero, ...parsed.hero } };
        }
        return parsed;
    }
    return defaultContent;
  });

  useEffect(() => {
    localStorage.setItem("site_content", JSON.stringify(content));
  }, [content]);

  const updateContent = (newContent: Partial<ContentState>) => {
    setContent((prev) => ({ ...prev, ...newContent }));
  };

  return (
    <ContentContext.Provider value={{ content, updateContent }}>
      {children}
    </ContentContext.Provider>
  );
};

export const useContent = () => useContext(ContentContext);
