// 302-redirect to the latest Brinex Lab Agent installer.
//
// Centralising the download URL here means version bumps land in a single
// env var (NEXT_PUBLIC_LAB_AGENT_INSTALLER_URL) instead of being spread
// across the banner, the docs, and any tray-side help links.
//
// Why a route handler vs Next.js redirects in next.config.ts:
// - The URL changes per environment (staging vs prod) — env vars are
//   easier to flip than rebuilding the config.
// - We want a server-side redirect (302), not a client-side one — works
//   when the user pastes the URL directly.

import { NextRequest, NextResponse } from "next/server";

const FALLBACK_INSTALLER_URL =
  "https://downloads.brinex.com/lab-agent/Brinex-Lab-Agent-Setup.exe";

export async function GET(request: NextRequest) {
  const target =
    process.env.NEXT_PUBLIC_LAB_AGENT_INSTALLER_URL ?? FALLBACK_INSTALLER_URL;
  // NextResponse.redirect requires an absolute URL. Resolve relative paths
  // (e.g., "/downloads/Brinex-Lab-Agent-Setup.exe" served from the same
  // origin) against the incoming request's origin.
  const absolute = new URL(target, request.url);
  return NextResponse.redirect(absolute, { status: 302 });
}
