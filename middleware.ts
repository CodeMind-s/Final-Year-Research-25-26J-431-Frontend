import createMiddleware from 'next-intl/middleware'
import { i18n } from './i18n.config'

export default createMiddleware({
    locales: i18n.locales,
    defaultLocale: i18n.defaultLocale,
    localePrefix: 'never', // Don't add locale prefix to URLs
    localeDetection: true // Detect locale from cookies/headers
})

export const config = {
    matcher: [
        // Exclude crystal routes, API, and static files from i18n middleware
        '/((?!api|_next/static|_next/image|favicon.ico|crystal|.*\\..*).*)'
    ],
}
