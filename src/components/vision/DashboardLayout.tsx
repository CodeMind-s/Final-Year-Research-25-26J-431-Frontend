
"use client";

import { ReactNode, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Video,
  Target,
  Layers,
  LineChart,
  FileText,
  Settings,
  Menu,
  X,
  Activity,
  Wifi,
  WifiOff,
  Bell,
  User,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface DashboardLayoutProps {
  children: ReactNode;
}

const navigationItems = [
  { name: "Camera Monitoring", href: "/dashboard/camera", icon: Video },
  { name: "Detection & Grading", href: "/dashboard/detection", icon: Target },
  { name: "Batch Assessment", href: "/dashboard/batch", icon: Layers },
  { name: "Analytics", href: "/dashboard/analytics", icon: LineChart },
  { name: "Reports", href: "/dashboard/reports", icon: FileText },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
];

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isConnected, setIsConnected] = useState(true);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 transform bg-card border-r border-border transition-transform duration-300 lg:relative lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center gap-3 border-b border-border px-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500">
              <Activity className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground">SaltQC AI</h1>
              <p className="text-xs text-muted-foreground">Quality System</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 overflow-y-auto p-4">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  )}
                >
                  <Icon className="h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* System Status */}
          <div className="border-t border-border p-4">
            <div className="rounded-lg bg-muted/50 p-3 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">System Status</span>
                <Badge variant={isConnected ? "default" : "destructive"} className="text-xs">
                  {isConnected ? "Online" : "Offline"}
                </Badge>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                {isConnected ? (
                  <Wifi className="h-3 w-3 text-green-500" />
                ) : (
                  <WifiOff className="h-3 w-3 text-red-500" />
                )}
                <span>Camera Units: 4/4</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Activity className="h-3 w-3 text-blue-500" />
                <span>AI Model: v2.4.1</span>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <header className="flex h-16 items-center justify-between border-b border-border bg-card px-4 lg:px-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
            <div>
              <h2 className="text-lg font-semibold text-foreground">
                Industrial Saltern Monitoring
              </h2>
              <p className="text-xs text-muted-foreground">
                Real-time AI-powered quality inspection
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500"></span>
            </Button>
            <div className="h-6 w-px bg-border"></div>
            <Button variant="ghost" className="gap-2">
              <User className="h-5 w-5" />
              <span className="hidden sm:inline">QC Admin</span>
            </Button>
            <Button variant="ghost" size="icon">
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-4 lg:p-6">{children}</main>
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}
    </div>
  );
}
