"use client"

import { DashboardLayout } from "@/components/crystal/dashboard-layout"
import { Card } from "@/components/crystal/ui/card"
import { AlertTriangle, Info, CheckCircle, X } from "lucide-react"
import { Badge } from "@/components/crystal/ui/badge"
import { Button } from "@/components/crystal/ui/button"
import { useState } from "react"
import { useTranslations } from 'next-intl'

export default function AlertsPage() {
  const t = useTranslations('crystal')

  const initialAlerts = [
    {
      id: 1,
      type: "warning",
      title: t('alerts.highHumidityTitle'),
      message: t('alerts.highHumidityMessage'),
      time: t('alerts.hoursAgo', { count: 2 }),
      read: false,
    },
    {
      id: 2,
      type: "info",
      title: t('alerts.optimalSalinityTitle'),
      message: t('alerts.optimalSalinityMessage'),
      time: t('alerts.hoursAgo', { count: 4 }),
      read: true,
    },
    {
      id: 3,
      type: "success",
      title: t('alerts.harvestReadyTitle'),
      message: t('alerts.harvestReadyMessage'),
      time: t('alerts.hoursAgo', { count: 6 }),
      read: true,
    },
    {
      id: 4,
      type: "warning",
      title: t('alerts.tempFluctuationTitle'),
      message: t('alerts.tempFluctuationMessage'),
      time: t('alerts.dayAgo'),
      read: true,
    },
  ]

  const [alerts, setAlerts] = useState(initialAlerts)
  const [expandedAlert, setExpandedAlert] = useState<number | null>(null)

  const dismissAlert = (id: number) => {
    setAlerts(alerts.filter(alert => alert.id !== id))
    if (expandedAlert === id) {
      setExpandedAlert(null)
    }
  }

  const toggleAlertRead = (id: number) => {
    setAlerts(alerts.map(alert =>
      alert.id === id ? { ...alert, read: !alert.read } : alert
    ))
  }

  return (
    // <DashboardLayout>
      <div className="p-3 sm:p-4 md:p-6 space-y-4 md:space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-foreground">{t('alerts.title')}</h1>
          <p className="text-sm text-muted-foreground mt-1">{t('alerts.subtitle')}</p>
        </div>

        <div className="space-y-2 md:space-y-3">
          {alerts.map((alert) => (
            <Card
              key={alert.id}
              className={`p-3 sm:p-4 transition-colors ${alert.read ? 'hover:bg-accent/30' : 'hover:bg-accent/50 bg-accent/20'}`}
            >
              <div className="flex items-start gap-2 sm:gap-4">
                {alert.type === "warning" && <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 text-warning mt-0.5 flex-shrink-0" />}
                {alert.type === "info" && <Info className="h-4 w-4 sm:h-5 sm:w-5 text-primary mt-0.5 flex-shrink-0" />}
                {alert.type === "success" && <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-success mt-0.5 flex-shrink-0" />}

                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-1 sm:gap-2 mb-1">
                    <h3 className="text-sm sm:text-base font-semibold text-foreground">{alert.title}</h3>
                    <Badge
                      variant={
                        alert.type === "warning" ? "destructive" : alert.type === "success" ? "default" : "secondary"
                      }
                      className="text-xs"
                    >
                      {alert.type === "warning" ? t('alerts.warning') : alert.type === "success" ? t('alerts.success') : t('alerts.info')}
                    </Badge>
                    {!alert.read && (
                      <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-xs">
                        {t('alerts.new')}
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs sm:text-sm text-muted-foreground mb-2">{alert.message}</p>

                  {expandedAlert === alert.id && (
                    <div className="mt-2 sm:mt-3 p-2 sm:p-3 bg-muted/50 rounded-lg text-xs sm:text-sm">
                      <p className="font-medium text-foreground mb-2">{t('alerts.detailedInfo')}</p>
                      <p className="text-muted-foreground mb-2">
                        {t('alerts.detailedDescription')}
                      </p>
                      <p className="text-[10px] sm:text-xs text-muted-foreground">{t('alerts.alertIdLabel', { id: String(alert.id) })} • {t('alerts.generatedLabel', { time: alert.time })}</p>
                    </div>
                  )}

                  <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-2">
                    <span className="text-xs text-muted-foreground">{alert.time}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 px-2 text-xs"
                      onClick={() => setExpandedAlert(expandedAlert === alert.id ? null : alert.id)}
                    >
                      {expandedAlert === alert.id ? t('alerts.hideDetails') : t('alerts.viewDetails')}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 px-2 text-xs"
                      onClick={() => toggleAlertRead(alert.id)}
                    >
                      {alert.read ? t('alerts.markUnread') : t('alerts.markRead')}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 px-2 text-xs text-destructive"
                      onClick={() => dismissAlert(alert.id)}
                    >
                      {t('alerts.dismiss')}
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    // </DashboardLayout>
  )
}
