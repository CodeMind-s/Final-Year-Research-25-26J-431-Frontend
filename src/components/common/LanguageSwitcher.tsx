'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Globe } from 'lucide-react';

const LOCALES = [
  { code: 'en', label: 'English' },
  { code: 'si', label: 'සිංහල' },
  { code: 'ta', label: 'தமிழ்' },
] as const;

function getActiveLocale(): string {
  if (typeof document === 'undefined') return 'en';
  const match = document.cookie.match(/NEXT_LOCALE=(\w+)/);
  return match?.[1] ?? 'en';
}

export default function LanguageSwitcher({ className = '' }: { className?: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const activeLocale = getActiveLocale();

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (code: string) => {
    document.cookie = `NEXT_LOCALE=${code};path=/;max-age=31536000`;
    setOpen(false);
    window.location.reload();
  };

  const activeLabel = LOCALES.find((l) => l.code === activeLocale)?.label ?? 'English';

  return (
    <div ref={ref} className={`relative inline-block ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 shadow-sm transition-colors hover:bg-slate-50"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <Globe className="h-4 w-4" />
        <span>{activeLabel}</span>
      </button>

      {open && (
        <ul
          role="listbox"
          className="absolute right-0 z-50 mt-1 min-w-[140px] overflow-hidden rounded-lg border border-slate-200 bg-white py-1 shadow-lg"
        >
          {LOCALES.map((locale) => (
            <li key={locale.code}>
              <button
                type="button"
                role="option"
                aria-selected={locale.code === activeLocale}
                onClick={() => handleSelect(locale.code)}
                className={`flex w-full items-center px-3 py-2 text-sm transition-colors ${
                  locale.code === activeLocale
                    ? 'bg-emerald-50 font-semibold text-emerald-700'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                {locale.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
