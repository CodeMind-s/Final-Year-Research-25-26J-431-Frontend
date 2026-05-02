// Liveness probe for the Brinex Lab Agent.
//
// The agent serves /health over HTTPS at https://localhost:5005/health and
// returns { status: "ok", model: <bool>, ... } when ready. We use a 1-second
// timeout because anything slower means the agent isn't actually running:
// loopback HTTP to a local process should respond in <50ms.
//
// Returning false here is what triggers the install banner in
// laboratory/dashboard/page.tsx — there is intentionally NO silent fallback to
// the cloud vision-service. If a lab user's agent is down, that's a state we
// want to surface, not paper over with cloud inference (which would make the
// cost story dishonest — see phase-1 ADR).

import { LAB_AGENT_HEALTH_URL } from "./api.config";

export interface LabAgentHealth {
  available: boolean;
  modelLoaded: boolean;
  version?: string;
  error?: string;
}

const PROBE_TIMEOUT_MS = 1000;

export async function probeLabAgent(
  timeoutMs = PROBE_TIMEOUT_MS,
): Promise<LabAgentHealth> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(LAB_AGENT_HEALTH_URL, {
      signal: ctrl.signal,
      cache: "no-store",
      // The agent's mkcert-issued cert is trusted by the browser via the
      // Windows trust store (see Phase 6). No special TLS handling needed.
    });
    if (!res.ok) {
      return { available: false, modelLoaded: false, error: `HTTP ${res.status}` };
    }
    const json = (await res.json()) as {
      status?: string;
      model?: boolean;
      version?: string;
    };
    const ok = json.status === "ok" && json.model === true;
    return {
      available: ok,
      modelLoaded: !!json.model,
      version: json.version,
      error: ok ? undefined : "Agent reported degraded state",
    };
  } catch (err) {
    return {
      available: false,
      modelLoaded: false,
      error:
        err instanceof DOMException && err.name === "AbortError"
          ? "Probe timed out"
          : (err as Error).message,
    };
  } finally {
    clearTimeout(timer);
  }
}
