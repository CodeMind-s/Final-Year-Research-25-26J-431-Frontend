"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bell, AlertTriangle, AlertCircle, Info } from "lucide-react";

const dummyAlerts = [
  {
    id: 1,
    type: "critical",
    title: "High Waste Output Detected",
    description: "Waste output exceeded normal range by 25% in Zone A",
    timestamp: "2026-02-07T10:30:00Z",
  },
  {
    id: 2,
    type: "critical",
    title: "Temperature Anomaly",
    description: "Temperature readings show unusual patterns - immediate attention required",
    timestamp: "2026-02-07T09:15:00Z",
  },
  {
    id: 3,
    type: "warning",
    title: "Humidity Level Warning",
    description: "Humidity levels approaching threshold limits",
    timestamp: "2026-02-07T08:45:00Z",
  },
];

export default function AlertsPage() {
  const getAlertIcon = (type: string) => {
    switch (type) {
      case "critical":
        return <AlertTriangle className="h-5 w-5 text-red-600" />;
      case "warning":
        return <AlertCircle className="h-5 w-5 text-yellow-600" />;
      default:
        return <Info className="h-5 w-5 text-blue-600" />;
    }
  };

  const getAlertBadge = (type: string) => {
    switch (type) {
      case "critical":
        return <Badge className="bg-red-500">Critical</Badge>;
      case "warning":
        return <Badge className="bg-yellow-500">Warning</Badge>;
      default:
        return <Badge className="bg-blue-500">Info</Badge>;
    }
  };

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-valor-700 flex items-center gap-2">
            <Bell className="h-8 w-8" />
            Alerts
          </h1>
          <p className="text-muted-foreground mt-2">
            Model-predicted alerts and system notifications
          </p>
        </div>
        <Badge className="bg-red-500 text-lg px-4 py-2">
          {dummyAlerts.length} Active
        </Badge>
      </div>

      <div className="grid gap-4">
        {dummyAlerts.map((alert) => (
          <Card key={alert.id} className="border-l-4 border-l-red-500">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  {getAlertIcon(alert.type)}
                  <div>
                    <CardTitle className="text-lg">{alert.title}</CardTitle>
                    <CardDescription className="mt-1">
                      {alert.description}
                    </CardDescription>
                  </div>
                </div>
                {getAlertBadge(alert.type)}
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {formatDate(alert.timestamp)}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

