/**
 * Settings Page
 * 
 * User settings and preferences page displaying user profile information,
 * notification preferences, and system configuration options for the
 * salt production monitoring system.
 * 
 * @module SettingsPage
 */

"use client"

import { Card } from "@/components/crystal/ui/card"
import { Switch } from "@/components/crystal/ui/switch"
import { User, Mail, Briefcase, MapPin } from "lucide-react"
import { useTranslations } from 'next-intl'
import { useAuth } from "@/hooks/useAuth"
import { useEffect } from "react"

export default function SettingsPage() {
  const t = useTranslations('crystal')
  const { user, refreshUser } = useAuth()

  useEffect(() => {
    refreshUser()
  }, [])

  // PSS authenticated user data
  const userData = {
    name: user?.name || "N/A",
    email: user?.email || user?.phone || "N/A",
    role: user?.role || "N/A",
    location: "Puttalam Salt Society, Sri Lanka"
  }

  return (
    // <DashboardLayout>
      <div className="p-3 sm:p-4 md:p-6 space-y-4 md:space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-foreground">{t('settings.title')}</h1>
          <p className="text-sm text-muted-foreground mt-1">{t('settings.subtitle')}</p>
        </div>

        <div className="grid gap-4 md:gap-6 max-w-3xl">
          <Card className="p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-semibold text-foreground mb-3 sm:mb-4">{t('settings.userProfile')}</h2>
            <div className="space-y-3 sm:space-y-4">
              <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-muted/50 rounded-lg">
                <User className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-[10px] sm:text-xs text-muted-foreground">{t('settings.fullName')}</p>
                  <p className="text-xs sm:text-sm font-medium text-foreground truncate">{userData.name}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-muted/50 rounded-lg">
                <Mail className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-[10px] sm:text-xs text-muted-foreground">{t('settings.email')}</p>
                  <p className="text-xs sm:text-sm font-medium text-foreground truncate">{userData.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-muted/50 rounded-lg">
                <Briefcase className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-[10px] sm:text-xs text-muted-foreground">{t('settings.role')}</p>
                  <p className="text-xs sm:text-sm font-medium text-foreground truncate">{userData.role}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-muted/50 rounded-lg">
                <MapPin className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-[10px] sm:text-xs text-muted-foreground">{t('settings.siteLocation')}</p>
                  <p className="text-xs sm:text-sm font-medium text-foreground truncate">{userData.location}</p>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-semibold text-foreground mb-3 sm:mb-4">{t('settings.notifications')}</h2>
            <div className="space-y-3 sm:space-y-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-medium text-foreground">{t('settings.productionAlerts')}</p>
                  <p className="text-[10px] sm:text-xs text-muted-foreground">{t('settings.productionAlertsDesc')}</p>
                </div>
                <Switch defaultChecked className="flex-shrink-0" />
              </div>
              <div className="flex items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-medium text-foreground">{t('settings.systemWarnings')}</p>
                  <p className="text-[10px] sm:text-xs text-muted-foreground">{t('settings.systemWarningsDesc')}</p>
                </div>
                <Switch defaultChecked className="flex-shrink-0" />
              </div>
              <div className="flex items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-medium text-foreground">{t('settings.dataSyncNotifications')}</p>
                  <p className="text-[10px] sm:text-xs text-muted-foreground">{t('settings.dataSyncNotificationsDesc')}</p>
                </div>
                <Switch className="flex-shrink-0" />
              </div>
            </div>
          </Card>

        </div>
      </div>
    // </DashboardLayout>
  )
}
