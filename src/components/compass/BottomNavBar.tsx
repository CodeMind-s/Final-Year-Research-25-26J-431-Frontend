"use client";

import React from "react";
import { Home, CalendarDays, BarChart3, CircleUserRound } from "lucide-react";

export type NavTab = "home" | "planner" | "market" | "profile";

interface NavItem {
  id: NavTab;
  label: string;
  icon: React.ElementType;
}

const NAV_ITEMS: NavItem[] = [
  { id: "home", label: "Home", icon: Home },
  { id: "planner", label: "Planner", icon: CalendarDays },
  { id: "market", label: "Market", icon: BarChart3 },
  { id: "profile", label: "Profile", icon: CircleUserRound },
];

interface BottomNavBarProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({
  activeTab,
  onTabChange,
}) => {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 lg:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      <div className="flex items-stretch justify-around max-w-md mx-auto h-16">
        {NAV_ITEMS.map((item) => {
          const isActive = activeTab === item.id;
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`
                flex flex-col items-center justify-center flex-1 gap-0.5
                transition-all duration-200 ease-out
                active:scale-95
                ${isActive
                  ? "text-compass-600"
                  : "text-slate-400 hover:text-slate-600"
                }
              `}
              aria-label={item.label}
              aria-current={isActive ? "page" : undefined}
            >
              {/* Active indicator dot */}
              <span
                className={`
                  block w-5 h-0.5 rounded-full mb-1 transition-all duration-300
                  ${isActive ? "bg-compass-600 scale-x-100" : "bg-transparent scale-x-0"}
                `}
              />

              <Icon
                size={22}
                strokeWidth={isActive ? 2.5 : 1.8}
                className={`transition-all duration-200 ${
                  isActive ? "drop-shadow-sm" : ""
                }`}
              />

              <span
                className={`
                  text-[10px] font-medium leading-tight transition-all duration-200
                  ${isActive ? "font-semibold" : ""}
                `}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
