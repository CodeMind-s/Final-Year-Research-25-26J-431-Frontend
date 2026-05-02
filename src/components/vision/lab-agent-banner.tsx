"use client";

import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Download, AlertCircle } from "lucide-react";

// Shown on the laboratory dashboard whenever probeLabAgent() returns false.
// No silent fallback to cloud inference — surfacing the install state is the
// whole point of moving inference to the lab PC. (See phase-1 ADR.)
//
// The Download installer button is hidden until a real installer is hosted
// (Phase 8). Set NEXT_PUBLIC_LAB_AGENT_INSTALLER_URL to a reachable URL to
// re-enable it.
export function LabAgentBanner() {
  const installerUrl = process.env.NEXT_PUBLIC_LAB_AGENT_INSTALLER_URL;
  const installerAvailable =
    !!installerUrl && !installerUrl.includes("downloads.brinex.com");

  return (
    <Alert variant="destructive" className="border-rose-200 bg-rose-50">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Brinex Lab Agent is not running</AlertTitle>
      <AlertDescription className="flex flex-wrap items-center gap-3">
        <span>
          Local inference requires the Brinex Lab Agent on this PC. Start
          detection is disabled until the agent is reachable.
        </span>
        <div className="flex items-center gap-2">
          {installerAvailable ? (
            <Button asChild variant="default" size="sm" className="gap-2">
              <a href="/downloads/lab-agent">
                <Download className="h-4 w-4" />
                Download installer
              </a>
            </Button>
          ) : null}
          <span className="text-xs">
            Already installed? Launch it from the system tray, then reload this
            page.
          </span>
        </div>
      </AlertDescription>
    </Alert>
  );
}
