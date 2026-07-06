import { motion } from "framer-motion";
import { useJourney, getBadges } from "@/lib/journey-store";
import { Compass, MapPin, BookOpen, Layers } from "lucide-react";

export function StoryJourney() {
  const { state, reset } = useJourney();
  const badges = getBadges(state);
  const minutes = Math.round(state.totalReadMs / 60000);

  const stats = [
    { icon: BookOpen, label: "Stories read", value: state.viewedIds.length },
    { icon: Layers, label: "Categories", value: Object.keys(state.categoryCounts).length },
    { icon: MapPin, label: "Regions visited", value: Object.keys(state.regionCounts).length },
    { icon: Compass, label: "Minutes explored", value: minutes },
  ];

  const earnedCount = badges.filter((b) => b.earned).length;
  const progress = (earnedCount / badges.length) * 100;

  return (
    <section className="container mx-auto px-6 py-24">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="glass rounded-3xl p-8 md:p-12 relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-hero opacity-30 pointer-events-none" />
        <div className="relative">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
            <div>
              <p className="text-xs uppercase tracking-widest text-gold mb-3">Your journey</p>
              <h2 className="font-display text-4xl md:text-5xl">Your Story Journey</h2>
              <p className="mt-3 text-muted-foreground max-w-xl">
                Every story you open shapes what we surface next. Keep exploring to unlock badges.
              </p>
            </div>
            {state.viewedIds.length > 0 && (
              <button
                onClick={reset}
                className="text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground self-start md:self-end"
              >
                Reset journey
              </button>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
            {stats.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.06 }}
                className="glass rounded-2xl p-5 border border-border/40"
              >
                <s.icon className="size-4 text-gold mb-3" />
                <div className="font-display text-3xl">{s.value}</div>
                <div className="text-xs text-muted-foreground uppercase tracking-widest mt-1">
                  {s.label}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Progress */}
          <div className="mb-6">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-muted-foreground">Badges earned</span>
              <span className="text-gold">
                {earnedCount} / {badges.length}
              </span>
            </div>
            <div className="h-1.5 rounded-full bg-border/40 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                whileInView={{ width: `${progress}%` }}
                viewport={{ once: true }}
                transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
                className="h-full bg-gradient-to-r from-gold to-saffron"
              />
            </div>
          </div>

          {/* Badges */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {badges.map((b, i) => (
              <motion.div
                key={b.id}
                initial={{ opacity: 0, scale: 0.92 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.06 }}
                whileHover={{ y: -4 }}
                className={`rounded-2xl p-5 border text-center transition-all ${
                  b.earned
                    ? "glass border-gold/40 shadow-glow"
                    : "border-border/40 opacity-50 grayscale"
                }`}
              >
                <div className="text-3xl mb-2">{b.emoji}</div>
                <div className="font-display text-base">{b.label}</div>
                <div className="text-xs text-muted-foreground mt-1">{b.desc}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </section>
  );
}
