/**
 * Reports Page
 * 
 * Provides access to downloadable production and parameter reports.
 * Includes weekly logbooks, monthly parameter records, and production reports
 * with options to select date ranges and download in various formats.
 * 
 * @module ReportsPage
 */

"use client"

import { Card } from "@/components/crystal/ui/card"
import { FileText, Download, Calendar } from "lucide-react"
import { Button } from "@/components/crystal/ui/button"
import { useState } from "react"
import { DownloadReportDialog } from "@/components/crystal/dialogs/download-report-dialog"

export default function ReportsPage() {
  const [downloadDialogOpen, setDownloadDialogOpen] = useState(false)
  const [selectedReport, setSelectedReport] = useState("")

  const handleDownloadClick = (reportName: string) => {
    setSelectedReport(reportName)
    setDownloadDialogOpen(true)
  }

  return (
    <>
      {/* <DashboardLayout> */}
      <div className="p-3 sm:p-4 md:p-6 space-y-4 md:space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-foreground">Reports</h1>
          <p className="text-sm text-muted-foreground mt-1">Download and view production and parameter reports</p>
        </div>

        <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          <Card className="p-4 sm:p-6 hover:bg-accent/50 transition-colors cursor-pointer">
            <FileText className="h-6 w-6 sm:h-8 sm:w-8 text-primary mb-2 sm:mb-3" />
            <h3 className="text-sm sm:text-base font-semibold mb-1 sm:mb-2 text-foreground">Weekly Logbook Report</h3>
            <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4">
              Daily recorded parameters with charts and analysis for a selected week
            </p>
            <Button
              variant="outline"
              size="sm"
              className="w-full sm:w-auto"
              onClick={() => handleDownloadClick("Weekly Logbook Report")}
            >
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
          </Card>

          <Card className="p-6 hover:bg-accent/50 transition-colors cursor-pointer">
            <Calendar className="h-8 w-8 text-primary mb-3" />
            <h3 className="font-semibold mb-2 text-foreground">Monthly Parameter Records</h3>
            <p className="text-sm text-muted-foreground mb-4">Complete monthly environmental parameter records and trends</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleDownloadClick("Monthly Parameter Records")}
            >
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
          </Card>

          <Card className="p-6 hover:bg-accent/50 transition-colors cursor-pointer">
            <FileText className="h-8 w-8 text-primary mb-3" />
            <h3 className="font-semibold mb-2 text-foreground">Monthly Production Report</h3>
            <p className="text-sm text-muted-foreground mb-4">Monthly production actual vs predicted with variance analysis</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleDownloadClick("Monthly Production Report")}
            >
              <Download className="h-4 w-4 mr-2" />
              Download
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
