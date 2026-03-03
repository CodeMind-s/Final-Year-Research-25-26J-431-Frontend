'use client';

import React from 'react';
import LanguageSwitcher from '@/components/common/LanguageSwitcher';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 relative">
      <div className="absolute top-4 right-4">
        <LanguageSwitcher />
      </div>
      <div className="w-full max-w- px-4 py-8">
        {children}
      </div>
    </div>
  );
}
