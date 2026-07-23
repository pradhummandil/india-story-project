import { type ReactNode, useState, useEffect } from "react";
import { AdminSidebar } from "./AdminSidebar";
import { Bell, Search, Menu, LogOut, LayoutDashboard, ChevronRight } from "lucide-react";
import { useAuthStore } from "@/lib/auth-store";
import { Link, useRouterState } from "@tanstack/react-router";
import { LanguageToggle } from "@/components/site/LanguageToggle";

interface AdminLayoutProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  activeNav?: string;
}

export function AdminLayout({ children, title, subtitle }: AdminLayoutProps) {
  const { location } = useRouterState();
  
  // Collapse State from localStorage
  const [collapsed, setCollapsed] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("isp_admin_sidebar_collapsed") === "true";
    }
    return false;
  });

  // Mobile drawer State
  const [mobileOpen, setMobileOpen] = useState(false);

  // Sync collapsed state to localStorage
  const handleToggleSidebar = () => {
    setCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem("isp_admin_sidebar_collapsed", String(next));
      return next;
    });
  };

  const { user, profile, signOut } = useAuthStore();
  const displayName = (profile?.fullName) || user?.email?.split("@")[0] || "Admin";
  const avatarUrl = profile?.avatarUrl as string | undefined;

  // Breadcrumbs generation based on path
  const pathParts = location.pathname.split("/").filter(Boolean);
  const breadcrumbs = pathParts.map((part, index) => {
    const to = "/" + pathParts.slice(0, index + 1).join("/");
    const label = part.charAt(0).toUpperCase() + part.slice(1).replace(/-/g, " ");
    return { to, label };
  });

  return (
    <div className="min-h-screen bg-background text-foreground flex font-sans">
      
      {/* Sidebar Navigation */}
      <AdminSidebar
        collapsed={collapsed}
        onToggle={handleToggleSidebar}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      {/* Main content wrapper */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${
          collapsed ? "lg:pl-16" : "lg:pl-64"
        }`}
      >
        {/* Top Header */}
        <header className="h-16 flex items-center justify-between px-4 md:px-6 border-b border-border/60 bg-card/90 backdrop-blur-md sticky top-0 z-30 select-none">
          <div className="flex items-center gap-3">
            {/* Mobile Menu Toggle Button */}
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted border border-border/40 transition-all cursor-pointer"
              aria-label="Open navigation menu"
            >
              <Menu className="size-4.5" />
            </button>

            {/* Breadcrumbs / Page hierarchy */}
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
              <Link to="/admin" className="hover:text-foreground transition-colors">
                Admin
              </Link>
              {breadcrumbs.length > 1 && (
                <>
                  {breadcrumbs.slice(1).map((crumb, idx) => (
                    <div key={crumb.to} className="flex items-center gap-1.5">
                      <ChevronRight className="size-3 text-muted-foreground/40" />
                      {idx === breadcrumbs.length - 2 ? (
                        <span className="text-primary font-semibold">{crumb.label}</span>
                      ) : (
                        <Link to={crumb.to} className="hover:text-foreground transition-colors">
                          {crumb.label}
                        </Link>
                      )}
                    </div>
                  ))}
                </>
              )}
            </div>
            
            {/* Mobile-only page header */}
            <span className="sm:hidden text-xs font-semibold text-primary truncate max-w-[150px]">
              {title || "Overview"}
            </span>
          </div>

          {/* Header Action Controls */}
          <div className="flex items-center gap-4">
            <LanguageToggle />
            
            {/* Profile Popover / Dropdown info */}
            <div className="flex items-center gap-2.5">
              <Link
                to="/profile"
                className="flex items-center gap-2 group transition-transform duration-200"
              >
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={displayName}
                    className="size-8 rounded-full border border-border object-cover shadow-sm group-hover:border-primary/50 transition-colors"
                  />
                ) : (
                  <div className="size-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center group-hover:border-primary/50 transition-colors">
                    <span className="text-[11px] font-black text-primary uppercase">
                      {displayName.charAt(0)}
                    </span>
                  </div>
                )}
                <div className="hidden md:flex flex-col text-left">
                  <span className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors leading-tight">
                    {displayName}
                  </span>
                  <span className="text-[9px] uppercase tracking-wider font-bold text-muted-foreground leading-none mt-0.5">
                    {profile?.role || "Admin"}
                  </span>
                </div>
              </Link>
            </div>
          </div>
        </header>

        {/* Page Content Layout */}
        <main className="flex-1 p-4 md:p-6 overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
