"use client";

import { useCallback, useEffect, useState } from "react";
import { probeLabAgent, LabAgentHealth } from "@/lib/lab-agent-probe";

interface State {
  available: boolean | null;     // null while initial probe is in flight
  modelLoaded: boolean;
  version?: string;
  error?: string;
  refresh: () => void;
}

// Single source of truth for "is the lab agent up?". Probes on mount, on
// window focus, and every 10s while mounted (catches the agent crashing
// without the user clicking out of the tab).
export function useLabAgentHealth(): State {
  const [health, setHealth] = useState<LabAgentHealth>({
    available: false,
    modelLoaded: false,
  });
  const [initialised, setInitialised] = useState(false);

  const refresh = useCallback(async () => {
    const next = await probeLabAgent();
    setHealth(next);
    setInitialised(true);
  }, []);

  useEffect(() => {
    void refresh();

    const onFocus = () => void refresh();
    window.addEventListener("focus", onFocus);

    const interval = window.setInterval(() => void refresh(), 10_000);

    return () => {
      window.removeEventListener("focus", onFocus);
      window.clearInterval(interval);
    };
  }, [refresh]);

  return {
    available: initialised ? health.available : null,
    modelLoaded: health.modelLoaded,
    version: health.version,
    error: health.error,
    refresh: () => void refresh(),
  };
}
