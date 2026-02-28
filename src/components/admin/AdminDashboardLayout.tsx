"use client";

import { ReactNode, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  CreditCard,
  FileText,
  Receipt,
  Menu,
  X,
  LogOut,
  Logs,
  FlaskConical,
  Video,
  BarChart2,
  Bell,
  Settings,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useAuth } from "@/hooks/useAuth";
import { UserRole } from "@/dtos/auth.dto";
import Image from "next/image";

interface AdminDashboardLayoutProps {
  children: ReactNode;
}

interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
}

const superadminNavItems: NavItem[] = [
  { name: "Overview", href: "/superadmin/dashboard", icon: LayoutDashboard },
  { name: "Users", href: "/superadmin/users", icon: Users },
  { name: "Plans", href: "/superadmin/plans", icon: CreditCard },
  { name: "Payments", href: "/superadmin/payments", icon: FileText },
  { name: "Subscriptions", href: "/superadmin/subscriptions", icon: Receipt },
  { name: "Audit Logs", href: "/superadmin/audit-logs", icon: Logs },
];

const adminNavItems: NavItem[] = [
  { name: "Overview", href: "/superadmin/dashboard", icon: LayoutDashboard },
  { name: "Users", href: "/superadmin/users", icon: Users },
  { name: "Plans", href: "/superadmin/plans", icon: CreditCard },
  { name: "Payments", href: "/superadmin/payments", icon: FileText },
  { name: "Subscriptions", href: "/superadmin/subscriptions", icon: Receipt },
];

const saltSocietyNavItems: NavItem[] = [
  { name: "Dashboard", href: "/salt-society/dashboard", icon: LayoutDashboard },
  { name: "Salt Production", href: "/salt-society/salt-production", icon: FlaskConical },
  { name: "Recording", href: "/salt-society/recording", icon: Video },
  { name: "Reports", href: "/salt-society/reports", icon: BarChart2 },
  { name: "Alerts", href: "/salt-society/alerts", icon: Bell },
  { name: "Settings", href: "/salt-society/settings", icon: Settings },
];

const laboratoryNavItems: NavItem[] = [
  { name: "Dashboard", href: "/laboratory/dashboard", icon: LayoutDashboard },
  { name: "Batches", href: "/laboratory/batches", icon: FlaskConical },
  { name: "Statistics", href: "/laboratory/statistics", icon: BarChart2 },
];

function getNavItems(role?: UserRole): NavItem[] {
  switch (role) {
    case UserRole.SUPERADMIN:
      return superadminNavItems;
    case UserRole.ADMIN:
      return adminNavItems;
    case UserRole.SALTSOCIETY:
      return saltSocietyNavItems;
    case UserRole.LABORATORY:
      return laboratoryNavItems;
    default:
      return [];
  }
}

function getPanelTitle(role?: UserRole): { title: string; subtitle: string } {
  switch (role) {
    case UserRole.SALTSOCIETY:
      return { title: "Salt Society Panel", subtitle: "BrineX Salt Society Management" };
    case UserRole.LABORATORY:
      return { title: "Laboratory Panel", subtitle: "BrineX AI-Powered Quality Inspection" };
    case UserRole.ADMIN:
    case UserRole.SUPERADMIN:
    default:
      return { title: "Administration Panel", subtitle: "BrineX Platform Management" };
  }
}

export function AdminDashboardLayout({
  children,
}: AdminDashboardLayoutProps) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const { logout, user } = useAuth();

  const handleLogout = () => {
    localStorage.clear();
    logout();
  };

  const navItems = getNavItems(user?.role);
  const { title, subtitle } = getPanelTitle(user?.role);

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
          {/* Brand */}
          <div className="flex h-16 items-center gap-3 border-b border-border px-6">
            <Image src={'/assets/images/logo.svg'} alt='brinex logo' width={500} height={100} />
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 overflow-y-auto p-4">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                pathname === item.href ||
                pathname.startsWith(item.href + "/");
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

          {/* User Info */}
          <div className="border-t border-border p-4">
            <div className="rounded-lg bg-muted/50 p-3 space-y-1">
              <p className="text-sm font-medium truncate">
                {user?.name || user?.email}
              </p>
              <Badge variant="secondary" className="text-xs">
                {user?.role}
              </Badge>
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
              {sidebarOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
            <div>
              <h2 className="text-lg font-semibold text-foreground tracking-tighter">
                {title}
              </h2>
              <p className="text-xs text-muted-foreground">
                {subtitle}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="h-6 w-px bg-border"></div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowLogoutDialog(true)}
            >
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

      {/* Logout Confirmation Dialog */}
      <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Logout</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to log out? You will be redirected to the
              login page.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleLogout}
              className="bg-destructive hover:bg-destructive/90"
            >
              Logout
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
