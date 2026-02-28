"use client";

import { useState, useEffect, useCallback } from "react";
import { visionApi } from "@/lib/vision-api-client";
import { StatisticsSummary, DailyStats, HourlyStats } from "@/types/vision-detection";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatPercentage, formatMs } from "@/lib/utils";
import {
  TrendingUp,
  Activity,
  Clock,
  Zap,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import PageHeader from "@/components/vision/PageHeader";

const COLORS = ["#22c55e", "#ef4444", "#f97316"];

export default function AnalyticsPage() {
  const [summary, setSummary] = useState<StatisticsSummary | null>(null);
  const [dailyStats, setDailyStats] = useState<DailyStats[]>([]);
  const [hourlyStats, setHourlyStats] = useState<HourlyStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [summaryData, dailyData, hourlyData] = await Promise.all([
        visionApi.getStatsSummary() as Promise<StatisticsSummary>,
        visionApi.getDailyStats({ limit: 30 }) as Promise<DailyStats[]>,
        visionApi.getHourlyStats() as Promise<HourlyStats[]>,
      ]);
      setSummary(summaryData);
      setDailyStats(dailyData);
      setHourlyStats(hourlyData);
    } catch (err) {
      console.error("Failed to fetch statistics:", err);
      setError("Could not connect to backend. Please ensure the server is running and MongoDB is connected.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Statistics & Analytics" description="Performance trends and quality insights" />
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin h-8 w-8 border-2 border-cyan-500 border-t-transparent rounded-full mx-auto mb-3"></div>
            <p className="text-gray-500">Loading statistics...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <PageHeader title="Statistics & Analytics" description="Performance trends and quality insights" />
          <Button
            variant="outline"
            size="sm"
            onClick={fetchStats}
            className="gap-1.5"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Retry
          </Button>
        </div>
        <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4">
          <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-red-800">Connection Error</p>
            <p className="text-sm text-red-600 mt-1">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  const pieData = summary
    ? [
        { name: "Pure", value: summary.totalPure },
        { name: "Impure", value: summary.totalImpure },
        { name: "Unwanted", value: summary.totalUnwanted },
      ]
    : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <PageHeader title="Statistics & Analytics" description="Performance trends and quality insights" />
        <Button
          variant="outline"
          size="sm"
          onClick={fetchStats}
          disabled={loading}
          className="gap-1.5"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Total Detections
            </CardTitle>
            <Activity className="h-4 w-4 text-cyan-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {summary?.totalDetections ?? 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Average Purity
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatPercentage(summary?.averagePurity ?? 100)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Avg Processing
            </CardTitle>
            <Clock className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatMs(summary?.averageProcessingTime ?? 0)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Detections/Hour
            </CardTitle>
            <Zap className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {summary?.detectionsPerHour?.toFixed(1) ?? 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Trend Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Purity Trend (Last 30 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            {dailyStats.length === 0 ? (
              <div className="h-64 flex items-center justify-center text-gray-500">
                No data available
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={dailyStats}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) =>
                      new Date(value).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })
                    }
                  />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
                  <Tooltip
                    formatter={(value) => [
                      `${Number(value).toFixed(1)}%`,
                      "Purity",
                    ]}
                  />
                  <Line
                    type="monotone"
                    dataKey="avgPurity"
                    stroke="#22c55e"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Distribution Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Overall Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            {pieData.every((d) => d.value === 0) ? (
              <div className="h-64 flex items-center justify-center text-gray-500">
                No data available
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) =>
                      `${name} ${((percent ?? 0) * 100).toFixed(0)}%`
                    }
                  >
                    {pieData.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Hourly Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Today&apos;s Hourly Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          {hourlyStats.every((h) => h.detections === 0) ? (
            <div className="h-64 flex items-center justify-center text-gray-500">
              No detections today
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={hourlyStats}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="hour"
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => `${value}:00`}
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip
                  labelFormatter={(value) => `${value}:00`}
                  formatter={(value, name) => [
                    Number(value),
                    name === "pureCount" ? "Pure" : name === "impureCount" ? "Impure" : "Unwanted",
                  ]}
                />
                <Bar dataKey="pureCount" name="Pure" fill="#22c55e" stackId="a" />
                <Bar
                  dataKey="impureCount"
                  name="Impure"
                  fill="#ef4444"
                  stackId="a"
                />
                <Bar
                  dataKey="unwantedCount"
                  name="Unwanted"
                  fill="#f97316"
                  stackId="a"
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
