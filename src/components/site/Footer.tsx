import { Link } from "@tanstack/react-router";
import { Instagram, Twitter, Youtube, Linkedin } from "lucide-react";
import { useI18nStore, getFooterText } from "@/lib/i18n";

const socials = [
  { Icon: Instagram, label: "Instagram", href: "https://www.instagram.com/indiastoryproject/" },
  { Icon: Twitter, label: "Twitter", href: "https://twitter.com" },
  { Icon: Youtube, label: "YouTube", href: "https://youtube.com" },
  { Icon: Linkedin, label: "LinkedIn", href: "https://linkedin.com" },
];

export function Footer() {
  const lang = useI18nStore((s) => s.lang);
  const footerText = getFooterText(lang);

  return (
    <footer className="relative border-t-2 border-primary bg-card mt-32 text-foreground">
      <div className="container mx-auto px-6 py-16">
        <div className="grid gap-12 md:grid-cols-4 border-b border-border/80 pb-12">
          {/* Logo & Description */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <img
                src="https://indiastoryproject.com/wp-content/uploads/2022/04/Logo-ISP.png"
                alt="India Story Project logo"
                className="size-8 rounded-full border border-border object-cover"
              />
              <span className="font-display text-xl tracking-tight font-bold">
                <span className="text-primary">India</span> Story Project
              </span>
            </div>
            <p className="text-sm text-muted-foreground max-w-md leading-relaxed font-sans">
              {footerText.tagline}
            </p>
            <div className="flex gap-2 pt-2">
              {socials.map(({ Icon, label, href }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="flex items-center justify-center size-9 border border-border hover:border-primary hover:text-primary transition-colors text-muted-foreground"
                >
                  <Icon className="size-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Sitemap links */}
          <div className="space-y-4">
            <h4 className="text-xs uppercase tracking-widest font-bold text-primary font-sans">
              {footerText.explore}
            </h4>
            <ul className="space-y-2 text-sm font-sans font-medium">
              <li>
                <Link
                  to="/"
                  className="text-muted-foreground hover:text-foreground hover:underline transition-all"
                >
                  {footerText.home}
                </Link>
              </li>
              <li>
                <Link
                  to="/stories"
                  className="text-muted-foreground hover:text-foreground hover:underline transition-all"
                >
                  {footerText.stories}
                </Link>
              </li>
              <li>
                <Link
                  to="/about"
                  className="text-muted-foreground hover:text-foreground hover:underline transition-all"
                >
                  {footerText.about}
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="text-muted-foreground hover:text-foreground hover:underline transition-all"
                >
                  {footerText.contact}
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div className="space-y-4">
            <h4 className="text-xs uppercase tracking-widest font-bold text-primary font-sans">
              {footerText.getInTouch}
            </h4>
            <ul className="space-y-2 text-sm text-muted-foreground font-sans">
              <li>hello@indiastoryproject.com</li>
              <li>Bengaluru · Mumbai · Delhi</li>
            </ul>
          </div>
        </div>

        {/* Footer Base */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-8 text-xs text-muted-foreground font-sans">
          <p>
            © {new Date().getFullYear()} India Story Project. {footerText.rights}
          </p>
          <p>{footerText.crafted}</p>
        </div>
      </div>
    </footer>
  );
}
