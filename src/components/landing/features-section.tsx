"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Check } from "lucide-react";
import { SectionWrapper } from "./section-wrapper";
import { modules } from "./data";
import { staggerContainer, staggerItem } from "./animations";

export function FeaturesSection() {
  return (
    <SectionWrapper id="features" className="bg-gray-50/50">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="text-center max-w-xl mx-auto mb-12 md:mb-16"
      >
        <p className="text-xs font-medium uppercase tracking-widest text-gray-900 mb-3">
          Core Features
        </p>
        <h2 className="text-[clamp(1.75rem,3vw+0.5rem,2.5rem)] font-semibold tracking-tighter text-gray-900 mb-4">
          Four Modules, One Platform
        </h2>
        <p className="text-gray-500 text-base tracking-tighter leading-relaxed">
          Each module tackles a critical stage of salt production — from
          prediction to quality inspection to waste recovery.
        </p>
      </motion.div>

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
        className="grid md:grid-cols-2 gap-6 md:gap-8"
      >
        {modules.map((mod) => (
          <motion.div
            key={mod.name}
            variants={staggerItem}
            whileHover={{ y: -4 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
            className="group p-6 md:p-8 rounded-2xl border border-gray-200 bg-white hover:shadow-xl hover:shadow-gray-100 transition-shadow duration-300"
          >
            <div className="mb-5">
              <Image
                src={mod.logo}
                alt={`${mod.name} logo`}
                width={140}
                height={40}
                className="h-9 w-auto"
              />
            </div>

            <h3 className="tracking-tighter text-xl font-semibold text-gray-900 mb-1">
              {mod.tagline}
            </h3>
            <p className="text-gray-500 leading-relaxed mb-5 text-sm tracking-tighter">
              {mod.description}
            </p>

            <ul className="space-y-2.5">
              {mod.features.map((feature) => (
                <li key={feature} className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center">
                    <Check className="w-3 h-3 text-gray-900" />
                  </div>
                  <span className="text-sm text-gray-600 tracking-tighter">{feature}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        ))}
      </motion.div>
    </SectionWrapper>
  );
}
