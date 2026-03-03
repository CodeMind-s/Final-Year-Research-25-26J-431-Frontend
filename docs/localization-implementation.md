# Localization Implementation Guide

## Overview

The Brinex frontend supports three languages: **English**, **Sinhala** (සිංහල), and **Tamil** (தமிழ்). Localization is powered by [`next-intl`](https://next-intl-docs.vercel.app/) with cookie-based locale persistence.

## Architecture

| Aspect | Implementation |
|--------|---------------|
| Library | `next-intl` (App Router integration) |
| Locale persistence | `NEXT_LOCALE` cookie — no URL prefix changes |
| Default locale | `en` (English) |
| Supported locales | `en`, `si`, `ta` |
| Translation structure | Nested JSON, 6 namespaces per locale |
| Font support | Noto Sans Sinhala + Noto Sans Tamil (Google Fonts via CSS variables) |

## File Structure

```
messages/
├── en/
│   ├── common.json      # Shared UI strings (Loading, Cancel, Confirm, etc.)
│   ├── auth.json         # Login, signup, OTP, onboarding, plans
│   ├── nav.json          # Navigation labels for all modules
│   ├── compass.json      # Landowner: dashboard, planner, harvest, market
│   ├── seller.json       # Distributor: offers, requests, deals
│   └── crystal.json      # Salt Society: production, alerts, reports, settings
├── si/                   # Same 6 files — Sinhala translations
└── ta/                   # Same 6 files — Tamil translations
```

## Key Configuration Files

### `src/i18n/request.ts`
Server-side config that reads `NEXT_LOCALE` cookie and dynamically imports all 6 namespace JSON files for the active locale.

### `next.config.ts`
Wrapped with `createNextIntlPlugin('./src/i18n/request.ts')`.

### `src/app/layout.tsx`
- Async Server Component
- Calls `getLocale()` and `getMessages()` from `next-intl/server`
- Wraps app with `<NextIntlClientProvider messages={messages}>`
- Sets `<html lang={locale}>`
- Loads Noto Sans Sinhala and Noto Sans Tamil via `next/font/google`

## Language Switcher

`src/components/common/LanguageSwitcher.tsx` — a client component with globe icon dropdown showing:
- English
- සිංහල (Sinhala)
- தமிழ் (Tamil)

On selection, it sets the `NEXT_LOCALE` cookie and reloads the page.

### Placement
| Location | File |
|----------|------|
| Auth pages | `src/app/(auth)/layout.tsx` — top-right corner |
| Landowner nav | `src/components/compass/TopNavBar.tsx` — desktop header + mobile drawer footer |
| Distributor nav | `src/app/(compass)/compass/seller-dashboard/page.tsx` — drawer footer |
| SaltSociety nav | `src/components/crystal/dashboard-layout.tsx` — header bar |

## Usage in Components

### Basic usage (client components)
```tsx
'use client';
import { useTranslations } from 'next-intl';

export default function MyComponent() {
  const t = useTranslations('compass');
  return <h1>{t('home.goodMorning')}</h1>;
}
```

### With interpolation
```tsx
t('planner.beds', { count: 5 })           // "5 beds"
t('otp.otpSentTo', { target: phone })     // "We sent a 6-digit code to +94..."
t('creation.bagsAcrossBeds', { bags: 40, beds: 5, duration: 45 })
```

### Multiple namespaces
```tsx
const t = useTranslations('seller');
const tn = useTranslations('nav');

// Use t() for seller-specific strings
// Use tn() for navigation strings
```

## Adding New Translations

1. Add the key to `messages/en/<namespace>.json`
2. Add the corresponding Sinhala translation to `messages/si/<namespace>.json`
3. Add the corresponding Tamil translation to `messages/ta/<namespace>.json`
4. Use `t('section.key')` in your component

## Module-Level Constants

Components with module-level arrays/objects that contain strings (e.g., `NAV_ITEMS`, `STATUS_CFG`) must define them **inside** the component body, after the `useTranslations()` hook call:

```tsx
// WRONG — hooks can't be used at module level
const NAV_ITEMS = [{ label: t('home') }]; // Error!

// CORRECT — define inside the component
export default function MyNav() {
  const t = useTranslations('nav');
  const NAV_ITEMS = [{ label: t('compass.home') }]; // Works!
  // ...
}
```

## Namespaces Reference

| Namespace | ~Keys | Used by |
|-----------|-------|---------|
| `common` | 22 | All modules (shared UI strings) |
| `auth` | 90 | Login, signup, OTP, onboarding, plans |
| `nav` | 60 | TopNavBar, BottomNavBar, dashboard-layout, AdminDashboardLayout, seller nav |
| `compass` | 190 | HomeDashboard, PlannerLanding, PlanCreationFlow, HarvestNowFlow, MarketAnalysis, Deals, Readiness, Saltern |
| `seller` | 80 | Distributor: offers, requests, deals, account, confirmations |
| `crystal` | 70 | Production dashboard, recording, alerts, reports, settings |

## Testing

1. `npm run dev` — app starts without errors
2. Default (English) — all screens render identically to pre-localization
3. Switch to Sinhala via language switcher — text renders in Sinhala script
4. Switch to Tamil via language switcher — text renders in Tamil script
5. Refresh page — locale persists (cookie-based)
6. Test all role flows: login → onboarding → dashboard → sub-pages
7. Verify longer Sinhala/Tamil strings don't break layouts
8. `npm run build` — production build succeeds
