"use client";

import { motion } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { SectionWrapper } from "./section-wrapper";
import { faqItems } from "./data";

export function FaqSection() {
  return (
    <SectionWrapper id="faq" className="bg-gray-50/50">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="text-center max-w-2xl mx-auto mb-12 md:mb-16"
      >
        <p className="text-xs font-medium uppercase tracking-widest text-gray-900 mb-3">
          FAQ
        </p>
        <h2 className="text-[clamp(1.75rem,3vw+0.5rem,2.5rem)] font-semibold tracking-tighter text-gray-900 mb-4">
          Frequently Asked Questions
        </h2>
        <p className="text-gray-500 text-base tracking-tighter leading-relaxed">
          Everything you need to know about Brinex and how it works.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.1, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="max-w-3xl mx-auto"
      >
        <Accordion type="single" collapsible className="space-y-3">
          {faqItems.map((item, index) => (
            <AccordionItem
              key={index}
              value={`item-${index}`}
              className="border border-gray-200 rounded-xl px-6 bg-white data-[state=open]:shadow-sm transition-shadow"
            >
              <AccordionTrigger className="text-left font-medium text-gray-900 hover:no-underline py-5 tracking-tighter">
                {item.question}
              </AccordionTrigger>
              <AccordionContent className="text-gray-500 leading-relaxed pb-5 tracking-tighter">
                {item.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </motion.div>
    </SectionWrapper>
  );
}
