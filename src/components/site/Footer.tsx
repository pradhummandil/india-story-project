import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Instagram, Twitter, Youtube, Linkedin } from "lucide-react";
import { useI18nStore, getFooterText } from "@/lib/i18n";

const socials = [
  { Icon: Instagram, label: "Instagram" },
  { Icon: Twitter, label: "Twitter" },
  { Icon: Youtube, label: "YouTube" },
  { Icon: Linkedin, label: "LinkedIn" },
];

const linkCls =
  "story-link inline-block text-muted-foreground hover:text-foreground transition-colors";

export function Footer() {
  const lang = useI18nStore((s) => s.lang);
  const footerText = getFooterText(lang);

  return (
    <footer className="relative border-t border-border mt-32">
      <div className="absolute inset-x-0 -top-px h-px bg-linear-to-r from-transparent via-gold/40 to-transparent" />
      <div className="container mx-auto px-6 py-16 grid gap-12 md:grid-cols-4">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="md:col-span-2"
        >
          <div className="flex items-center gap-3">
            <img
              src="https://indiastoryproject.com/wp-content/uploads/2022/04/Logo-ISP.png"
              alt="India Story Project logo"
              className="size-10 rounded-full bg-background shadow-glow border border-border object-cover"
            />
            <span className="font-display text-lg">
              <span className="text-gradient-gold font-semibold">India</span> Story Project
            </span>
          </div>
          <p className="mt-4 text-sm text-muted-foreground max-w-md leading-relaxed">
            {footerText.tagline}
          </p>

          <div className="flex gap-3 mt-6">
            {socials.map(({ Icon, label }, i) => (
              <motion.a
                key={label}
                href="#"
                aria-label={label}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.1 + i * 0.06 }}
                whileHover={{ y: -3, scale: 1.08 }}
                whileTap={{ scale: 0.95 }}
                className="grid place-items-center size-10 rounded-full glass hover:border-gold/60 hover:text-gold transition-colors shadow-sm hover:shadow-glow"
              >
                <Icon className="size-4" />
              </motion.a>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <h4 className="text-sm font-semibold text-foreground mb-4">Explore</h4>
          <ul className="space-y-3 text-sm">
            <li>
              <Link to="/" className={linkCls}>
                {footerText.home}
              </Link>
            </li>
            <li>
              <Link to="/stories" className={linkCls}>
                {footerText.stories}
              </Link>
            </li>
            <li>
              <Link to="/about" className={linkCls}>
                {footerText.about}
              </Link>
            </li>
            <li>
              <Link to="/contact" className={linkCls}>
                {footerText.contact}
              </Link>
            </li>
          </ul>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <h4 className="text-sm font-semibold text-foreground mb-4">Get in touch</h4>
          <ul className="space-y-3 text-sm text-muted-foreground">
            <li>hello@indiastoryproject.com</li>
            <li>Bengaluru · Mumbai · Delhi</li>
          </ul>
        </motion.div>
      </div>
      <div className="border-t border-border">
        <div className="container mx-auto px-6 py-6 flex flex-col md:flex-row items-center justify-between gap-2 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} India Story Project. All rights reserved.</p>
          <p>Crafted with care, in India.</p>
        </div>
      </div>
    </footer>
  );
}
