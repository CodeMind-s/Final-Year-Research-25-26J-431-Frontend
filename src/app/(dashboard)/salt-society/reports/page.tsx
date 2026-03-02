"use client"

import { DashboardLayout } from "@/components/crystal/dashboard-layout"
import { Card } from "@/components/crystal/ui/card"
import { FileText, Download, Calendar } from "lucide-react"
import { Button } from "@/components/crystal/ui/button"
import { useState } from "react"
import { DownloadReportDialog } from "@/components/crystal/dialogs/download-report-dialog"
import { useTranslations } from 'next-intl'

export default function ReportsPage() {
  const t = useTranslations('crystal')
  const [downloadDialogOpen, setDownloadDialogOpen] = useState(false)
  const [selectedReport, setSelectedReport] = useState("")

  const handleDownloadClick = (reportName: string) => {
    setSelectedReport(reportName)
    setDownloadDialogOpen(true)
  }

  return (
    <>
      {/* <DashboardLayout> */}
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-semibold text-foreground">{t('reports.title')}</h1>
          <p className="text-muted-foreground mt-1">{t('reports.subtitle')}</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card className="p-6 hover:bg-accent/50 transition-colors cursor-pointer">
            <FileText className="h-8 w-8 text-primary mb-3" />
            <h3 className="font-semibold mb-2 text-foreground">{t('reports.weeklyProductionReport')}</h3>
            <p className="text-sm text-muted-foreground mb-4">
              {t('reports.weeklyProductionDesc')}
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleDownloadClick(t('reports.weeklyProductionReport'))}
            >
              <Download className="h-4 w-4 mr-2" />
              {t('reports.download')}
            </Button>
          </Card>

          <Card className="p-6 hover:bg-accent/50 transition-colors cursor-pointer">
            <Calendar className="h-8 w-8 text-primary mb-3" />
            <h3 className="font-semibold mb-2 text-foreground">{t('reports.monthlyAnalysis')}</h3>
            <p className="text-sm text-muted-foreground mb-4">{t('reports.monthlyAnalysisDesc')}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleDownloadClick(t('reports.monthlyAnalysis'))}
            >
              <Download className="h-4 w-4 mr-2" />
              {t('reports.download')}
            </Button>
          </Card>

          <Card className="p-6 hover:bg-accent/50 transition-colors cursor-pointer">
            <FileText className="h-8 w-8 text-primary mb-3" />
            <h3 className="font-semibold mb-2 text-foreground">{t('reports.sitePerformance')}</h3>
            <p className="text-sm text-muted-foreground mb-4">{t('reports.sitePerformanceDesc')}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleDownloadClick(t('reports.sitePerformance'))}
            >
              <Download className="h-4 w-4 mr-2" />
              {t('reports.download')}
            </Button>
          </Card>
        </div>
      </div>

      <DownloadReportDialog
        open={downloadDialogOpen}
        onOpenChange={setDownloadDialogOpen}
        reportType={selectedReport}
      />
      {/* </DashboardLayout> */}
    </>
  )
}
