import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useContent } from "@/lib/contentContext";

export default function FAQ() {
  const { content } = useContent();

  return (
    <section className="py-24 bg-navy-50 dark:bg-navy-900">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-navy-900 dark:text-white mb-4">
            {content.faq.titlePart1} <span className="text-gold-600">{content.faq.titleHighlight}</span>
          </h2>
        </div>

        <Accordion type="single" collapsible className="w-full space-y-4">
          {content.faq.items.map((item, i) => (
            <AccordionItem key={i} value={`item-${i}`} className="bg-white dark:bg-navy-800 rounded-xl px-6 border-none shadow-sm">
              <AccordionTrigger className="text-lg font-medium text-navy-900 dark:text-white hover:text-gold-600 hover:no-underline py-6">
                {item.question}
              </AccordionTrigger>
              <AccordionContent className="text-gray-600 dark:text-gray-400 pb-6">
                {item.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
