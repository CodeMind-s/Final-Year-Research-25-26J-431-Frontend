"use client"

import { Card } from "@/components/crystal/ui/card"
import { Button } from "@/components/crystal/ui/button"
import { Input } from "@/components/crystal/ui/input"
import { Label } from "@/components/crystal/ui/label"
import { useState, useEffect } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/crystal/ui/select"
import { Badge } from "@/components/crystal/ui/badge"
import { TrendingUp, TrendingDown, Edit, Trash2, Plus, Calendar, Package, BarChart3 } from "lucide-react"
import { productionController } from "@/services/production.controller"
import { ActualMonthlyProductionData } from "@/types/production.types"
import { useToast } from "@/hooks/use-toast"
import { crystallizationController } from "@/services/crystallization.controller"
import { useTranslations } from 'next-intl'
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
import { AreaChart, Area, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from "recharts"

export function SaltProductionRecording() {
    const t = useTranslations('crystal.saltProduction')
    const tc = useTranslations('crystal.common')
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
            // 1 year before current month for table records
            const startDate = new Date(today.getFullYear(), today.getMonth() - 12, 1)
            // 6 months after current month for chart predictions
            const endDate = new Date(today.getFullYear(), today.getMonth() + 6, 1)

            const formatDate = (d: Date) => d.toISOString().slice(0, 7)

            // Fetch actual productions (past data - 1 year)
            const actualResponse = await productionController.getActualMonthlyProductions({
                startMonth: formatDate(startDate),
                endMonth: formatDate(today),
            })

            const actualData = Array.isArray(actualResponse) ? actualResponse : (actualResponse?.data || [])

            // Fetch predicted productions (for entire timeline including past months)
            try {
                const predictedResponse = await crystallizationController.getPredictedMonthlyProductions({
                    startMonth: formatDate(startDate),
                    endMonth: formatDate(endDate),
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
                title: tc('error'),
                description: t('toast.fetchError'),
                variant: "destructive",
            })
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchProductions()
    }, [])

    // Prepare chart data
    const prepareChartData = () => {
        const today = new Date()
        const currentMonth = today.toISOString().slice(0, 7)

        // Create 12-month timeline (6 months before + current + 5 months after = 12 total)
        const months: string[] = []
        for (let i = -6; i <= 5; i++) {
            const date = new Date(today.getFullYear(), today.getMonth() + i, 1)
            months.push(date.toISOString().slice(0, 7))
        }

        // Create a map of actual production by month (convert bags to tons)
        const actualMap: { [key: string]: number } = {}
        productions.forEach((prod) => {
            actualMap[prod.month] = prod.production_volume * 50 // Convert bags to tons
        })

        // Create a map of predicted production by month (convert bags to tons)
        const predictedMap: { [key: string]: number } = {}
        predictedProductions.forEach((pred) => {
            predictedMap[pred.month] = (pred.productionForecast || 0) * 50 // Convert bags to tons
        })

        // Build chart data for each month
        const chartData = months.map((month) => {
            const [year, monthNum] = month.split('-')
            const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
            const monthIndex = parseInt(monthNum) - 1
            const label = `${monthNames[monthIndex]} ${year}`

            return {
                month: month,
                label: label,
                actual: actualMap[month] || null,
                predicted: predictedMap[month] || null,
                isCurrentMonth: month === currentMonth,
            }
        })

        return chartData
    }

    const chartData = prepareChartData()

    // Calculate average production in tons
    const calculateAverageProduction = () => {
        if (productions.length === 0) return 0
        const total = productions.reduce((sum, prod) => sum + (prod.production_volume * 50), 0)
        return total / productions.length
    }

    const averageProduction = calculateAverageProduction()

    // Determine season based on month (Maha: Oct-Mar, Yala: Apr-Sep)
    const getSeasonFromMonth = (monthStr: string): string => {
        if (!monthStr) return ""
        const month = parseInt(monthStr.split('-')[1])
        // Yala: April (4) to September (9)
        // Maha: October (10) to March (3)
        return (month >= 4 && month <= 9) ? 'Yala' : 'Maha'
    }

    // Handle create
    const handleCreate = async () => {
        if (!formData.month || !formData.production_volume || !formData.season) {
            toast({
                title: t('toast.validationError'),
                description: t('toast.fillAllFields'),
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
                title: tc('success'),
                description: t('toast.createSuccess'),
            })

            setShowCreateDialog(false)
            setFormData({ month: "", production_volume: "", season: "" })
            fetchProductions()
        } catch (error) {
            console.error("Failed to create production:", error)
            toast({
                title: tc('error'),
                description: t('toast.createError'),
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
                title: t('toast.validationError'),
                description: t('toast.fillAllFields'),
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
                title: tc('success'),
                description: t('toast.updateSuccess'),
            })

            setShowEditDialog(false)
            setSelectedProduction(null)
            setFormData({ month: "", production_volume: "", season: "" })
            fetchProductions()
        } catch (error) {
            console.error("Failed to update production:", error)
            toast({
                title: tc('error'),
                description: t('toast.updateError'),
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
                title: tc('success'),
                description: t('toast.deleteSuccess'),
            })

            setShowDeleteDialog(false)
            setSelectedProduction(null)
            fetchProductions()
        } catch (error) {
            console.error("Failed to delete production:", error)
            toast({
                title: tc('error'),
                description: t('toast.deleteError'),
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
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Package className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-semibold text-foreground">{t('title')}</h1>
                        <p className="text-sm text-muted-foreground">{t('subtitle')}</p>
                    </div>
                </div>
                <Button
                    onClick={() => {
                        setFormData({ month: "", production_volume: "", season: "" })
                        setShowCreateDialog(true)
                    }}
                    className="bg-primary hover:bg-primary/90"
                >
                    <Plus className="h-4 w-4 mr-2" />
                    {t('newRecord')}
                </Button>
            </div>

            {/* Production Chart */}
            {chartData.length > 0 && (
                <Card className="p-5 border-2 border-primary/30 bg-linear-to-br from-primary/5 to-background">
                    <div className="mb-4 flex items-center gap-2">
                        <BarChart3 className="h-5 w-5 text-primary" />
                        <div>
                            <h2 className="text-lg font-semibold text-foreground">{t('productionOverview')}</h2>
                            <p className="text-sm text-muted-foreground">{t('productionOverviewSubtitle')}</p>
                        </div>
                    </div>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="rgb(99 102 241)" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="rgb(99 102 241)" stopOpacity={0.1} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgb(229 229 229)" />
                                <XAxis
                                    dataKey="label"
                                    stroke="rgb(115 115 115)"
                                    tick={{ fontSize: 12 }}
                                    angle={-20}
                                    textAnchor="end"
                                    height={70}
                                />
                                <YAxis
                                    stroke="rgb(115 115 115)"
                                    tick={{ fontSize: 11 }}
                                    label={{ value: t('chart.yAxisLabel'), angle: -90, position: "insideLeft", style: { fontSize: 11 } }}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: "white",
                                        border: "1px solid rgb(229 229 229)",
                                        borderRadius: "8px",
                                        fontSize: "12px"
                                    }}
                                    formatter={(value: any) => [`${value?.toLocaleString()} ${t('chart.tons')}`, ""]}
                                />
                                <Legend
                                    wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }}
                                    formatter={(value) => value === "actual" ? t('chart.actual') : t('chart.predicted')}
                                />
                                {/* Red vertical dashed line for current month */}
                                <ReferenceLine
                                    x={chartData.find(d => d.isCurrentMonth)?.label}
                                    stroke="rgb(239 68 68)"
                                    strokeDasharray="5 5"
                                    strokeWidth={2}
                                    label={{ value: "Current", position: "top", fill: "rgb(239 68 68)", fontSize: 11 }}
                                />
                                {/* Actual production: solid line with colored area */}
                                <Area
                                    type="monotone"
                                    dataKey="actual"
                                    stroke="rgb(99 102 241)"
                                    strokeWidth={2}
                                    fillOpacity={1}
                                    fill="url(#colorActual)"
                                    name="actual"
                                    connectNulls={false}
                                />
                                {/* Predicted production: dashed line with no area */}
                                <Line
                                    type="monotone"
                                    dataKey="predicted"
                                    stroke="rgb(168 85 247)"
                                    strokeWidth={2}
                                    strokeDasharray="5 5"
                                    name="predicted"
                                    dot={{ fill: "rgb(168 85 247)", r: 3 }}
                                    connectNulls={false}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </Card>
            )}

            {/* Production Records Table */}
            <Card className="p-6">
                <div className="mb-4">
                    <h2 className="text-lg font-semibold text-foreground">{t('productionRecords')}</h2>
                    <p className="text-sm text-muted-foreground">{t('productionRecordsSubtitle')}</p>
                </div>

                {isLoading ? (
                    <div className="text-center py-12">
                        <p className="text-muted-foreground">{t('loadingRecords')}</p>
                    </div>
                ) : productions.length === 0 ? (
                    <div className="text-center py-12">
                        <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">{t('noRecordsFound')}</p>
                        <Button
                            onClick={() => setShowCreateDialog(true)}
                            variant="outline"
                            className="mt-4"
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            {t('createFirstRecord')}
                        </Button>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-border">
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">{t('table.month')}</th>
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">{t('table.season')}</th>
                                    <th className="text-right py-3 px-4 text-sm font-semibold text-foreground">{t('table.production')}</th>
                                    <th className="text-right py-3 px-4 text-sm font-semibold text-foreground">{t('table.actions')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {productions.map((production) => (
                                    <tr
                                        key={production._id}
                                        className={`border-b border-border hover:bg-muted/50 transition-colors ${production.season === "Maha"
                                            ? "bg-indigo-500/15  border-indigo-500/10"
                                            : "bg-purple-500/15 border-purple-500/10"
                                            }`}
                                    >
                                        <td className="py-3 px-4">
                                            <div className="flex items-center gap-2">
                                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                                <span className="font-medium text-foreground">{formatMonth(production.month)}</span>
                                            </div>
                                        </td>
                                        <td className="py-3 px-4">
                                            <Badge
                                                className={
                                                    production.season === "Maha"
                                                        ? "bg-indigo-500/10 text-indigo-600 border-indigo-500/20"
                                                        : "bg-purple-500/10 text-purple-600 border-purple-500/20"
                                                }
                                            >
                                                {production.season}
                                            </Badge>
                                        </td>
                                        <td className="py-3 px-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                {(production.production_volume * 50) >= averageProduction ? (
                                                    <TrendingUp className="h-4 w-4 text-green-500" />
                                                ) : (
                                                    <TrendingDown className="h-4 w-4 text-red-500" />
                                                )}
                                                <span
                                                    className={`font-bold ${(production.production_volume * 50) >= averageProduction
                                                        ? 'text-green-600'
                                                        : 'text-red-600'
                                                        }`}
                                                >
                                                    {(production.production_volume * 50).toLocaleString()}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="py-3 px-4">
                                            <div className="flex items-center justify-end gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => openEditDialog(production)}
                                                    className="hover:bg-primary/10 hover:text-primary"
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => openDeleteDialog(production)}
                                                    className="hover:bg-destructive/10 hover:text-destructive"
                                                >
                                                    <Trash2 className="h-4 w-4" />
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
                        <DialogTitle>{t('dialog.createTitle')}</DialogTitle>
                        <DialogDescription>
                            {t('dialog.createDescription')}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="create-month">{t('form.month')}</Label>
                            <Input
                                id="create-month"
                                type="month"
                                value={formData.month}
                                onChange={(e) => {
                                    const month = e.target.value
                                    const season = getSeasonFromMonth(month)
                                    setFormData({ ...formData, month, season })
                                }}
                                className="bg-background border-border text-foreground"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="create-season">{t('form.season')}</Label>
                            <Select value={formData.season} onValueChange={(value) => setFormData({ ...formData, season: value })} disabled>
                                <SelectTrigger id="create-season" className="bg-muted border-border text-foreground">
                                    <SelectValue placeholder={t('form.selectSeason')} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Maha">{t('seasons.maha')}</SelectItem>
                                    <SelectItem value="Yala">{t('seasons.yala')}</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="create-volume">{t('form.productionVolume')}</Label>
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
                            {tc('cancel')}
                        </Button>
                        <Button onClick={handleCreate} disabled={isSubmitting}>
                            {isSubmitting ? t('buttons.creating') : t('buttons.createRecord')}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit Dialog */}
            <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{t('dialog.editTitle')}</DialogTitle>
                        <DialogDescription>
                            {selectedProduction && t('dialog.editDescription', { month: formatMonth(selectedProduction.month) })}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="edit-month">{t('form.month')}</Label>
                            <Input
                                id="edit-month"
                                type="month"
                                value={formData.month}
                                disabled
                                className="bg-muted border-border text-muted-foreground"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-season">{t('form.season')}</Label>
                            <Select value={formData.season} onValueChange={(value) => setFormData({ ...formData, season: value })} disabled>
                                <SelectTrigger id="edit-season" className="bg-muted border-border text-muted-foreground" >
                                    <SelectValue placeholder={t('form.selectSeason')} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Maha">{t('seasons.maha')}</SelectItem>
                                    <SelectItem value="Yala">{t('seasons.yala')}</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-volume">{t('form.productionVolume')}</Label>
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
                            {tc('cancel')}
                        </Button>
                        <Button onClick={handleUpdate} disabled={isSubmitting}>
                            {isSubmitting ? t('buttons.updating') : t('buttons.updateRecord')}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{t('dialog.deleteTitle')}</AlertDialogTitle>
                        <AlertDialogDescription>
                            {selectedProduction && t('dialog.deleteDescription', { month: formatMonth(selectedProduction.month) })}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>{tc('cancel')}</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            disabled={isSubmitting}
                            className="bg-destructive hover:bg-destructive/90"
                        >
                            {isSubmitting ? t('buttons.deleting') : t('buttons.delete')}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
