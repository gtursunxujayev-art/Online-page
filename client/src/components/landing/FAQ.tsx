import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function FAQ() {
  return (
    <section className="py-24 bg-navy-50 dark:bg-navy-900">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-navy-900 dark:text-white mb-4">
            Ko‘p beriladigan <span className="text-gold-600">savollar</span>
          </h2>
        </div>

        <Accordion type="single" collapsible className="w-full space-y-4">
          <AccordionItem value="item-1" className="bg-white dark:bg-navy-800 rounded-xl px-6 border-none shadow-sm">
            <AccordionTrigger className="text-lg font-medium text-navy-900 dark:text-white hover:text-gold-600 hover:no-underline py-6">
              Kurs kimlar uchun mo‘ljallangan?
            </AccordionTrigger>
            <AccordionContent className="text-gray-600 dark:text-gray-400 pb-6">
              Kurs tadbirkorlar, rahbarlar, talabalar va o‘z nutqini rivojlantirmoqchi bo‘lgan barcha uchun mo‘ljallangan. Yosh chegarasi 16+.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-2" className="bg-white dark:bg-navy-800 rounded-xl px-6 border-none shadow-sm">
            <AccordionTrigger className="text-lg font-medium text-navy-900 dark:text-white hover:text-gold-600 hover:no-underline py-6">
              Darslarni o‘tkazib yuborsam nima bo‘ladi?
            </AccordionTrigger>
            <AccordionContent className="text-gray-600 dark:text-gray-400 pb-6">
              Barcha darslar yozib olinadi va platformaga yuklanadi. Siz istalgan vaqtda qayta ko‘rishingiz mumkin. Ammo amaliy mashg‘ulotlarda qatnashish tavsiya etiladi.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-3" className="bg-white dark:bg-navy-800 rounded-xl px-6 border-none shadow-sm">
            <AccordionTrigger className="text-lg font-medium text-navy-900 dark:text-white hover:text-gold-600 hover:no-underline py-6">
              To‘lovni bo‘lib to‘lasa bo‘ladimi?
            </AccordionTrigger>
            <AccordionContent className="text-gray-600 dark:text-gray-400 pb-6">
              Ha, albatta. To‘lovni 2 ga bo‘lib to‘lash imkoniyati mavjud.
            </AccordionContent>
          </AccordionItem>
           <AccordionItem value="item-4" className="bg-white dark:bg-navy-800 rounded-xl px-6 border-none shadow-sm">
            <AccordionTrigger className="text-lg font-medium text-navy-900 dark:text-white hover:text-gold-600 hover:no-underline py-6">
              Kurs yakunida sertifikat beriladimi?
            </AccordionTrigger>
            <AccordionContent className="text-gray-600 dark:text-gray-400 pb-6">
              Ha, kursni muvaffaqiyatli tamomlagan va imtihondan o‘tgan o‘quvchilarga rasmiy sertifikat topshiriladi.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </section>
  );
}
