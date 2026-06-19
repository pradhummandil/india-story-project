import { motion } from "framer-motion";
import { useState } from "react";
import { regionDots } from "@/lib/contributor-store";

export function CommunityMap() {
  const [active, setActive] = useState<string | null>(null);
  const maxC = Math.max(...regionDots.map((d) => d.count));

  return (
    <div className="glass rounded-3xl p-6 md:p-10 relative overflow-hidden">
      <div className="absolute inset-0 bg-hero opacity-20 pointer-events-none" />
      <div className="relative grid md:grid-cols-[1fr_280px] gap-8 items-start">
        <div className="relative aspect-[3/4] rounded-2xl border border-border/40 overflow-hidden bg-gradient-to-b from-background/40 to-background/10">
          {/* Soft India silhouette suggestion */}
          <div className="absolute inset-0 grid place-items-center opacity-[0.08]">
            <span className="font-display text-[12rem] leading-none">भा</span>
          </div>

          {regionDots.map((d, i) => {
            const size = 8 + (d.count / maxC) * 18;
            const isActive = active === d.region;
            return (
              <motion.button
                key={d.region}
                onMouseEnter={() => setActive(d.region)}
                onMouseLeave={() => setActive(null)}
                onClick={() => setActive(d.region)}
                initial={{ opacity: 0, scale: 0 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.04, type: "spring", stiffness: 180, damping: 14 }}
                className="absolute -translate-x-1/2 -translate-y-1/2"
                style={{ left: `${d.x}%`, top: `${d.y}%` }}
              >
                <span
                  className="absolute inset-0 rounded-full bg-gold/30 animate-ping"
                  style={{ width: size, height: size, marginLeft: -size / 2, marginTop: -size / 2 }}
                />
                <span
                  className={`relative block rounded-full bg-gradient-to-br from-gold to-saffron transition-all ${
                    isActive ? "shadow-glow scale-125" : ""
                  }`}
                  style={{ width: size, height: size }}
                />
              </motion.button>
            );
          })}
        </div>

        <div>
          <p className="text-xs uppercase tracking-widest text-gold mb-3">Live community map</p>
          <h3 className="font-display text-2xl mb-2">{active ?? "Across Bharat"}</h3>
          <p className="text-sm text-muted-foreground mb-6">
            {active
              ? `${regionDots.find((r) => r.region === active)?.count} contributors active in ${active}.`
              : "Hover or tap any node to explore where stories are being told right now."}
          </p>

          <div className="space-y-2 max-h-[280px] overflow-auto pr-1">
            {[...regionDots]
              .sort((a, b) => b.count - a.count)
              .slice(0, 8)
              .map((r) => (
                <div
                  key={r.region}
                  onMouseEnter={() => setActive(r.region)}
                  onMouseLeave={() => setActive(null)}
                  className={`flex items-center justify-between p-2 rounded-lg text-sm transition-colors ${
                    active === r.region ? "bg-gold/10" : "hover:bg-foreground/5"
                  }`}
                >
                  <span className="text-muted-foreground">{r.region}</span>
                  <span className="text-gold font-display">{r.count}</span>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
