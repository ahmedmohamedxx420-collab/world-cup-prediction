import { Skeleton } from "@/components/ui/skeleton";

function BoardRowSkeleton() {
  return (
    <li className="grid gap-3 rounded-lg border bg-card p-4 sm:grid-cols-[auto_1fr_auto] sm:items-center">
      <span className="flex items-center gap-3">
        <Skeleton className="size-9 rounded-full" />
        <Skeleton className="size-10 rounded-full" />
      </span>
      <span className="min-w-0 space-y-3">
        <Skeleton className="h-4 w-40 max-w-full" />
        <span className="flex flex-wrap gap-1.5">
          {Array.from({ length: 5 }, (_, index) => (
            <Skeleton key={index} className="h-7 w-20 rounded-md" />
          ))}
        </span>
      </span>
      <span className="flex items-end justify-between gap-3 sm:flex-col sm:justify-center">
        <Skeleton className="h-8 w-14" />
        <Skeleton className="h-3 w-8" />
      </span>
    </li>
  );
}

export default function LeaderboardLoading() {
  return (
    <div className="space-y-5" aria-hidden>
      <div className="space-y-3">
        <Skeleton className="h-8 w-40" />
        <div className="grid grid-cols-2 rounded-lg border bg-muted/40 p-1">
          <Skeleton className="h-9 rounded-md" />
          <Skeleton className="h-9 rounded-md" />
        </div>
      </div>

      <ol className="space-y-3">
        {Array.from({ length: 6 }, (_, index) => (
          <BoardRowSkeleton key={index} />
        ))}
      </ol>
    </div>
  );
}
