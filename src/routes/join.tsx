import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Trophy, Flame, MapPin, Sparkles, Heart, Users } from "lucide-react";
import { SiteLayout } from "@/components/site/Layout";
import { ShareStoryWizard } from "@/components/site/ShareStoryWizard";
import { CommunityMap } from "@/components/site/CommunityMap";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  useContributor,
  getContribBadges,
  seedContributors,
  challenges,
} from "@/lib/contributor-store";
import { stories } from "@/lib/stories-data";

export const Route = createFileRoute("/join")({
  head: () => ({
    meta: [
      { title: "Join the Movement — India Story Project" },
      {
        name: "description",
        content:
          "Become a contributor. Share stories, earn badges, and help build India's largest living archive of positive change.",
      },
      { property: "og:title", content: "Join the Movement — India Story Project" },
      {
        property: "og:description",
        content: "Share, contribute, and shape India's story archive.",
      },
    ],
  }),
  component: JoinPage,
});

function JoinPage() {
  const { state, updateProfile, submissions } = useContribOrSubs();
  const badges = getContribBadges(state);
  const totalImpact = state.submissions.reduce((a, b) => a + b.impact, 0);
  const regions = new Set(state.submissions.map((s) => s.region)).size;

  // Combine seed + user for leaderboards
  const userAsContrib =
    state.submissions.length > 0
      ? [
          {
            name: state.name || "You",
            handle: state.handle || "you",
            region: state.submissions[0]?.region ?? "—",
            stories: state.submissions.length,
            impact: totalImpact,
            you: true,
          },
        ]
      : [];

  const leaderboard = [...userAsContrib, ...seedContributors]
    .map((c) => ({ ...c }))
    .sort((a, b) => b.impact - a.impact)
    .slice(0, 6);

  const emerging = seedContributors.filter((c) => c.emerging).slice(0, 3);

  const topStories = stories.slice(0, 3);

  const topRegions = (() => {
    const counts: Record<string, number> = {};
    for (const s of stories) counts[s.region] = (counts[s.region] ?? 0) + 1;
    for (const s of state.submissions) counts[s.region] = (counts[s.region] ?? 0) + 1;
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
  })();

  return (
    <SiteLayout>
      {/* Hero */}
      <section className="container mx-auto px-6 pt-12 pb-16 md:pt-20 md:pb-24">
        <div className="max-w-3xl">
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-xs uppercase tracking-widest text-gold mb-3"
          >
            Join the movement
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="font-display text-5xl md:text-7xl leading-[1.05]"
          >
            From reader to{" "}
            <span className="text-gradient-gold italic">contributor</span>.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className="mt-6 text-lg text-muted-foreground leading-relaxed"
          >
            Help build India's largest living archive of positive change. Share a
            story, profile a changemaker, or report from your corner of Bharat.
          </motion.p>
        </div>
      </section>

      {/* Share a story */}
      <section className="container mx-auto px-6 pb-16">
        <SectionHead eyebrow="Share a story" title="A guided journey, not a form." />
        <ShareStoryWizard />
      </section>

      {/* Contributor profile + badges */}
      <section className="container mx-auto px-6 py-16">
        <SectionHead eyebrow="Your contributor profile" title="Your name on the archive." />
        <div className="grid lg:grid-cols-[1fr_1.2fr] gap-6">
          <div className="glass rounded-3xl p-8 relative overflow-hidden">
            <div className="absolute inset-0 bg-hero opacity-20 pointer-events-none" />
            <div className="relative">
              <div className="flex items-center gap-4 mb-6">
                <div className="size-16 rounded-full bg-gradient-to-br from-gold to-saffron grid place-items-center shadow-glow font-display text-2xl text-gold-foreground">
                  {(state.name || "Y").slice(0, 1).toUpperCase()}
                </div>
                <div>
                  <div className="font-display text-2xl">{state.name || "Your name"}</div>
                  <div className="text-xs text-muted-foreground">
                    @{state.handle || "your-handle"}
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <Input
                  value={state.name}
                  onChange={(e) => updateProfile({ name: e.target.value })}
                  placeholder="Full name"
                  className="h-11 bg-transparent border-border focus-visible:ring-gold/40"
                />
                <Input
                  value={state.handle}
                  onChange={(e) => updateProfile({ handle: e.target.value })}
                  placeholder="Handle"
                  className="h-11 bg-transparent border-border focus-visible:ring-gold/40"
                />
                <Textarea
                  value={state.bio}
                  onChange={(e) => updateProfile({ bio: e.target.value })}
                  placeholder="Short bio — what stories do you tell?"
                  className="min-h-[88px] bg-transparent border-border focus-visible:ring-gold/40"
                />
              </div>

              <div className="grid grid-cols-3 gap-3 mt-6">
                <StatTile label="Stories" value={state.submissions.length} />
                <StatTile label="Impact" value={totalImpact} />
                <StatTile label="Regions" value={regions} />
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="glass rounded-3xl p-8">
              <p className="text-xs uppercase tracking-widest text-gold mb-3">Contribution badges</p>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {badges.map((b, i) => (
                  <motion.div
                    key={b.id}
                    initial={{ opacity: 0, scale: 0.92 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: i * 0.05 }}
                    whileHover={{ y: -4 }}
                    className={`rounded-2xl p-4 text-center border ${
                      b.earned
                        ? "glass border-gold/40 shadow-glow"
                        : "border-border/40 opacity-50 grayscale"
                    }`}
                  >
                    <div className="text-2xl mb-1">{b.emoji}</div>
                    <div className="font-display text-sm leading-tight">{b.label}</div>
                    <div className="text-[10px] text-muted-foreground mt-1">{b.desc}</div>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="glass rounded-3xl p-8">
              <p className="text-xs uppercase tracking-widest text-gold mb-3">Your submissions</p>
              {submissions.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Submit your first story above to see it here.
                </p>
              ) : (
                <ul className="divide-y divide-border/40">
                  {submissions.slice(0, 5).map((s) => (
                    <li key={s.id} className="py-3 flex items-center justify-between gap-4">
                      <div className="min-w-0">
                        <div className="text-sm truncate">{s.title}</div>
                        <div className="text-xs text-muted-foreground">
                          {s.category} · {s.region}
                        </div>
                      </div>
                      <span className="text-xs text-gold">+{s.impact} impact</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Leaderboard */}
      <section className="container mx-auto px-6 py-16">
        <SectionHead eyebrow="Impact leaderboard" title="The people moving Bharat forward." />
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="glass rounded-3xl p-8">
            <div className="flex items-center gap-2 mb-5">
              <Trophy className="size-4 text-gold" />
              <p className="text-xs uppercase tracking-widest text-gold">Top contributors</p>
            </div>
            <ul className="space-y-2">
              {leaderboard.map((c, i) => (
                <motion.li
                  key={c.handle}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.04 }}
                  className={`flex items-center gap-4 p-3 rounded-xl border ${
                    (c as { you?: boolean }).you
                      ? "border-gold/50 bg-gold/5"
                      : "border-border/40"
                  }`}
                >
                  <span className="font-display text-lg text-gold w-6 text-center">
                    {i + 1}
                  </span>
                  <div className="size-9 rounded-full bg-gradient-to-br from-gold to-saffron grid place-items-center text-gold-foreground text-sm font-semibold">
                    {c.name.slice(0, 1)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm truncate">{c.name}</div>
                    <div className="text-xs text-muted-foreground">
                      @{c.handle} · {c.region}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gold">{c.impact.toLocaleString()}</div>
                    <div className="text-[10px] text-muted-foreground uppercase tracking-widest">
                      {c.stories} stories
                    </div>
                  </div>
                </motion.li>
              ))}
            </ul>
          </div>

          <div className="space-y-6">
            <div className="glass rounded-3xl p-8">
              <div className="flex items-center gap-2 mb-5">
                <Flame className="size-4 text-gold" />
                <p className="text-xs uppercase tracking-widest text-gold">Most impactful stories</p>
              </div>
              <ul className="space-y-3">
                {topStories.map((s) => (
                  <li key={s.id} className="flex items-start gap-3">
                    <div
                      className="size-10 rounded-lg shrink-0"
                      style={{ background: s.gradient }}
                    />
                    <div className="min-w-0">
                      <div className="text-sm truncate">{s.title}</div>
                      <div className="text-xs text-muted-foreground">
                        {s.category} · {s.region}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="grid sm:grid-cols-2 gap-6">
              <div className="glass rounded-3xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  <MapPin className="size-4 text-gold" />
                  <p className="text-xs uppercase tracking-widest text-gold">Most active regions</p>
                </div>
                <ul className="space-y-2">
                  {topRegions.map(([r, n]) => (
                    <li key={r} className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{r}</span>
                      <span className="text-gold">{n}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="glass rounded-3xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="size-4 text-gold" />
                  <p className="text-xs uppercase tracking-widest text-gold">Emerging changemakers</p>
                </div>
                <ul className="space-y-3">
                  {emerging.map((c) => (
                    <li key={c.handle} className="flex items-center gap-3">
                      <div className="size-8 rounded-full bg-gradient-to-br from-gold to-saffron grid place-items-center text-gold-foreground text-xs font-semibold">
                        {c.name.slice(0, 1)}
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm truncate">{c.name}</div>
                        <div className="text-xs text-muted-foreground">{c.region}</div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Challenges */}
      <section className="container mx-auto px-6 py-16">
        <SectionHead eyebrow="Bharat Story Challenge" title="Monthly campaigns to rally around." />
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {challenges.map((c, i) => (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.55, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ y: -6 }}
              className="glass rounded-3xl p-6 relative overflow-hidden group"
            >
              <div
                className={`absolute -top-12 -right-12 size-32 rounded-full bg-gradient-to-br ${c.accent} opacity-20 blur-2xl group-hover:opacity-40 transition-opacity`}
              />
              <div className="relative">
                <div className="text-3xl mb-3">{c.emoji}</div>
                <div className="text-xs uppercase tracking-widest text-gold mb-1">
                  {c.period}
                </div>
                <h3 className="font-display text-xl mb-2">{c.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{c.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Community map */}
      <section className="container mx-auto px-6 py-16 pb-28">
        <SectionHead eyebrow="Community map" title="Where Bharat is telling stories." />
        <CommunityMap />

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mt-10 glass rounded-3xl p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-6"
        >
          <div className="flex items-center gap-4">
            <div className="size-12 rounded-full bg-gradient-to-br from-gold to-saffron grid place-items-center shadow-glow">
              <Heart className="size-5 text-gold-foreground" />
            </div>
            <div>
              <div className="font-display text-2xl">You belong here.</div>
              <div className="text-sm text-muted-foreground">
                Every contributor builds Bharat's archive of positive change.
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="size-4 text-gold" />
            {seedContributors.length + (state.submissions.length > 0 ? 1 : 0)} contributors and
            growing
          </div>
        </motion.div>
      </section>
    </SiteLayout>
  );
}

function useContribOrSubs() {
  const { state, updateProfile } = useContributor();
  return { state, updateProfile, submissions: state.submissions };
}

function SectionHead({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div className="mb-8">
      <p className="text-xs uppercase tracking-widest text-gold mb-2">{eyebrow}</p>
      <h2 className="font-display text-3xl md:text-4xl">{title}</h2>
    </div>
  );
}

function StatTile({ label, value }: { label: string; value: number }) {
  return (
    <div className="glass rounded-2xl p-4 border border-border/40 text-center">
      <div className="font-display text-2xl">{value}</div>
      <div className="text-[10px] uppercase tracking-widest text-muted-foreground mt-1">
        {label}
      </div>
    </div>
  );
}
