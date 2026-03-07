/**
 * @module SaltProductionRecording
 * 
 * Dashboard for recording and managing monthly salt production data.
 * Displays production chart with historical and predicted data,
 * and provides CRUD operations for production records.
 */

"use client"

import { Card } from "@/components/crystal/ui/card"
import { Button } from "@/components/crystal/ui/button"
import { Input } from "@/components/crystal/ui/input"
import { Label } from "@/components/crystal/ui/label"
import { useState, useEffect } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/crystal/ui/select"
import { Badge } from "@/components/crystal/ui/badge"
import { useTranslations } from 'next-intl'
import { TrendingUp, Edit, Trash2, Plus, Calendar, Package, BarChart3 } from "lucide-react"
import { productionController } from "@/services/production.controller"
import { ActualMonthlyProductionData } from "@/types/production.types"
import { useToast } from "@/hooks/use-toast"
import { crystallizationController } from "@/services/crystallization.controller"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/crystal/ui/dialog"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/crystal/ui/alert-dialog"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

export function SaltProductionRecording() {
    const t = useTranslations('crystal')
    const { toast } = useToast()
    const [productions, setProductions] = useState<ActualMonthlyProductionData[]>([])
    const [predictedProductions, setPredictedProductions] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isSubmitting, setIsSubmitting] = useState(false)

    // Form state
    const [showCreateDialog, setShowCreateDialog] = useState(false)
    const [showEditDialog, setShowEditDialog] = useState(false)
    const [showDeleteDialog, setShowDeleteDialog] = useState(false)
    const [selectedProduction, setSelectedProduction] = useState<ActualMonthlyProductionData | null>(null)

    const [formData, setFormData] = useState({
        month: "",
        production_volume: "",
        season: "",
    })

    // Fetch production records
    const fetchProductions = async () => {
        try {
            setIsLoading(true)
            const today = new Date()
            
            // Get past 12 months for actual data
            const past12Months = new Date(today)
            past12Months.setMonth(today.getMonth() - 12)
            
            // Get next 2 months for predicted data
            const next2Months = new Date(today)
            next2Months.setMonth(today.getMonth() + 2)

            const formatDate = (d: Date) => d.toISOString().slice(0, 7)

            // Fetch actual productions (past 12 months)
            const actualResponse = await productionController.getActualMonthlyProductions({
                startMonth: formatDate(past12Months),
                endMonth: formatDate(today),
            })

            const actualData = Array.isArray(actualResponse) ? actualResponse : (actualResponse?.data || [])

            // Fetch predicted productions (next 2 months)
            try {
                const predictedResponse = await crystallizationController.getPredictedMonthlyProductions({
                    startMonth: formatDate(today),
                    endMonth: formatDate(next2Months),
                })
                const predictedData = Array.isArray(predictedResponse) ? predictedResponse : (predictedResponse?.data || [])
                setPredictedProductions(predictedData)
            } catch (error) {
                console.error("Failed to fetch predicted productions:", error)
                setPredictedProductions([])
            }

            // Sort by month descending
            const sortedData = actualData.sort((a, b) => b.month.localeCompare(a.month))
            setProductions(sortedData)
        } catch (error) {
            console.error("Failed to fetch productions:", error)
            toast({
                title: "Error",
                description: "Failed to fetch production records",
                variant: "destructive",
            })
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchProductions()
    }, [])

    // Prepare chart data - Past 12 months actual + Next 2 months predicted
    const prepareChartData = () => {
        // Create a map for actual monthly data
        const actualMonthlyData: { [key: string]: number } = {}
        productions.forEach((prod) => {
            actualMonthlyData[prod.month] = prod.production_volume
        })

        // Create a map for predicted monthly data
        const predictedMonthlyData: { [key: string]: number } = {}
        predictedProductions.forEach((pred) => {
            predictedMonthlyData[pred.month] = pred.productionForecast || 0
        })

        // Get all unique months and sort them
        const allMonths = new Set([...Object.keys(actualMonthlyData), ...Object.keys(predictedMonthlyData)])
        const sortedMonths = Array.from(allMonths).sort()

        // Format month for display (e.g., "Jan 2024")
        const formatMonthLabel = (monthStr: string): string => {
            const [year, month] = monthStr.split('-')
            const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
            const monthIndex = parseInt(month) - 1
            return `${monthNames[monthIndex]} ${year}`
        }

        // Combine into chart data (actual past + predicted future)
        const combinedData = sortedMonths.map((month) => ({
            month: formatMonthLabel(month),
            actual: actualMonthlyData[month] ? Math.round(actualMonthlyData[month]) : undefined,
            predicted: predictedMonthlyData[month] ? Math.round(predictedMonthlyData[month]) : undefined,
        }))

        return combinedData
    }

    const chartData = prepareChartData()

    // Handle create
    const handleCreate = async () => {
        if (!formData.month || !formData.production_volume || !formData.season) {
            toast({
                title: "Validation Error",
                description: "Please fill in all fields",
                variant: "destructive",
            })
            return
        }

        try {
            setIsSubmitting(true)
            await productionController.createProduction({
                month: formData.month,
                production_volume: parseFloat(formData.production_volume),
                season: formData.season,
            })

            toast({
                title: "Success",
                description: "Production record created successfully",
            })

            setShowCreateDialog(false)
            setFormData({ month: "", production_volume: "", season: "" })
            fetchProductions()
        } catch (error) {
            console.error("Failed to create production:", error)
            toast({
                title: "Error",
                description: "Failed to create production record",
                variant: "destructive",
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    // Handle update
    const handleUpdate = async () => {
        if (!selectedProduction || !formData.production_volume || !formData.season) {
            toast({
                title: "Validation Error",
                description: "Please fill in all fields",
                variant: "destructive",
            })
            return
        }

        try {
            setIsSubmitting(true)
            await productionController.updateProduction(selectedProduction._id, {
                production_volume: parseFloat(formData.production_volume),
                season: formData.season,
            })

            toast({
                title: "Success",
                description: "Production record updated successfully",
            })

            setShowEditDialog(false)
            setSelectedProduction(null)
            setFormData({ month: "", production_volume: "", season: "" })
            fetchProductions()
        } catch (error) {
            console.error("Failed to update production:", error)
            toast({
                title: "Error",
                description: "Failed to update production record",
                variant: "destructive",
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    // Handle delete
    const handleDelete = async () => {
        if (!selectedProduction) return

        try {
            setIsSubmitting(true)
            await productionController.deleteProduction(selectedProduction._id)

            toast({
                title: "Success",
                description: "Production record deleted successfully",
            })

            setShowDeleteDialog(false)
            setSelectedProduction(null)
            fetchProductions()
        } catch (error) {
            console.error("Failed to delete production:", error)
            toast({
                title: "Error",
                description: "Failed to delete production record",
                variant: "destructive",
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    // Open edit dialog
    const openEditDialog = (production: ActualMonthlyProductionData) => {
        setSelectedProduction(production)
        setFormData({
            month: production.month,
            production_volume: production.production_volume.toString(),
            season: production.season,
        })
        setShowEditDialog(true)
    }

    // Open delete dialog
    const openDeleteDialog = (production: ActualMonthlyProductionData) => {
        setSelectedProduction(production)
        setShowDeleteDialog(true)
    }

    // Format month for display
    const formatMonth = (monthStr: string): string => {
        const [year, month] = monthStr.split('-')
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
        const monthIndex = parseInt(month) - 1
        return `${monthNames[monthIndex]} ${year}`
    }

    return (
        <div className="p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
                <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                    <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <Package className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                    </div>
                    <div className="min-w-0">
                        <h1 className="text-lg sm:text-xl md:text-2xl font-semibold text-foreground truncate">{t('recording.title')}</h1>
                        <p className="text-xs sm:text-sm text-muted-foreground truncate">{t('recording.productionRecords')}</p>
                    </div>
                </div>
                <Button
                    onClick={() => {
                        setFormData({ month: "", production_volume: "", season: "" })
                        setShowCreateDialog(true)
                    }}
                    className="bg-primary hover:bg-primary/90 w-full sm:w-auto shrink-0 text-xs sm:text-sm h-8 sm:h-10"
                >
                    <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
                    {t('recording.addRecord')}
                </Button>
            </div>

            {/* Production Chart */}
            {chartData.length > 0 && (
                <Card className="p-3 sm:p-4 md:p-6">
                    <div className="mb-3 sm:mb-4 flex items-center gap-1.5 sm:gap-2">
                        <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5 text-primary shrink-0" />
                        <div className="min-w-0">
                            <h2 className="text-sm sm:text-base md:text-lg font-semibold text-foreground truncate">{t('recording.productionOverview')}</h2>
                            <p className="text-xs sm:text-sm text-muted-foreground truncate">{t('recording.actualVsPredicted')}</p>
                        </div>
                    </div>
                    <div className="h-56 sm:h-64 md:h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgb(229 229 229)" />
                                <XAxis
                                    dataKey="month"
                                    stroke="rgb(115 115 115)"
                                    tick={{ fontSize: 9 }}
                                    angle={-20}
                                    textAnchor="end"
                                    height={60}
                                />
                                <YAxis
                                    stroke="rgb(115 115 115)"
                                    tick={{ fontSize: 9 }}
                                    label={{ value: "Production (bags)", angle: -90, position: "insideLeft", style: { fontSize: 9 } }}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: "white",
                                        border: "1px solid rgb(229 229 229)",
                                        borderRadius: "8px",
                                        fontSize: "11px"
                                    }}
                                    formatter={(value: any) => [`${value?.toLocaleString()} bags`, ""]}
                                />
                                <Legend
                                    wrapperStyle={{ fontSize: "10px", paddingTop: "8px" }}
                                    formatter={(value) => value === "actual" ? "Actual (past 12 months)" : "Predicted (next 2 months)"}
                                />
                                <Bar
                                    dataKey="actual"
                                    fill="rgb(99 102 241)"
                                    name="actual"
                                    radius={[4, 4, 0, 0]}
                                />
                                <Bar
                                    dataKey="predicted"
                                    fill="rgb(168 85 247)"
                                    name="predicted"
                                    radius={[4, 4, 0, 0]}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>
            )}

            {/* Production Records Table */}
            <Card className="p-3 sm:p-4 md:p-6">
                <div className="mb-3 sm:mb-4">
                    <h2 className="text-sm sm:text-base md:text-lg font-semibold text-foreground">{t('recording.productionRecords')}</h2>
                    <p className="text-xs sm:text-sm text-muted-foreground">{t('recording.actualVsPredicted')}</p>
                </div>

                {isLoading ? (
                    <div className="text-center py-8 sm:py-12">
                        <p className="text-muted-foreground text-xs sm:text-sm">Loading production records...</p>
                    </div>
                ) : productions.length === 0 ? (
                    <div className="text-center py-8 sm:py-12">
                        <Package className="h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground mx-auto mb-3 sm:mb-4" />
                        <p className="text-muted-foreground text-xs sm:text-sm">No production records found</p>
                        <Button
                            onClick={() => setShowCreateDialog(true)}
                            variant="outline"
                            className="mt-3 sm:mt-4 text-xs sm:text-sm h-8 sm:h-10"
                        >
                            <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
                            Create First Record
                        </Button>
                    </div>
                ) : (
                    <div className="overflow-x-auto -mx-3 sm:mx-0">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-border">
                                    <th className="text-left py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm font-semibold text-foreground">Month</th>
                                    <th className="text-left py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm font-semibold text-foreground">Season</th>
                                    <th className="text-right py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm font-semibold text-foreground">Production (bags)</th>
                                    <th className="text-right py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm font-semibold text-foreground">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {productions.map((production) => (
                                    <tr key={production._id} className="border-b border-border hover:bg-muted/50 transition-colors">
                                        <td className="py-2 sm:py-3 px-2 sm:px-4">
                                            <div className="flex items-center gap-1 sm:gap-2">
                                                <Calendar className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground shrink-0" />
                                                <span className="font-medium text-foreground text-xs sm:text-sm truncate">{formatMonth(production.month)}</span>
                                            </div>
                                        </td>
                                        <td className="py-2 sm:py-3 px-2 sm:px-4">
                                            <Badge
                                                className={
                                                    production.season === "Maha"
                                                        ? "bg-indigo-500/10 text-indigo-600 border-indigo-500/20 text-[10px] sm:text-xs"
                                                        : "bg-purple-500/10 text-purple-600 border-purple-500/20 text-[10px] sm:text-xs"
                                                }
                                            >
                                                {production.season}
                                            </Badge>
                                        </td>
                                        <td className="py-2 sm:py-3 px-2 sm:px-4 text-right">
                                            <div className="flex items-center justify-end gap-1 sm:gap-2">
                                                <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-success shrink-0" />
                                                <span className="font-bold text-foreground text-xs sm:text-sm">
                                                    {production.production_volume.toLocaleString()}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="py-2 sm:py-3 px-2 sm:px-4">
                                            <div className="flex items-center justify-end gap-1 sm:gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => openEditDialog(production)}
                                                    className="hover:bg-primary/10 hover:text-primary h-7 w-7 sm:h-8 sm:w-8 p-0"
                                                >
                                                    <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => openDeleteDialog(production)}
                                                    className="hover:bg-destructive/10 hover:text-destructive h-7 w-7 sm:h-8 sm:w-8 p-0"
                                                >
                                                    <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </Card>

            {/* Create Dialog */}
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Create Production Record</DialogTitle>
                        <DialogDescription>
                            Add a new monthly production record
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="create-month">Month</Label>
                            <Input
                                id="create-month"
                                type="month"
                                value={formData.month}
                                onChange={(e) => setFormData({ ...formData, month: e.target.value })}
                                className="bg-background border-border text-foreground"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="create-season">Season</Label>
                            <Select value={formData.season} onValueChange={(value) => setFormData({ ...formData, season: value })}>
                                <SelectTrigger id="create-season" className="bg-background border-border text-foreground">
                                    <SelectValue placeholder="Select season" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Maha">Maha</SelectItem>
                                    <SelectItem value="Yala">Yala</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="create-volume">Production Volume (bags)</Label>
                            <Input
                                id="create-volume"
                                type="number"
                                step="0.1"
                                placeholder="0.0"
                                value={formData.production_volume}
                                onChange={(e) => setFormData({ ...formData, production_volume: e.target.value })}
                                className="bg-background border-border text-foreground"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleCreate} disabled={isSubmitting}>
                            {isSubmitting ? "Creating..." : "Create Record"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit Dialog */}
            <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Production Record</DialogTitle>
                        <DialogDescription>
                            Update production record for {selectedProduction && formatMonth(selectedProduction.month)}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="edit-month">Month</Label>
                            <Input
                                id="edit-month"
                                type="month"
                                value={formData.month}
                                disabled
                                className="bg-muted border-border text-muted-foreground"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-season">Season</Label>
                            <Select value={formData.season} onValueChange={(value) => setFormData({ ...formData, season: value })}>
                                <SelectTrigger id="edit-season" className="bg-background border-border text-foreground">
                                    <SelectValue placeholder="Select season" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Maha">Maha</SelectItem>
                                    <SelectItem value="Yala">Yala</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-volume">Production Volume (tons)</Label>
                            <Input
                                id="edit-volume"
                                type="number"
                                step="0.1"
                                placeholder="0.0"
                                value={formData.production_volume}
                                onChange={(e) => setFormData({ ...formData, production_volume: e.target.value })}
                                className="bg-background border-border text-foreground"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowEditDialog(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleUpdate} disabled={isSubmitting}>
                            {isSubmitting ? "Updating..." : "Update Record"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete the production record for{" "}
                            <strong>{selectedProduction && formatMonth(selectedProduction.month)}</strong>.
                            This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            disabled={isSubmitting}
                            className="bg-destructive hover:bg-destructive/90"
                        >
                            {isSubmitting ? "Deleting..." : "Delete"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
