"use client"

import type React from "react";
import { Analytics } from "@vercel/analytics/next";
import "./crystal-globals.css";
import { NextIntlClientProvider } from 'next-intl'
import { useEffect, useState } from 'react'

export default function CrystalLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [locale, setLocale] = useState('en')
  const [messages, setMessages] = useState<any>(null)

  useEffect(() => {
    // Get locale from localStorage or default to 'en'
    const savedLocale = localStorage.getItem('preferred-locale') || 'en'
    setLocale(savedLocale)

    // Load messages for the locale
    import(`../../../../messages/${savedLocale}.json`)
      .then((msgs) => setMessages(msgs.default))
      .catch((err) => {
        console.error('Failed to load messages:', err)
        // Fallback to English
        import(`../../../../messages/en.json`)
          .then((msgs) => setMessages(msgs.default))
      })
  }, [])

  // Don't render until messages are loaded
  if (!messages) {
    return <div>Loading...</div>
  }

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <div>
        {children}
        <Analytics />
      </div>
    </NextIntlClientProvider>
  );
}
