# Lab Agent installer (legacy static path)

**The dashboard does NOT link directly to anything in this folder.**

The banner in `src/components/vision/lab-agent-banner.tsx` links to
`/downloads/lab-agent`, which is a server-side redirect handler at
`src/app/downloads/lab-agent/route.ts`. The redirect target is set via
the `NEXT_PUBLIC_LAB_AGENT_INSTALLER_URL` env var (defaulting to the
production CDN URL).

This folder exists only for the rare case where you want to host the
installer alongside the Next.js build instead of behind a CDN — drop the
`.exe` here and override `NEXT_PUBLIC_LAB_AGENT_INSTALLER_URL` to
`/downloads/Brinex-Lab-Agent-Setup.exe`. Generally not recommended;
hosting the binary in the Next.js bundle adds minutes to the build.
