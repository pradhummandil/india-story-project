import { type ReactNode, useState } from "react";
import { AdminSidebar } from "./AdminSidebar";
import { Bell, Search } from "lucide-react";
import { useAuthStore } from "@/lib/auth-store";

interface AdminLayoutProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
}

export function AdminLayout({ children, title, subtitle }: AdminLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);
  const { user } = useAuthStore();
  const displayName =
    (user?.user_metadata?.name as string) || user?.email?.split("@")[0] || "Admin";
  const avatarUrl = user?.user_metadata?.avatar_url as string | undefined;

  return (
    <div className="min-h-screen bg-[#0F0F0F] text-white flex">
      <AdminSidebar collapsed={collapsed} onToggle={() => setCollapsed((v) => !v)} />

      {/* Main content */}
      <main
        className={`flex-1 flex flex-col transition-all duration-300 ${
          collapsed ? "ml-16" : "ml-64"
        }`}
      >
        {/* Top bar */}
        <header className="h-16 flex items-center justify-between px-6 border-b border-white/10 bg-[#0F0F0F] sticky top-0 z-30">
          <div>
            {title && <h1 className="font-display text-xl font-bold text-white">{title}</h1>}
            {subtitle && <p className="text-xs text-white/40 font-sans">{subtitle}</p>}
          </div>

          <div className="flex items-center gap-4">
            {/* Search */}
            <div className="hidden md:flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-1.5 rounded-sm">
              <Search className="size-3.5 text-white/30" />
              <input
                type="text"
                placeholder="Search…"
                className="bg-transparent text-xs font-sans text-white/70 placeholder:text-white/30 outline-none w-36"
              />
            </div>

            {/* Notifications */}
            <button className="relative text-white/40 hover:text-white transition-colors">
              <Bell className="size-5" />
            </button>

            {/* User */}
            <div className="flex items-center gap-2">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={displayName}
                  className="size-8 rounded-full border border-white/20 object-cover"
                />
              ) : (
                <div className="size-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center">
                  <span className="text-xs font-bold text-primary uppercase">
                    {displayName.charAt(0)}
                  </span>
                </div>
              )}
              <span className="text-sm font-sans text-white/70 hidden md:block">{displayName}</span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <div className="flex-1 p-6 overflow-auto">{children}</div>
      </main>
    </div>
  );
}
