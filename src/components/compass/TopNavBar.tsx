"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Menu,
  X,
  Home,
  CalendarDays,
  BarChart3,
  CircleUserRound,
  Settings,
  HelpCircle,
  LogOut,
  Compass,
} from "lucide-react";
import type { NavTab } from "./BottomNavBar";

interface TopNavBarProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  onLogout?: () => void;
}

interface DrawerNavItem {
  id: string;
  label: string;
  icon: React.ElementType;
  type: "nav" | "action";
  tab?: NavTab;
  danger?: boolean;
  onClick?: () => void;
}

export const TopNavBar: React.FC<TopNavBarProps> = ({
  activeTab,
  onTabChange,
  onLogout,
}) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);

  // Close drawer on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsDrawerOpen(false);
    };
    if (isDrawerOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isDrawerOpen]);

  const mainNavItems: DrawerNavItem[] = [
    { id: "home", label: "Home", icon: Home, type: "nav", tab: "home" },
    { id: "planner", label: "Planner", icon: CalendarDays, type: "nav", tab: "planner" },
    { id: "market", label: "Market Analysis", icon: BarChart3, type: "nav", tab: "market" },
    { id: "profile", label: "Profile", icon: CircleUserRound, type: "nav", tab: "profile" },
  ];

  const secondaryItems: DrawerNavItem[] = [
    { id: "settings", label: "Settings", icon: Settings, type: "action" },
    { id: "help", label: "Help & Support", icon: HelpCircle, type: "action" },
    {
      id: "logout",
      label: "Logout",
      icon: LogOut,
      type: "action",
      danger: true,
      onClick: onLogout,
    },
  ];

  const handleNavClick = (item: DrawerNavItem) => {
    if (item.type === "nav" && item.tab) {
      onTabChange(item.tab);
    } else if (item.onClick) {
      item.onClick();
    }
    setIsDrawerOpen(false);
  };

  return (
    <>
      {/* Top Bar */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
        <div className="flex items-center justify-between h-14 px-4 max-w-[1600px] mx-auto">
          {/* Left: Hamburger */}
          <button
            onClick={() => setIsDrawerOpen(true)}
            className="p-2 -ml-2 rounded-xl hover:bg-slate-100 active:scale-95 transition-all"
            aria-label="Open menu"
          >
            <Menu size={22} className="text-slate-700" />
          </button>

          {/* Center: App logo / title */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-compass-600 rounded-lg flex items-center justify-center">
              <Compass size={18} className="text-white" />
            </div>
            <span className="text-base font-bold text-slate-900 tracking-tight">
              BrineX
            </span>
          </div>

          {/* Right: Desktop nav items (hidden on mobile) */}
          <div className="hidden lg:flex items-center gap-1">
            {mainNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = item.tab === activeTab;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item)}
                  className={`
                    flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all
                    ${isActive
                      ? "bg-compass-50 text-compass-700"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                    }
                  `}
                >
                  <Icon size={18} strokeWidth={isActive ? 2.2 : 1.8} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* Mobile: spacer to keep logo centered */}
          <div className="w-10 lg:hidden" />
        </div>
      </header>

      {/* Drawer Overlay */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-[2px] transition-opacity duration-300"
            onClick={() => setIsDrawerOpen(false)}
          />

          {/* Drawer Panel — slides in from left */}
          <div
            ref={drawerRef}
            className="absolute left-0 top-0 bottom-0 w-72 bg-white shadow-2xl flex flex-col animate-in slide-in-from-left duration-300"
          >
            {/* Drawer Header */}
            <div className="flex items-center justify-between p-4 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 bg-compass-600 rounded-xl flex items-center justify-center">
                  <Compass size={20} className="text-white" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">BrineX Compass</p>
                  <p className="text-[11px] text-slate-500">Landowner Portal</p>
                </div>
              </div>
              <button
                onClick={() => setIsDrawerOpen(false)}
                className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
                aria-label="Close menu"
              >
                <X size={20} className="text-slate-500" />
              </button>
            </div>

            {/* Main Nav Items */}
            <div className="flex-1 overflow-y-auto py-3 px-3">
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-3 mb-2">
                Navigation
              </p>
              <nav className="space-y-1">
                {mainNavItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = item.tab === activeTab;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleNavClick(item)}
                      className={`
                        w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all
                        active:scale-[0.98]
                        ${isActive
                          ? "bg-compass-50 text-compass-700 shadow-sm"
                          : "text-slate-700 hover:bg-slate-50"
                        }
                      `}
                    >
                      <div
                        className={`
                          w-9 h-9 rounded-lg flex items-center justify-center transition-colors
                          ${isActive
                            ? "bg-compass-600 text-white"
                            : "bg-slate-100 text-slate-500"
                          }
                        `}
                      >
                        <Icon size={18} />
                      </div>
                      <span>{item.label}</span>
                      {isActive && (
                        <div className="ml-auto w-1.5 h-1.5 rounded-full bg-compass-600" />
                      )}
                    </button>
                  );
                })}
              </nav>

              {/* Divider */}
              <div className="my-4 border-t border-slate-100" />

              {/* Secondary Items */}
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-3 mb-2">
                More
              </p>
              <nav className="space-y-1">
                {secondaryItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleNavClick(item)}
                      className={`
                        w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all
                        active:scale-[0.98]
                        ${item.danger
                          ? "text-red-600 hover:bg-red-50"
                          : "text-slate-700 hover:bg-slate-50"
                        }
                      `}
                    >
                      <div
                        className={`
                          w-9 h-9 rounded-lg flex items-center justify-center
                          ${item.danger
                            ? "bg-red-50 text-red-500"
                            : "bg-slate-100 text-slate-500"
                          }
                        `}
                      >
                        <Icon size={18} />
                      </div>
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Drawer Footer */}
            <div className="p-4 pt-3 border-t border-slate-100">
              <p className="text-[11px] text-slate-400 text-center">
                BrineX Compass v2.0 • Salt Saltern Management
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
