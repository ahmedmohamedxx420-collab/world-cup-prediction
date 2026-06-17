import { Skeleton } from "@/components/ui/skeleton";

function BreakdownCardSkeleton() {
  return (
    <li className="rounded-lg border bg-card p-4">
      <div className="space-y-3">
        <div className="flex flex-wrap gap-2">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-3 w-14" />
        </div>
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
          <Skeleton className="h-5 min-w-0" />
          <Skeleton className="h-7 w-12 rounded-md" />
          <Skeleton className="h-5 min-w-0" />
        </div>
        <Skeleton className="h-3 w-48 max-w-full" />
        <div className="grid gap-2 sm:grid-cols-3">
          <Skeleton className="h-14 rounded-md" />
          <Skeleton className="h-14 rounded-md" />
          <Skeleton className="h-14 rounded-md" />
        </div>
      </div>
    </li>
  );
}

export default function MemberResultsLoading() {
  return (
    <div className="space-y-5" aria-hidden>
      <Skeleton className="h-5 w-32" />

      <section className="space-y-4">
        <header className="space-y-3">
          <div className="flex items-center gap-3">
            <Skeleton className="size-12 rounded-full" />
            <div className="min-w-0 space-y-2">
              <Skeleton className="h-6 w-56 max-w-full" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: 6 }, (_, index) => (
              <Skeleton key={index} className="h-7 w-24 rounded-md" />
            ))}
          </div>
        </header>

        <ul className="space-y-3">
          {Array.from({ length: 4 }, (_, index) => (
            <BreakdownCardSkeleton key={index} />
          ))}
        </ul>
      </section>
    </div>
  );
}
