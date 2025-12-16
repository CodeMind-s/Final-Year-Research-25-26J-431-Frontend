"use client"

import { Card } from "@/components/crystal/ui/card"
import { Badge } from "@/components/crystal/ui/badge"
import { Button } from "@/components/crystal/ui/button"
import { TrendingUp, Droplets, Activity, Cloud, AlertCircle } from "lucide-react"
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ReferenceLine, Label } from "recharts"
import { useState } from "react"
import { ForecastReportDialog } from "@/components/crystal/dialogs/forecast-report-dialog"
import { NotifySupervisorsDialog } from "@/components/crystal/dialogs/notify-supervisors-dialog"
import { currentSeason, dailyEnvironmentalData, historicalProduction, monthlyProduction } from "@/sample-data/crystal/pss-mock-data"

export function ProductionDashboard() {
  const [forecastDialogOpen, setForecastDialogOpen] = useState(false)
  const [notifyDialogOpen, setNotifyDialogOpen] = useState(false)

  // Combine historical and future production data
  const combinedProductionData = [
    { period: "Yala 2023", production: 6350, type: "historical" },
    { period: "Maha 2023/24", production: 7920, type: "historical" },
    { period: "Yala 2024", production: 6580, type: "historical" },
    { period: "Maha 2024/25", production: 8120, type: "historical" },
    { period: "Dec 2025", production: null, predicted: 1200, type: "current" },
    { period: "Jan 2026", production: null, predicted: 1450, type: "future" },
    { period: "Feb 2026", production: null, predicted: 1650, type: "future" },
    { period: "Mar 2026", production: null, predicted: 1580, type: "future" },
    { period: "Apr 2026", production: null, predicted: 1380, type: "future" },
    { period: "May 2026", production: null, predicted: 1100, type: "future" },
  ]

  const totalPrediction = monthlyProduction.reduce((sum, month) => sum + month.predicted, 0)
  const avgConfidence = Math.round(monthlyProduction.reduce((sum, month) => sum + month.confidence, 0) / monthlyProduction.length)
  
  const mahaSeasons = historicalProduction.filter(s => s.season.includes("Maha") && !s.predicted)
  const avgHistorical = Math.round(mahaSeasons.reduce((sum, s) => sum + s.production, 0) / mahaSeasons.length)

  // Get current environmental conditions (latest data point)
  const latestEnv = dailyEnvironmentalData[dailyEnvironmentalData.length - 1]
  
  return (
    <div className="p-6 space-y-4">
      {/* Compact Header with Season */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Daily Environmental Monitoring & Production Forecast</h1>
          <p className="text-sm text-muted-foreground">Puttalam Salt Society - Critical Operational Data</p>
        </div>
        <div className="text-right">
          <Badge className="bg-primary text-primary-foreground text-base px-3 py-1">
            {currentSeason.name} {currentSeason.year}
          </Badge>
          <p className="text-xs text-muted-foreground mt-1">Oct 2025 - Mar 2026</p>
        </div>
      </div>

      {/* Compact Key Metrics */}
      <div className="grid gap-3 grid-cols-4">
        <Card className="p-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-muted-foreground">Season Forecast</span>
            <TrendingUp className="h-3 w-3 text-success" />
          </div>
          <div className="text-xl font-bold text-foreground">{totalPrediction.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">tons</p>
        </Card>

        <Card className="p-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-muted-foreground">Current Salinity</span>
            <Droplets className="h-3 w-3 text-primary" />
          </div>
          <div className="text-xl font-bold text-foreground">{latestEnv?.salinity || 24.9}</div>
          <p className="text-xs text-success">°Bé</p>
        </Card>

        <Card className="p-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-muted-foreground">Temperature</span>
            <Activity className="h-3 w-3 text-destructive" />
          </div>
          <div className="text-xl font-bold text-foreground">{latestEnv?.temperature || 27}</div>
          <p className="text-xs text-muted-foreground">°C</p>
        </Card>

        <Card className="p-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-muted-foreground">Humidity</span>
            <Cloud className="h-3 w-3 text-success" />
          </div>
          <div className="text-xl font-bold text-foreground">{latestEnv?.humidity || 75}</div>
          <p className="text-xs text-muted-foreground">%</p>
        </Card>
      </div>

      {/* MAIN: Daily Environmental Predictions - MOST IMPORTANT */}
      <Card className="p-5 border-2 border-primary/30 bg-linear-to-br from-primary/5 to-background">
        <div className="mb-3">
          <div className="flex items-center gap-2 mb-1">
            <div className="h-2 w-2 rounded-full bg-primary animate-pulse"></div>
            <h2 className="text-lg font-bold text-foreground">Daily Environmental Predictions</h2>
            <Badge className="bg-primary/20 text-primary">Critical for PSS Maintenance</Badge>
          </div>
          <p className="text-xs text-muted-foreground">Past 6 months (solid) vs Future 6 months (dashed) - Salinity, Rainfall, Temperature, Humidity</p>
        </div>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={dailyEnvironmentalData}>
              <defs>
                <linearGradient id="colorSalinity" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="rgb(99 102 241)" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="rgb(99 102 241)" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgb(229 229 229)" />
              <XAxis 
                dataKey="period" 
                stroke="rgb(115 115 115)"
                tick={{ fontSize: 9 }}
                interval={Math.floor(dailyEnvironmentalData.length / 15)}
              />
              <YAxis yAxisId="left" stroke="rgb(99 102 241)" tick={{ fontSize: 10 }} label={{ value: "Salinity (°Bé) / Temp (°C) / Humidity (%)", angle: -90, position: "insideLeft", style: { fontSize: 10 } }} />
              <YAxis yAxisId="right" orientation="right" stroke="rgb(59 130 246)" tick={{ fontSize: 10 }} label={{ value: "Rainfall (mm)", angle: 90, position: "insideRight", style: { fontSize: 10 } }} />
              
              {/* Vertical line marking the boundary between historical (left) and predicted (right) */}
              <ReferenceLine 
                x={dailyEnvironmentalData.find(d => d.type === 'predicted')?.period || "1 Dec"} 
                stroke="rgb(239 68 68)" 
                strokeWidth={2}
                strokeDasharray="5 5" 
                yAxisId="left"
              >
                <Label 
                  value="← HISTORICAL | PREDICTED →" 
                  position="top" 
                  fill="rgb(239 68 68)" 
                  fontSize={12}
                  fontWeight="bold"
                />
              </ReferenceLine>
              
              <Tooltip
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid rgb(229 229 229)",
                  borderRadius: "8px",
                  fontSize: "11px"
                }}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-white p-2 border rounded shadow-sm">
                        <p className="font-semibold text-xs mb-1">{data.period}</p>
                        <p className="text-xs text-muted-foreground mb-1">
                          {data.type === 'historical' ? '📊 Historical' : '🔮 Predicted'}
                        </p>
                        {payload.map((entry: any, index: number) => (
                          <p key={index} className="text-xs" style={{ color: entry.color }}>
                            {entry.name}: {entry.value}
                          </p>
                        ))}
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend wrapperStyle={{ fontSize: "11px" }} />
              
              {/* Salinity - PRIMARY METRIC - Thick blue line */}
              <Line 
                yAxisId="left"
                type="monotone" 
                dataKey="salinity" 
                stroke="rgb(99 102 241)" 
                strokeWidth={4} 
                name="Salinity (°Bé)" 
                dot={false}
                connectNulls={true}
              />
              
              {/* Rainfall - Blue bars, lighter for predicted */}
              <Bar 
                yAxisId="right"
                dataKey="rainfall" 
                fill="rgb(59 130 246)" 
                name="Rainfall (mm)" 
                radius={[2, 2, 0, 0]}
                opacity={0.6}
              />
              
              {/* Temperature - Red line */}
              <Line 
                yAxisId="left"
                type="monotone" 
                dataKey="temperature" 
                stroke="rgb(239 68 68)" 
                strokeWidth={2} 
                name="Temperature (°C)" 
                dot={false}
                connectNulls={true}
              />
              
              {/* Humidity - Green line */}
              <Line 
                yAxisId="left"
                type="monotone" 
                dataKey="humidity" 
                stroke="rgb(34 197 94)" 
                strokeWidth={2} 
                name="Humidity (%)" 
                dot={false}
                connectNulls={true}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
        <div className="flex items-center gap-6 mt-3 text-xs text-muted-foreground justify-center border-t pt-3">
          <div className="flex items-center gap-2 px-3 py-1 bg-muted/30 rounded">
            <div className="h-0.5 w-10 bg-primary"></div>
            <span className="font-medium">← Past 6 months (Historical)</span>
          </div>
          <div className="h-6 w-px bg-destructive"></div>
          <div className="flex items-center gap-2 px-3 py-1 bg-primary/5 rounded">
            <span className="font-medium">Future 6 months (Predicted) →</span>
            <div className="h-0.5 w-10 bg-primary"></div>
          </div>
        </div>
      </Card>

      {/* Secondary: Production Forecasts - Seasonal & Monthly */}
      <div className="grid gap-4 grid-cols-2">
        {/* Seasonal Production (Yala/Maha) */}
        <Card className="p-4">
          <div className="mb-3">
            <h2 className="text-base font-semibold text-foreground">Seasonal Production - Yala/Maha</h2>
            <p className="text-xs text-muted-foreground">6-month seasonal totals (historical & predicted)</p>
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={[
                { season: "Yala 2023", production: 6350, type: "historical" },
                { season: "Maha 2023/24", production: 7920, type: "historical" },
                { season: "Yala 2024", production: 6580, type: "historical" },
                { season: "Maha 2024/25", production: 8120, type: "historical" },
                { season: "Yala 2025", production: null, predicted: 6800, type: "predicted" },
                { season: "Maha 2025/26", production: null, predicted: 8360, type: "predicted" },
              ]}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgb(229 229 229)" />
                <XAxis 
                  dataKey="season" 
                  stroke="rgb(115 115 115)"
                  tick={{ fontSize: 10 }}
                  angle={-35}
                  textAnchor="end"
                  height={70}
                />
                <YAxis stroke="rgb(115 115 115)" tick={{ fontSize: 11 }} label={{ value: "Production (tons)", angle: -90, position: "insideLeft", style: { fontSize: 10 } }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "white",
                    border: "1px solid rgb(229 229 229)",
                    borderRadius: "8px",
                    fontSize: "12px"
                  }}
                />
                <Legend wrapperStyle={{ fontSize: "11px" }} />
                <Bar dataKey="production" fill="rgb(99 102 241)" name="Actual (tons)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="predicted" fill="rgb(168 85 247)" name="Predicted (tons)" radius={[4, 4, 0, 0]} opacity={0.7} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Monthly Production Breakdown */}
        <Card className="p-4">
          <div className="mb-3">
            <h2 className="text-base font-semibold text-foreground">Monthly Production - Past & Future</h2>
            <p className="text-xs text-muted-foreground">Maha 2024/25 (actual) + Maha 2025/26 (predicted)</p>
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={[
                // Maha 2024/25 - Historical (Oct 2024 - Mar 2025)
                { month: "Oct 24", production: 1180, type: "historical" },
                { month: "Nov 24", production: 1250, type: "historical" },
                { month: "Dec 24", production: 1420, type: "historical" },
                { month: "Jan 25", production: 1580, type: "historical" },
                { month: "Feb 25", production: 1690, type: "historical" },
                { month: "Mar 25", production: 1520, type: "historical" },
                // Future months gap
                { month: "...", production: null, predicted: null, type: "gap" },
                // Maha 2025/26 - Predicted (Dec 2025 - May 2026)
                { month: "Dec 25", production: null, predicted: 1200, type: "predicted" },
                { month: "Jan 26", production: null, predicted: 1450, type: "predicted" },
                { month: "Feb 26", production: null, predicted: 1650, type: "predicted" },
                { month: "Mar 26", production: null, predicted: 1580, type: "predicted" },
                { month: "Apr 26", production: null, predicted: 1380, type: "predicted" },
                { month: "May 26", production: null, predicted: 1100, type: "predicted" },
              ]}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgb(229 229 229)" />
                <XAxis 
                  dataKey="month" 
                  stroke="rgb(115 115 115)"
                  tick={{ fontSize: 9 }}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis stroke="rgb(115 115 115)" tick={{ fontSize: 11 }} label={{ value: "Production (tons)", angle: -90, position: "insideLeft", style: { fontSize: 10 } }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "white",
                    border: "1px solid rgb(229 229 229)",
                    borderRadius: "8px",
                    fontSize: "12px"
                  }}
                />
                <Legend wrapperStyle={{ fontSize: "11px" }} />
                <Bar dataKey="production" fill="rgb(99 102 241)" name="Actual (tons)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="predicted" fill="rgb(168 85 247)" name="Predicted (tons)" radius={[4, 4, 0, 0]} opacity={0.7} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Operational Summary */}
      <div className="grid gap-4 grid-cols-3">
        {/* Overall Saltern Status */}
        <Card className="p-4">
          <h3 className="text-sm font-semibold text-foreground mb-3">Overall Saltern Status</h3>
          <div className="space-y-2">
            <div className="flex justify-between items-center p-2 bg-success/10 rounded">
              <span className="text-sm text-foreground">Avg Brine Density</span>
              <span className="text-sm font-bold text-success">24.9°Bé</span>
            </div>
            <div className="flex justify-between items-center p-2 bg-muted/50 rounded">
              <span className="text-sm text-foreground">Total Area</span>
              <span className="text-sm font-bold text-foreground">13.9 ha</span>
            </div>
            <div className="flex justify-between items-center p-2 bg-muted/50 rounded">
              <span className="text-sm text-foreground">Active Landowners</span>
              <span className="text-sm font-bold text-foreground">8</span>
            </div>
            <div className="flex justify-between items-center p-2 bg-primary/10 rounded">
              <span className="text-sm text-foreground">PSS Workmen</span>
              <span className="text-sm font-bold text-primary">16</span>
            </div>
          </div>
        </Card>

        {/* Current Season Summary */}
        <Card className="p-4">
          <h3 className="text-sm font-semibold text-foreground mb-3">Current Season (Maha 2025/26)</h3>
          <div className="space-y-2">
            <div className="p-2 bg-primary/10 rounded">
              <p className="text-xs text-muted-foreground">Total Forecast</p>
              <p className="text-2xl font-bold text-primary">{totalPrediction.toLocaleString()} tons</p>
            </div>
            <div className="p-2 bg-success/10 rounded">
              <p className="text-xs text-muted-foreground">Avg Confidence</p>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-background rounded-full h-2">
                  <div className="bg-success rounded-full h-2" style={{ width: `${avgConfidence}%` }} />
                </div>
                <span className="text-sm font-bold text-success">{avgConfidence}%</span>
              </div>
            </div>
            <div className="p-2 bg-muted/50 rounded">
              <p className="text-xs text-muted-foreground">vs Historical Avg</p>
              <p className="text-lg font-bold text-foreground">+{Math.round((totalPrediction - avgHistorical) / avgHistorical * 100)}% better</p>
            </div>
          </div>
        </Card>

        {/* PSS Recommendations */}
        <Card className="p-4">
          <h3 className="text-sm font-semibold text-foreground mb-3">PSS Actions Required</h3>
          <div className="space-y-2">
            <div className="flex items-start gap-2 p-2 bg-success/10 border border-success/20 rounded text-xs">
              <Activity className="h-4 w-4 text-success mt-0.5 flex shrink-0" />
              <div>
                <p className="font-medium text-foreground">Optimal Salinity Trend</p>
                <p className="text-muted-foreground">Maintain current operations</p>
              </div>
            </div>
            
            <div className="flex items-start gap-2 p-2 bg-warning/10 border border-warning/20 rounded text-xs">
              <AlertCircle className="h-4 w-4 text-warning mt-0.5 flex shrink-0" />
              <div>
                <p className="font-medium text-foreground">Rainfall Expected</p>
                <p className="text-muted-foreground">Monitor daily, adjust workmen</p>
              </div>
            </div>
          </div>

          <div className="flex gap-2 mt-3">
            <Button size="sm" onClick={() => setForecastDialogOpen(true)} className="flex-1 text-xs h-8">
              View Details
            </Button>
            <Button size="sm" variant="outline" onClick={() => setNotifyDialogOpen(true)} className="flex-1 text-xs h-8">
              Alert Teams
            </Button>
          </div>
        </Card>
      </div>

      {/* Dialogs */}
      <ForecastReportDialog open={forecastDialogOpen} onOpenChange={setForecastDialogOpen} />
      <NotifySupervisorsDialog open={notifyDialogOpen} onOpenChange={setNotifyDialogOpen} />
    </div>
  )
}
