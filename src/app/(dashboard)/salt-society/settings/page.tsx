"use client"

import { DashboardLayout } from "@/components/crystal/dashboard-layout"
import { Card } from "@/components/crystal/ui/card"
import { Switch } from "@/components/crystal/ui/switch"
import { User, Mail, Briefcase, MapPin } from "lucide-react"
import { useTranslations } from 'next-intl'

export default function SettingsPage() {
  const t = useTranslations('crystal')

  // PSS authenticated user data
  const userData = {
    name: "Sunil Perera",
    email: "sunil.perera@puttalam-salt.lk",
    role: "PSS Operations Manager",
    location: "Puttalam Salt Society, Sri Lanka"
  }

  return (
    // <DashboardLayout>
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-semibold text-foreground">{t('settings.title')}</h1>
          <p className="text-muted-foreground mt-1">{t('settings.subtitle')}</p>
        </div>

        <div className="grid gap-6 max-w-3xl">
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-foreground mb-4">{t('settings.userProfile')}</h2>
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <User className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">{t('settings.fullName')}</p>
                  <p className="text-sm font-medium text-foreground">{userData.name}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <Mail className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">{t('settings.email')}</p>
                  <p className="text-sm font-medium text-foreground">{userData.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <Briefcase className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">{t('settings.role')}</p>
                  <p className="text-sm font-medium text-foreground">{userData.role}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <MapPin className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">{t('settings.siteLocation')}</p>
                  <p className="text-sm font-medium text-foreground">{userData.location}</p>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-semibold text-foreground mb-4">{t('settings.notifications')}</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">{t('settings.productionAlerts')}</p>
                  <p className="text-xs text-muted-foreground">{t('settings.productionAlertsDesc')}</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">{t('settings.systemWarnings')}</p>
                  <p className="text-xs text-muted-foreground">{t('settings.systemWarningsDesc')}</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">{t('settings.dataSyncNotifications')}</p>
                  <p className="text-xs text-muted-foreground">{t('settings.dataSyncNotificationsDesc')}</p>
                </div>
                <Switch />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-semibold text-foreground mb-4">{t('settings.systemPreferences')}</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">{t('settings.offlineMode')}</p>
                  <p className="text-xs text-muted-foreground">{t('settings.offlineModeDesc')}</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">{t('settings.autoSync')}</p>
                  <p className="text-xs text-muted-foreground">{t('settings.autoSyncDesc')}</p>
                </div>
                <Switch defaultChecked />
              </div>
            </div>
          </Card>
        </div>
      </div>
    // </DashboardLayout>
  )
}
