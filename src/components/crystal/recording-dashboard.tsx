/**
 * @module RecordingDashboard
 * 
 * Dashboard for recording daily environmental measurements.
 * Allows field workers to input parameters like temperature, lagoon levels,
 * brine levels, and channel depths with validation and historical data display.
 */

"use client"

import { Card } from "@/components/crystal/ui/card"
import { Button } from "@/components/crystal/ui/button"
import { Input } from "@/components/crystal/ui/input"
import { Label } from "@/components/crystal/ui/label"
import { Textarea } from "@/components/crystal/ui/textarea"
import { useState, useEffect } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/crystal/ui/select"
import { Badge } from "@/components/crystal/ui/badge"
import { Droplets, Thermometer, Gauge, Wind, Calendar as CalendarIcon, User, Sparkles, Edit, History } from "lucide-react"
import { RecordConfirmationDialog } from "@/components/crystal/dialogs/record-confirmation-dialog"
import { crystallizationController } from "@/services/crystallization.controller"
import { useAuth } from "@/hooks/useAuth"
import { useToast } from "@/hooks/use-toast"
import { DailyMeasurementDataItem } from "@/types/crystallization.types"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/crystal/ui/dialog"


export function RecordingDashboard() {
  const { user, logout, isLoading } = useAuth()
  const { toast } = useToast()
  const [formData, setFormData] = useState({
    temperature: "",
    lagoon: "",
    orBrineLevel: "",
    orBundLevel: "",
    irBrineLevel: "",
    irBundLevel: "",
    eastChannel: "",
    westChannel: "",
  })

  const [recentEntries, setRecentEntries] = useState([
    {
      date: "2025-12-15 14:30",
      parameter: "Temperature",
      value: "32°C",
      worker: "Sunil Perera",
      site: "Sector A",
      remarks: "Optimal level",
    },
    {
      date: "2025-12-15 14:15",
      parameter: "OR Brine Level",
      value: "24.5°Bé",
      worker: "Nimal Silva",
      site: "Sector B",
      remarks: "-",
    },
    {
      date: "2025-12-15 13:45",
      parameter: "East Channel",
      value: "15cm",
      worker: "Kamal Fernando",
      site: "Sector C",
      remarks: "Normal depth",
    },
    {
      date: "2025-12-15 13:30",
      parameter: "Lagoon",
      value: "8.5%",
      worker: "Priya Jayawardena",
      site: "Sector A",
      remarks: "Within range",
    },
  ])

  const [showSuccess, setShowSuccess] = useState(false)
  const [recordedData, setRecordedData] = useState<any>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [historicalData, setHistoricalData] = useState<DailyMeasurementDataItem[]>([])
  const [isLoadingHistory, setIsLoadingHistory] = useState(false)
  const [editingRecord, setEditingRecord] = useState<DailyMeasurementDataItem | null>(null)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [editFormData, setEditFormData] = useState({
    temperature: "",
    lagoon: "",
    orBrineLevel: "",
    orBundLevel: "",
    irBrineLevel: "",
    irBundLevel: "",
    eastChannel: "",
    westChannel: "",
  })
  const [isUpdating, setIsUpdating] = useState(false)

  // Fetch historical data from last month
  useEffect(() => {
    fetchHistoricalData()
  }, [])

  // Populate edit form when editing record changes
  useEffect(() => {
    if (editingRecord) {
      setEditFormData({
        temperature: editingRecord.parameters.water_temperature.toString(),
        lagoon: editingRecord.parameters.lagoon.toString(),
        orBrineLevel: editingRecord.parameters.OR_brine_level.toString(),
        orBundLevel: editingRecord.parameters.OR_bund_level.toString(),
        irBrineLevel: editingRecord.parameters.IR_brine_level.toString(),
        irBundLevel: editingRecord.parameters.IR_bound_level.toString(),
        eastChannel: editingRecord.parameters.East_channel.toString(),
        westChannel: editingRecord.parameters.West_channel.toString(),
      })
    }
  }, [editingRecord])

  const fetchHistoricalData = async () => {
    try {
      setIsLoadingHistory(true)
      const endDate = new Date()
      const startDate = new Date()
      startDate.setMonth(startDate.getMonth() - 1)

      const data = await crystallizationController.getDailyMeasurements({
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
      })

      if (data && Array.isArray(data)) {
        setHistoricalData(data)
      }
    } catch (error) {
      console.error('Failed to fetch historical data:', error)
      toast({
        title: "Error",
        description: "Failed to load historical data",
        variant: "destructive",
      })
    } finally {
      setIsLoadingHistory(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate all fields are filled
    const requiredFields = [
      { name: 'Temperature', value: formData.temperature },
      { name: 'Lagoon', value: formData.lagoon },
      { name: 'OR Brine Level', value: formData.orBrineLevel },
      { name: 'OR Bund Level', value: formData.orBundLevel },
      { name: 'IR Brine Level', value: formData.irBrineLevel },
      { name: 'IR Bund Level', value: formData.irBundLevel },
      { name: 'East Channel', value: formData.eastChannel },
      { name: 'West Channel', value: formData.westChannel },
    ]

    const emptyFields = requiredFields.filter(field => !field.value || field.value.trim() === '')

    if (emptyFields.length > 0) {
      toast({
        title: "Validation Error",
        description: `Please fill in all required fields: ${emptyFields.map(f => f.name).join(', ')}`,
        variant: "destructive",
      })
      return
    }

    try {
      setIsSubmitting(true)

      // Prepare the payload
      const payload = {
        date: new Date().toISOString().split('T')[0], // Format: "YYYY-MM-DD"
        waterTemperature: parseFloat(formData.temperature) || 0,
        lagoon: parseFloat(formData.lagoon) || 0,
        orBrineLevel: parseFloat(formData.orBrineLevel) || 0,
        orBoundLevel: parseFloat(formData.orBundLevel) || 0,
        irBrineLevel: parseFloat(formData.irBrineLevel) || 0,
        irBoundLevel: parseFloat(formData.irBundLevel) || 0,
        eastChannel: parseFloat(formData.eastChannel) || 0,
        westChannel: parseFloat(formData.westChannel) || 0,
      }

      // Call the API
      const response = await crystallizationController.createDailyMeasurement(payload)

      // Update recent entries for UI
      const newEntry = {
        date: new Date().toLocaleString("en-US", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
        }),
        parameter: "Temperature",
        value: `${formData.temperature}°C`,
        worker: "Sunil Perera",
        site: "Field Data",
        remarks: "-",
      }
      setRecentEntries([newEntry, ...recentEntries.slice(0, 3)])

      // Show success dialog
      setRecordedData({
        site: "Puttalam",
        worker: user?.name,
        parameters: Object.values(payload).filter((value) => value !== null && value !== undefined).length,
      })
      setShowSuccess(true)

      // Refresh historical data to show the new entry
      await fetchHistoricalData()

      // Reset form
      setFormData({
        temperature: "",
        lagoon: "",
        orBrineLevel: "",
        orBundLevel: "",
        irBrineLevel: "",
        irBundLevel: "",
        eastChannel: "",
        westChannel: "",
      })
    } catch (error) {
      console.error('Failed to submit daily measurement:', error)
      alert('Failed to submit measurement. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!editingRecord) return

    // Validate all fields are filled
    const requiredFields = [
      { name: 'Temperature', value: editFormData.temperature },
      { name: 'Lagoon', value: editFormData.lagoon },
      { name: 'OR Brine Level', value: editFormData.orBrineLevel },
      { name: 'OR Bund Level', value: editFormData.orBundLevel },
      { name: 'IR Brine Level', value: editFormData.irBrineLevel },
      { name: 'IR Bund Level', value: editFormData.irBundLevel },
      { name: 'East Channel', value: editFormData.eastChannel },
      { name: 'West Channel', value: editFormData.westChannel },
    ]

    const emptyFields = requiredFields.filter(field => !field.value || field.value.trim() === '')

    if (emptyFields.length > 0) {
      toast({
        title: "Validation Error",
        description: `Please fill in all required fields: ${emptyFields.map(f => f.name).join(', ')}`,
        variant: "destructive",
      })
      return
    }

    try {
      setIsUpdating(true)

      const payload = {
        waterTemperature: parseFloat(editFormData.temperature) || 0,
        lagoon: parseFloat(editFormData.lagoon) || 0,
        orBrineLevel: parseFloat(editFormData.orBrineLevel) || 0,
        orBoundLevel: parseFloat(editFormData.orBundLevel) || 0,
        irBrineLevel: parseFloat(editFormData.irBrineLevel) || 0,
        irBoundLevel: parseFloat(editFormData.irBundLevel) || 0,
        eastChannel: parseFloat(editFormData.eastChannel) || 0,
        westChannel: parseFloat(editFormData.westChannel) || 0,
      }

      await crystallizationController.updateDailyMeasurement(editingRecord._id, payload)

      toast({
        title: "Success",
        description: "Measurement updated successfully",
      })

      // Refresh historical data
      await fetchHistoricalData()

      // Close dialog
      setShowEditDialog(false)
      setEditingRecord(null)
    } catch (error) {
      console.error('Failed to update daily measurement:', error)
      toast({
        title: "Error",
        description: "Failed to update measurement. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <div className="p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6">
      {/* Header with Icon */}
      <div className="flex items-center gap-2 sm:gap-3">
        <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
          <Sparkles className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
        </div>
        <div className="min-w-0">
          <h1 className="text-lg sm:text-xl md:text-2xl font-semibold text-foreground truncate">Field Data Recording</h1>
          <p className="text-xs sm:text-sm text-muted-foreground truncate">PSS Daily Environmental Monitoring</p>
        </div>
      </div>

      {/* Data Entry Form */}
      <Card className="p-3 sm:p-4 md:p-6 bg-linear-to-br from-background to-accent/5">
            <div className="flex items-center justify-between mb-2 gap-2">
              <h2 className="text-base sm:text-lg md:text-xl font-semibold text-foreground truncate">Record Parameters</h2>
              <Badge className="bg-primary/10 text-primary border-primary/20 shrink-0 text-[10px] sm:text-xs">{new Date().toLocaleDateString()}</Badge>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
              {/* Parameter Grid */}
              <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2">
                {/* Temperature */}
                <Card className="p-3 sm:p-4 bg-destructive/5 border-destructive/20 hover:bg-destructive/10 transition-colors">
                  <Label htmlFor="temperature" className="flex items-center gap-1.5 sm:gap-2 text-destructive font-semibold text-xs sm:text-sm">
                    <Thermometer className="h-4 w-4 sm:h-5 sm:w-5 shrink-0" />
                    Temperature
                  </Label>
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <Input
                      id="temperature"
                      type="number"
                      step="0.1"
                      placeholder="30"
                      value={formData.temperature}
                      onChange={(e) => setFormData({ ...formData, temperature: e.target.value })}
                      className="bg-background border-border text-foreground text-lg sm:text-2xl font-bold h-11 sm:h-14 text-center"
                    />
                    <span className="text-muted-foreground font-medium text-xs sm:text-sm shrink-0">°C</span>
                  </div>
                </Card>

                {/* Lagoon */}
                <Card className="p-3 sm:p-4 bg-primary/5 border-primary/20 hover:bg-primary/10 transition-colors">
                  <Label htmlFor="lagoon" className="flex items-center gap-1.5 sm:gap-2 text-primary font-semibold text-xs sm:text-sm">
                    <Droplets className="h-4 w-4 sm:h-5 sm:w-5 shrink-0" />
                    Lagoon
                  </Label>
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <Input
                      id="lagoon"
                      type="number"
                      step="0.1"
                      placeholder="2"
                      value={formData.lagoon}
                      onChange={(e) => setFormData({ ...formData, lagoon: e.target.value })}
                      className="bg-background border-border text-foreground text-lg sm:text-2xl font-bold h-11 sm:h-14 text-center"
                    />
                    <span className="text-muted-foreground font-medium text-xs sm:text-sm shrink-0">%</span>
                  </div>
                </Card>

                {/* OR Brine Level (Salinity) */}
                <Card className="p-3 sm:p-4 bg-primary/5 border-primary/20 hover:bg-primary/10 transition-colors">
                  <Label htmlFor="orBrineLevel" className="flex items-center gap-1.5 sm:gap-2 text-primary font-semibold text-xs sm:text-sm">
                    <Droplets className="h-4 w-4 sm:h-5 sm:w-5 shrink-0" />
                    OR Brine Level
                  </Label>
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <Input
                      id="orBrineLevel"
                      type="number"
                      step="0.1"
                      placeholder="3"
                      value={formData.orBrineLevel}
                      onChange={(e) => setFormData({ ...formData, orBrineLevel: e.target.value })}
                      className="bg-background border-border text-foreground text-lg sm:text-2xl font-bold h-11 sm:h-14 text-center"
                    />
                    <span className="text-muted-foreground font-medium text-xs sm:text-sm shrink-0">°Bé</span>
                  </div>
                </Card>

                {/* OR Bund Level (Water Level) */}
                <Card className="p-3 sm:p-4 bg-chart-2/10 border-chart-2/20 hover:bg-chart-2/20 transition-colors">
                  <Label htmlFor="orBundLevel" className="flex items-center gap-1.5 sm:gap-2 text-chart-2 font-semibold text-xs sm:text-sm">
                    <Gauge className="h-4 w-4 sm:h-5 sm:w-5 shrink-0" />
                    OR Bund Level
                  </Label>
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <Input
                      id="orBundLevel"
                      type="number"
                      step="0.1"
                      placeholder="1.5"
                      value={formData.orBundLevel}
                      onChange={(e) => setFormData({ ...formData, orBundLevel: e.target.value })}
                      className="bg-background border-border text-foreground text-lg sm:text-2xl font-bold h-11 sm:h-14 text-center"
                    />
                    <span className="text-muted-foreground font-medium text-xs sm:text-sm shrink-0">feet</span>
                  </div>
                </Card>

                {/* IR Brine Level (Salinity) */}
                <Card className="p-3 sm:p-4 bg-primary/5 border-primary/20 hover:bg-primary/10 transition-colors">
                  <Label htmlFor="irBrineLevel" className="flex items-center gap-1.5 sm:gap-2 text-primary font-semibold text-xs sm:text-sm">
                    <Droplets className="h-4 w-4 sm:h-5 sm:w-5 shrink-0" />
                    IR Brine Level
                  </Label>
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <Input
                      id="irBrineLevel"
                      type="number"
                      step="0.1"
                      placeholder="4.5"
                      value={formData.irBrineLevel}
                      onChange={(e) => setFormData({ ...formData, irBrineLevel: e.target.value })}
                      className="bg-background border-border text-foreground text-lg sm:text-2xl font-bold h-11 sm:h-14 text-center"
                    />
                    <span className="text-muted-foreground font-medium text-xs sm:text-sm shrink-0">°Bé</span>
                  </div>
                </Card>

                {/* IR Bund Level (Water Level) */}
                <Card className="p-3 sm:p-4 bg-chart-2/10 border-chart-2/20 hover:bg-chart-2/20 transition-colors">
                  <Label htmlFor="irBundLevel" className="flex items-center gap-1.5 sm:gap-2 text-chart-2 font-semibold text-xs sm:text-sm">
                    <Gauge className="h-4 w-4 sm:h-5 sm:w-5 shrink-0" />
                    IR Bund Level
                  </Label>
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <Input
                      id="irBundLevel"
                      type="number"
                      step="0.1"
                      placeholder="5"
                      value={formData.irBundLevel}
                      onChange={(e) => setFormData({ ...formData, irBundLevel: e.target.value })}
                      className="bg-background border-border text-foreground text-lg sm:text-2xl font-bold h-11 sm:h-14 text-center"
                    />
                    <span className="text-muted-foreground font-medium text-xs sm:text-sm shrink-0">feet</span>
                  </div>
                </Card>

                {/* East Channel (Water Level) */}
                <Card className="p-3 sm:p-4 bg-chart-3/10 border-chart-3/20 hover:bg-chart-3/20 transition-colors">
                  <Label htmlFor="eastChannel" className="flex items-center gap-1.5 sm:gap-2 text-chart-3 font-semibold text-xs sm:text-sm">
                    <Wind className="h-4 w-4 sm:h-5 sm:w-5 shrink-0" />
                    East Channel
                  </Label>
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <Input
                      id="eastChannel"
                      type="number"
                      step="0.1"
                      placeholder="7"
                      value={formData.eastChannel}
                      onChange={(e) => setFormData({ ...formData, eastChannel: e.target.value })}
                      className="bg-background border-border text-foreground text-lg sm:text-2xl font-bold h-11 sm:h-14 text-center"
                    />
                    <span className="text-muted-foreground font-medium text-xs sm:text-sm shrink-0">cm</span>
                  </div>
                </Card>

                {/* West Channel (Water Level) */}
                <Card className="p-3 sm:p-4 bg-chart-3/10 border-chart-3/20 hover:bg-chart-3/20 transition-colors">
                  <Label htmlFor="westChannel" className="flex items-center gap-1.5 sm:gap-2 text-chart-3 font-semibold text-xs sm:text-sm">
                    <Wind className="h-4 w-4 sm:h-5 sm:w-5 shrink-0" />
                    West Channel
                  </Label>
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <Input
                      id="westChannel"
                      type="number"
                      step="0.1"
                      placeholder="8"
                      value={formData.westChannel}
                      onChange={(e) => setFormData({ ...formData, westChannel: e.target.value })}
                      className="bg-background border-border text-foreground text-lg sm:text-2xl font-bold h-11 sm:h-14 text-center"
                    />
                    <span className="text-muted-foreground font-medium text-xs sm:text-sm shrink-0">cm</span>
                  </div>
                </Card>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                size="lg"
                disabled={isSubmitting}
                className="w-full h-11 sm:h-14 text-base sm:text-lg font-semibold bg-linear-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
              >
                <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 mr-2 shrink-0" />
                {isSubmitting ? "Submitting..." : "Record Field Data"}
              </Button>
            </form>
          </Card>

      {/* Historical Data Section */}
      <Card className="p-3 sm:p-4 md:p-6 bg-linear-to-br from-background to-accent/5">
        <div className="flex items-center justify-between mb-4 gap-2">
          <div className="flex items-center gap-2">
            <History className="h-5 w-5 text-primary" />
            <h2 className="text-base sm:text-lg md:text-xl font-semibold text-foreground">Last Month's Records</h2>
          </div>
          <Badge variant="outline" className="text-[10px] sm:text-xs">
            {historicalData.length} Entries
          </Badge>
        </div>

        {isLoadingHistory ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-muted-foreground">Loading historical data...</div>
          </div>
        ) : historicalData.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-muted-foreground">No historical data available</div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-2 sm:p-3 font-semibold text-foreground">Date</th>
                  {/* <th className="text-center p-2 sm:p-3 font-semibold text-foreground">Day #</th> */}
                  <th className="text-center p-2 sm:p-3 font-semibold text-destructive">
                    <div className="flex items-center justify-center gap-1">
                      <Thermometer className="h-4 w-4" />
                      <span className="hidden sm:inline">Temp</span>
                    </div>
                  </th>
                  <th className="text-center p-2 sm:p-3 font-semibold text-primary">
                    <div className="flex items-center justify-center gap-1">
                      <Droplets className="h-4 w-4" />
                      <span className="hidden sm:inline">Lagoon</span>
                    </div>
                  </th>
                  <th className="text-center p-2 sm:p-3 font-semibold text-primary">
                    <div className="flex items-center justify-center gap-1">
                      <Droplets className="h-4 w-4" />
                      <span className="hidden sm:inline">OR Brine</span>
                    </div>
                  </th>
                  <th className="text-center p-2 sm:p-3 font-semibold text-chart-2">
                    <div className="flex items-center justify-center gap-1">
                      <Gauge className="h-4 w-4" />
                      <span className="hidden sm:inline">OR Bund</span>
                    </div>
                  </th>
                  <th className="text-center p-2 sm:p-3 font-semibold text-primary">
                    <div className="flex items-center justify-center gap-1">
                      <Droplets className="h-4 w-4" />
                      <span className="hidden sm:inline">IR Brine</span>
                    </div>
                  </th>
                  <th className="text-center p-2 sm:p-3 font-semibold text-chart-2">
                    <div className="flex items-center justify-center gap-1">
                      <Gauge className="h-4 w-4" />
                      <span className="hidden sm:inline">IR Bund</span>
                    </div>
                  </th>
                  <th className="text-center p-2 sm:p-3 font-semibold text-chart-3">
                    <div className="flex items-center justify-center gap-1">
                      <Wind className="h-4 w-4" />
                      <span className="hidden sm:inline">E.Ch</span>
                    </div>
                  </th>
                  <th className="text-center p-2 sm:p-3 font-semibold text-chart-3">
                    <div className="flex items-center justify-center gap-1">
                      <Wind className="h-4 w-4" />
                      <span className="hidden sm:inline">W.Ch</span>
                    </div>
                  </th>
                  <th className="text-center p-2 sm:p-3 font-semibold text-foreground">Action</th>
                </tr>
              </thead>
              <tbody>
                {historicalData.map((record) => (
                  <tr key={record._id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                    <td className="p-2 sm:p-3 text-foreground font-medium">
                      {new Date(record.date).toLocaleDateString()}
                    </td>
                    {/* <td className="p-2 sm:p-3 text-center text-muted-foreground">
                      {record.dayNumber}
                    </td> */}
                    <td className="p-2 sm:p-3 text-center font-bold text-destructive">
                      {record.parameters.water_temperature}°C
                    </td>
                    <td className="p-2 sm:p-3 text-center font-bold text-primary">
                      {record.parameters.lagoon}%
                    </td>
                    <td className="p-2 sm:p-3 text-center font-bold text-primary">
                      {record.parameters.OR_brine_level}°Bé
                    </td>
                    <td className="p-2 sm:p-3 text-center font-bold text-chart-2">
                      {record.parameters.OR_bund_level}cm
                    </td>
                    <td className="p-2 sm:p-3 text-center font-bold text-primary">
                      {record.parameters.IR_brine_level}°Bé
                    </td>
                    <td className="p-2 sm:p-3 text-center font-bold text-chart-2">
                      {record.parameters.IR_bound_level}cm
                    </td>
                    <td className="p-2 sm:p-3 text-center font-bold text-chart-3">
                      {record.parameters.East_channel}cm
                    </td>
                    <td className="p-2 sm:p-3 text-center font-bold text-chart-3">
                      {record.parameters.West_channel}cm
                    </td>
                    <td className="p-2 sm:p-3 text-center">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setEditingRecord(record)
                          setShowEditDialog(true)
                        }}
                        className="h-8 w-8 p-0"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>


      {/* Confirmation Dialog */}
      <RecordConfirmationDialog
        open={showSuccess}
        onOpenChange={(open) => {
          setShowSuccess(open)
          if (!open) setRecordedData(null)
        }}
        recordData={recordedData}
      />

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="h-5 w-5 text-primary" />
              Edit Measurement Record
            </DialogTitle>
            {editingRecord && (
              <p className="text-sm text-muted-foreground">
                Date: {new Date(editingRecord.date).toLocaleDateString()} | Day #{editingRecord.dayNumber}
              </p>
            )}
          </DialogHeader>

          <form onSubmit={handleUpdate} className="space-y-4">
            <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2">
              {/* Temperature */}
              <Card className="p-3 sm:p-4 bg-destructive/5 border-destructive/20">
                <Label htmlFor="edit-temperature" className="flex items-center gap-1.5 sm:gap-2 text-destructive font-semibold text-xs sm:text-sm">
                  <Thermometer className="h-4 w-4 sm:h-5 sm:w-5 shrink-0" />
                  Temperature
                </Label>
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <Input
                    id="edit-temperature"
                    type="number"
                    step="0.1"
                    value={editFormData.temperature}
                    onChange={(e) => setEditFormData({ ...editFormData, temperature: e.target.value })}
                    className="bg-background border-border text-foreground text-lg sm:text-2xl font-bold h-11 sm:h-14 text-center"
                  />
                  <span className="text-muted-foreground font-medium text-xs sm:text-sm shrink-0">°C</span>
                </div>
              </Card>

              {/* Lagoon */}
              <Card className="p-3 sm:p-4 bg-primary/5 border-primary/20">
                <Label htmlFor="edit-lagoon" className="flex items-center gap-1.5 sm:gap-2 text-primary font-semibold text-xs sm:text-sm">
                  <Droplets className="h-4 w-4 sm:h-5 sm:w-5 shrink-0" />
                  Lagoon
                </Label>
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <Input
                    id="edit-lagoon"
                    type="number"
                    step="0.1"
                    value={editFormData.lagoon}
                    onChange={(e) => setEditFormData({ ...editFormData, lagoon: e.target.value })}
                    className="bg-background border-border text-foreground text-lg sm:text-2xl font-bold h-11 sm:h-14 text-center"
                  />
                  <span className="text-muted-foreground font-medium text-xs sm:text-sm shrink-0">%</span>
                </div>
              </Card>

              {/* OR Brine Level */}
              <Card className="p-3 sm:p-4 bg-primary/5 border-primary/20">
                <Label htmlFor="edit-orBrineLevel" className="flex items-center gap-1.5 sm:gap-2 text-primary font-semibold text-xs sm:text-sm">
                  <Droplets className="h-4 w-4 sm:h-5 sm:w-5 shrink-0" />
                  OR Brine Level
                </Label>
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <Input
                    id="edit-orBrineLevel"
                    type="number"
                    step="0.1"
                    value={editFormData.orBrineLevel}
                    onChange={(e) => setEditFormData({ ...editFormData, orBrineLevel: e.target.value })}
                    className="bg-background border-border text-foreground text-lg sm:text-2xl font-bold h-11 sm:h-14 text-center"
                  />
                  <span className="text-muted-foreground font-medium text-xs sm:text-sm shrink-0">°Bé</span>
                </div>
              </Card>

              {/* OR Bund Level */}
              <Card className="p-3 sm:p-4 bg-chart-2/10 border-chart-2/20">
                <Label htmlFor="edit-orBundLevel" className="flex items-center gap-1.5 sm:gap-2 text-chart-2 font-semibold text-xs sm:text-sm">
                  <Gauge className="h-4 w-4 sm:h-5 sm:w-5 shrink-0" />
                  OR Bund Level
                </Label>
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <Input
                    id="edit-orBundLevel"
                    type="number"
                    step="0.1"
                    value={editFormData.orBundLevel}
                    onChange={(e) => setEditFormData({ ...editFormData, orBundLevel: e.target.value })}
                    className="bg-background border-border text-foreground text-lg sm:text-2xl font-bold h-11 sm:h-14 text-center"
                  />
                  <span className="text-muted-foreground font-medium text-xs sm:text-sm shrink-0">cm</span>
                </div>
              </Card>

              {/* IR Brine Level */}
              <Card className="p-3 sm:p-4 bg-primary/5 border-primary/20">
                <Label htmlFor="edit-irBrineLevel" className="flex items-center gap-1.5 sm:gap-2 text-primary font-semibold text-xs sm:text-sm">
                  <Droplets className="h-4 w-4 sm:h-5 sm:w-5 shrink-0" />
                  IR Brine Level
                </Label>
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <Input
                    id="edit-irBrineLevel"
                    type="number"
                    step="0.1"
                    value={editFormData.irBrineLevel}
                    onChange={(e) => setEditFormData({ ...editFormData, irBrineLevel: e.target.value })}
                    className="bg-background border-border text-foreground text-lg sm:text-2xl font-bold h-11 sm:h-14 text-center"
                  />
                  <span className="text-muted-foreground font-medium text-xs sm:text-sm shrink-0">°Bé</span>
                </div>
              </Card>

              {/* IR Bund Level */}
              <Card className="p-3 sm:p-4 bg-chart-2/10 border-chart-2/20">
                <Label htmlFor="edit-irBundLevel" className="flex items-center gap-1.5 sm:gap-2 text-chart-2 font-semibold text-xs sm:text-sm">
                  <Gauge className="h-4 w-4 sm:h-5 sm:w-5 shrink-0" />
                  IR Bund Level
                </Label>
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <Input
                    id="edit-irBundLevel"
                    type="number"
                    step="0.1"
                    value={editFormData.irBundLevel}
                    onChange={(e) => setEditFormData({ ...editFormData, irBundLevel: e.target.value })}
                    className="bg-background border-border text-foreground text-lg sm:text-2xl font-bold h-11 sm:h-14 text-center"
                  />
                  <span className="text-muted-foreground font-medium text-xs sm:text-sm shrink-0">cm</span>
                </div>
              </Card>

              {/* East Channel */}
              <Card className="p-3 sm:p-4 bg-chart-3/10 border-chart-3/20">
                <Label htmlFor="edit-eastChannel" className="flex items-center gap-1.5 sm:gap-2 text-chart-3 font-semibold text-xs sm:text-sm">
                  <Wind className="h-4 w-4 sm:h-5 sm:w-5 shrink-0" />
                  East Channel
                </Label>
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <Input
                    id="edit-eastChannel"
                    type="number"
                    step="0.1"
                    value={editFormData.eastChannel}
                    onChange={(e) => setEditFormData({ ...editFormData, eastChannel: e.target.value })}
                    className="bg-background border-border text-foreground text-lg sm:text-2xl font-bold h-11 sm:h-14 text-center"
                  />
                  <span className="text-muted-foreground font-medium text-xs sm:text-sm shrink-0">cm</span>
                </div>
              </Card>

              {/* West Channel */}
              <Card className="p-3 sm:p-4 bg-chart-3/10 border-chart-3/20">
                <Label htmlFor="edit-westChannel" className="flex items-center gap-1.5 sm:gap-2 text-chart-3 font-semibold text-xs sm:text-sm">
                  <Wind className="h-4 w-4 sm:h-5 sm:w-5 shrink-0" />
                  West Channel
                </Label>
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <Input
                    id="edit-westChannel"
                    type="number"
                    step="0.1"
                    value={editFormData.westChannel}
                    onChange={(e) => setEditFormData({ ...editFormData, westChannel: e.target.value })}
                    className="bg-background border-border text-foreground text-lg sm:text-2xl font-bold h-11 sm:h-14 text-center"
                  />
                  <span className="text-muted-foreground font-medium text-xs sm:text-sm shrink-0">cm</span>
                </div>
              </Card>
            </div>

            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowEditDialog(false)
                  setEditingRecord(null)
                }}
                disabled={isUpdating}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isUpdating}
                className="bg-primary hover:bg-primary/90"
              >
                {isUpdating ? "Updating..." : "Update Record"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
