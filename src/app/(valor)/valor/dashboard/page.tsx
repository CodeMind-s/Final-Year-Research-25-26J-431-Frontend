"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Sparkles, Download, RefreshCw, Thermometer, Target, Plus, Maximize2, Minimize2, Bell, BarChart3 } from "lucide-react";
import { WasteCompositionForm } from "@/components/valor/WasteCompositionForm";
import { EnvironmentalFactorsForm } from "@/components/valor/EnvironmentalFactorsForm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { SummaryCards } from "@/components/valor/SummaryCards";
import { Trash2, Droplets } from "lucide-react";
import {
  WasteCompositionPredictionRequest,
  WasteCompositionPredictionResponse,
  EnvironmentalFactorsPredictionRequest,
  EnvironmentalFactorsPredictionResponse,
} from "@/types/valor.types";
import { useToast } from "@/hooks/use-toast";

export default function ValorDashboardPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [compositionResults, setCompositionResults] = useState<WasteCompositionPredictionResponse[]>([]);
  const [environmentalResults, setEnvironmentalResults] = useState<EnvironmentalFactorsPredictionResponse[]>([]);
  const [showCompositionDialog, setShowCompositionDialog] = useState(false);
  const [showEnvironmentalDialog, setShowEnvironmentalDialog] = useState(false);
  const [expandedTable, setExpandedTable] = useState<'composition' | 'environmental' | null>(null);

  // Handle Waste Composition Prediction
  const handleCompositionPrediction = async (data: WasteCompositionPredictionRequest) => {
    setIsLoading(true);
    try {
      // TODO: Replace with actual API call
      // const response = await valorController.predictWasteComposition(data);

      // Mock response for now
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const mockResult: WasteCompositionPredictionResponse = {
        id: `comp-${Date.now()}`,
        requestData: data,
        predictions: {
          magnesiumChloride: Math.random() * 50 + 20,
          calciumSulfate: Math.random() * 40 + 15,
          sodiumSulfate: Math.random() * 35 + 10,
          organicMatter: Math.random() * 25 + 5,
          totalWaste: 0,
        },
        confidenceScore: Math.random() * 0.3 + 0.7,
        economicValue: 0,
        timestamp: new Date().toISOString(),
      };

      // Calculate total waste
      mockResult.predictions.totalWaste =
        mockResult.predictions.magnesiumChloride +
        mockResult.predictions.calciumSulfate +
        mockResult.predictions.sodiumSulfate +
        mockResult.predictions.organicMatter;

      // Calculate economic value (mock prices per kg)
      mockResult.economicValue = Math.round(
        mockResult.predictions.magnesiumChloride * 450 +
        mockResult.predictions.calciumSulfate * 380 +
        mockResult.predictions.sodiumSulfate * 420 +
        mockResult.predictions.organicMatter * 150
      );

      setCompositionResults([mockResult, ...compositionResults]);
      setShowCompositionDialog(false);

      toast({
        title: "Prediction Complete",
        description: `Predicted ${mockResult.predictions.totalWaste.toFixed(2)} kg of total waste for ${data.month}`,
      });
    } catch {
      toast({
        title: "Prediction Failed",
        description: "Failed to predict waste composition. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Environmental Factors Prediction
  const handleEnvironmentalPrediction = async (data: EnvironmentalFactorsPredictionRequest) => {
    setIsLoading(true);
    try {
      // TODO: Replace with actual API call
      // const response = await valorController.predictEnvironmentalFactors(data);

      // Mock response for now
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const optimalTemp = Math.random() * 10 + 28;
      const optimalHumidity = Math.random() * 20 + 65;

      const mockResult: EnvironmentalFactorsPredictionResponse = {
        id: `env-${Date.now()}`,
        requestData: data,
        predictions: {
          optimalTemperature: optimalTemp,
          optimalHumidity: optimalHumidity,
          temperatureRange: [optimalTemp - 3, optimalTemp + 3],
          humidityRange: [optimalHumidity - 8, optimalHumidity + 8],
        },
        feasibility: Math.random() > 0.5 ? 'High' : Math.random() > 0.3 ? 'Medium' : 'Low',
        confidenceScore: Math.random() * 0.3 + 0.7,
        timestamp: new Date().toISOString(),
      };

      setEnvironmentalResults([mockResult, ...environmentalResults]);
      setShowEnvironmentalDialog(false);

      toast({
        title: "Prediction Complete",
        description: `Optimal conditions: ${optimalTemp.toFixed(1)}°C, ${optimalHumidity.toFixed(1)}% humidity`,
      });
    } catch {
      toast({
        title: "Prediction Failed",
        description: "Failed to predict environmental factors. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Delete
  const handleDelete = (id: string, type: 'composition' | 'environmental') => {
    if (type === 'composition') {
      setCompositionResults(compositionResults.filter(r => r.id !== id));
    } else {
      setEnvironmentalResults(environmentalResults.filter(r => r.id !== id));
    }

    toast({
      title: "Deleted",
      description: "Prediction result removed successfully.",
    });
  };

  // Handle Export
  const handleExport = () => {
    const exportData = {
      compositionResults,
      environmentalResults,
      exportedAt: new Date().toISOString(),
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataUri = "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);
    const exportFileDefaultName = `valor-predictions-${new Date().toISOString().split("T")[0]}.json`;

    const linkElement = document.createElement("a");
    linkElement.setAttribute("href", dataUri);
    linkElement.setAttribute("download", exportFileDefaultName);
    linkElement.click();

    toast({
      title: "Export Complete",
      description: "Predictions exported successfully.",
    });
  };

  // Handle Clear All
  const handleClearAll = () => {
    setCompositionResults([]);
    setEnvironmentalResults([]);

    toast({
      title: "Cleared",
      description: "All prediction results have been cleared.",
    });
  };

  // Format date helper
  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getConfidenceBadge = (score: number) => {
    if (score >= 0.8) return <Badge className="bg-green-500">High ({(score * 100).toFixed(0)}%)</Badge>;
    if (score >= 0.6) return <Badge className="bg-yellow-500">Medium ({(score * 100).toFixed(0)}%)</Badge>;
    return <Badge className="bg-red-500">Low ({(score * 100).toFixed(0)}%)</Badge>;
  };

  const getFeasibilityBadge = (feasibility: string) => {
    const colors = {
      High: 'bg-green-500',
      Medium: 'bg-yellow-500',
      Low: 'bg-red-500',
    };
    return <Badge className={colors[feasibility as keyof typeof colors]}>{feasibility}</Badge>;
  };

  return (
    <div className="p-6 space-y-6">
      {/* Summary Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-red-200 bg-gradient-to-br from-red-50 to-white">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Bell className="h-4 w-4 text-red-600" />
              Active Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">3</div>
            <p className="text-xs text-muted-foreground mt-2">2 critical, 1 warning</p>
          </CardContent>
        </Card>

        <Card className="border-valor-200 bg-gradient-to-br from-valor-50 to-white">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total By-Products
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-valor-700">
              {compositionResults.length > 0
                ? compositionResults.reduce((sum, r) => sum + r.predictions.totalWaste, 0).toFixed(0)
                : '0'} kg
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              From {compositionResults.length} prediction{compositionResults.length !== 1 ? 's' : ''}
            </p>
          </CardContent>
        </Card>

        <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-white">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-blue-600" />
              Conversion Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">87%</div>
            <p className="text-xs text-muted-foreground mt-2">+5% from last month</p>
          </CardContent>
        </Card>
      </div>

      {/* Summary Cards */}
      {compositionResults.length > 0 && (
        <SummaryCards compositionResults={compositionResults} />
      )}

      {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Button
            onClick={() => setShowCompositionDialog(true)}
            className="bg-valor-600 hover:bg-valor-700 text-white gap-2 h-14"
            size="lg"
          >
            <Plus className="h-5 w-5" />
            <div className="text-left">
              <div className="font-semibold">Predict Waste Composition</div>
              <div className="text-xs opacity-90">From environmental factors</div>
            </div>
          </Button>
          <Button
            onClick={() => setShowEnvironmentalDialog(true)}
            className="bg-valor-600 hover:bg-valor-700 text-white gap-2 h-14"
            size="lg"
          >
            <Plus className="h-5 w-5" />
            <div className="text-left">
              <div className="font-semibold">Predict Environmental Factors</div>
              <div className="text-xs opacity-90">From target composition</div>
            </div>
          </Button>
        </div>

        {/* Results Tables - Side by Side with Expand */}
        <div className={`grid gap-6 ${
          expandedTable === null 
            ? 'lg:grid-cols-2' 
            : 'grid-cols-1'
        }`}>
          {/* Waste Composition Results */}
          {(expandedTable === null || expandedTable === 'composition') && (
            <Card className="border-valor-200">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-valor-700">
                      <Thermometer className="h-5 w-5" />
                      Waste Composition Predictions
                    </CardTitle>
                    <CardDescription>
                      Predicted waste output based on environmental conditions
                    </CardDescription>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setExpandedTable(expandedTable === 'composition' ? null : 'composition')}
                    className="shrink-0"
                  >
                    {expandedTable === 'composition' ? (
                      <Minimize2 className="h-4 w-4" />
                    ) : (
                      <Maximize2 className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {compositionResults.length > 0 ? (
                  <div className="rounded-md border overflow-x-auto">
                    <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date & Month</TableHead>
                      <TableHead>Conditions</TableHead>
                      <TableHead>MgCl₂ (kg)</TableHead>
                      <TableHead>CaSO₄ (kg)</TableHead>
                      <TableHead>Na₂SO₄ (kg)</TableHead>
                      <TableHead>Organic (kg)</TableHead>
                      <TableHead>Total (kg)</TableHead>
                      <TableHead>Value (LKR)</TableHead>
                      <TableHead>Confidence</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {compositionResults.map((result) => (
                      <TableRow key={result.id}>
                        <TableCell>
                          <div className="font-medium">{result.requestData.month}</div>
                          <div className="text-xs text-muted-foreground">
                            {formatDate(result.timestamp)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div className="flex items-center gap-1">
                              <Thermometer className="h-3 w-3 text-orange-500" />
                              {result.requestData.temperature}°C
                            </div>
                            <div className="flex items-center gap-1">
                              <Droplets className="h-3 w-3 text-blue-500" />
                              {result.requestData.humidity}%
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium text-purple-600">
                          {result.predictions.magnesiumChloride.toFixed(2)}
                        </TableCell>
                        <TableCell className="font-medium text-blue-600">
                          {result.predictions.calciumSulfate.toFixed(2)}
                        </TableCell>
                        <TableCell className="font-medium text-green-600">
                          {result.predictions.sodiumSulfate.toFixed(2)}
                        </TableCell>
                        <TableCell className="font-medium text-amber-600">
                          {result.predictions.organicMatter.toFixed(2)}
                        </TableCell>
                        <TableCell className="font-bold text-valor-700">
                          {result.predictions.totalWaste.toFixed(2)}
                        </TableCell>
                        <TableCell className="font-semibold text-green-700">
                          {result.economicValue.toLocaleString()}
                        </TableCell>
                        <TableCell>{getConfidenceBadge(result.confidenceScore)}</TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(result.id, 'composition')}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Thermometer className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-lg font-medium text-muted-foreground">No waste composition predictions yet</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Click &ldquo;Predict Waste Composition&rdquo; above to create your first prediction
                </p>
              </div>
            )}
          </CardContent>
        </Card>
          )}

          {/* Environmental Factors Results */}
          {(expandedTable === null || expandedTable === 'environmental') && (
            <Card className="border-valor-200">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-valor-700">
                      <Target className="h-5 w-5" />
                      Environmental Factor Predictions
                    </CardTitle>
                    <CardDescription>
                      Optimal conditions for desired waste composition
                    </CardDescription>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setExpandedTable(expandedTable === 'environmental' ? null : 'environmental')}
                    className="shrink-0"
                  >
                    {expandedTable === 'environmental' ? (
                      <Minimize2 className="h-4 w-4" />
                    ) : (
                      <Maximize2 className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {environmentalResults.length > 0 ? (
                  <div className="rounded-md border overflow-x-auto">
                    <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date & Month</TableHead>
                      <TableHead>Target Composition</TableHead>
                      <TableHead>Optimal Temp (°C)</TableHead>
                      <TableHead>Optimal Humidity (%)</TableHead>
                      <TableHead>Temp Range</TableHead>
                      <TableHead>Humidity Range</TableHead>
                      <TableHead>Feasibility</TableHead>
                      <TableHead>Confidence</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {environmentalResults.map((result) => (
                      <TableRow key={result.id}>
                        <TableCell>
                          <div className="font-medium">{result.requestData.month}</div>
                          <div className="text-xs text-muted-foreground">
                            {formatDate(result.timestamp)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-xs space-y-0.5">
                            {result.requestData.targetComposition.magnesiumChloride ? (
                              <div>MgCl₂: {result.requestData.targetComposition.magnesiumChloride}kg</div>
                            ) : null}
                            {result.requestData.targetComposition.calciumSulfate ? (
                              <div>CaSO₄: {result.requestData.targetComposition.calciumSulfate}kg</div>
                            ) : null}
                            {result.requestData.targetComposition.sodiumSulfate ? (
                              <div>Na₂SO₄: {result.requestData.targetComposition.sodiumSulfate}kg</div>
                            ) : null}
                            {result.requestData.targetComposition.organicMatter ? (
                              <div>Organic: {result.requestData.targetComposition.organicMatter}kg</div>
                            ) : null}
                          </div>
                        </TableCell>
                        <TableCell className="font-medium text-orange-600">
                          {result.predictions.optimalTemperature.toFixed(1)}°C
                        </TableCell>
                        <TableCell className="font-medium text-blue-600">
                          {result.predictions.optimalHumidity.toFixed(1)}%
                        </TableCell>
                        <TableCell className="text-sm">
                          {result.predictions.temperatureRange[0].toFixed(1)} - {result.predictions.temperatureRange[1].toFixed(1)}°C
                        </TableCell>
                        <TableCell className="text-sm">
                          {result.predictions.humidityRange[0].toFixed(1)} - {result.predictions.humidityRange[1].toFixed(1)}%
                        </TableCell>
                        <TableCell>{getFeasibilityBadge(result.feasibility)}</TableCell>
                        <TableCell>{getConfidenceBadge(result.confidenceScore)}</TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(result.id, 'environmental')}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Target className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-lg font-medium text-muted-foreground">No environmental factor predictions yet</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Click &ldquo;Predict Environmental Factors&rdquo; above to create your first prediction
                </p>
              </div>
            )}
          </CardContent>
        </Card>
          )}
        </div>

      {/* Dialogs for Forms */}
      <Dialog open={showCompositionDialog} onOpenChange={setShowCompositionDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-valor-700">
              <Thermometer className="h-5 w-5" />
              Predict Waste Composition
            </DialogTitle>
            <DialogDescription>
              Enter environmental factors to predict salt waste composition for the month
            </DialogDescription>
          </DialogHeader>
          <WasteCompositionForm
            onSubmit={handleCompositionPrediction}
            isLoading={isLoading}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={showEnvironmentalDialog} onOpenChange={setShowEnvironmentalDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-valor-700">
              <Target className="h-5 w-5" />
              Predict Environmental Factors
            </DialogTitle>
            <DialogDescription>
              Enter desired waste composition to predict optimal environmental conditions
            </DialogDescription>
          </DialogHeader>
          <EnvironmentalFactorsForm
            onSubmit={handleEnvironmentalPrediction}
            isLoading={isLoading}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

