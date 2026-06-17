import { Skeleton } from "@/components/ui/skeleton";

function ResultCardSkeleton() {
  return (
    <section className="space-y-4 rounded-xl bg-card p-4 ring-1 ring-foreground/10">
      <div className="space-y-2">
        <Skeleton className="h-5 w-56 max-w-full" />
        <Skeleton className="h-4 w-40" />
      </div>
      <div className="flex flex-wrap items-end gap-3">
        <div className="space-y-1">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-10 w-20" />
        </div>
        <div className="space-y-1">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-10 w-20" />
        </div>
        <div className="space-y-1">
          <Skeleton className="h-3 w-36" />
          <Skeleton className="h-10 w-48" />
        </div>
        <Skeleton className="h-9 w-24" />
      </div>
    </section>
  );
}

export default function AdminResultsLoading() {
  return (
    <div className="space-y-4" aria-hidden>
      {Array.from({ length: 5 }, (_, index) => (
        <ResultCardSkeleton key={index} />
      ))}
    </div>
  );
}
