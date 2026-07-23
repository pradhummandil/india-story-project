import { Skeleton } from "@/components/ui/skeleton";

export function StoryCardSkeleton() {
  return (
    <div className="bg-card border border-border/40 rounded-xl overflow-hidden p-4 space-y-4 shadow-sm">
      <Skeleton className="w-full aspect-[4/3] rounded-lg" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-1/4 rounded" />
        <Skeleton className="h-6 w-3/4 rounded" />
        <Skeleton className="h-4 w-5/6 rounded" />
      </div>
      <div className="flex items-center gap-2 pt-2 border-t border-border/20">
        <Skeleton className="size-6 rounded-full" />
        <Skeleton className="h-3 w-1/3 rounded" />
      </div>
    </div>
  );
}

export function HeroSkeleton() {
  return (
    <div className="relative w-full h-[70vh] bg-card border-b border-border/40 flex flex-col justify-end p-8 md:p-16 space-y-4">
      <Skeleton className="absolute inset-0 size-full" />
      <div className="relative z-10 space-y-3 max-w-2xl">
        <Skeleton className="h-5 w-24 rounded" />
        <Skeleton className="h-10 md:h-16 w-3/4 rounded" />
        <Skeleton className="h-4 w-5/6 rounded" />
        <Skeleton className="h-4 w-2/3 rounded" />
        <div className="flex gap-3 pt-4">
          <Skeleton className="h-10 w-32 rounded-full" />
          <Skeleton className="h-10 w-24 rounded-full" />
        </div>
      </div>
    </div>
  );
}

export function AuthorSkeleton() {
  return (
    <div className="bg-card border border-border/40 rounded-xl p-6 text-center space-y-4 flex flex-col items-center shadow-sm">
      <Skeleton className="size-20 md:size-24 rounded-full" />
      <div className="space-y-2 w-full flex flex-col items-center">
        <Skeleton className="h-5 w-1/2 rounded" />
        <Skeleton className="h-4 w-1/3 rounded" />
        <Skeleton className="h-3 w-3/4 rounded" />
      </div>
    </div>
  );
}

export function VideoSkeleton() {
  return (
    <div className="bg-card border border-border/40 rounded-xl overflow-hidden shadow-sm">
      <div className="relative aspect-[16/9] w-full">
        <Skeleton className="size-full" />
        <div className="absolute inset-0 flex items-center justify-center">
          <Skeleton className="size-12 rounded-full" />
        </div>
      </div>
      <div className="p-4 space-y-2">
        <Skeleton className="h-4 w-1/3 rounded" />
        <Skeleton className="h-5 w-5/6 rounded" />
        <Skeleton className="h-3 w-1/2 rounded" />
      </div>
    </div>
  );
}

export function CommentSkeleton() {
  return (
    <div className="border-b border-border/20 py-4 space-y-3">
      <div className="flex items-center gap-3">
        <Skeleton className="size-8 rounded-full" />
        <div className="space-y-1 flex-1">
          <Skeleton className="h-4 w-24 rounded" />
          <Skeleton className="h-3 w-16 rounded" />
        </div>
      </div>
      <div className="space-y-1.5 pl-11">
        <Skeleton className="h-4 w-full rounded" />
        <Skeleton className="h-4 w-5/6 rounded" />
      </div>
    </div>
  );
}

export function MapSkeleton() {
  return (
    <div className="relative w-full h-[60vh] bg-card border border-border/40 rounded-2xl overflow-hidden flex items-center justify-center shadow-inner">
      <Skeleton className="absolute inset-0 size-full" />
      <div className="relative z-10 text-center space-y-2">
        <Skeleton className="size-12 rounded-full mx-auto" />
        <Skeleton className="h-4 w-40 rounded mx-auto" />
        <Skeleton className="h-3 w-28 rounded mx-auto" />
      </div>
    </div>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="w-full bg-card border border-border/40 rounded-xl overflow-hidden shadow-sm p-4 space-y-3">
      <div className="flex justify-between items-center pb-3 border-b border-border/20">
        <Skeleton className="h-4 w-1/4 rounded" />
        <Skeleton className="h-4 w-1/6 rounded" />
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center justify-between py-2 border-b border-border/10">
          <div className="flex items-center gap-3 w-1/2">
            <Skeleton className="size-8 rounded-full shrink-0" />
            <div className="space-y-1 w-full">
              <Skeleton className="h-4 w-3/4 rounded" />
              <Skeleton className="h-3 w-1/2 rounded" />
            </div>
          </div>
          <Skeleton className="h-4 w-1/6 rounded" />
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>
      ))}
    </div>
  );
}

export function ProfileSkeleton() {
  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 p-6 bg-card border border-border/40 rounded-2xl">
      <div className="flex flex-col md:flex-row items-center gap-6 pb-6 border-b border-border/20">
        <Skeleton className="size-28 rounded-full" />
        <div className="space-y-2 text-center md:text-left flex-1">
          <Skeleton className="h-7 w-48 rounded mx-auto md:mx-0" />
          <Skeleton className="h-4 w-32 rounded mx-auto md:mx-0" />
          <Skeleton className="h-4 w-64 rounded mx-auto md:mx-0" />
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="p-4 border border-border/20 rounded-xl space-y-2">
            <Skeleton className="h-4 w-1/2 rounded" />
            <Skeleton className="h-6 w-3/4 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}
