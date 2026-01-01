export const i18n = {
    defaultLocale: 'en',
    locales: ['en', 'si', 'ta'],
} as const

export type Locale = (typeof i18n)['locales'][number]
