"use client"

import { Card } from "@/components/crystal/ui/card"
import { Badge } from "@/components/crystal/ui/badge"
import { Button } from "@/components/crystal/ui/button"
import { Input } from "@/components/crystal/ui/input"
import { Label } from "@/components/crystal/ui/label"
import { Tabs, TabsList, TabsTrigger } from "@/components/crystal/ui/tabs"
import { RecycleIcon, Droplets, ThermometerSun, TrendingUp, AlertCircle, CheckCircle2, Factory, Sparkles, Beaker, FlaskConical, RefreshCw } from "lucide-react"
import { ComposedChart, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Area, PieChart, Pie, Cell } from "recharts"
import { useState, useEffect, useCallback } from "react"
import { wasteManagementController } from "@/services/waste-management.controller"
import type { WastePredictionData as ApiWastePredictionData, WasteAverageMetrics, QuickPredictionRequest } from "@/types/waste-management.types"

// Extended type with period property for display
interface WastePredictionData extends ApiWastePredictionData {
  period: string
}

// Chart colors
const SOLID_WASTE_COLORS = {
  gypsum: "rgb(168 85 247)", // purple
  limestone: "rgb(249 115 22)", // orange
  industrial_salt: "rgb(59 130 246)" // blue
}

const LIQUID_WASTE_COLORS = {
  bittern: "rgb(245 158 11)", // amber
  epsom_salt: "rgb(34 197 94)", // green
  potash: "rgb(236 72 153)", // pink
  magnesium_oil: "rgb(6 182 212)" // cyan
}

export function WasteValorizationDashboard() {
  const [predictionMode, setPredictionMode] = useState<"forecast" | "quick">("forecast")
  const [wasteData, setWasteData] = useState<WastePredictionData[]>([])
  const [averages, setAverages] = useState<WasteAverageMetrics>({
    production_volume: 0,
    rain_sum: 0,
    temperature_mean: 0,
    humidity_mean: 0,
    wind_speed_mean: 0,
    predicted_waste: 0
  })
  const [quickPredictionResult, setQuickPredictionResult] = useState<WastePredictionData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isQuickPredicting, setIsQuickPredicting] = useState(false)
  const [quickJobId, setQuickJobId] = useState<string | null>(null)
  const [quickJobStatus, setQuickJobStatus] = useState<"processing" | "completed" | "failed" | null>(null)
  const [quickJobMessage, setQuickJobMessage] = useState<string>("")
  
  // Quick prediction form state
  const [quickForm, setQuickForm] = useState<QuickPredictionRequest>({
    production_volume: 50000,
    rain_sum: 200,
    temperature_mean: 28,
    humidity_mean: 85,
    wind_speed_mean: 15
  })

  // Fetch system forecast data
  const fetchSystemForecast = useCallback(async () => {
    try {
      setIsLoading(true)
      
      const today = new Date()
      const startDate = new Date(today)
      startDate.setDate(today.getDate() - 30)
      const endDate = new Date(today)
      endDate.setDate(today.getDate() + 14)
      
      const formatDate = (date: Date) => date.toISOString().split('T')[0]
      
      const response = await wasteManagementController.getWastePredictions({
        startDate: formatDate(startDate),
        endDate: formatDate(endDate),
        includeAverages: true
      })
      
      console.log("API Response:", response)
      
      // httpClient.extractData already unwraps the response, so predictions is at the top level
      if (!response?.predictions) {
        console.error("Invalid response structure:", response)
        return
      }
      
      const transformedData: WastePredictionData[] = response.predictions.map(item => {
        const date = new Date(item.date)
        const period = date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
        return { ...item, period }
      })
      
      setWasteData(transformedData)
      
      // Set averages if provided, otherwise calculate from data
      if (response.averages) {
        setAverages(response.averages)
      } else {
        console.warn("No averages provided, calculating from data")
        // Calculate averages from the predictions
        const calculatedAverages = calculateAveragesFromData(transformedData)
        setAverages(calculatedAverages)
      }
      
    } catch (error) {
      console.error("Error fetching waste data:", error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (predictionMode === "forecast") {
      fetchSystemForecast()
    }
  }, [predictionMode, fetchSystemForecast])

  const calculateAveragesFromData = (data: WastePredictionData[]): WasteAverageMetrics => {
    if (data.length === 0) {
      return {
        production_volume: 0,
        rain_sum: 0,
        temperature_mean: 0,
        humidity_mean: 0,
        wind_speed_mean: 0,
        predicted_waste: 0
      }
    }
    
    const sum = data.reduce((acc, item) => ({
      production_volume: acc.production_volume + (item.production_volume || 0),
      rain_sum: acc.rain_sum + (item.rain_sum || 0),
      temperature_mean: acc.temperature_mean + (item.temperature_mean || 0),
      humidity_mean: acc.humidity_mean + (item.humidity_mean || 0),
      wind_speed_mean: acc.wind_speed_mean + (item.wind_speed_mean || 0),
      predicted_waste: acc.predicted_waste + (item.predicted_waste || 0),
      solid_waste_gypsum: acc.solid_waste_gypsum + (item.solid_waste_gypsum || 0),
      solid_waste_limestone: acc.solid_waste_limestone + (item.solid_waste_limestone || 0),
      solid_waste_industrial_salt: acc.solid_waste_industrial_salt + (item.solid_waste_industrial_salt || 0),
      total_solid_waste: acc.total_solid_waste + (item.total_solid_waste || 0),
      liquid_waste_bittern: acc.liquid_waste_bittern + (item.liquid_waste_bittern || 0),
      potential_epsom_salt: acc.potential_epsom_salt + (item.potential_epsom_salt || 0),
      potential_potash: acc.potential_potash + (item.potential_potash || 0),
      potential_magnesium_oil: acc.potential_magnesium_oil + (item.potential_magnesium_oil || 0),
      total_liquid_waste: acc.total_liquid_waste + (item.total_liquid_waste || 0)
    }), {
      production_volume: 0,
      rain_sum: 0,
      temperature_mean: 0,
      humidity_mean: 0,
      wind_speed_mean: 0,
      predicted_waste: 0,
      solid_waste_gypsum: 0,
      solid_waste_limestone: 0,
      solid_waste_industrial_salt: 0,
      total_solid_waste: 0,
      liquid_waste_bittern: 0,
      potential_epsom_salt: 0,
      potential_potash: 0,
      potential_magnesium_oil: 0,
      total_liquid_waste: 0
    })
    
    const count = data.length
    
    return {
      production_volume: Math.round(sum.production_volume / count),
      rain_sum: parseFloat((sum.rain_sum / count).toFixed(2)),
      temperature_mean: parseFloat((sum.temperature_mean / count).toFixed(2)),
      humidity_mean: parseFloat((sum.humidity_mean / count).toFixed(2)),
      wind_speed_mean: parseFloat((sum.wind_speed_mean / count).toFixed(2)),
      predicted_waste: Math.round(sum.predicted_waste / count),
      solid_waste_gypsum: sum.solid_waste_gypsum > 0 ? Math.round(sum.solid_waste_gypsum / count) : undefined,
      solid_waste_limestone: sum.solid_waste_limestone > 0 ? Math.round(sum.solid_waste_limestone / count) : undefined,
      solid_waste_industrial_salt: sum.solid_waste_industrial_salt > 0 ? Math.round(sum.solid_waste_industrial_salt / count) : undefined,
      total_solid_waste: sum.total_solid_waste > 0 ? Math.round(sum.total_solid_waste / count) : undefined,
      liquid_waste_bittern: sum.liquid_waste_bittern > 0 ? Math.round(sum.liquid_waste_bittern / count) : undefined,
      potential_epsom_salt: sum.potential_epsom_salt > 0 ? Math.round(sum.potential_epsom_salt / count) : undefined,
      potential_potash: sum.potential_potash > 0 ? Math.round(sum.potential_potash / count) : undefined,
      potential_magnesium_oil: sum.potential_magnesium_oil > 0 ? Math.round(sum.potential_magnesium_oil / count) : undefined,
      total_liquid_waste: sum.total_liquid_waste > 0 ? Math.round(sum.total_liquid_waste / count) : undefined
    }
  }

  const handleQuickPrediction = async () => {
    try {
      setIsQuickPredicting(true)
      setQuickJobStatus(null)
      setQuickPredictionResult(null)
      
      const response = await wasteManagementController.submitQuickPrediction(quickForm)
      
      console.log("Quick Prediction Job Submitted:", response)
      
      setQuickJobId(response.jobId)
      setQuickJobStatus(response.status)
      setQuickJobMessage(response.message)
      
      // If somehow immediate result is available (shouldn't happen in async pattern)
      if (response.prediction) {
        const date = new Date()
        const period = date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
        setQuickPredictionResult({
          ...response.prediction,
          period
        })
      }
      
    } catch (error) {
      console.error("Error submitting quick prediction:", error)
      setQuickJobStatus("failed")
      setQuickJobMessage("Failed to submit prediction job. Please try again.")
    } finally {
      setIsQuickPredicting(false)
    }
  }

  const handleCheckPredictionStatus = async () => {
    if (!quickJobId) return
    
    try {
      setIsQuickPredicting(true)
      
      const response = await wasteManagementController.getQuickPredictionStatus(quickJobId)
      
      console.log("Quick Prediction Status:", response)
      
      setQuickJobStatus(response.status)
      setQuickJobMessage(response.message)
      
      if (response.status === "completed" && response.prediction) {
        const date = new Date()
        const period = date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
        setQuickPredictionResult({
          ...response.prediction,
          period
        })
      }
      
    } catch (error) {
      console.error("Error checking prediction status:", error)
      setQuickJobStatus("failed")
      setQuickJobMessage("Failed to check prediction status. Please try again.")
    } finally {
      setIsQuickPredicting(false)
    }
  }

  // Prepare waste breakdown data for pie charts
  const getSolidWasteBreakdown = (data: WastePredictionData | WasteAverageMetrics) => [
    { name: "Gypsum", value: data.solid_waste_gypsum || 0, color: SOLID_WASTE_COLORS.gypsum },
    { name: "Limestone", value: data.solid_waste_limestone || 0, color: SOLID_WASTE_COLORS.limestone },
    { name: "Industrial Salt", value: data.solid_waste_industrial_salt || 0, color: SOLID_WASTE_COLORS.industrial_salt }
  ]

  const getLiquidWasteBreakdown = (data: WastePredictionData | WasteAverageMetrics) => [
    { name: "Bittern", value: data.liquid_waste_bittern || 0, color: LIQUID_WASTE_COLORS.bittern },
    { name: "Epsom Salt", value: data.potential_epsom_salt || 0, color: LIQUID_WASTE_COLORS.epsom_salt },
    { name: "Potash", value: data.potential_potash || 0, color: LIQUID_WASTE_COLORS.potash },
    { name: "Magnesium Oil", value: data.potential_magnesium_oil || 0, color: LIQUID_WASTE_COLORS.magnesium_oil }
  ]

  const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { payload: WastePredictionData }[]; label?: string }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-white border border-border rounded-lg p-3 shadow-lg">
          <p className="text-xs font-semibold text-foreground mb-2">{label}</p>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">
              <span className="font-medium text-primary">Total Waste:</span> {data.predicted_waste?.toLocaleString() || 0} kg
            </p>
            {data.total_solid_waste && (
              <p className="text-xs text-muted-foreground">
                <span className="font-medium text-purple-600">Solid:</span> {data.total_solid_waste.toLocaleString()} kg
              </p>
            )}
            {data.total_liquid_waste && (
              <p className="text-xs text-muted-foreground">
                <span className="font-medium text-amber-600">Liquid:</span> {data.total_liquid_waste.toLocaleString()} L
              </p>
            )}
          </div>
        </div>
      )
    }
    return null
  }

  if (isLoading && predictionMode === "forecast") {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-sm text-muted-foreground">Loading waste management data...</p>
        </div>
      </div>
    )
  }

  // Display data based on mode
  const displayData = predictionMode === "quick" && quickPredictionResult ? quickPredictionResult : averages

  return (
    <div className="space-y-4">
      {/* Header with Mode Selector */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <RecycleIcon className="h-7 w-7 text-primary" />
            Salt Waste Valorization
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            AI-powered waste prediction and valorization analytics
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Tabs value={predictionMode} onValueChange={(v) => setPredictionMode(v as "forecast" | "quick")}>
            <TabsList>
              <TabsTrigger value="forecast" className="gap-2">
                <TrendingUp className="h-4 w-4" />
                System Forecast
              </TabsTrigger>
              <TabsTrigger value="quick" className="gap-2">
                <Sparkles className="h-4 w-4" />
                Quick Prediction
              </TabsTrigger>
            </TabsList>
          </Tabs>
          
          <Badge variant="outline" className="px-3 py-1.5">
            <span className="text-xs font-medium">Updated: {new Date().toLocaleDateString('en-GB')}</span>
          </Badge>
        </div>
      </div>

      {/* Quick Prediction Form */}
      {predictionMode === "quick" && (
        <Card className="p-4">
          <div className="mb-4">
            <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
              <FlaskConical className="h-5 w-5 text-primary" />
              Input Parameters for Instant Prediction
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              Enter production and environmental data to get immediate waste predictions
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
            <div className="space-y-2">
              <Label htmlFor="prod-vol" className="text-xs">Production Volume (kg)</Label>
              <Input
                id="prod-vol"
                type="number"
                value={quickForm.production_volume}
                onChange={(e) => setQuickForm({ ...quickForm, production_volume: parseFloat(e.target.value) || 0 })}
                className="h-9"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="rain" className="text-xs">Rainfall (mm)</Label>
              <Input
                id="rain"
                type="number"
                step="0.01"
                value={quickForm.rain_sum}
                onChange={(e) => setQuickForm({ ...quickForm, rain_sum: parseFloat(e.target.value) || 0 })}
                className="h-9"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="temp" className="text-xs">Temperature (°C)</Label>
              <Input
                id="temp"
                type="number"
                step="0.1"
                value={quickForm.temperature_mean}
                onChange={(e) => setQuickForm({ ...quickForm, temperature_mean: parseFloat(e.target.value) || 0 })}
                className="h-9"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="humidity" className="text-xs">Humidity (%)</Label>
              <Input
                id="humidity"
                type="number"
                step="0.1"
                value={quickForm.humidity_mean}
                onChange={(e) => setQuickForm({ ...quickForm, humidity_mean: parseFloat(e.target.value) || 0 })}
                className="h-9"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="wind" className="text-xs">Wind Speed (km/h)</Label>
              <Input
                id="wind"
                type="number"
                step="0.1"
                value={quickForm.wind_speed_mean}
                onChange={(e) => setQuickForm({ ...quickForm, wind_speed_mean: parseFloat(e.target.value) || 0 })}
                className="h-9"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Button 
              onClick={handleQuickPrediction} 
              disabled={isQuickPredicting}
              className="flex-1 md:flex-initial"
            >
              {isQuickPredicting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Submitting...
                </>
              ) : (
                <>
                  <Beaker className="h-4 w-4 mr-2" />
                  Submit Prediction
                </>
              )}
            </Button>
            
            {quickJobId && quickJobStatus === "processing" && (
              <Button 
                onClick={handleCheckPredictionStatus}
                disabled={isQuickPredicting}
                variant="outline"
                className="flex-1 md:flex-initial"
              >
                {isQuickPredicting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2"></div>
                    Checking...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Check Status
                  </>
                )}
              </Button>
            )}
          </div>
          
          {/* Job Status Display */}
          {quickJobId && (
            <div className="mt-4 pt-4 border-t border-border">
              <div className="flex items-start gap-3">
                {quickJobStatus === "processing" && (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary mt-0.5"></div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-foreground">Processing Prediction</p>
                      <p className="text-xs text-muted-foreground mt-1">{quickJobMessage}</p>
                      <p className="text-xs text-blue-600 mt-1">Job ID: {quickJobId}</p>
                    </div>
                  </>
                )}
                {quickJobStatus === "completed" && (
                  <>
                    <CheckCircle2 className="h-5 w-5 text-success mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-success">Prediction Complete!</p>
                      <p className="text-xs text-muted-foreground mt-1">Results are displayed below.</p>
                    </div>
                  </>
                )}
                {quickJobStatus === "failed" && (
                  <>
                    <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-destructive">Prediction Failed</p>
                      <p className="text-xs text-muted-foreground mt-1">{quickJobMessage}</p>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </Card>
      )}

      {/* Key Metrics - Show Quick Prediction Result or Averages */}
      {(predictionMode === "forecast" || quickPredictionResult) && (
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          <Card className="p-5">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground font-medium">Production</p>
                <p className="text-3xl font-bold text-foreground">{displayData.production_volume?.toLocaleString() || 0}</p>
                <p className="text-sm text-muted-foreground">kg/day</p>
              </div>
              <div className="p-2.5 bg-primary/10 rounded-lg">
                <Factory className="h-6 w-6 text-primary" />
              </div>
            </div>
          </Card>

          <Card className="p-5">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground font-medium">Total Waste</p>
                <p className="text-3xl font-bold text-warning">{displayData.predicted_waste?.toLocaleString() || 0}</p>
                <p className="text-sm text-muted-foreground">kg/day</p>
              </div>
              <div className="p-2.5 bg-warning/10 rounded-lg">
                <RecycleIcon className="h-6 w-6 text-warning" />
              </div>
            </div>
          </Card>

          <Card className="p-5">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground font-medium">Solid Waste</p>
                <p className="text-3xl font-bold text-purple-600">{displayData.total_solid_waste?.toLocaleString() || 0}</p>
                <p className="text-sm text-muted-foreground">kg/day</p>
              </div>
              <div className="p-2.5 bg-purple-50 rounded-lg">
                <Beaker className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </Card>

          <Card className="p-5">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground font-medium">Liquid Waste</p>
                <p className="text-3xl font-bold text-amber-600">{displayData.total_liquid_waste?.toLocaleString() || 0}</p>
                <p className="text-sm text-muted-foreground">L/day</p>
              </div>
              <div className="p-2.5 bg-amber-50 rounded-lg">
                <Droplets className="h-6 w-6 text-amber-600" />
              </div>
            </div>
          </Card>

          <Card className="p-5">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground font-medium">Temperature</p>
                <p className="text-3xl font-bold text-destructive">{displayData.temperature_mean}°C</p>
                <p className="text-sm text-muted-foreground">Mean</p>
              </div>
              <div className="p-2.5 bg-destructive/10 rounded-lg">
                <ThermometerSun className="h-6 w-6 text-destructive" />
              </div>
            </div>
          </Card>

          <Card className="p-5">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground font-medium">Humidity</p>
                <p className="text-3xl font-bold text-cyan-600">{displayData.humidity_mean}%</p>
                <p className="text-sm text-muted-foreground">Relative</p>
              </div>
              <div className="p-2.5 bg-cyan-50 rounded-lg">
                <Droplets className="h-6 w-6 text-cyan-600" />
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Time Series Chart - Only for System Forecast */}
      {predictionMode === "forecast" && (
        <Card className="p-4">
          <div className="mb-4">
            <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Daily Waste Prediction Timeline
            </h2>
            <p className="text-xs text-muted-foreground mt-1">
              {wasteData.length > 0 && wasteData[0].total_solid_waste !== undefined 
                ? "Historical (30 days) and forecasted waste generation (14 days ahead) with solid/liquid breakdown"
                : "Historical (30 days) and forecasted waste generation (14 days ahead)"}
            </p>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={wasteData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="solidGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="rgb(168 85 247)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="rgb(168 85 247)" stopOpacity={0.05} />
                  </linearGradient>
                  <linearGradient id="liquidGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="rgb(245 158 11)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="rgb(245 158 11)" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgb(229 229 229)" />
                <XAxis
                  dataKey="period"
                  stroke="rgb(115 115 115)"
                  tick={{ fontSize: 10 }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis
                  stroke="rgb(115 115 115)"
                  tick={{ fontSize: 11 }}
                  label={{
                    value: "Waste (kg / L)",
                    angle: -90,
                    position: "insideLeft",
                    style: { fontSize: 11, fill: "rgb(115 115 115)" }
                  }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }} iconType="circle" />
                
                {/* Show breakdown if available, otherwise show total waste */}
                {wasteData.length > 0 && wasteData[0].total_solid_waste !== undefined ? (
                  <>
                    <Area
                      type="monotone"
                      dataKey="total_solid_waste"
                      stroke="rgb(168 85 247)"
                      strokeWidth={2}
                      fill="url(#solidGradient)"
                      name="Solid Waste (kg)"
                      stackId="waste"
                    />
                    
                    <Area
                      type="monotone"
                      dataKey="total_liquid_waste"
                      stroke="rgb(245 158 11)"
                      strokeWidth={2}
                      fill="url(#liquidGradient)"
                      name="Liquid Waste (L)"
                      stackId="waste"
                    />
                  </>
                ) : (
                  <Area
                    type="monotone"
                    dataKey="predicted_waste"
                    stroke="rgb(79 70 229)"
                    strokeWidth={2}
                    fill="url(#solidGradient)"
                    name="Total Waste (kg)"
                  />
                )}
              </ComposedChart>
            </ResponsiveContainer>
          </div>
          
          <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t border-border">
            {wasteData.length > 0 && wasteData[0].total_solid_waste !== undefined ? (
              <>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                  <span className="text-xs text-muted-foreground">Solid Waste (Gypsum, Limestone, Salt)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                  <span className="text-xs text-muted-foreground">Liquid Waste (Bittern & Recoverable)</span>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-indigo-600"></div>
                <span className="text-xs text-muted-foreground">Total Waste Prediction (awaiting detailed breakdown from backend)</span>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Waste Breakdown Pie Charts */}
      {(predictionMode === "forecast" || quickPredictionResult) && (
        <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
          {/* Show message if no breakdown data available */}
          {!displayData.total_solid_waste && !displayData.total_liquid_waste && (
            <div className="col-span-full">
              <Card className="p-4 bg-blue-50 border-blue-200">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-blue-900">Detailed Waste Breakdown Pending</p>
                    <p className="text-xs text-blue-700 mt-1">
                      The backend is currently returning basic waste predictions. Once the breakdown data (solid waste: gypsum, limestone, industrial salt; liquid waste: bittern, epsom salt, potash, magnesium oil) is added to the API response, the pie charts and detailed composition analysis will appear here.
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          )}
          
          {/* Solid Waste Breakdown - Only show if data exists */}
          {displayData.total_solid_waste && displayData.total_solid_waste > 0 && (
          <Card className="p-4">
            <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <Beaker className="h-4 w-4 text-purple-600" />
              Solid Waste Breakdown
            </h3>
            <div className="flex items-center justify-between">
              <div className="h-48 w-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={getSolidWasteBreakdown(displayData)}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {getSolidWasteBreakdown(displayData).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              
              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between p-2 bg-purple-50 rounded">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: SOLID_WASTE_COLORS.gypsum }}></div>
                    <span className="text-xs text-muted-foreground">Gypsum</span>
                  </div>
                  <span className="text-sm font-semibold">{(displayData.solid_waste_gypsum || 0).toLocaleString()} kg</span>
                </div>
                
                <div className="flex items-center justify-between p-2 bg-orange-50 rounded">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: SOLID_WASTE_COLORS.limestone }}></div>
                    <span className="text-xs text-muted-foreground">Limestone</span>
                  </div>
                  <span className="text-sm font-semibold">{(displayData.solid_waste_limestone || 0).toLocaleString()} kg</span>
                </div>
                
                <div className="flex items-center justify-between p-2 bg-blue-50 rounded">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: SOLID_WASTE_COLORS.industrial_salt }}></div>
                    <span className="text-xs text-muted-foreground">Industrial Salt</span>
                  </div>
                  <span className="text-sm font-semibold">{(displayData.solid_waste_industrial_salt || 0).toLocaleString()} kg</span>
                </div>
                
                <div className="flex items-center justify-between p-2 bg-purple-100 rounded border-t-2 border-purple-600 mt-3">
                  <span className="text-xs font-semibold text-foreground">Total Solid</span>
                  <span className="text-sm font-bold text-purple-600">{(displayData.total_solid_waste || 0).toLocaleString()} kg</span>
                </div>
              </div>
            </div>
          </Card>
          )}

          {/* Liquid Waste & Recoverable Products - Only show if data exists */}
          {displayData.total_liquid_waste && displayData.total_liquid_waste > 0 && (
          <Card className="p-4">
            <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <Droplets className="h-4 w-4 text-amber-600" />
              Liquid Waste & Recoverable Products
            </h3>
            <div className="flex items-center justify-between">
              <div className="h-48 w-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={getLiquidWasteBreakdown(displayData)}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {getLiquidWasteBreakdown(displayData).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              
              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between p-2 bg-amber-50 rounded">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: LIQUID_WASTE_COLORS.bittern }}></div>
                    <span className="text-xs text-muted-foreground">Bittern</span>
                  </div>
                  <span className="text-sm font-semibold">{(displayData.liquid_waste_bittern || 0).toLocaleString()} L</span>
                </div>
                
                <div className="flex items-center justify-between p-2 bg-green-50 rounded">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: LIQUID_WASTE_COLORS.epsom_salt }}></div>
                    <span className="text-xs text-muted-foreground">Epsom Salt*</span>
                  </div>
                  <span className="text-sm font-semibold">{(displayData.potential_epsom_salt || 0).toLocaleString()} kg</span>
                </div>
                
                <div className="flex items-center justify-between p-2 bg-pink-50 rounded">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: LIQUID_WASTE_COLORS.potash }}></div>
                    <span className="text-xs text-muted-foreground">Potash*</span>
                  </div>
                  <span className="text-sm font-semibold">{(displayData.potential_potash || 0).toLocaleString()} kg</span>
                </div>
                
                <div className="flex items-center justify-between p-2 bg-cyan-50 rounded">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: LIQUID_WASTE_COLORS.magnesium_oil }}></div>
                    <span className="text-xs text-muted-foreground">Magnesium Oil*</span>
                  </div>
                  <span className="text-sm font-semibold">{(displayData.potential_magnesium_oil || 0).toLocaleString()} L</span>
                </div>
                
                <div className="flex items-center justify-between p-2 bg-amber-100 rounded border-t-2 border-amber-600 mt-3">
                  <span className="text-xs font-semibold text-foreground">Total Liquid</span>
                  <span className="text-sm font-bold text-amber-600">{(displayData.total_liquid_waste || 0).toLocaleString()} L</span>
                </div>
                
                <p className="text-[10px] text-muted-foreground mt-2">* Potential recoverable products</p>
              </div>
            </div>
          </Card>
          )}
        </div>
      )}

      {/* Status and Insights */}
      <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
        <Card className="p-4">
          <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-success" />
            Waste Management Performance
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-success/10 border border-success/20 rounded-lg">
              <div>
                <p className="text-sm font-medium text-foreground">Waste-to-Production Ratio</p>
                <p className="text-xs text-muted-foreground mt-0.5">Current efficiency</p>
              </div>
              <span className="text-lg font-bold text-success">
                {displayData.production_volume && displayData.predicted_waste
                  ? ((displayData.predicted_waste / displayData.production_volume) * 100).toFixed(2)
                  : '0.00'}%
              </span>
            </div>
            
            <div className="flex justify-between items-center p-3 bg-primary/10 rounded-lg">
              <div>
                <p className="text-sm font-medium text-foreground">Solid Waste Percentage</p>
                <p className="text-xs text-muted-foreground mt-0.5">Of total waste</p>
              </div>
              <span className="text-lg font-bold text-primary">
                {displayData.predicted_waste && displayData.total_solid_waste
                  ? ((displayData.total_solid_waste / displayData.predicted_waste) * 100).toFixed(1)
                  : '0.0'}%
              </span>
            </div>

            <div className="flex justify-between items-center p-3 bg-amber-50 rounded-lg">
              <div>
                <p className="text-sm font-medium text-foreground">Valorization Potential</p>
                <p className="text-xs text-muted-foreground mt-0.5">Recoverable products value</p>
              </div>
              <span className="text-lg font-bold text-amber-600">
                ${((displayData.potential_epsom_salt || 0) * 0.5 + 
                   (displayData.potential_potash || 0) * 0.8 + 
                   (displayData.potential_magnesium_oil || 0) * 1.2).toLocaleString()}
              </span>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-warning" />
            {predictionMode === "quick" ? "Quick Prediction Insights" : "System Recommendations"}
          </h3>
          <div className="space-y-2">
            <div className="flex items-start gap-2 p-3 bg-success/10 border border-success/20 rounded-lg text-xs">
              <CheckCircle2 className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-foreground">High Valorization Opportunity</p>
                <p className="text-muted-foreground mt-0.5">
                  {predictionMode === "quick" 
                    ? "Your inputs predict significant recoverable products from bittern"
                    : "Current conditions favor efficient waste processing and recovery"}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs">
              <TrendingUp className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-foreground">Production Efficiency</p>
                <p className="text-muted-foreground mt-0.5">
                  Waste generation is {displayData.predicted_waste && displayData.production_volume
                    ? ((displayData.predicted_waste / displayData.production_volume) * 100 < 7 ? 'within' : 'above')
                    : 'within'} optimal thresholds for the production volume
                </p>
              </div>
            </div>

            {predictionMode === "forecast" && (
              <div className="flex items-start gap-2 p-3 bg-warning/10 border border-warning/20 rounded-lg text-xs">
                <AlertCircle className="h-4 w-4 text-warning mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-foreground">Weather Impact Alert</p>
                  <p className="text-muted-foreground mt-0.5">
                    Rainfall levels may affect waste volume. Monitor storage capacity
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-2 mt-4 pt-4 border-t border-border">
            <Button size="sm" className="flex-1 text-xs h-9">
              <RecycleIcon className="h-3.5 w-3.5 mr-1.5" />
              View Report
            </Button>
            <Button size="sm" variant="outline" className="flex-1 text-xs h-9">
              Export Data
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )
}
