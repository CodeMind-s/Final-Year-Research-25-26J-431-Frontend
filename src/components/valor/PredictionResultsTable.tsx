"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Download, Trash2, TrendingUp, Droplets, Thermometer } from "lucide-react";
import {
  WasteCompositionPredictionResponse,
  EnvironmentalFactorsPredictionResponse,
} from "@/types/valor.types";

interface PredictionResultsTableProps {
  compositionResults: WasteCompositionPredictionResponse[];
  environmentalResults: EnvironmentalFactorsPredictionResponse[];
  onDelete?: (id: string, type: 'composition' | 'environmental') => void;
  onExport?: () => void;
}

export function PredictionResultsTable({
  compositionResults,
  environmentalResults,
  onDelete,
  onExport,
}: PredictionResultsTableProps) {
  const hasResults = compositionResults.length > 0 || environmentalResults.length > 0;

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

  if (!hasResults) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <TrendingUp className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-lg font-medium text-muted-foreground">No predictions yet</p>
          <p className="text-sm text-muted-foreground mt-2">
            Submit a prediction request to see results here
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Waste Composition Results */}
      {compositionResults.length > 0 && (
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
              {onExport && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onExport}
                  className="gap-2"
                >
                  <Download className="h-4 w-4" />
                  Export
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
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
                        {onDelete && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onDelete(result.id, 'composition')}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Environmental Factors Results */}
      {environmentalResults.length > 0 && (
        <Card className="border-valor-200">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-valor-700">
                  <Droplets className="h-5 w-5" />
                  Environmental Factor Predictions
                </CardTitle>
                <CardDescription>
                  Optimal conditions for desired waste composition
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
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
                        {onDelete && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onDelete(result.id, 'environmental')}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

