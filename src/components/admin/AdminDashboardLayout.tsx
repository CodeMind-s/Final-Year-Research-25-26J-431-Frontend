"use client";

import { ReactNode, useState, useEffect } from "react";
import { useTranslations } from "next-intl";
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
  File,
  RecycleIcon,
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
import { adminController } from "@/services/admin.controller";
import Image from "next/image";

const ROLES_NEEDING_VERIFICATION = [UserRole.LANDOWNER, UserRole.DISTRIBUTOR, UserRole.LABORATORY];

interface AdminDashboardLayoutProps {
  children: ReactNode;
}

interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
}

export function AdminDashboardLayout({
  children,
}: AdminDashboardLayoutProps) {
  const t = useTranslations('nav');
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [pendingVerificationCount, setPendingVerificationCount] = useState(0);
  const { logout, user } = useAuth();

  useEffect(() => {
    if (user?.role === UserRole.SUPERADMIN || user?.role === UserRole.ADMIN) {
      adminController.getUsers(1, 100).then((res) => {
        const allUsers = res.data || [];
        const count = allUsers.filter(
          (u: any) =>
            u.isOnboarded === true &&
            u.isVerified !== true &&
            ROLES_NEEDING_VERIFICATION.includes(u.role)
        ).length;
        setPendingVerificationCount(count);
      }).catch((err) => {
        console.error("Failed to fetch pending verification count:", err);
      });
    }
  }, [user?.role, pathname]);

  const handleLogout = () => {
    localStorage.clear();
    logout();
  };

  const superadminNavItems: NavItem[] = [
    { name: t('admin.overview'), href: "/superadmin/dashboard", icon: LayoutDashboard },
    { name: t('admin.users'), href: "/superadmin/users", icon: Users },
    { name: t('admin.plans'), href: "/superadmin/plans", icon: CreditCard },
    { name: t('admin.payments'), href: "/superadmin/payments", icon: FileText },
    { name: t('admin.subscriptions'), href: "/superadmin/subscriptions", icon: Receipt },
    { name: t('admin.auditLogs'), href: "/superadmin/audit-logs", icon: Logs },
  ];

  const adminNavItems: NavItem[] = [
    { name: t('admin.overview'), href: "/superadmin/dashboard", icon: LayoutDashboard },
    { name: t('admin.users'), href: "/superadmin/users", icon: Users },
    { name: t('admin.plans'), href: "/superadmin/plans", icon: CreditCard },
    { name: t('admin.payments'), href: "/superadmin/payments", icon: FileText },
    { name: t('admin.subscriptions'), href: "/superadmin/subscriptions", icon: Receipt },
  ];

  const saltSocietyNavItems: NavItem[] = [
    { name: t('admin.dashboard'), href: "/salt-society/dashboard", icon: LayoutDashboard },
    { name: t('admin.recording'), href: "/salt-society/recording", icon: File },
    { name: t('admin.saltProduction'), href: "/salt-society/salt-production", icon: FlaskConical },
    { name: t('admin.wasteManagement'), href: "/salt-society/waste-management", icon: RecycleIcon },
    { name: t('admin.reports'), href: "/salt-society/reports", icon: BarChart2 },
    // { name: t('admin.alerts'), href: "/salt-society/alerts", icon: Bell },
    { name: t('admin.settings'), href: "/salt-society/settings", icon: Settings },
  ];

  const laboratoryNavItems: NavItem[] = [
    { name: t('admin.dashboard'), href: "/laboratory/dashboard", icon: LayoutDashboard },
    { name: t('admin.batches'), href: "/laboratory/batch", icon: FlaskConical },
    { name: t('admin.statistics'), href: "/laboratory/statistics", icon: BarChart2 },
    { name: t('admin.reports'), href: "/laboratory/reports", icon: FileText },
    { name: t('admin.settings'), href: "/laboratory/settings", icon: Settings },
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
        return { title: t('admin.saltSocietyPanel'), subtitle: t('admin.saltSocietySubtitle') };
      case UserRole.LABORATORY:
        return { title: t('admin.labPanel'), subtitle: t('admin.labSubtitle') };
      case UserRole.ADMIN:
      case UserRole.SUPERADMIN:
      default:
        return { title: t('admin.adminPanel'), subtitle: t('admin.adminSubtitle') };
    }
  }

  const navItems = getNavItems(user?.role);
  const { title, subtitle } = getPanelTitle(user?.role);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 sm:w-72 transform bg-card border-r border-border transition-transform duration-300 lg:relative lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-full flex-col">
          {/* Brand */}
          <div className="flex h-16 items-center gap-3 border-b border-border px-6">
            <Image src={'/assets/images/logo.svg'} alt='brinex logo' width={500} height={50} />
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
                  {item.href === "/superadmin/users" && pendingVerificationCount > 0 && (
                    <Badge variant="destructive" className="ml-auto text-[10px] px-1.5 py-0 h-5 min-w-5 flex items-center justify-center">
                      {pendingVerificationCount}
                    </Badge>
                  )}
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
        <header className="flex h-14 md:h-16 items-center justify-between border-b border-border bg-card px-3 md:px-4 lg:px-6">
          <div className="flex items-center gap-2 md:gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden h-8 w-8 md:h-10 md:w-10"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              {sidebarOpen ? (
                <X className="h-4 w-4 md:h-5 md:w-5" />
              ) : (
                <Menu className="h-4 w-4 md:h-5 md:w-5" />
              )}
            </Button>
            <div className="hidden sm:block">
              <h2 className="text-base md:text-lg font-semibold text-foreground tracking-tighter">
                {title}
              </h2>
              <p className="text-[10px] md:text-xs text-muted-foreground">
                {subtitle}
              </p>
            </div>
          </div>

                        {/* Logo in the middle */}
        <div className="flex-shrink-0 lg:hidden">
          <Image 
            src="/assets/images/crystal-logo.svg" 
            alt="Brinex Logo" 
            width={80} 
            height={80}
            className="w-16 h-16 sm:w-20 sm:h-20"
          />
        </div>

          <div className="flex items-center gap-2 md:gap-3">
            <div className="h-6 w-px bg-border hidden sm:block"></div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 md:h-10 md:w-10"
              onClick={() => setShowLogoutDialog(true)}
            >
              <LogOut className="h-4 w-4 md:h-5 md:w-5" />
            </Button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-3 sm:p-4 md:p-5 lg:p-6">{children}</main>
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
            <AlertDialogTitle>{t('admin.confirmLogout')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('admin.logoutMessage')}
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
