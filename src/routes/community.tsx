import { createFileRoute, Outlet, Link, useLocation } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/Layout";
import { MessageSquare, Users, Trophy, Award, Home } from "lucide-react";

export const Route = createFileRoute("/community")({
  component: CommunityLayout,
});

export default function CommunityLayout() {
  const location = useLocation();
  const currentPath = location.pathname;

  const tabs = [
    { label: "Home", path: "/community", icon: Home },
    { label: "Forums", path: "/community/forums", icon: MessageSquare },
    { label: "Groups", path: "/community/groups", icon: Users },
    { label: "Challenges", path: "/community/challenges", icon: Trophy },
    { label: "Rankings", path: "/community/rankings", icon: Award },
  ];

  return (
    <SiteLayout>
      <div className="min-h-screen bg-background text-foreground">
        {/* Community Nav Banner */}
        <div className="bg-card/90 border-b border-border sticky top-16 z-40 backdrop-blur-md">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center justify-between h-14 overflow-x-auto scrollbar-none">
              <div className="flex space-x-1 sm:space-x-2">
                {tabs.map((tab) => {
                  const isActive =
                    tab.path === "/community"
                      ? currentPath === "/community" || currentPath === "/community/"
                      : currentPath.startsWith(tab.path);
                  const Icon = tab.icon;
                  return (
                    <Link
                      key={tab.path}
                      to={tab.path}
                      className={`flex items-center gap-2 px-4 py-2 text-[11px] font-sans font-bold uppercase tracking-widest transition-all rounded-md ${
                        isActive
                          ? "bg-primary text-primary-foreground shadow-sm"
                          : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                      }`}
                    >
                      <Icon className="size-3.5" />
                      <span>{tab.label}</span>
                    </Link>
                  );
                })}
              </div>
              <div className="text-[10px] text-muted-foreground font-sans uppercase tracking-widest hidden md:block">
                India Story Hub — Community Platform
              </div>
            </div>
          </div>
        </div>

        {/* Content Outlet */}
        <div className="max-w-7xl mx-auto px-4 py-8">
          <Outlet />
        </div>
      </div>
    </SiteLayout>
  );
}
