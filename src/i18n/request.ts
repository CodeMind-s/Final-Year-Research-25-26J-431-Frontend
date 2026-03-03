import { getRequestConfig } from 'next-intl/server';
import { cookies } from 'next/headers';

export const locales = ['en', 'si', 'ta'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'en';

async function loadMessages(locale: string) {
  switch (locale) {
    case 'si':
      return {
        common: (await import('../../messages/si/common.json')).default,
        auth: (await import('../../messages/si/auth.json')).default,
        nav: (await import('../../messages/si/nav.json')).default,
        compass: (await import('../../messages/si/compass.json')).default,
        seller: (await import('../../messages/si/seller.json')).default,
        crystal: (await import('../../messages/si/crystal.json')).default,
      };
    case 'ta':
      return {
        common: (await import('../../messages/ta/common.json')).default,
        auth: (await import('../../messages/ta/auth.json')).default,
        nav: (await import('../../messages/ta/nav.json')).default,
        compass: (await import('../../messages/ta/compass.json')).default,
        seller: (await import('../../messages/ta/seller.json')).default,
        crystal: (await import('../../messages/ta/crystal.json')).default,
      };
    default:
      return {
        common: (await import('../../messages/en/common.json')).default,
        auth: (await import('../../messages/en/auth.json')).default,
        nav: (await import('../../messages/en/nav.json')).default,
        compass: (await import('../../messages/en/compass.json')).default,
        seller: (await import('../../messages/en/seller.json')).default,
        crystal: (await import('../../messages/en/crystal.json')).default,
      };
  }
}

export default getRequestConfig(async () => {
  const cookieStore = await cookies();
  const locale = (cookieStore.get('NEXT_LOCALE')?.value as Locale) || defaultLocale;
  const validLocale = locales.includes(locale as Locale) ? locale : defaultLocale;

  const messages = await loadMessages(validLocale);

  return {
    locale: validLocale,
    messages,
  };
});
