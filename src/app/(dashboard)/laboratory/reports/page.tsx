"use client";

import { useState, useCallback } from "react";
import { visionApi } from "@/lib/vision-api-client";
import {
  StatisticsSummary,
  HourlyStats,
  DailyStats,
} from "@/types/vision-detection";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { formatPercentage } from "@/lib/utils";
import { downloadCsv } from "@/lib/csv-export";
import {
  downloadQualityReportPdf,
  type ReportPeriod,
} from "@/lib/pdf-export";
import {
  Download,
  FileText,
  Activity,
  TrendingUp,
  Zap,
  RefreshCw,
  AlertCircle,
  Calendar,
} from "lucide-react";
import PageHeader from "@/components/vision/PageHeader";

function todayStr(): string {
  return new Date().toISOString().split("T")[0];
}

function currentMonthStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function lastDayOfMonth(yearMonth: string): string {
  const [y, m] = yearMonth.split("-").map(Number);
  return new Date(y, m, 0).getDate().toString().padStart(2, "0");
}

function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr + "T00:00:00");
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
}

function computeSummaryFromData(
  data: HourlyStats[] | DailyStats[]
): StatisticsSummary {
  let totalDetections = 0;
  let totalPure = 0;
  let totalImpure = 0;
  let totalUnwanted = 0;
  let puritySum = 0;
  let purityCount = 0;

  for (const row of data) {
    totalDetections += row.detections;
    totalPure += row.pureCount;
    totalImpure += row.impureCount;
    totalUnwanted += row.unwantedCount;
    if (row.detections > 0) {
      puritySum += row.avgPurity * row.detections;
      purityCount += row.detections;
    }
  }

  const hoursWithData = data.filter((r) => r.detections > 0).length;
  return {
    totalDetections,
    totalPure,
    totalImpure,
    totalUnwanted,
    averagePurity: purityCount > 0 ? puritySum / purityCount : 100,
    averageProcessingTime: 0,
    detectionsPerHour: hoursWithData > 0 ? totalDetections / hoursWithData : 0,
    periodStart: null,
    periodEnd: null,
  };
}

export default function ReportsPage() {
  const [period, setPeriod] = useState<ReportPeriod>("hourly");
  const [singleDate, setSingleDate] = useState(todayStr());
  const [startDate, setStartDate] = useState(todayStr());
  const [endDate, setEndDate] = useState(todayStr());
  const [month, setMonth] = useState(currentMonthStr());

  const [summary, setSummary] = useState<StatisticsSummary | null>(null);
  const [hourlyData, setHourlyData] = useState<HourlyStats[]>([]);
  const [dailyData, setDailyData] = useState<DailyStats[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generated, setGenerated] = useState(false);

  const getDateRange = useCallback((): { start: string; end: string } => {
    switch (period) {
      case "hourly":
        return { start: singleDate, end: addDays(singleDate, 1) };
      case "daily":
        return { start: startDate, end: endDate };
      case "biweekly":
        return { start: startDate, end: addDays(startDate, 13) };
      case "monthly": {
        const s = `${month}-01`;
        const e = `${month}-${lastDayOfMonth(month)}`;
        return { start: s, end: e };
      }
    }
  }, [period, singleDate, startDate, endDate, month]);

  const generateReport = useCallback(async () => {
    setLoading(true);
    setError(null);
    setGenerated(false);
    const range = getDateRange();

    try {
      if (period === "hourly") {
        const hourly = await visionApi.getHourlyStats(range.start);
        setSummary(computeSummaryFromData(hourly));
        setHourlyData(hourly);
        setDailyData([]);
      } else {
        const daily = await visionApi.getDailyStats({
          startDate: range.start,
          endDate: range.end,
        });
        setSummary(computeSummaryFromData(daily));
        setDailyData(daily);
        setHourlyData([]);
      }
      setGenerated(true);
    } catch (err) {
      console.error("Failed to generate report:", err);
      setError(
        "Could not generate report. Please ensure the server is running."
      );
    } finally {
      setLoading(false);
    }
  }, [period, getDateRange]);

  const handleExportCsv = () => {
    if (period === "hourly") {
      downloadCsv(
        hourlyData.map((h) => ({
          hour: `${h.hour}:00`,
          detections: h.detections,
          pureCount: h.pureCount,
          impureCount: h.impureCount,
          unwantedCount: h.unwantedCount,
          avgPurity: `${h.avgPurity.toFixed(1)}%`,
        })),
        [
          { key: "hour", header: "Hour" },
          { key: "detections", header: "Detections" },
          { key: "pureCount", header: "Pure" },
          { key: "impureCount", header: "Impure" },
          { key: "unwantedCount", header: "Unwanted" },
          { key: "avgPurity", header: "Avg Purity" },
        ],
        `quality-report-hourly-${singleDate}.csv`
      );
    } else {
      const range = getDateRange();
      downloadCsv(
        dailyData.map((d) => ({
          date: d.date,
          detections: d.detections,
          pureCount: d.pureCount,
          impureCount: d.impureCount,
          unwantedCount: d.unwantedCount,
          avgPurity: `${d.avgPurity.toFixed(1)}%`,
        })),
        [
          { key: "date", header: "Date" },
          { key: "detections", header: "Detections" },
          { key: "pureCount", header: "Pure" },
          { key: "impureCount", header: "Impure" },
          { key: "unwantedCount", header: "Unwanted" },
          { key: "avgPurity", header: "Avg Purity" },
        ],
        `quality-report-${period}-${range.start}.csv`
      );
    }
  };

  const handleExportPdf = () => {
    if (!summary) return;
    const range = getDateRange();
    const data = period === "hourly" ? hourlyData : dailyData;
    downloadQualityReportPdf(summary, data, period, range);
  };

  const tableData = period === "hourly" ? hourlyData : dailyData;
  const hasData = tableData.length > 0;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Quality Inspection Reports"
        description="Generate and export quality inspection reports with real detection data"
      />

      {/* Controls */}
      <Card>
        <CardContent className="pt-">
          <div className="flex flex-wrap items-end gap-4">
            {/* Period Selector */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-muted-foreground">
                Period
              </label>
              <Select
                value={period}
                onValueChange={(v) => setPeriod(v as ReportPeriod)}
              >
                <SelectTrigger className="w-[160px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hourly">Hourly</SelectItem>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="biweekly">Biweekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Date Inputs */}
            {period === "hourly" && (
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-muted-foreground">
                  Date
                </label>
                <div className="flex h-9 items-center rounded-md border bg-transparent px-3 text-sm shadow-xs">
                  <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="date"
                    value={singleDate}
                    onChange={(e) => setSingleDate(e.target.value)}
                    className="bg-transparent outline-none"
                  />
                </div>
              </div>
            )}

            {period === "daily" && (
              <>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-muted-foreground">
                    Start Date
                  </label>
                  <div className="flex h-9 items-center rounded-md border bg-transparent px-3 text-sm shadow-xs">
                    <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="bg-transparent outline-none"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-muted-foreground">
                    End Date
                  </label>
                  <div className="flex h-9 items-center rounded-md border bg-transparent px-3 text-sm shadow-xs">
                    <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="bg-transparent outline-none"
                    />
                  </div>
                </div>
              </>
            )}

            {period === "biweekly" && (
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-muted-foreground">
                  Start Date (14-day window)
                </label>
                <div className="flex h-9 items-center rounded-md border bg-transparent px-3 text-sm shadow-xs">
                  <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="bg-transparent outline-none"
                  />
                </div>
              </div>
            )}

            {period === "monthly" && (
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-muted-foreground">
                  Month
                </label>
                <div className="flex h-9 items-center rounded-md border bg-transparent px-3 text-sm shadow-xs">
                  <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="month"
                    value={month}
                    onChange={(e) => setMonth(e.target.value)}
                    className="bg-transparent outline-none"
                  />
                </div>
              </div>
            )}

            <Button
              onClick={generateReport}
              disabled={loading}
              className="gap-2 bg-blue-600 hover:bg-blue-700"
            >
              {loading ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <FileText className="h-4 w-4" />
              )}
              {loading ? "Generating..." : "Generate Report"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Error */}
      {error && (
        <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4">
          <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-red-800">
              Report Generation Failed
            </p>
            <p className="text-sm text-red-600 mt-1">{error}</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={generateReport}
            className="ml-auto shrink-0 gap-1.5"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Retry
          </Button>
        </div>
      )}

      {/* Summary Cards */}
      {generated && summary && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Detections
              </CardTitle>
              <Activity className="h-4 w-4 text-cyan-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {summary.totalDetections}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Average Purity
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {formatPercentage(summary.averagePurity)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Pure / Impure / Unwanted
              </CardTitle>
              <Activity className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                <span className="text-green-600">{summary.totalPure}</span>
                {" / "}
                <span className="text-red-500">{summary.totalImpure}</span>
                {" / "}
                <span className="text-orange-500">{summary.totalUnwanted}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Detections/Hour
              </CardTitle>
              <Zap className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {summary.detectionsPerHour.toFixed(1)}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Data Table */}
      {generated && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>
                {period === "hourly" ? "Hourly" : "Daily"} Breakdown
              </CardTitle>
              {hasData && (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleExportCsv}
                    className="gap-1.5"
                  >
                    <Download className="h-3.5 w-3.5" />
                    Export CSV
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleExportPdf}
                    className="gap-1.5"
                  >
                    <FileText className="h-3.5 w-3.5" />
                    Export PDF
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {!hasData ? (
              <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
                <Activity className="h-8 w-8 mb-2 opacity-40" />
                <p>No detections found for the selected period.</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>
                      {period === "hourly" ? "Hour" : "Date"}
                    </TableHead>
                    <TableHead className="text-right">Detections</TableHead>
                    <TableHead className="text-right">Pure</TableHead>
                    <TableHead className="text-right">Impure</TableHead>
                    <TableHead className="text-right">Unwanted</TableHead>
                    <TableHead className="text-right">Avg Purity</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {period === "hourly"
                    ? hourlyData.map((row) => (
                      <TableRow key={row.hour}>
                        <TableCell className="font-medium">
                          {row.hour}:00
                        </TableCell>
                        <TableCell className="text-right">
                          {row.detections}
                        </TableCell>
                        <TableCell className="text-right text-green-600">
                          {row.pureCount}
                        </TableCell>
                        <TableCell className="text-right text-red-500">
                          {row.impureCount}
                        </TableCell>
                        <TableCell className="text-right text-orange-500">
                          {row.unwantedCount}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatPercentage(row.avgPurity)}
                        </TableCell>
                      </TableRow>
                    ))
                    : dailyData.map((row) => (
                      <TableRow key={row.date}>
                        <TableCell className="font-medium">
                          {row.date}
                        </TableCell>
                        <TableCell className="text-right">
                          {row.detections}
                        </TableCell>
                        <TableCell className="text-right text-green-600">
                          {row.pureCount}
                        </TableCell>
                        <TableCell className="text-right text-red-500">
                          {row.impureCount}
                        </TableCell>
                        <TableCell className="text-right text-orange-500">
                          {row.unwantedCount}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatPercentage(row.avgPurity)}
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
