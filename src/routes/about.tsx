import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { SiteLayout } from "@/components/site/Layout";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — India Story Project" },
      { name: "description", content: "Our mission, vision, and the team telling India's stories with depth and craft." },
      { property: "og:title", content: "About — India Story Project" },
      { property: "og:description", content: "Our mission, vision, and the team telling India's stories." },
    ],
  }),
  component: About,
});

const stats = [
  { value: "120+", label: "Stories published" },
  { value: "28", label: "States & UTs covered" },
  { value: "60+", label: "Independent journalists" },
  { value: "2M", label: "Readers worldwide" },
];

function About() {
  return (
    <SiteLayout>
      <section className="container mx-auto px-6 py-16 md:py-24">
        <div className="max-w-4xl">
          <p className="text-xs uppercase tracking-widest text-gold mb-3">About us</p>
          <h1 className="font-display text-5xl md:text-7xl leading-[1.05]">
            We believe India deserves{" "}
            <span className="text-gradient-gold italic">better stories</span>.
          </h1>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mt-20">
          <div className="glass rounded-2xl p-10">
            <p className="text-xs uppercase tracking-widest text-gold mb-4">Mission</p>
            <h2 className="font-display text-3xl mb-4">Slow journalism, rooted in place.</h2>
            <p className="text-muted-foreground leading-relaxed">
              We commission long-form stories from journalists who live where
              they report. We pay them well, edit them deeply, and publish them
              with care. No SEO games, no hot takes.
            </p>
          </div>
          <div className="glass rounded-2xl p-10">
            <p className="text-xs uppercase tracking-widest text-gold mb-4">Vision</p>
            <h2 className="font-display text-3xl mb-4">A library of modern India.</h2>
            <p className="text-muted-foreground leading-relaxed">
              In ten years, India Story Project should be the place people turn
              to when they want to understand who India became, in the words of
              the people who built it.
            </p>
          </div>
        </div>

        {/* Impact */}
        <div className="mt-24">
          <p className="text-xs uppercase tracking-widest text-gold mb-3 text-center">Our impact</p>
          <h2 className="font-display text-4xl md:text-5xl text-center mb-14">By the numbers</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="glass rounded-2xl p-8 text-center"
              >
                <div className="font-display text-5xl md:text-6xl text-gradient-gold">{s.value}</div>
                <div className="mt-3 text-sm text-muted-foreground uppercase tracking-wider">{s.label}</div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Team placeholder */}
        <div className="mt-24">
          <p className="text-xs uppercase tracking-widest text-gold mb-3 text-center">The people</p>
          <h2 className="font-display text-4xl md:text-5xl text-center mb-14">Storytellers behind the project</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="glass rounded-2xl p-6 hover-lift">
                <div
                  className="aspect-square rounded-xl mb-5"
                  style={{
                    background: `linear-gradient(135deg, oklch(0.5 0.15 ${30 + i * 40}), oklch(0.3 0.1 ${50 + i * 40}))`,
                  }}
                />
                <h3 className="font-display text-xl">Team Member</h3>
                <p className="text-sm text-muted-foreground mt-1">Role · Location</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
