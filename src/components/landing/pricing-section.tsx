"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SectionWrapper } from "./section-wrapper";
import { pricingPlans } from "./data";
import { staggerContainer, staggerItem } from "./animations";

export function PricingSection() {
  return (
    <SectionWrapper id="pricing">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="text-center max-w-2xl mx-auto mb-12 md:mb-16"
      >
        <p className="text-xs font-medium uppercase tracking-widest text-gray-900 mb-3">
          Pricing
        </p>
        <h2 className="text-[clamp(1.75rem,3vw+0.5rem,2.5rem)] font-semibold tracking-tighter text-gray-900 mb-4">
          Simple, Transparent Pricing
        </h2>
        <p className="text-gray-500 text-base tracking-tighter leading-relaxed">
          Start free and scale as your operation grows. No hidden fees.
        </p>
      </motion.div>

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
        className="grid md:grid-cols-3 gap-6 md:gap-8 max-w-5xl mx-auto"
      >
        {pricingPlans.map((plan) => (
          <motion.div
            key={plan.name}
            variants={staggerItem}
            className={`relative flex flex-col p-6 md:p-8 rounded-2xl border ${
              plan.highlighted
                ? "border-gray-900 bg-white shadow-xl shadow-gray-900/10 ring-1 ring-gray-900"
                : "border-gray-200 bg-white"
            }`}
          >
            {plan.highlighted && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <Badge className="bg-gray-900 hover:bg-gray-900 text-white px-3 py-1 text-xs uppercase tracking-wider shadow-lg shadow-gray-900/25">
                  Most Popular
                </Badge>
              </div>
            )}

            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-1 tracking-tighter">
                {plan.name}
              </h3>
              <div className="flex items-baseline gap-1 mb-2">
                <span className="text-4xl font-bold text-gray-900">
                  {plan.price}
                </span>
                <span className="text-gray-500 text-sm">/{plan.period}</span>
              </div>
              <p className="text-sm text-gray-500 tracking-tighter">{plan.description}</p>
            </div>

            <ul className="space-y-3 mb-8 flex-1">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center mt-0.5">
                    <Check className="w-3 h-3 text-gray-900" />
                  </div>
                  <span className="text-sm text-gray-600 tracking-tighter">{feature}</span>
                </li>
              ))}
            </ul>

            <div className="mt-auto space-y-3">
              <Button
                className={`w-full h-11 rounded-xl tracking-tighter ${
                  plan.highlighted
                    ? "bg-gray-900 hover:bg-gray-800 text-white shadow-lg shadow-gray-900/25"
                    : ""
                }`}
                variant={plan.highlighted ? "default" : "outline"}
                asChild
              >
                <Link href="/auth/signup">{plan.cta}</Link>
              </Button>
              <p className="text-xs text-center text-gray-400 tracking-tighter">
                For {plan.targetRoles.join(", ")}
              </p>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </SectionWrapper>
  );
}
