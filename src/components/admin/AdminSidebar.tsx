import { Link, useRouterState } from "@tanstack/react-router";
import { useEffect } from "react";
import {
  LayoutDashboard,
  BookOpen,
  FolderOpen,
  MapPin,
  Users,
  Image,
  BarChart3,
  Settings,
  X,
  ChevronLeft,
  ChevronRight,
  LogOut,
  MessageSquare,
  Trophy,
  Award,
  Mail,
  Layers,
  Compass,
} from "lucide-react";
import { useAuthStore } from "@/lib/auth-store";

const NAV_ITEMS = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/admin/stories", label: "Stories", icon: BookOpen },
  { to: "/admin/newsroom", label: "Newsroom Console", icon: BookOpen },
  { to: "/admin/slideshow", label: "Slideshow", icon: Layers },
  { to: "/admin/contact", label: "Inbox", icon: Mail },
  { to: "/admin/newsletter", label: "Newsletter", icon: Mail },
  { to: "/admin/community", label: "Community", icon: FolderOpen },
  { to: "/admin/comments", label: "Comments", icon: MessageSquare },
  { to: "/admin/leaderboard", label: "Leaderboard", icon: Trophy },
  { to: "/admin/achievements", label: "Achievements", icon: Award },
  { to: "/admin/users", label: "Users & Roles", icon: Users },
  { to: "/admin/authors", label: "Authors CMS", icon: Users },
  { to: "/admin/themes", label: "Themes CMS", icon: Compass },
  { to: "/admin/states", label: "States CMS", icon: MapPin },
  { to: "/admin/media", label: "Media Library", icon: Image },
  { to: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/admin/infrastructure", label: "Infrastructure", icon: Settings },
  { to: "/admin/settings", label: "Settings", icon: Settings },
];

interface AdminSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

export function AdminSidebar({
  collapsed,
  onToggle,
  mobileOpen,
  onMobileClose,
}: AdminSidebarProps) {
  const { location } = useRouterState();
  const { profile, signOut } = useAuthStore();
  const role = profile?.role?.toLowerCase();

  const filteredNavItems = NAV_ITEMS.filter((item) => {
    if (item.to === "/admin/settings" || item.to === "/admin/infrastructure") {
      return role === "superadmin";
    }
    return true;
  });

  const isActive = (item: (typeof NAV_ITEMS)[0]) => {
    if (item.exact) return location.pathname === item.to;
    return location.pathname.startsWith(item.to);
  };

  // Close mobile drawer on route change
  useEffect(() => {
    onMobileClose();
  }, [location.pathname]);

  const sidebarContent = (
    <div className="flex flex-col h-full bg-[#0A0A0A]/95 backdrop-blur-md border-r border-white/5 select-none">
      {/* Brand logo & collapse trigger */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-white/5">
        <Link to="/" className="flex items-center gap-2.5 transition-transform duration-200 hover:scale-[1.02]">
          <img
            src="/Logo-ISP.jpg"
            alt="ISP Logo"
            className="size-7 rounded-full border border-white/10 shadow-lg shadow-black/40"
          />
          {(!collapsed || mobileOpen) && (
            <span className="font-display text-base font-bold text-white tracking-wide">
              <span className="text-[#C8A96A]">India</span> Story
            </span>
          )}
        </Link>
        
        {/* Desktop Collapse Trigger */}
        <button
          onClick={onToggle}
          className="hidden lg:flex size-7 items-center justify-center rounded-md text-white/40 hover:text-white hover:bg-white/5 border border-white/5 transition-all cursor-pointer ml-auto"
          aria-label="Toggle sidebar"
        >
          {collapsed ? <ChevronRight className="size-4" /> : <ChevronLeft className="size-4" />}
        </button>

        {/* Mobile Close Trigger */}
        <button
          onClick={onMobileClose}
          className="lg:hidden flex size-7 items-center justify-center rounded-md text-white/40 hover:text-white hover:bg-white/5 transition-all cursor-pointer ml-auto"
          aria-label="Close sidebar"
        >
          <X className="size-4" />
        </button>
      </div>

      {/* Nav Label Header */}
      {(!collapsed || mobileOpen) && (
        <div className="px-4 pt-6 pb-2">
          <span className="text-[10px] font-sans font-black uppercase tracking-[0.2em] text-white/20 select-none">
            Main Management
          </span>
        </div>
      )}

      {/* Nav Link Container */}
      <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-1 scrollbar-thin scrollbar-thumb-white/5">
        {filteredNavItems.map((item) => {
          const active = isActive(item);
          const Icon = item.icon;
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group relative ${
                active
                  ? "bg-[#C8A96A] text-black font-semibold shadow-md shadow-[#C8A96A]/10"
                  : "text-white/50 hover:text-white hover:bg-white/5"
              }`}
              title={collapsed && !mobileOpen ? item.label : undefined}
            >
              <Icon className={`size-4.5 flex-shrink-0 transition-transform duration-200 group-hover:scale-105 ${active ? "text-black" : "text-white/40 group-hover:text-white"}`} />
              {(!collapsed || mobileOpen) && (
                <span className="text-sm font-sans font-medium tracking-wide truncate">{item.label}</span>
              )}
              {active && (!collapsed || mobileOpen) && (
                <div className="size-1.5 rounded-full bg-black ml-auto shrink-0" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Sign Out Trigger */}
      <div className="px-3 py-4 border-t border-white/5">
        <button
          onClick={() => void signOut()}
          className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-white/40 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/10 transition-all duration-200 cursor-pointer"
          title={collapsed && !mobileOpen ? "Sign Out" : undefined}
        >
          <LogOut className="size-4.5 flex-shrink-0" />
          {(!collapsed || mobileOpen) && <span className="text-sm font-sans font-medium">Sign Out</span>}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Sidebar Navigation Drawer Overlay */}
      <div
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity duration-300 lg:hidden ${
          mobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={onMobileClose}
      />
      
      {/* Mobile Drawer wrapper */}
      <div
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 lg:hidden transition-transform duration-300 transform ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {sidebarContent}
      </div>

      {/* Desktop Persistent Sidebar */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 hidden lg:block transition-all duration-300 ${
          collapsed ? "w-16" : "w-64"
        }`}
      >
        {sidebarContent}
      </aside>
    </>
  );
}
