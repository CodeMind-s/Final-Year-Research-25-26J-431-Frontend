/**
 * Download Report Dialog
 * 
 * Dialog component for generating and downloading various production reports
 * including weekly logbooks, monthly parameter records, and monthly production reports.
 * Allows users to select date ranges and generates PDF reports from API data.
 * 
 * @module DownloadReportDialog
 */

"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/crystal/ui/dialog"
import { Button } from "@/components/crystal/ui/button"
import { Label } from "@/components/crystal/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/crystal/ui/select"
import { Download, FileText, Loader2 } from "lucide-react"
import { useState, useEffect } from "react"
import { crystallizationController } from "@/services/crystallization.controller"
import { productionController } from "@/services/production.controller"
import { useToast } from "@/hooks/use-toast"
import {
  downloadWeeklyLogbookReport,
  downloadMonthlyParameterRecordsReport,
  downloadMonthlyProductionReport,
} from "@/lib/pdf-export"
import type {
  DailyMeasurementDataItem,
} from "@/types/crystallization.types"

interface DownloadReportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  reportType: string
}

export function DownloadReportDialog({ open, onOpenChange, reportType }: DownloadReportDialogProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const { toast } = useToast()

  // State for date selection
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString())
  const [selectedMonth, setSelectedMonth] = useState((new Date().getMonth() + 1).toString())
  const [selectedWeek, setSelectedWeek] = useState("1")

  // Determine which report type is being generated
  const isWeeklyLogbook = reportType.toLowerCase().includes("weekly logbook")
  const isMonthlyParameters = reportType.toLowerCase().includes("monthly parameter")
  const isMonthlyProduction = reportType.toLowerCase().includes("monthly production")

  // Generate year options (last 5 years)
  const years = Array.from({ length: 5 }, (_, i) => {
    const year = new Date().getFullYear() - i
    return year.toString()
  })

  // Generate month options
  const months = [
    { value: "1", label: "January" },
    { value: "2", label: "February" },
    { value: "3", label: "March" },
    { value: "4", label: "April" },
    { value: "5", label: "May" },
    { value: "6", label: "June" },
    { value: "7", label: "July" },
    { value: "8", label: "August" },
    { value: "9", label: "September" },
    { value: "10", label: "October" },
    { value: "11", label: "November" },
    { value: "12", label: "December" },
  ]

  // Generate week options (4 weeks per month)
  const weeks = [
    { value: "1", label: "Week 1 (Days 1-7)" },
    { value: "2", label: "Week 2 (Days 8-14)" },
    { value: "3", label: "Week 3 (Days 15-21)" },
    { value: "4", label: "Week 4 (Days 22-28)" },
    { value: "5", label: "Week 5 (Days 29+)" },
  ]

  // Helper function to get date range for selected week
  const getWeekDateRange = (year: number, month: number, week: number) => {
    const startDay = (week - 1) * 7 + 1
    const endDay = Math.min(week * 7, new Date(year, month, 0).getDate())
    
    const startDate = new Date(year, month - 1, startDay)
    const endDate = new Date(year, month - 1, endDay)
    
    return {
      startDate: startDate.toISOString().split("T")[0],
      endDate: endDate.toISOString().split("T")[0],
    }
  }

  // Helper function to get date range for selected month
  const getMonthDateRange = (year: number, month: number) => {
    const startDate = new Date(year, month - 1, 1)
    const endDate = new Date(year, month, 0) // Last day of month
    
    return {
      startDate: startDate.toISOString().split("T")[0],
      endDate: endDate.toISOString().split("T")[0],
    }
  }

  // Generate Weekly Logbook Report
  const generateWeeklyLogbook = async () => {
    try {
      setIsGenerating(true)

      const year = parseInt(selectedYear)
      const month = parseInt(selectedMonth)
      const week = parseInt(selectedWeek)

      const { startDate, endDate } = getWeekDateRange(year, month, week)

      // Fetch daily measurement data for the week
      const weekData = await crystallizationController.getDailyMeasurements({
        startDate,
        endDate,
      })

      if (weekData.length === 0) {
        toast({
          title: "No Data",
          description: "No data available for the selected week.",
          variant: "destructive",
        })
        return
      }

      const monthName = months.find(m => m.value === selectedMonth)?.label
      const weekLabel = `Week ${week} of ${monthName} ${year}`

      // Generate PDF
      await downloadWeeklyLogbookReport(weekData, weekLabel, startDate, endDate)

      toast({
        title: "Success",
        description: "Weekly Logbook Report downloaded successfully",
      })

      onOpenChange(false)
    } catch (error) {
      console.error("Error generating weekly logbook:", error)
      toast({
        title: "Error",
        description: "Failed to generate report. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  // Generate Monthly Parameter Records
  const generateMonthlyParameters = async () => {
    try {
      setIsGenerating(true)

      const year = parseInt(selectedYear)
      const month = parseInt(selectedMonth)

      const { startDate, endDate } = getMonthDateRange(year, month)

      // Fetch daily measurement data for the month
      const monthData = await crystallizationController.getDailyMeasurements({
        startDate,
        endDate,
      })

      if (monthData.length === 0) {
        toast({
          title: "No Data",
          description: "No data available for the selected month.",
          variant: "destructive",
        })
        return
      }

      const monthName = months.find(m => m.value === selectedMonth)?.label
      const monthLabel = `${monthName} ${year}`

      // Generate PDF
      await downloadMonthlyParameterRecordsReport(monthData, monthLabel, startDate, endDate)

      toast({
        title: "Success",
        description: "Monthly Parameter Records downloaded successfully",
      })

      onOpenChange(false)
    } catch (error) {
      console.error("Error generating monthly parameters:", error)
      toast({
        title: "Error",
        description: "Failed to generate report. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  // Generate Monthly Production Report
  const generateMonthlyProduction = async () => {
    try {
      setIsGenerating(true)

      const year = parseInt(selectedYear)

      // Fetch predicted monthly production for the entire year (12 months)
      const startMonth = `${year}-01` // January
      const endMonth = `${year}-12` // December

      const predictedData = await crystallizationController.getPredictedMonthlyProductions({
        startMonth,
        endMonth,
      })

      // Fetch actual monthly production
      const actualData = await productionController.getActualMonthlyProductions({
        startMonth,
        endMonth,
      })

      // Combine data - ensure we have all 12 months
      // Note: httpClient.extractData() already unwraps { data: [...] } responses,
      // so predictedData and actualData are arrays directly, not wrapped objects
      const predictedList = Array.isArray(predictedData) ? predictedData : (predictedData?.data || [])
      const actualList = Array.isArray(actualData) ? actualData : (actualData?.data || [])

      const allMonths = []
      for (let m = 1; m <= 12; m++) {
        const monthStr = `${year}-${m.toString().padStart(2, '0')}`
        const pred = predictedList.find((p: any) => p.month === monthStr)
        const actual = actualList.find((a: any) => a.month === monthStr)
        
        allMonths.push({
          month: monthStr,
          actualProduction: actual?.production_volume || null,
          predictedProduction: pred?.productionForecast || null,
        })
      }

      // Generate PDF
      await downloadMonthlyProductionReport(allMonths, year.toString())

      toast({
        title: "Success",
        description: "Monthly Production Report downloaded successfully",
      })

      onOpenChange(false)
    } catch (error) {
      console.error("Error generating monthly production report:", error)
      toast({
        title: "Error",
        description: "Failed to generate report. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const handleDownload = async () => {
    if (isWeeklyLogbook) {
      await generateWeeklyLogbook()
    } else if (isMonthlyParameters) {
      await generateMonthlyParameters()
    } else if (isMonthlyProduction) {
      await generateMonthlyProduction()
    } else {
      toast({
        title: "Not Implemented",
        description: "This report type is not yet implemented",
        variant: "destructive",
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Download {reportType}
          </DialogTitle>
          <DialogDescription>
            Select the period for your report
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Date Selection */}
          <div className="space-y-3">
            {/* Year Selection */}
            <div className="space-y-2">
              <Label>Year</Label>
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger>
                  <SelectValue placeholder="Select year" />
                </SelectTrigger>
                <SelectContent>
                  {years.map((year) => (
                    <SelectItem key={year} value={year}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Month Selection (not for Monthly Production Report) */}
            {!isMonthlyProduction && (
              <div className="space-y-2">
                <Label>Month</Label>
                <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select month" />
                  </SelectTrigger>
                  <SelectContent>
                    {months.map((month) => (
                      <SelectItem key={month.value} value={month.value}>
                        {month.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Week Selection (only for Weekly Logbook Report) */}
            {isWeeklyLogbook && (
              <div className="space-y-2">
                <Label>Week</Label>
                <Select value={selectedWeek} onValueChange={setSelectedWeek}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select week" />
                  </SelectTrigger>
                  <SelectContent>
                    {weeks.map((week) => (
                      <SelectItem key={week.value} value={week.value}>
                        {week.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {/* Preview Info */}
          <div className="p-4 bg-muted/50 rounded-lg">
            <p className="text-sm font-medium text-foreground mb-2">Report Contents</p>
            <div className="space-y-1 text-xs text-muted-foreground">
              {isWeeklyLogbook ? (
                <>
                  <p>• Table of daily recorded parameters</p>
                  <p>• Line charts for each parameter (predicted vs actual)</p>
                  <p>• Week summary and observations</p>
                  <p>• BrineX header and footer on all pages</p>
                </>
              ) : isMonthlyParameters ? (
                <>
                  <p>• Complete monthly parameter records table</p>
                  <p>• Line charts for each environmental parameter</p>
                  <p>• Monthly summary and analysis</p>
                  <p>• BrineX header and footer on all pages</p>
                </>
              ) : isMonthlyProduction ? (
                <>
                  <p>• Complete 12-month production data (January-December)</p>
                  <p>• Actual vs predicted comparison for each month</p>
                  <p>• Annual summary and variance analysis</p>
                  <p>• Performance insights and recommendations</p>
                  <p>• BrineX header and footer on all pages</p>
                </>
              ) : (
                <>
                  <p>• Comprehensive production data</p>
                  <p>• Environmental factors analysis</p>
                  <p>• Recommendations and insights</p>
                  <p>• BrineX header and footer on all pages</p>
                </>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button onClick={handleDownload} className="flex-1" disabled={isGenerating}>
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Download PDF
                </>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isGenerating}
            >
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
