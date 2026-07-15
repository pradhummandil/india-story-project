import { Link, useRouterState } from "@tanstack/react-router";
import { useEffect, useState, useRef } from "react";
import { Menu, X, Compass, User, LogOut, Shield, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LanguageToggle } from "./LanguageToggle";
import { useI18nStore, getNavText } from "@/lib/i18n";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthStore } from "@/lib/auth-store";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { location } = useRouterState();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { user, signOut } = useAuthStore();
  const lang = useI18nStore((s) => s.lang);
  const navText = getNavText(lang);

  const links = [
    { to: "/", label: navText.home },
    { to: "/stories", label: navText.stories },
    { to: "/share-story", label: lang === "hi" ? "कहानी साझा करें" : "Share Story" },
    { to: "/explore", label: lang === "hi" ? "अन्वेषण" : "Explore" },
    { to: "/about", label: navText.about },
    { to: "/contact", label: navText.contact },
  ];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Handle click outside user dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isTransparent = location.pathname === "/" && !scrolled;
  const isAdmin = user?.app_metadata?.role === "Admin" || user?.app_metadata?.role === "SuperAdmin";
  const avatarUrl = user?.user_metadata?.avatar_url as string | undefined;
  const displayName = (user?.user_metadata?.name as string) || user?.email?.split("@")[0] || "User";

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 fixed-header ${
        isTransparent
          ? "bg-transparent is-transparent py-6 text-white"
          : "bg-background/80 backdrop-blur-md py-3 shadow-sm text-foreground"
      }`}
    >
      <div className="container mx-auto px-6 flex items-center justify-between">
        <Link to="/" preload="intent" className="flex items-center gap-3 group">
          <div className="relative size-9 rounded-full border border-[#C8A96A]/40 overflow-hidden p-0.5 shadow-sm shadow-[#C8A96A]/10 transition-all duration-300 group-hover:scale-105 group-hover:border-[#C8A96A]/60 flex items-center justify-center">
            <img
              src="https://indiastoryproject.com/wp-content/uploads/2022/04/Logo-ISP.png"
              alt="India Story Project logo"
              className="w-full h-full rounded-full object-cover"
            />
          </div>
          <span className="font-display text-xl tracking-tight">
            <span
              className={`${isTransparent ? "text-white group-hover:text-gold" : "text-primary"} font-bold transition-colors duration-300`}
            >
              India
            </span>{" "}
            <span
              className={`transition-colors duration-300 ${isTransparent ? "text-white/95 group-hover:text-white" : "text-foreground/90 group-hover:text-primary"} font-medium`}
            >
              Story Project
            </span>
          </span>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 font-sans text-[11px] tracking-[0.15em] font-medium uppercase">
          {links.map((l) => {
            const active =
              l.to === "/" ? location.pathname === "/" : location.pathname.startsWith(l.to);
            return (
              <Link
                key={l.to}
                to={l.to}
                preload="intent"
                className={`relative py-1.5 transition-colors duration-300 ${
                  active
                    ? isTransparent
                      ? "text-white font-semibold"
                      : "text-primary font-semibold"
                    : isTransparent
                      ? "text-white/70 hover:text-white"
                      : "text-foreground/60 hover:text-primary"
                }`}
              >
                {l.label}
                {active ? (
                  <motion.span
                    layoutId="activeNavLine"
                    className={`absolute left-0 right-0 bottom-[-6px] h-[2.5px] ${
                      isTransparent
                        ? "bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]"
                        : "bg-primary shadow-[0_0_4px_rgba(139,0,0,0.3)]"
                    }`}
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                ) : (
                  <span className="absolute left-0 right-0 bottom-[-6px] h-[2.5px] bg-primary/80 scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Right side elements: Language Switch + Auth / Explore Button */}
        <div className="hidden md:flex items-center gap-4">
          <LanguageToggle />

          {user ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setUserMenuOpen((o) => !o)}
                className="flex items-center gap-2 outline-none"
              >
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={displayName}
                    className="size-8 rounded-full border border-border/50 object-cover hover:scale-105 transition-transform"
                  />
                ) : (
                  <div className="size-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center hover:scale-105 transition-transform">
                    <User className="size-4 text-primary" />
                  </div>
                )}
              </button>

              <AnimatePresence>
                {userMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 mt-2 w-48 bg-[#161616] border border-white/10 rounded-sm shadow-xl py-1 z-50 text-white"
                  >
                    <div className="px-4 py-2 border-b border-white/5">
                      <p className="text-xs text-white/45 font-sans">Signed in as</p>
                      <p className="text-sm font-sans font-medium truncate">{displayName}</p>
                    </div>

                    <Link
                      to="/profile"
                      preload="intent"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-xs font-sans text-white/70 hover:text-white hover:bg-white/5 transition-colors"
                    >
                      <User className="size-3.5" />
                      My Profile
                    </Link>

                    {isAdmin && (
                      <Link
                        to="/admin"
                        preload="intent"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-xs font-sans text-white/70 hover:text-white hover:bg-white/5 transition-colors"
                      >
                        <Shield className="size-3.5" />
                        Admin Dashboard
                      </Link>
                    )}

                    <button
                      onClick={() => {
                        setUserMenuOpen(false);
                        void signOut();
                      }}
                      className="flex items-center gap-2 px-4 py-2 text-xs font-sans text-red-400 hover:bg-red-500/10 w-full text-left transition-colors border-t border-white/5 mt-1"
                    >
                      <LogOut className="size-3.5" />
                      Sign Out
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <Link to="/login" className="inline-flex">
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-sans uppercase tracking-[0.15em] text-[10px] font-semibold h-9 px-5 rounded-full shadow-sm shadow-primary/10 transition-all duration-300 hover:-translate-y-0.5">
                Sign In
              </Button>
            </Link>
          )}

          <Link to="/share-story" preload="intent" className="inline-flex">
            <Button className="bg-red-700 hover:bg-red-700 text-white font-sans uppercase tracking-[0.15em] text-[10px] font-bold h-9 px-5 rounded-full shadow-glow transition-all duration-300 hover:-translate-y-0.5 flex items-center">
              <Sparkles className="size-3.5 mr-2 animate-pulse" />
              {lang === "hi" ? "अपनी कहानी साझा करें" : "Share Your Story"}
            </Button>
          </Link>
        </div>

        {/* Mobile controls */}
        <div className="flex md:hidden items-center gap-4">
          <LanguageToggle />
          <button
            className={`p-2 transition-colors duration-300 relative focus:outline-none ${
              isTransparent ? "text-white" : "text-foreground"
            }`}
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle menu"
            aria-expanded={open}
            aria-controls="mobile-menu"
          >
            {/* Animated Hamburger SVG */}
            <div className="relative size-6 flex flex-col justify-center items-center">
              <span
                className={`block absolute h-[1.8px] w-5 bg-current transform transition duration-300 ease-in-out ${
                  open ? "rotate-45" : "-translate-y-1.5"
                }`}
              />
              <span
                className={`block absolute h-[1.8px] w-5 bg-current transform transition duration-300 ease-in-out ${
                  open ? "opacity-0" : ""
                }`}
              />
              <span
                className={`block absolute h-[1.8px] w-5 bg-current transform transition duration-300 ease-in-out ${
                  open ? "-rotate-45" : "translate-y-1.5"
                }`}
              />
            </div>
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-menu"
            role="menu"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="md:hidden bg-background/95 backdrop-blur-md border-t border-border/60 overflow-hidden shadow-lg"
          >
            <div className="container mx-auto px-6 py-6 flex flex-col gap-4 font-sans text-xs tracking-wider uppercase font-semibold">
              {links.map((l) => (
                <Link
                  key={l.to}
                  to={l.to}
                  onClick={() => setOpen(false)}
                  className="py-2 text-muted-foreground hover:text-foreground border-b border-border/40"
                >
                  {l.label}
                </Link>
              ))}

              {user ? (
                <>
                  <Link
                    to="/profile"
                    onClick={() => setOpen(false)}
                    className="py-2 text-muted-foreground hover:text-foreground border-b border-border/40 flex items-center gap-2"
                  >
                    <User className="size-4" />
                    My Profile ({displayName})
                  </Link>
                  {isAdmin && (
                    <Link
                      to="/admin"
                      onClick={() => setOpen(false)}
                      className="py-2 text-muted-foreground hover:text-foreground border-b border-border/40 flex items-center gap-2"
                    >
                      <Shield className="size-4" />
                      Admin Dashboard
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      setOpen(false);
                      void signOut();
                    }}
                    className="py-2 text-red-400 hover:text-red-300 text-left flex items-center gap-2"
                  >
                    <LogOut className="size-4" />
                    Sign Out
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setOpen(false)}
                  className="py-2 text-muted-foreground hover:text-foreground border-b border-border/40"
                >
                  Sign In
                </Link>
              )}

              <Link to="/share-story" onClick={() => setOpen(false)} className="w-full mt-2">
                <Button className="w-full bg-primary hover:bg-primary/95 text-primary-foreground rounded-full uppercase tracking-widest text-[10px] h-12 font-sans font-bold shadow-sm shadow-primary/10 hover:shadow-md hover:translate-y-[-1px] transition-all duration-300">
                  <Sparkles className="size-4 mr-2" />
                  {lang === "hi" ? "अपनी कहानी साझा करें" : "Share Your Story"}
                </Button>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
