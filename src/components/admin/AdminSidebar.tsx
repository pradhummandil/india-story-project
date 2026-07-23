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
import { useI18nStore } from "@/lib/i18n";

type NavGroup = {
  title: string;
  titleHi: string;
  items: {
    to: string;
    label: string;
    labelHi: string;
    icon: any;
    exact?: boolean;
    superAdminOnly?: boolean;
  }[];
};

const NAV_GROUPS: NavGroup[] = [
  {
    title: "Editorial & Content",
    titleHi: "संपादकीय और सामग्री",
    items: [
      { to: "/admin", label: "Dashboard", labelHi: "डैशबोर्ड", icon: LayoutDashboard, exact: true },
      { to: "/admin/stories", label: "Stories", labelHi: "कहानियाँ", icon: BookOpen },
      { to: "/admin/newsroom", label: "Newsroom Console", labelHi: "न्यूज़रूम कंसोल", icon: BookOpen },
      { to: "/admin/slideshow", label: "Slideshow", labelHi: "स्लाइडशो", icon: Layers },
      { to: "/admin/media", label: "Media Library", labelHi: "मीडिया लाइब्रेरी", icon: Image },
    ],
  },
  {
    title: "Community & Audience",
    titleHi: "समुदाय और दर्शक",
    items: [
      { to: "/admin/contact", label: "Inbox", labelHi: "इनबॉक्स", icon: Mail },
      { to: "/admin/newsletter", label: "Newsletter", labelHi: "न्यूज़लेटर", icon: Mail },
      { to: "/admin/community", label: "Community", labelHi: "समुदाय", icon: FolderOpen },
      { to: "/admin/comments", label: "Comments", labelHi: "टिप्पणियाँ", icon: MessageSquare },
      { to: "/admin/leaderboard", label: "Leaderboard", labelHi: "लीडरबोर्ड", icon: Trophy },
      { to: "/admin/achievements", label: "Achievements", labelHi: "उपलब्धियां", icon: Award },
      { to: "/admin/users", label: "Users & Roles", labelHi: "उपयोगकर्ता और भूमिकाएं", icon: Users },
      { to: "/admin/authors", label: "Authors CMS", labelHi: "लेखक प्रबंधन", icon: Users },
    ],
  },
  {
    title: "Platform & System",
    titleHi: "प्लेटफ़ॉर्म और सिस्टम",
    items: [
      { to: "/admin/themes", label: "Themes CMS", labelHi: "विषय प्रबंधन", icon: Compass },
      { to: "/admin/states", label: "States CMS", labelHi: "राज्य प्रबंधन", icon: MapPin },
      { to: "/admin/analytics", label: "Analytics", labelHi: "विश्लेषण", icon: BarChart3 },
      { to: "/admin/infrastructure", label: "Infrastructure", labelHi: "इंफ्रास्ट्रक्चर", icon: Settings, superAdminOnly: true },
      { to: "/admin/settings", label: "Settings", labelHi: "सेटिंग्स", icon: Settings, superAdminOnly: true },
    ],
  },
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
  const lang = useI18nStore((s) => s.lang);
  const role = profile?.role?.toLowerCase();

  const isSuperAdmin = role === "superadmin";

  const isActive = (to: string, exact?: boolean) => {
    if (exact) return location.pathname === to;
    return location.pathname.startsWith(to);
  };

  // Close mobile drawer on route change
  useEffect(() => {
    onMobileClose();
  }, [location.pathname]);

  const isCollapsedDesktop = collapsed && !mobileOpen;

  const sidebarContent = (
    <div className="flex flex-col h-full bg-card border-r border-border text-foreground select-none">
      {/* Brand logo & collapse trigger */}
      <div className="h-16 shrink-0 flex items-center justify-between px-4 border-b border-border/60">
        <Link to="/" className="flex items-center gap-2.5 transition-transform duration-200 hover:scale-[1.02]">
          <img
            src="/Logo-ISP.jpg"
            alt="ISP Logo"
            className="size-7 rounded-full border border-border shadow-sm"
          />
          {!isCollapsedDesktop && (
            <span className="font-display text-base font-bold tracking-wide text-foreground">
              <span className="text-primary font-bold">India</span> Story
            </span>
          )}
        </Link>

        {/* Desktop Collapse Trigger */}
        <button
          onClick={onToggle}
          className="hidden lg:flex size-7 items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted border border-border/40 transition-all cursor-pointer ml-auto"
          aria-label="Toggle sidebar"
        >
          {collapsed ? <ChevronRight className="size-4" /> : <ChevronLeft className="size-4" />}
        </button>

        {/* Mobile Close Trigger */}
        <button
          onClick={onMobileClose}
          className="lg:hidden flex size-7 items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-all cursor-pointer ml-auto"
          aria-label="Close sidebar"
        >
          <X className="size-4" />
        </button>
      </div>

      {/* Nav Link Container with auto scroll */}
      <nav className="flex-1 min-h-0 overflow-y-auto px-3 py-3 space-y-5 scrollbar-thin scrollbar-thumb-border/40 pb-6">
        {NAV_GROUPS.map((group) => {
          const visibleItems = group.items.filter(
            (item) => !item.superAdminOnly || isSuperAdmin
          );
          if (visibleItems.length === 0) return null;

          return (
            <div key={group.title} className="space-y-1">
              {!isCollapsedDesktop && (
                <div className="px-2 pb-1.5 pt-1">
                  <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-muted-foreground/70">
                    {lang === "hi" ? group.titleHi : group.title}
                  </span>
                </div>
              )}
              {visibleItems.map((item) => {
                const active = isActive(item.to, item.exact);
                const Icon = item.icon;
                const displayLabel = lang === "hi" ? item.labelHi : item.label;

                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={`flex items-center gap-3 transition-all duration-200 group relative ${
                      isCollapsedDesktop
                        ? `justify-center px-0 py-2.5 rounded-xl ${
                            active
                              ? "bg-primary/15 text-primary font-bold shadow-sm"
                              : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                          }`
                        : `px-3 py-2.5 rounded-lg border-l-3 ${
                            active
                              ? "bg-primary/10 border-primary text-primary font-bold shadow-sm"
                              : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50"
                          }`
                    }`}
                    title={isCollapsedDesktop ? displayLabel : undefined}
                  >
                    <Icon
                      className={`size-4.5 shrink-0 transition-transform duration-200 group-hover:scale-105 ${
                        active ? "text-primary font-bold" : "text-muted-foreground group-hover:text-foreground"
                      }`}
                    />
                    {!isCollapsedDesktop && (
                      <span className="text-xs font-sans font-semibold tracking-wide truncate">
                        {displayLabel}
                      </span>
                    )}
                    {active && !isCollapsedDesktop && (
                      <div className="size-1.5 rounded-full bg-primary ml-auto shrink-0" />
                    )}
                  </Link>
                );
              })}
            </div>
          );
        })}
      </nav>

      {/* Sign Out Trigger */}
      <div className="p-3 border-t border-border/60 shrink-0 bg-card">
        <button
          onClick={() => void signOut()}
          className={`flex items-center gap-3 w-full rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 border border-transparent hover:border-destructive/20 transition-all duration-200 cursor-pointer ${
            isCollapsedDesktop ? "justify-center px-0 py-2.5" : "px-3 py-2.5"
          }`}
          title={isCollapsedDesktop ? (lang === "hi" ? "साइन आउट" : "Sign Out") : undefined}
        >
          <LogOut className="size-4.5 shrink-0" />
          {!isCollapsedDesktop && (
            <span className="text-xs font-sans font-semibold">{lang === "hi" ? "साइन आउट" : "Sign Out"}</span>
          )}
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
