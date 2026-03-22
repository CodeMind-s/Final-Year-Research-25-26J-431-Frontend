"use client"

import { Card } from "@/components/crystal/ui/card"
import { FileText, Download, Calendar, Droplets } from "lucide-react"
import { Button } from "@/components/crystal/ui/button"
import { useState } from "react"
import { httpClient } from '@/lib/http-client'
import { DownloadReportDialog } from "@/components/crystal/dialogs/download-report-dialog"

export default function ReportsPage() {
  const [downloadDialogOpen, setDownloadDialogOpen] = useState(false)
  const [selectedReport, setSelectedReport] = useState("")
  const DEFAULT_SITE_ID = '123e4567-e89b-12d3-a456-426614174000'

  const handleDownloadClick = (reportName: string) => {
    setSelectedReport(reportName)
    setDownloadDialogOpen(true)
  }

  const handleDownloadWaste = async () => {
    try {
      const s = `${new Date().getFullYear()}-01`
      const e = `${new Date().getFullYear()}-12`
      const q = new URLSearchParams()
      q.append('site_id', DEFAULT_SITE_ID)
      q.append('start_month', s)
      q.append('end_month', e)
      q.append('currency', 'LKR')
      q.append('format', 'csv')
      const url = `/waste-management/reports/predictions/detailed?${q.toString()}`
      const resp = await httpClient.getInstance().get(url, { responseType: 'blob' })

      const text = await resp.data.text()
      let csvData: string | null = null
      try {
        const parsed = JSON.parse(text)
        const rows = parsed?.data?.rows || parsed?.rows || (Array.isArray(parsed) ? parsed : null)
        if (Array.isArray(rows) && rows.length > 0) {
          const keys = Object.keys(rows[0])
          const escape = (v: any) => {
            if (v === null || v === undefined) return ''
            // If value is object/array, stringify it so CSV contains useful data instead of [object Object]
            const normalized = (typeof v === 'object') ? JSON.stringify(v) : String(v)
            if (normalized.includes(',') || normalized.includes('"') || normalized.includes('\n')) {
              return '"' + normalized.replace(/"/g, '""') + '"'
            }
            return normalized
          }
          const lines = [keys.join(',')]
          for (const r of rows) lines.push(keys.map(k => escape(r[k])).join(','))
          csvData = lines.join('\n')
        }
      } catch (e) {
        // not JSON
      }

      if (csvData != null) {
        const blob = new Blob([csvData], { type: 'text/csv' })
        const href = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = href
        a.download = `waste-valorization-${s}-to-${e}.csv`
        document.body.appendChild(a)
        a.click()
        a.remove()
        URL.revokeObjectURL(href)
      } else {
        const arrayBuffer = await resp.data.arrayBuffer()
        const blob = new Blob([arrayBuffer], { type: resp.headers['content-type'] || 'text/csv' })
        const href = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = href
        a.download = `waste-valorization-${s}-to-${e}.csv`
        document.body.appendChild(a)
        a.click()
        a.remove()
        URL.revokeObjectURL(href)
      }
    } catch (err) {
      console.error('Failed to download waste CSV', err)
      alert('Failed to download report')
    }
  }

  return (
    <div className="p-3 sm:p-4 md:p-6 space-y-4 md:space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-semibold text-foreground">Reports</h1>
        <p className="text-sm text-muted-foreground mt-1">Download and view production and parameter reports</p>
      </div>

      <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="p-4 sm:p-6 hover:bg-accent/50 transition-colors cursor-pointer">
          <FileText className="h-6 w-6 sm:h-8 sm:w-8 text-primary mb-2 sm:mb-3" />
          <h3 className="text-sm sm:text-base font-semibold mb-1 sm:mb-2 text-foreground">Weekly Logbook Report</h3>
          <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4">Daily recorded parameters with charts and analysis for a selected week</p>
          <Button variant="outline" size="sm" className="w-full sm:w-auto" onClick={() => handleDownloadClick('Weekly Logbook Report')}>
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
        </Card>

        <Card className="p-6 hover:bg-accent/50 transition-colors cursor-pointer">
          <Calendar className="h-8 w-8 text-primary mb-3" />
          <h3 className="font-semibold mb-2 text-foreground">Monthly Parameter Records</h3>
          <p className="text-sm text-muted-foreground mb-4">Complete monthly environmental parameter records and trends</p>
          <Button variant="outline" size="sm" onClick={() => handleDownloadClick('Monthly Parameter Records')}>
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
        </Card>

        <Card className="p-6 hover:bg-accent/50 transition-colors cursor-pointer">
          <FileText className="h-8 w-8 text-primary mb-3" />
          <h3 className="font-semibold mb-2 text-foreground">Monthly Production Report</h3>
          <p className="text-sm text-muted-foreground mb-4">Monthly production actual vs predicted with variance analysis</p>
          <Button variant="outline" size="sm" onClick={() => handleDownloadClick('Monthly Production Report')}>
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
        </Card>

        <Card className="p-6 hover:bg-accent/50 transition-colors cursor-pointer">
          <Droplets className="h-8 w-8 text-primary mb-3" />
          <h3 className="font-semibold mb-2 text-foreground">Waste Valorization Report</h3>
          <p className="text-sm text-muted-foreground mb-4">Monthly waste predictions, breakdowns and valorization summary</p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleDownloadWaste}>
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
          </div>
        </Card>
      </div>

      <DownloadReportDialog
        open={downloadDialogOpen}
        onOpenChange={setDownloadDialogOpen}
        reportType={selectedReport}
      />
    </div>
  )
}
