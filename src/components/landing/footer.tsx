"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const footerColumns = {
  Product: [
    { label: "Crystal", href: "/crystal" },
    { label: "Compass", href: "/compass" },
    { label: "Vision", href: "/vision" },
    { label: "Valor", href: "/valor" },
  ],
  Support: [
    { label: "FAQ", href: "#faq" },
    { label: "Contact Us", href: "#" },
  ],
  Legal: [
    { label: "Privacy Policy", href: "#" },
    { label: "Terms of Service", href: "#" },
  ],
};

export function Footer() {
  return (
    <footer className="bg-gray-100/60 px-4 md:px-6 lg:px-8 pb-8 pt-4">
      <div className="max-w-7xl mx-auto">
        {/* ─── CTA Card ─── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="relative rounded-3xl p-px bg-gradient-to-b from-gray-200 via-gray-100 to-gray-200 mb-4"
        >
          <div className="rounded-3xl bg-white px-6 py-14 md:py-20 text-center">
            <h2 className="text-[clamp(1.75rem,3.5vw+0.5rem,2.75rem)] font-semibold tracking-tighter leading-[1.15] text-gray-900 mb-4">
              Ready to Transform Your
              <br />
              Salt Production?
            </h2>
            <p className="text-gray-500 text-sm md:text-base leading-relaxed max-w-lg mx-auto mb-8 tracking-tighter">
              AI-powered crystallization forecasting, quality inspection, and
              seasonal planning - all from one platform, no complex setup needed.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Button
                size="lg"
                className="h-11 px-6 rounded-full bg-gray-900 hover:bg-gray-800 text-white shadow-lg shadow-gray-900/20"
                asChild
              >
                <Link href="/auth/signup">
                  Start Now
                  <ArrowRight className="ml-1.5 w-4 h-4" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="h-11 px-6 rounded-full border-gray-300"
                asChild
              >
                <a href="#faq">Contact Us</a>
              </Button>
            </div>
          </div>
        </motion.div>

        {/* ─── Footer Card ─── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{
            duration: 0.6,
            delay: 0.1,
            ease: [0.25, 0.46, 0.45, 0.94],
          }}
          className="relative rounded-3xl p-px bg-gradient-to-b from-gray-200/60 via-gray-100/40 to-gray-200/40"
        >
          <div className="rounded-3xl bg-gradient-to-br from-gray-50/80 via-white to-gray-50/60 backdrop-blur-sm px-6 md:px-10 py-10 md:py-12">
            <div className="grid md:grid-cols-12 gap-10 md:gap-8">
              {/* Left — Logo + description */}
              <div className="md:col-span-4">
                <Link href="/" className="inline-block mb-4">
                  <Image
                    src="/assets/images/logo.svg"
                    alt="Brinex"
                    width={120}
                    height={32}
                    className="h-7 w-auto"
                  />
                </Link>
                <p className="text-sm text-gray-500 leading-relaxed max-w-xs tracking-tight">
                  AI-powered salt production management platform built for Sri
                  Lanka&apos;s salt industry.
                </p>
              </div>

              {/* Right — Link columns */}
              <div className="md:col-span-8 grid grid-cols-2 sm:grid-cols-3 gap-8">
                {Object.entries(footerColumns).map(([category, links]) => (
                  <div key={category}>
                    <h4 className="text-sm font-medium text-gray-900 mb-4 tracking-tight">
                      {category}
                    </h4>
                    <ul className="space-y-2.5">
                      {links.map((link) => (
                        <li key={link.label}>
                          <Link
                            href={link.href}
                            className="text-sm text-gray-500 hover:text-gray-900 transition-colors tracking-tight"
                          >
                            {link.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* ─── Copyright ─── */}
        <p className="text-center text-xs text-gray-400 mt-6 tracking-tight">
          &copy; {new Date().getFullYear()} Brinex. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
