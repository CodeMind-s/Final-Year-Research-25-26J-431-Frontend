"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Target, Calendar, Loader2, FlaskConical } from "lucide-react";
import { EnvironmentalFactorsPredictionRequest } from "@/types/valor.types";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

interface EnvironmentalFactorsFormProps {
  onSubmit: (data: EnvironmentalFactorsPredictionRequest) => void;
  isLoading?: boolean;
}

export function EnvironmentalFactorsForm({ onSubmit, isLoading = false }: EnvironmentalFactorsFormProps) {
  const [formData, setFormData] = useState<EnvironmentalFactorsPredictionRequest>({
    month: "",
    targetComposition: {
      magnesiumChloride: 0,
      calciumSulfate: 0,
      sodiumSulfate: 0,
      organicMatter: 0,
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.month) return;

    // Check if at least one composition value is set
    const hasComposition = Object.values(formData.targetComposition).some(val => val && val > 0);
    if (!hasComposition) return;

    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {/* Month Selection */}
          <div className="space-y-2">
            <Label htmlFor="env-month" className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-valor-600" />
              Month
            </Label>
            <Select
              value={formData.month}
              onValueChange={(value) => setFormData({ ...formData, month: value })}
            >
              <SelectTrigger id="env-month">
                <SelectValue placeholder="Select month" />
              </SelectTrigger>
              <SelectContent>
                {MONTHS.map((month) => (
                  <SelectItem key={month} value={month}>
                    {month}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="border-t pt-4">
            <Label className="flex items-center gap-2 mb-3 text-base">
              <FlaskConical className="h-5 w-5 text-valor-600" />
              Target Waste Composition (kg)
            </Label>
            <p className="text-xs text-muted-foreground mb-4">
              Enter at least one target composition value
            </p>

            {/* Magnesium Chloride */}
            <div className="space-y-2 mb-3">
              <Label htmlFor="magnesiumChloride" className="text-sm">
                Magnesium Chloride (MgCl₂)
              </Label>
              <Input
                id="magnesiumChloride"
                type="number"
                step="0.1"
                value={formData.targetComposition.magnesiumChloride}
                onChange={(e) => setFormData({
                  ...formData,
                  targetComposition: {
                    ...formData.targetComposition,
                    magnesiumChloride: parseFloat(e.target.value) || 0
                  }
                })}
                min="0"
                className="border-valor-200 focus:border-valor-500"
              />
            </div>

            {/* Calcium Sulfate */}
            <div className="space-y-2 mb-3">
              <Label htmlFor="calciumSulfate" className="text-sm">
                Calcium Sulfate (CaSO₄)
              </Label>
              <Input
                id="calciumSulfate"
                type="number"
                step="0.1"
                value={formData.targetComposition.calciumSulfate}
                onChange={(e) => setFormData({
                  ...formData,
                  targetComposition: {
                    ...formData.targetComposition,
                    calciumSulfate: parseFloat(e.target.value) || 0
                  }
                })}
                min="0"
                className="border-valor-200 focus:border-valor-500"
              />
            </div>

            {/* Sodium Sulfate */}
            <div className="space-y-2 mb-3">
              <Label htmlFor="sodiumSulfate" className="text-sm">
                Sodium Sulfate (Na₂SO₄)
              </Label>
              <Input
                id="sodiumSulfate"
                type="number"
                step="0.1"
                value={formData.targetComposition.sodiumSulfate}
                onChange={(e) => setFormData({
                  ...formData,
                  targetComposition: {
                    ...formData.targetComposition,
                    sodiumSulfate: parseFloat(e.target.value) || 0
                  }
                })}
                min="0"
                className="border-valor-200 focus:border-valor-500"
              />
            </div>

            {/* Organic Matter */}
            <div className="space-y-2">
              <Label htmlFor="organicMatter" className="text-sm">
                Organic Matter
              </Label>
              <Input
                id="organicMatter"
                type="number"
                step="0.1"
                value={formData.targetComposition.organicMatter}
                onChange={(e) => setFormData({
                  ...formData,
                  targetComposition: {
                    ...formData.targetComposition,
                    organicMatter: parseFloat(e.target.value) || 0
                  }
                })}
                min="0"
                className="border-valor-200 focus:border-valor-500"
              />
            </div>
          </div>

        <Button
          type="submit"
          disabled={!formData.month || isLoading}
          className="w-full bg-valor-600 hover:bg-valor-700 text-white"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Predicting...
            </>
          ) : (
            "Predict Environmental Factors"
          )}
        </Button>
      </form>
  );
}

