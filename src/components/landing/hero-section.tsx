"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { staggerContainer, staggerItem } from "./animations";

export function HeroSection() {
  return (
    <section id="hero" className="relative h-screen min-h-[900px] overflow-hidden">
      {/* Full-bleed background image */}
      <Image
        src="/assets/images/hero.png"
        alt="Salt fields with pyramids of crystallized salt and a worker harvesting"
        fill
        className="object-cover"
        priority
      />

      {/* Light overlay for text readability */}
      {/* <div className="absolute inset-0 bg-white/30" /> */}

      {/* Centered text content */}
      <div className="relative z-10 h-full flex flex-col items-center justify-start pt-40 px-4 md:px-6">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="show"
          className="text-center max-w-3xl mx-auto"
        >
          {/* Display headline */}
          <motion.h1
            variants={staggerItem}
            className="text-[clamp(2.25rem,5vw+0.5rem,3.5rem)] font-semibold tracking-tighter leading-[1] text-gray-700 mb-5"
          >
            Intelligent Salt Production
            <br />
            For New Era.
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            variants={staggerItem}
            className="text-xs md:text-base text-gray-500 max-w-md mx-auto leading-snug mb-4 tracking-tight"
          >
            AI-powered crystallization forecasting, quality inspection, and seasonal
            planning - built for Sri Lanka&apos;s salt producers.
          </motion.p>

          {/* CTA button */}
          <motion.div variants={staggerItem}>
            <Link
              href="/auth/signup"
              className="inline-flex items-center justify-center h-10 px-8 rounded-xl bg-gray-800/80 hover:bg-gray-800 text-white text-sm font-medium tracking-tight transition-all backdrop-blur-sm"
            >
              Get Started
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
