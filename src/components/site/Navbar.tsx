import { Link, useRouterState } from "@tanstack/react-router";
import { useEffect, useRef, useState, type MouseEvent } from "react";
import { motion, AnimatePresence, useMotionValue, useSpring } from "framer-motion";
import { Menu, X, Compass } from "lucide-react";
import { Button } from "@/components/ui/button";

const links = [
  { to: "/", label: "Home" },
  { to: "/stories", label: "Stories" },
  { to: "/join", label: "Join" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
] as const;

function MagneticLink({
  to,
  label,
  active,
}: {
  to: string;
  label: string;
  active: boolean;
}) {
  const ref = useRef<HTMLAnchorElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 200, damping: 18 });
  const sy = useSpring(y, { stiffness: 200, damping: 18 });

  const onMove = (e: MouseEvent<HTMLAnchorElement>) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    x.set((e.clientX - (r.left + r.width / 2)) * 0.25);
    y.set((e.clientY - (r.top + r.height / 2)) * 0.25);
  };
  const onLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <Link
      ref={ref}
      to={to}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className="relative px-4 py-2 text-sm tracking-wide transition-colors"
    >
      <motion.span
        style={{ x: sx, y: sy }}
        className={`relative inline-block ${active ? "text-foreground" : "text-muted-foreground hover:text-foreground"}`}
      >
        {label}
        <span
          className={`absolute left-0 -bottom-1 h-px bg-linear-to-r from-gold to-saffron transition-all duration-500 ${
            active ? "w-full opacity-100" : "w-0 opacity-0 group-hover:w-full"
          }`}
        />
        {active && (
          <motion.span
            layoutId="nav-underline"
            className="absolute left-0 right-0 -bottom-1 h-px bg-linear-to-r from-gold to-saffron"
            transition={{ type: "spring", stiffness: 380, damping: 32 }}
          />
        )}
      </motion.span>
    </Link>
  );
}

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { location } = useRouterState();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ${
        scrolled ? "glass-strong py-3" : "py-5"
      }`}
    >
      <div className="container mx-auto px-6 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 group">
          <motion.img
            whileHover={{ rotate: 8, scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300, damping: 18 }}
            src="https://indiastoryproject.com/wp-content/uploads/2022/04/Logo-ISP.png"
            alt="India Story Project logo"
            className="size-10 rounded-full bg-background shadow-glow border border-border object-cover"
          />
          <span className="font-display text-lg leading-none">
            <span className="text-gradient-gold font-semibold">India</span>{" "}
            <span className="text-foreground/90">Story Project</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {links.map((l) => (
            <MagneticLink
              key={l.to}
              to={l.to}
              label={l.label}
              active={
                l.to === "/"
                  ? location.pathname === "/"
                  : location.pathname.startsWith(l.to)
              }
            />
          ))}
        </nav>

        <div className="hidden md:block">
          <Link to="/explore" className="inline-flex">
            <Button className="btn-premium bg-linear-to-r from-gold to-saffron text-gold-foreground shadow-glow border-0">
              <Compass className="size-4" />
              Explore India
            </Button>
          </Link>
        </div>


        <button
          className="md:hidden p-2 text-foreground"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {open ? <X className="size-6" /> : <Menu className="size-6" />}
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="md:hidden glass-strong border-t border-border mt-3"
          >
            <div className="container mx-auto px-6 py-6 flex flex-col gap-1">
              {links.map((l, i) => (
                <motion.div
                  key={l.to}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 + i * 0.05 }}
                >
                  <Link
                    to={l.to}
                    onClick={() => setOpen(false)}
                    className="py-3 text-base text-muted-foreground hover:text-foreground block"
                  >
                    {l.label}
                  </Link>
                </motion.div>
              ))}
              <Button className="mt-3 bg-linear-to-r from-gold to-saffron text-gold-foreground border-0">
                <Compass className="size-4" />
                Explore India
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
