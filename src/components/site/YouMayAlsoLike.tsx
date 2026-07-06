import { motion, AnimatePresence } from "framer-motion";
import { StoryCard } from "@/components/site/StoryCard";
import { useJourney, getSimilar, getRecommendations } from "@/lib/journey-store";

export function YouMayAlsoLike() {
  const { state } = useJourney();
  if (!state.lastViewedId) return null;

  const similar = getSimilar(state.lastViewedId, 3);
  const continueExploring = getRecommendations(state, 3);

  return (
    <AnimatePresence>
      <motion.section
        key={state.lastViewedId}
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="container mx-auto px-6 py-16"
      >
        <div className="mb-8">
          <p className="text-xs uppercase tracking-widest text-gold mb-3">
            Because you opened a story
          </p>
          <h2 className="font-display text-3xl md:text-4xl">You May Also Like</h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {similar.map((s, i) => (
            <StoryCard key={s.id} story={s} index={i} />
          ))}
        </div>

        {continueExploring.length > 0 && (
          <div className="mt-16">
            <h3 className="font-display text-2xl mb-6">Continue Exploring</h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {continueExploring.map((s, i) => (
                <StoryCard key={s.id} story={s} index={i} />
              ))}
            </div>
          </div>
        )}
      </motion.section>
    </AnimatePresence>
  );
}
