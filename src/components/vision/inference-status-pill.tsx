"use client";

import { Badge } from "@/components/ui/badge";
import { Cpu, Cloud, AlertTriangle } from "lucide-react";
import type { AgentSource } from "@/hooks/use-vision-websocket";

interface Props {
  source: AgentSource;
  version?: string;
  className?: string;
}

// Visual indicator of where YOLO inference is currently running. v1 only
// renders "local" or "unavailable" — the "cloud" branch is wired so the v2
// fallback flag is a one-line change in use-vision-websocket.ts.
export function InferenceStatusPill({ source, version, className }: Props) {
  const config = {
    local: {
      label: version ? `Inference: Local PC (v${version})` : "Inference: Local PC",
      icon: <Cpu className="h-3 w-3" />,
      classes: "bg-emerald-500 hover:bg-emerald-500/90 text-white border-transparent",
    },
    cloud: {
      label: "Inference: Cloud",
      icon: <Cloud className="h-3 w-3" />,
      classes: "bg-amber-500 hover:bg-amber-500/90 text-white border-transparent",
    },
    unavailable: {
      label: "Inference: Offline",
      icon: <AlertTriangle className="h-3 w-3" />,
      classes: "bg-rose-500 hover:bg-rose-500/90 text-white border-transparent",
    },
  }[source];

  return (
    <Badge className={`${config.classes} ${className ?? ""}`.trim()}>
      {config.icon}
      <span>{config.label}</span>
    </Badge>
  );
}
