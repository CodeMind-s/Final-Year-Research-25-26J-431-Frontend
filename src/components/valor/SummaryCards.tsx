"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, DollarSign, Recycle, Sparkles } from "lucide-react";
import { WasteCompositionPredictionResponse } from "@/types/valor.types";

interface SummaryCardsProps {
  compositionResults: WasteCompositionPredictionResponse[];
}

export function SummaryCards({ compositionResults }: SummaryCardsProps) {
  const totalWaste = compositionResults.reduce((sum, r) => sum + r.predictions.totalWaste, 0);
  const totalValue = compositionResults.reduce((sum, r) => sum + r.economicValue, 0);
  const avgConfidence = compositionResults.length > 0
    ? compositionResults.reduce((sum, r) => sum + r.confidenceScore, 0) / compositionResults.length
    : 0;

  // Calculate most valuable compound
  const compounds = {
    magnesiumChloride: compositionResults.reduce((sum, r) => sum + r.predictions.magnesiumChloride, 0),
    calciumSulfate: compositionResults.reduce((sum, r) => sum + r.predictions.calciumSulfate, 0),
    sodiumSulfate: compositionResults.reduce((sum, r) => sum + r.predictions.sodiumSulfate, 0),
    organicMatter: compositionResults.reduce((sum, r) => sum + r.predictions.organicMatter, 0),
  };

  const mostValuableCompound = Object.entries(compounds).sort(([, a], [, b]) => b - a)[0];
  const compoundNames: Record<string, string> = {
    magnesiumChloride: 'Magnesium Chloride',
    calciumSulfate: 'Calcium Sulfate',
    sodiumSulfate: 'Sodium Sulfate',
    organicMatter: 'Organic Matter',
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total Waste Predicted */}
      <Card className="border-valor-200 bg-gradient-to-br from-valor-50 to-white">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Total Waste Predicted
          </CardTitle>
          <Recycle className="h-4 w-4 text-valor-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-valor-700">
            {totalWaste.toFixed(2)} kg
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            From {compositionResults.length} prediction{compositionResults.length !== 1 ? 's' : ''}
          </p>
        </CardContent>
      </Card>

      {/* Economic Value */}
      <Card className="border-green-200 bg-gradient-to-br from-green-50 to-white">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Total Economic Value
          </CardTitle>
          <DollarSign className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-700">
            LKR {totalValue.toLocaleString()}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Potential revenue from waste
          </p>
        </CardContent>
      </Card>

      {/* Average Confidence */}
      <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-white">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Average Confidence
          </CardTitle>
          <TrendingUp className="h-4 w-4 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-700">
            {(avgConfidence * 100).toFixed(0)}%
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Model prediction accuracy
          </p>
        </CardContent>
      </Card>

      {/* Most Valuable Compound */}
      <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-white">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Top Compound
          </CardTitle>
          <Sparkles className="h-4 w-4 text-purple-600" />
        </CardHeader>
        <CardContent>
          <div className="text-lg font-bold text-purple-700">
            {mostValuableCompound ? compoundNames[mostValuableCompound[0]] : 'N/A'}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {mostValuableCompound ? `${mostValuableCompound[1].toFixed(2)} kg total` : 'No data'}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

