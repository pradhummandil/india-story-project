import { Link, useRouterState } from "@tanstack/react-router";
import { useState } from "react";
import {
  LayoutDashboard,
  BookOpen,
  FolderOpen,
  MapPin,
  Users,
  Image,
  BarChart3,
  Settings,
  Menu,
  X,
  ChevronRight,
  LogOut,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthStore } from "@/lib/auth-store";

const NAV_ITEMS = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/admin/stories", label: "Stories", icon: BookOpen },
  { to: "/admin/categories", label: "Categories", icon: FolderOpen },
  { to: "/admin/states", label: "States", icon: MapPin },
  { to: "/admin/authors", label: "Authors", icon: Users },
  { to: "/admin/media", label: "Media", icon: Image },
  { to: "/admin/users", label: "Users", icon: Users },
  { to: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/admin/settings", label: "Settings", icon: Settings },
];

export function AdminSidebar({
  collapsed,
  onToggle,
}: {
  collapsed: boolean;
  onToggle: () => void;
}) {
  const { location } = useRouterState();
  const { signOut } = useAuthStore();

  const isActive = (item: (typeof NAV_ITEMS)[0]) => {
    if (item.exact) return location.pathname === item.to;
    return location.pathname.startsWith(item.to);
  };

  return (
    <aside
      className={`fixed top-0 left-0 h-screen bg-[#0A0A0A] border-r border-white/10 z-40 flex flex-col transition-all duration-300 ${
        collapsed ? "w-16" : "w-64"
      }`}
    >
      {/* Logo */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-white/10">
        {!collapsed && (
          <Link to="/" className="flex items-center gap-2">
            <img
              src="https://indiastoryproject.com/wp-content/uploads/2022/04/Logo-ISP.png"
              alt="ISP"
              className="size-7 rounded-full border border-white/20"
            />
            <span className="font-display text-base font-bold text-white">
              <span className="text-primary">India</span> Story
            </span>
          </Link>
        )}
        {collapsed && (
          <Link to="/" className="mx-auto">
            <img
              src="https://indiastoryproject.com/wp-content/uploads/2022/04/Logo-ISP.png"
              alt="ISP"
              className="size-7 rounded-full border border-white/20"
            />
          </Link>
        )}
        <button
          onClick={onToggle}
          className="text-white/40 hover:text-white transition-colors ml-auto flex-shrink-0"
          aria-label="Toggle sidebar"
        >
          {collapsed ? <ChevronRight className="size-4" /> : <Menu className="size-4" />}
        </button>
      </div>

      {/* Nav label */}
      {!collapsed && (
        <div className="px-4 pt-6 pb-2">
          <span className="text-[10px] font-sans font-bold uppercase tracking-[0.25em] text-white/30">
            Admin Panel
          </span>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-2 py-2 space-y-0.5">
        {NAV_ITEMS.map((item) => {
          const active = isActive(item);
          const Icon = item.icon;
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-sm transition-all duration-200 group ${
                active ? "bg-primary text-white" : "text-white/50 hover:text-white hover:bg-white/5"
              }`}
              title={collapsed ? item.label : undefined}
            >
              <Icon className="size-4 flex-shrink-0" />
              {!collapsed && (
                <span className="text-sm font-sans font-medium truncate">{item.label}</span>
              )}
              {active && !collapsed && <ChevronRight className="size-3 ml-auto opacity-60" />}
            </Link>
          );
        })}
      </nav>

      {/* Bottom: Sign out */}
      <div className="px-2 py-4 border-t border-white/10">
        <button
          onClick={() => void signOut()}
          className={`flex items-center gap-3 px-3 py-2.5 w-full rounded-sm text-white/40 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200`}
          title={collapsed ? "Sign Out" : undefined}
        >
          <LogOut className="size-4 flex-shrink-0" />
          {!collapsed && <span className="text-sm font-sans font-medium">Sign Out</span>}
        </button>
      </div>
    </aside>
  );
}
