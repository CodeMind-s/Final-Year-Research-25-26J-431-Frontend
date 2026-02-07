"use client";

import { ReactNode, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Thermometer,
  Target,
  Bell,
  BarChart3,
  Settings,
  Menu,
  X,
  RefreshCw,
  User,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";

interface ValorDashboardLayoutProps {
  children: ReactNode;
}

const navigationItems = [
  { name: "Dashboard", href: "/valor/dashboard", icon: LayoutDashboard },
  { name: "Waste Prediction", href: "/valor/dashboard/waste-prediction", icon: Thermometer },
  { name: "Environmental Prediction", href: "/valor/dashboard/environmental-prediction", icon: Target },
  { name: "Alerts", href: "/valor/dashboard/alerts", icon: Bell },
  { name: "Analytics", href: "/valor/dashboard/analytics", icon: BarChart3 },
  { name: "Settings", href: "/valor/dashboard/settings", icon: Settings },
];

export default function ValorDashboardLayout({ children }: ValorDashboardLayoutProps) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  const handleSync = async () => {
    setIsSyncing(true);
    // Simulate sync
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsSyncing(false);
  };

  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="flex h-screen bg-gradient-to-br from-valor-50/30 to-background overflow-hidden">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 transform bg-white border-r border-valor-200 transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center gap-2 border-b border-valor-200 px-6">
            <Image
              src="/assets/images/valor-logo.svg"
              alt="Valor Logo"
              width={32}
              height={32}
            />
            <span className="text-xl font-bold text-valor-700">BrineX Valor</span>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto">
            {navigationItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-valor-100 text-valor-700"
                      : "text-gray-700 hover:bg-valor-50 hover:text-valor-700"
                  )}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon className="h-5 w-5" />
                  {item.name}
                  {item.name === "Alerts" && (
                    <Badge className="ml-auto bg-red-500 text-white">3</Badge>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="border-t border-valor-200 p-4">
            <div className="text-xs text-muted-foreground">
              <p className="font-medium">Salt Waste Valorization</p>
              <p className="mt-1">Optimization System v1.0</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top bar */}
        <header className="flex h-16 items-center justify-between border-b border-valor-200 bg-white/80 backdrop-blur-sm px-4 lg:px-6">
          <div className="flex items-center gap-4">
            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              {sidebarOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>

            {/* Date */}
            <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>{currentDate}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Sync button */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleSync}
              disabled={isSyncing}
              className="gap-2"
            >
              <RefreshCw className={cn("h-4 w-4", isSyncing && "animate-spin")} />
              <span className="hidden sm:inline">
                {isSyncing ? "Syncing..." : "Sync Data"}
              </span>
            </Button>

            {/* Notifications */}
            <Button variant="ghost" size="sm" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-medium text-white">
                3
              </span>
            </Button>

            {/* User menu */}
            <Button variant="ghost" size="sm" className="gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-valor-100">
                <User className="h-4 w-4 text-valor-700" />
              </div>
              <span className="hidden sm:inline text-sm font-medium">Dr. Priya Fernando</span>
            </Button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

