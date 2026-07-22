import { Link } from "@tanstack/react-router";
import { Instagram, Twitter, Youtube, Linkedin } from "lucide-react";
import { useI18nStore, getFooterText } from "@/lib/i18n";

const socials = [
  { Icon: Instagram, label: "Instagram", href: "https://www.instagram.com/indiastoryproject/" },
  { Icon: Twitter, label: "Twitter", href: "https://x.com/indiastoryproj" },
  { Icon: Youtube, label: "YouTube", href: "https://www.youtube.com/@indiastoryproject7282" },
  { Icon: Linkedin, label: "LinkedIn", href: "https://www.linkedin.com/company/india-story-project/" },
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
                src="/Logo-ISP.jpg"
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

          {/* Column 3: Sitemap Explore & Actions */}
          <div className="space-y-4">
            <h4 className="text-xs uppercase tracking-widest font-bold text-primary font-sans">
              Explore & Community
            </h4>
            <ul className="space-y-2 text-sm font-sans font-medium">
              <li>
                <Link to="/" className="text-muted-foreground hover:text-foreground transition-all">
                  Home
                </Link>
              </li>
              <li>
                <Link
                  to="/stories"
                  className="text-muted-foreground hover:text-foreground transition-all"
                >
                  Stories
                </Link>
              </li>
              <li>
                <Link
                  to="/explore"
                  className="text-muted-foreground hover:text-foreground transition-all"
                >
                  Explore Hub
                </Link>
              </li>
              <li>
                <Link
                  to="/map"
                  className="text-muted-foreground hover:text-foreground transition-all"
                >
                  Interactive Map
                </Link>
              </li>
              <li>
                <Link
                  to="/community"
                  className="text-muted-foreground hover:text-foreground transition-all"
                >
                  Community Forums
                </Link>
              </li>
              <li>
                <Link
                  to="/share-story"
                  className="text-muted-foreground hover:text-foreground transition-all"
                >
                  Share Your Story
                </Link>
              </li>
              <li>
                <Link
                  to="/rss"
                  className="text-muted-foreground hover:text-foreground transition-all"
                >
                  Podcast RSS Feed
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Company & Compliance */}
          <div className="space-y-4">
            <h4 className="text-xs uppercase tracking-widest font-bold text-primary font-sans">
              Company & Legal
            </h4>
            <ul className="space-y-2 text-sm font-sans font-medium">
              <li>
                <Link
                  to="/about"
                  className="text-muted-foreground hover:text-foreground transition-all"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  to="/careers"
                  className="text-muted-foreground hover:text-foreground transition-all"
                >
                  Careers
                </Link>
              </li>
              <li>
                <Link
                  to="/impact"
                  className="text-muted-foreground hover:text-foreground transition-all"
                >
                  Impact Initiatives
                </Link>
              </li>
              <li>
                <Link
                  to="/media-kit"
                  className="text-muted-foreground hover:text-foreground transition-all"
                >
                  Media & Press Kit
                </Link>
              </li>
              <li>
                <Link
                  to="/privacy"
                  className="text-muted-foreground hover:text-foreground transition-all"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="text-muted-foreground hover:text-foreground transition-all"
                >
                  Contact Support
                </Link>
              </li>
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
