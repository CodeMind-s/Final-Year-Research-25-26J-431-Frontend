"use client";

import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { useEffect, useRef } from "react";
import {
  CloudSun,
  ScanEye,
  CalendarRange,
  Recycle,
  Brain,
  BarChart3,
  Shield,
} from "lucide-react";
import { painPoints } from "./data";

/* ── Animated number counter ── */
function AnimatedStat({
  value,
  suffix = "",
}: {
  value: number;
  suffix?: string;
}) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, Math.round);
  const ref = useRef<HTMLSpanElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          animate(count, value, { duration: 2, ease: "easeOut" });
        }
      },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [count, value]);

  return (
    <span ref={ref}>
      <motion.span>{rounded}</motion.span>
      {suffix}
    </span>
  );
}

/* ── Stats data ── */
const stats = [
  { value: 95, suffix: "%", label: "Prediction Accuracy" },
  { value: 4, suffix: "", label: "Integrated Modules" },
  { value: 500, suffix: "+", label: "Salt Producers" },
  { value: 3, suffix: "", label: "Languages Supported" },
];

/* ── Icon map ── */
const iconMap = {
  "cloud-sun": CloudSun,
  "scan-eye": ScanEye,
  "calendar-range": CalendarRange,
  recycle: Recycle,
} as const;

export function WhyBrinexSection() {
  return (
    <section id="why-brinex" className="bg-white">
      {/* ═══ Part 1: About Intro ═══ */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-16 md:py-20 lg:py-24">
        <div className="grid md:grid-cols-12 gap-6 md:gap-10 items-start">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="md:col-span-3 text-xs font-medium text-gray-500 pt-2 uppercase tracking-widest"
          >
            About Brinex
          </motion.p>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="md:col-span-9 text-[clamp(1.75rem,3.5vw+0.5rem,3rem)] font-medium tracking-tighter leading-[1.15] text-gray-900"
          >
            Sri Lanka&apos;s salt industry has relied on guesswork for
            generations - from{" "}
            <span className="italic text-gray-500">
              unpredictable harvest timing
            </span>{" "}
            to manual quality checks.
          </motion.h2>
        </div>
      </div>

      {/* ═══ Part 2: Feature Showcase Row ═══ */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 pb-16 md:pb-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="grid md:grid-cols-12 gap-5 md:gap-6"
        >
          {/* Left — description card */}
          <div className="md:col-span-4 p-6 md:p-8 rounded-2xl bg-gray-50 border border-gray-100 flex flex-col justify-between gap-6">
            <div>
              <div className="w-10 h-10 rounded-full bg-gray-900 flex items-center justify-center mb-5">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <p className="text-gray-600 leading-relaxed text-sm tracking-tighter">
                Brinex combines AI prediction, computer vision, and seasonal
                analytics into one platform — replacing decades of manual
                processes with data-driven intelligence.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
              {[
                { icon: BarChart3, label: "Data-driven" },
                { icon: Shield, label: "Secure" },
                { icon: Brain, label: "AI-powered" },
              ].map(({ icon: Icon, label }) => (
                <div
                  key={label}
                  className="flex items-center gap-1.5 text-xs text-gray-500"
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Center — large visual card */}
          <div className="md:col-span-5 relative rounded-2xl overflow-hidden bg-gradient-to-br from-gray-200 via-gray-100 to-gray-50 min-h-[280px] md:min-h-0 flex items-end p-6 md:p-8">
            <div className="absolute inset-0 opacity-20">
              <svg
                className="w-full h-full"
                viewBox="0 0 400 300"
                fill="none"
                preserveAspectRatio="xMidYMid slice"
              >
                <circle cx="200" cy="150" r="120" stroke="#111" strokeWidth="0.5" opacity="0.5" />
                <circle cx="200" cy="150" r="80" stroke="#111" strokeWidth="0.5" opacity="0.4" />
                <circle cx="200" cy="150" r="40" stroke="#111" strokeWidth="0.5" opacity="0.3" />
                <path d="M80 250 Q200 100 320 200" stroke="#333" strokeWidth="0.5" opacity="0.4" />
                <path d="M60 280 Q200 130 340 230" stroke="#333" strokeWidth="0.5" opacity="0.3" />
              </svg>
            </div>
            <div className="relative z-10">
              <span className="inline-block px-3 py-1 rounded-full bg-white/80 backdrop-blur-sm text-xs font-medium text-gray-900 mb-3">
                Crystal Module
              </span>
              <h3 className="text-xl md:text-2xl font-semibold text-gray-900 tracking-tighter">
                Crystallization
                <br />
                Prediction
              </h3>
            </div>
          </div>

          {/* Right — stacked info cards */}
          <div className="md:col-span-3 flex flex-col gap-5 md:gap-6">
            <div className="flex-1 p-5 rounded-2xl bg-gray-50 border border-gray-100">
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">
                Technology
              </p>
              <p className="text-sm text-gray-600 leading-relaxed tracking-tighter">
                LSTM neural networks, YOLOv8 computer vision, and real-time
                weather integration.
              </p>
            </div>
            <div className="flex-1 p-5 rounded-2xl bg-gray-900 text-white">
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">
                Built for
              </p>
              <p className="text-sm text-gray-300 leading-relaxed tracking-tighter">
                Landowners, laboratories, distributors, and salt societies across
                Sri Lanka.
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* ═══ Part 3: Stats Bar ═══ */}
      <div className="border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-12 md:py-16">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{
                  delay: i * 0.1,
                  duration: 0.5,
                  ease: [0.25, 0.46, 0.45, 0.94],
                }}
                className="text-center"
              >
                <p className="text-4xl md:text-5xl font-bold tracking-tight text-gray-900">
                  <AnimatedStat value={stat.value} suffix={stat.suffix} />
                </p>
                <p className="text-sm text-gray-500 mt-2 tracking-tighter">
                  {stat.label}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* ═══ Part 4: "Why Brinex" Bento Grid ═══ */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-16 md:py-20 lg:py-24">
        <div className="grid md:grid-cols-2 gap-6 md:gap-10 items-end mb-12 md:mb-16">
          <div>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
              className="text-xs font-medium text-gray-500 mb-4 tracking-widest uppercase"
            >
              Why Choose Us
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{
                duration: 0.6,
                ease: [0.25, 0.46, 0.45, 0.94],
              }}
              className="text-[clamp(2rem,4vw+0.5rem,3.5rem)] font-semibold tracking-tighter capitalize leading-[1.1] text-gray-900"
            >
              Why salt producers
              <br />
              choose Brinex
            </motion.h2>
          </div>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-gray-500 leading-relaxed md:text-right max-w-md md:ml-auto tracking-tighter"
          >
            Every feature is built on real industry challenges, validated by salt
            producers, and designed to deliver measurable results.
          </motion.p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6">
          {painPoints.map((point, i) => {
            const Icon = iconMap[point.icon];
            return (
              <motion.div
                key={point.problem}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{
                  delay: i * 0.1,
                  duration: 0.5,
                  ease: [0.25, 0.46, 0.45, 0.94],
                }}
                className="group p-6 rounded-2xl border border-gray-200 bg-white hover:border-gray-300 hover:shadow-lg transition-all duration-300 flex flex-col"
              >
                <div className="w-11 h-11 rounded-xl bg-gray-100 flex items-center justify-center mb-5">
                  <Icon className="w-5 h-5 text-gray-900" />
                </div>
                <h3 className="text-base font-semibold text-gray-900 mb-2 tracking-tighter">
                  {point.problem}
                </h3>
                <p className="text-sm text-gray-500 leading-relaxed flex-1 tracking-tighter">
                  {point.solution}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
