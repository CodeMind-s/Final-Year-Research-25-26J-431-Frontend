"use client";

import { useState } from "react";
import { motion, useScroll, useMotionValueEvent } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import { navLinks } from "./data";

export function Navbar() {
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = useState(false);

  useMotionValueEvent(scrollY, "change", (latest) => {
    setScrolled(latest > 20);
  });

  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-5xl"
    >
      <nav
        className={`flex items-center justify-between px-4 py-3 rounded-2xl border transition-all duration-300 ${scrolled
            ? "bg-white/90 backdrop-blur-xl border-gray-200/80 shadow-lg shadow-black/5"
            : "bg-white/60 backdrop-blur-md border-gray-200/50"
          }`}
      >
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/assets/images/logo.svg"
            alt="Brinex"
            width={120}
            height={32}
            className="h-7 w-auto"
          />
        </Link>

        {/* Desktop nav links */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="px-4 py-2 text-sm tracking-tighter text-gray-600 hover:text-gray-900 transition-colors rounded-lg hover:bg-gray-100/80"
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* Desktop auth buttons */}
        <div className="hidden md:flex items-center gap-2">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/auth/login">Sign In</Link>
          </Button>
          <Button size="sm" asChild className="bg-gray-900 hover:bg-gray-800 text-white">
            <Link href="/auth/signup">Create Account</Link>
          </Button>
        </div>

        {/* Mobile menu */}
        <Sheet>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="sm" className="px-2">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Open menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[300px] p-6">
            <div className="flex flex-col gap-6 mt-8">
              <div className="flex flex-col gap-2">
                {navLinks.map((link) => (
                  <SheetClose key={link.label} asChild>
                    <a
                      href={link.href}
                      className="px-4 py-3 text-base text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      {link.label}
                    </a>
                  </SheetClose>
                ))}
              </div>
              <div className="flex flex-col gap-3 pt-4 border-t border-gray-200">
                <Button variant="outline" asChild className="w-full">
                  <Link href="/auth/login">Sign In</Link>
                </Button>
                <Button asChild className="w-full bg-gray-900 hover:bg-gray-800 text-white">
                  <Link href="/auth/signup">Create Account</Link>
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </nav>
    </motion.header>
  );
}
