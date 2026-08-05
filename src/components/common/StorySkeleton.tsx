/**
 * StorySkeleton — Shimmering placeholder card while story data loads.
 * Matches the exact dimensions and layout of StoryCard so there's no
 * layout shift when real content appears.
 *
 * Uses CSS @keyframes shimmer (defined in styles.css) — no JS overhead.
 */
export function StorySkeleton({ count = 4 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="border border-border/60 bg-card rounded-xl overflow-hidden p-3.5 sm:p-4 flex flex-col gap-3"
          aria-hidden="true"
        >
          {/* Theme badge row */}
          <div className="flex items-center gap-2 h-[22px]">
            <div className="skeleton-shimmer h-4 w-16 rounded" />
            <div className="skeleton-shimmer h-4 w-12 rounded" />
          </div>

          {/* Image placeholder */}
          <div className="skeleton-shimmer aspect-[16/10] rounded-lg w-full" />

          {/* Author + read time row */}
          <div className="flex items-center gap-2 h-[18px]">
            <div className="skeleton-shimmer h-3 w-24 rounded" />
            <div className="skeleton-shimmer h-3 w-16 rounded" />
          </div>

          {/* Title */}
          <div className="flex flex-col gap-1.5">
            <div className="skeleton-shimmer h-4 w-full rounded" />
            <div className="skeleton-shimmer h-4 w-3/4 rounded" />
          </div>

          {/* Excerpt */}
          <div className="flex flex-col gap-1">
            <div className="skeleton-shimmer h-3 w-full rounded" />
            <div className="skeleton-shimmer h-3 w-5/6 rounded" />
          </div>

          {/* Footer */}
          <div className="mt-2 pt-2.5 border-t border-border/40">
            <div className="skeleton-shimmer h-3 w-20 rounded" />
          </div>
        </div>
      ))}
    </>
  );
}
