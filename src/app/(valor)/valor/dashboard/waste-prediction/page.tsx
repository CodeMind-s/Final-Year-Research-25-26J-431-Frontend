"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Thermometer } from "lucide-react";

export default function WastePredictionPage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-valor-700 flex items-center gap-2">
          <Thermometer className="h-8 w-8" />
          Waste Composition Prediction
        </h1>
        <p className="text-muted-foreground mt-2">
          Predict salt waste composition based on environmental factors
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Waste Prediction Module</CardTitle>
          <CardDescription>
            Coming soon - Dedicated page for waste composition predictions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            This page will contain detailed waste composition prediction tools and history.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

