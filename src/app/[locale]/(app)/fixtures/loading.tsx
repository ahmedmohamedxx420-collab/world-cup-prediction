import { Skeleton } from "@/components/ui/skeleton";

function FixtureRowSkeleton() {
  return (
    <li className="grid gap-3 px-4 py-4 sm:grid-cols-[1fr_auto] sm:items-center">
      <div className="min-w-0 space-y-3">
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
        <Skeleton className="h-3 w-44 max-w-full" />
      </div>
      <div className="flex justify-end">
        <Skeleton className="h-9 w-24" />
      </div>
    </li>
  );
}

export default function FixturesLoading() {
  return (
    <div className="space-y-5" aria-hidden>
      <div className="space-y-3">
        <Skeleton className="h-8 w-32" />
        <div className="grid grid-cols-2 rounded-lg border bg-muted/40 p-1">
          <Skeleton className="h-9 rounded-md" />
          <Skeleton className="h-9 rounded-md" />
        </div>
      </div>

      <section className="space-y-2">
        <Skeleton className="mx-1 h-4 w-36" />
        <ul className="divide-y overflow-hidden rounded-lg border bg-card">
          {Array.from({ length: 6 }, (_, index) => (
            <FixtureRowSkeleton key={index} />
          ))}
        </ul>
      </section>
    </div>
  );
}
