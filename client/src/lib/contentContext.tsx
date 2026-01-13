import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { api } from "./api";

// Define the shape of our content
export interface ContentState {
  navbar: {
    logoText: string;
    logoHighlight: string;
    logoImage: string;
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
    heroVideoUrl: string;
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
    logoHighlight: "Notiqlik markazi",
    logoImage: "/logo_v3.png",
    ctaText: "Kursga yozilish",
    links: [
      { name: "Muammolar", href: "#/pain-points" },
      { name: "Metodika", href: "#/methodology" },
      { name: "Dastur", href: "#/program" },
      { name: "Mentorlar", href: "#/mentors" },
      { name: "Natijalar", href: "#/testimonials" },
    ]
  },
  hero: {
    badge: "Professional Notiqlik Kursi",
    titlePart1: "So‘z qudrati bilan",
    titleHighlight: "dunyoni",
    titlePart2: "zabt eting",
    description: "Hayajonni yengib, fikrlaringizni tizimli va ta’sirchan yetkazishni o‘rganing. 4 hafta ichida o‘zgarishni his qiling.",
    ctaPrimary: "Hoziroq ro‘yxatdan o‘ting",
    ctaSecondary: "Dastur bilan tanishish",
    promises: [
      "His hayajon va qo‘rquvni yo‘qotish",
      "Fikrlarimni tizimli yetkazish",
      "Ishonchli, ravon va ta’sirchan nutq"
    ],
    heroImage: "https://i.ibb.co/3ySvdQ0t/photo-2025-12-06-18-38-33.jpg",
    heroVideoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
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
      { title: "Psixologik tayyorgarlik", desc: "His hayajon va qo'rquvni yo'qotish bo'yicha maxsus psixologik mashqlar." },
      { title: "Ovoz va Diksiya", desc: "Notiq ovozini qurish, to‘g‘ri nafas olish, pauza va ritmni boshqarish." },
      { title: "30 Sekund Qoidasi", desc: "Fikrni 30 sekundda aniq, lo‘nda va ta’sirchan ifodalash metodlari." },
      { title: "Storytelling", desc: "Empatiya uyg‘otish, hikoya qilish va auditoriyani ishontirish san'ati." }
    ],
    statCount: "4000+",
    statLabel: "Muvaffaqiyatli bitiruvchilar"
  },
  program: {
    titlePart1: "4 Haftalik",
    titleHighlight: "Professional Dastur",
    description: "Nazariyadan amaliyotga bosqichma-bosqich o‘tish tizimi.",
    weeks: [
      { week: "1-Modul", title: "Kirish - Tashxis", topics: ["Notiqlikka kirish", "Nutq apparati", "Nutqdagi 30 ta muammolarni aniqlash", "Nutqda sport va nafas olish", "Tez aytish mashqlari"] },
      { week: "2-Modul", title: "Ovoz va Talaffuz", topics: ["Lab, til, jag' mashqlari", "Vokal darsi", "Tana tili", "Ovoz bilan ishlash", "Nafas mashqlari", "Yong'oq va qalam mashqlari", "Kitob o'qish mashqlari"] },
      { week: "3-Modul", title: "Ishonch va Psixologiya", topics: ["His hayajon va qo'rqvni yengish", "Nutqda ruhiyatning o'rni", "Kitobning nutqdagi o'rni", "Kitob o'qish texnikalari", "Kamera bilan ishlash", "Parazit so'zlar va parazit pauzalardan qutilish", "Shaxsiy brend qurish", "Xarizmani shakllantirish"] },
      { week: "4-Modul", title: "Texnikalar", topics: ["Nutqni tizimlashtirish (ATIX va TNYT)", "Notiq imidji", "Nutq texnikalar", "Notiqlarning sirlari", "Nutqdagi xatolar", "Nutq oldidan tayyorgarlik"] }
    ]
  },
  mentors: {
    titlePart1: "Tajribali",
    titleHighlight: "Mentorlar",
    description: "Sizga o‘z sohasining eng kuchli mutaxassislari ustozlik qiladi.",
    items: [
      { name: "Najot Nur", role: "Bosh Mentor", bio: "13+ yil tajribaga ega notiq. Nutq eksperti. Ko'plab konferensiyalar spikeri. 5000+ o'quvchilarni o'qitgan.", image: "https://i.ibb.co/rKdWnFw8/photo-2025-12-06-18-49-59.jpg" },
      { name: "Islom Qoraboyev", role: "Qo'shimcha Mentor", bio: "7+ yillik tajribaga ega O'zbekiston 24 telekanali boshlovchisi.", image: "https://i.ibb.co/b4Cwqnz/photo-2025-12-06-18-51-08.jpg" }
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
      { 
        name: "STANDART ONLAYN", 
        price: "1,500,000 so‘m", 
        desc: "Boshlang'ich bilimlar uchun", 
        features: [
          "Najot Nurdan notiqlikka oid 12 ta dars",
          "4 oy darslarni ko‘rish imkoni",
          "Ma’lumotlar uchun maxsus kanal",
          "Qo‘shimcha tarqatma materiallar va chek listlar",
        ], 
        popular: false, 
        buttonText: "Tanlash" 
      },
      { 
        name: "PREMIUM ONLAYN", 
        price: "2,500,000 so‘m", 
        desc: "To'liq nazorat va amaliyot", 
        features: [
          "Najot Nurdan notiqlikka oid 12 ta dars",
          "Asror Iskandarovdan “Shaxsiy brend qurish”",
          "6 oy davomida darslarni ko‘rish imkoniyati",
          "Ma’lumotlar uchun maxsus kanal",
          "Qo‘shimcha tarqatma materiallar va chek-listlar",
          "Umumiy telegram guruh",
          "Kuratorlar bilan telegram guruh",
          "Kurator nazorati",
          "Islom Qoraboyev bilan 2 marotaba ovozli chat",
          "Kurator bilan 2 marotaba zoom darsi",
          "Kurs so‘ngida sertifikat berish",
          "Kurator bilan shaxsiy suhbat imkoniyati",
          "Bitiruv tadbiri"
        ], 
        popular: true, 
        buttonText: "Tanlash" 
      },
      { 
        name: "VIP ONLAYN", 
        price: "5,000,000 so‘m", 
        desc: "Maksimal natija va qo'shimcha bilimlar", 
        features: [
          "Najot Nurdan notiqlikka oid 12 ta dars",
          "Asror Iskandarovdan “Shaxsiy brend qurish”",
          "Kozimxon To‘rayevdan “Xodimlarni boshqarish”",
          "Abdulaziz Muhammadan “Kitob psixologiyasi”",
          "Davron Turdiyevdan “Xotirani kuchaytirish”",
          "12 oy darslarni ko‘rish imkoniyati",
          "Ma’lumotlar uchun maxsus kanal",
          "Qo‘shimcha tarqatma materiallar va chek-listlar",
          "Umumiy telegram guruh",
          "Kuratorlar bilan telegram guruh",
          "Kurator nazorati",
          "Islom Qoraboyev bilan 4 marotaba zoom darsi",
          "Kurator bilan 2 marotaba zoom darsi",
          "Kurs so‘ngida sertifikat berish",
          "Kurator bilan shaxsiy suhbat",
          "1 marta couching darsda qatnashish imkoniyati",
          "Bitiruv tadbiri"
        ], 
        popular: false, 
        buttonText: "Tanlash" 
      }
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
    brandHighlight: "Notiqlik markazi",
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
  saveContentToServer: (contentToSave: ContentState) => Promise<boolean>;
  isLoading: boolean;
}>({
  content: defaultContent,
  updateContent: () => {},
  saveContentToServer: async () => false,
  isLoading: true,
});

export const ContentProvider = ({ children }: { children: ReactNode }) => {
  const [content, setContent] = useState<ContentState>(defaultContent);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadContent = async () => {
      try {
        const res = await api.content.get();
        if (res.ok) {
          const text = await res.text();
          if (text && text !== "null") {
            const serverContent = JSON.parse(text);
            if (serverContent && typeof serverContent === "object") {
              setContent({ ...defaultContent, ...serverContent });
            }
          }
        }
      } catch (error) {
        console.error("Failed to load content from server:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadContent();
  }, []);

  const updateContent = (newContent: Partial<ContentState>) => {
    setContent((prev) => ({ ...prev, ...newContent }));
  };

  const saveContentToServer = async (contentToSave: ContentState): Promise<boolean> => {
    try {
      const res = await api.content.update(contentToSave);
      if (res.ok) {
        setContent(contentToSave);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Failed to save content:", error);
      return false;
    }
  };

  return (
    <ContentContext.Provider value={{ content, updateContent, saveContentToServer, isLoading }}>
      {children}
    </ContentContext.Provider>
  );
};

export const useContent = () => useContext(ContentContext);
