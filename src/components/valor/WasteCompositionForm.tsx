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
import { Thermometer, Droplets, Calendar, Wind, CloudRain, Loader2 } from "lucide-react";
import { WasteCompositionPredictionRequest } from "@/types/valor.types";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

interface WasteCompositionFormProps {
  onSubmit: (data: WasteCompositionPredictionRequest) => void;
  isLoading?: boolean;
}

export function WasteCompositionForm({ onSubmit, isLoading = false }: WasteCompositionFormProps) {
  const [formData, setFormData] = useState<WasteCompositionPredictionRequest>({
    month: "",
    temperature: 30,
    humidity: 75,
    rainfall: 0,
    windSpeed: 0,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.month) return;
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {/* Month Selection */}
          <div className="space-y-2">
            <Label htmlFor="month" className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-valor-600" />
              Month
            </Label>
            <Select
              value={formData.month}
              onValueChange={(value) => setFormData({ ...formData, month: value })}
            >
              <SelectTrigger id="month">
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

          {/* Temperature */}
          <div className="space-y-2">
            <Label htmlFor="temperature" className="flex items-center gap-2">
              <Thermometer className="h-4 w-4 text-orange-600" />
              Temperature (°C)
            </Label>
            <Input
              id="temperature"
              type="number"
              step="0.1"
              value={formData.temperature}
              onChange={(e) => setFormData({ ...formData, temperature: parseFloat(e.target.value) })}
              min="20"
              max="45"
              required
              className="border-valor-200 focus:border-valor-500"
            />
            <p className="text-xs text-muted-foreground">
              Typical range: 25°C - 40°C
            </p>
          </div>

          {/* Humidity */}
          <div className="space-y-2">
            <Label htmlFor="humidity" className="flex items-center gap-2">
              <Droplets className="h-4 w-4 text-blue-600" />
              Humidity (%)
            </Label>
            <Input
              id="humidity"
              type="number"
              step="0.1"
              value={formData.humidity}
              onChange={(e) => setFormData({ ...formData, humidity: parseFloat(e.target.value) })}
              min="0"
              max="100"
              required
              className="border-valor-200 focus:border-valor-500"
            />
            <p className="text-xs text-muted-foreground">
              Typical range: 60% - 90%
            </p>
          </div>

          {/* Rainfall (Optional) */}
          <div className="space-y-2">
            <Label htmlFor="rainfall" className="flex items-center gap-2">
              <CloudRain className="h-4 w-4 text-blue-500" />
              Rainfall (mm) <span className="text-xs text-muted-foreground">(Optional)</span>
            </Label>
            <Input
              id="rainfall"
              type="number"
              step="0.1"
              value={formData.rainfall}
              onChange={(e) => setFormData({ ...formData, rainfall: parseFloat(e.target.value) })}
              min="0"
              className="border-valor-200 focus:border-valor-500"
            />
          </div>

          {/* Wind Speed (Optional) */}
          <div className="space-y-2">
            <Label htmlFor="windSpeed" className="flex items-center gap-2">
              <Wind className="h-4 w-4 text-sky-600" />
              Wind Speed (km/h) <span className="text-xs text-muted-foreground">(Optional)</span>
            </Label>
            <Input
              id="windSpeed"
              type="number"
              step="0.1"
              value={formData.windSpeed}
              onChange={(e) => setFormData({ ...formData, windSpeed: parseFloat(e.target.value) })}
              min="0"
              className="border-valor-200 focus:border-valor-500"
            />
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
            "Predict Waste Composition"
          )}
        </Button>
      </form>
  );
}

