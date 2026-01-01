"use client"

import { useLocale, useTranslations } from 'next-intl'
import { Globe } from 'lucide-react'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/crystal/ui/select'

export function LanguageSwitcher() {
    const t = useTranslations('crystal.language')
    const locale = useLocale()

    const handleLanguageChange = (newLocale: string) => {
        // Store language preference in both localStorage and cookie
        if (typeof window !== 'undefined') {
            localStorage.setItem('preferred-locale', newLocale)
            // Set cookie for server-side detection
            document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=31536000` // 1 year
            // Refresh page to apply new locale
            window.location.reload()
        }
    }

    return (
        <div className="flex items-center gap-2">
            <Globe className="h-4 w-4 text-muted-foreground" />
            <Select value={locale} onValueChange={handleLanguageChange}>
                <SelectTrigger className="w-[140px] bg-background border-border">
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="en">
                        <span className="flex items-center gap-2">
                            🇬🇧 {t('english')}
                        </span>
                    </SelectItem>
                    <SelectItem value="si">
                        <span className="flex items-center gap-2">
                            🇱🇰 {t('sinhala')}
                        </span>
                    </SelectItem>
                    <SelectItem value="ta">
                        <span className="flex items-center gap-2">
                            🇱🇰 {t('tamil')}
                        </span>
                    </SelectItem>
                </SelectContent>
            </Select>
        </div>
    )
}
