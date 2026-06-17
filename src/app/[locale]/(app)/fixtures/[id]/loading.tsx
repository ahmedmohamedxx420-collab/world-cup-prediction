import { Skeleton } from "@/components/ui/skeleton";

export default function FixtureDetailLoading() {
  return (
    <div className="space-y-6" aria-hidden>
      <Skeleton className="h-5 w-28" />

      <section className="space-y-4">
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-3 w-14" />
          </div>
          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
            <Skeleton className="h-7 min-w-0" />
            <Skeleton className="h-10 w-14 rounded-lg" />
            <Skeleton className="h-7 min-w-0" />
          </div>
        </div>
        <Skeleton className="h-5 w-56 max-w-full" />
      </section>

      <section className="space-y-4 rounded-lg border bg-card p-4">
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
          <Skeleton className="h-5 min-w-0" />
          <Skeleton className="h-6 w-10 rounded-md" />
          <Skeleton className="h-5 min-w-0" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Skeleton className="h-12 rounded-lg" />
          <Skeleton className="h-12 rounded-lg" />
        </div>
        <Skeleton className="h-10 w-full rounded-lg" />
      </section>

      <section className="space-y-3 rounded-lg border bg-card p-4">
        <div className="flex items-center justify-between gap-3">
          <Skeleton className="h-5 w-28" />
          <Skeleton className="h-4 w-20" />
        </div>
        {Array.from({ length: 3 }, (_, index) => (
          <div
            key={index}
            className="flex items-center justify-between gap-3 rounded-lg bg-muted/50 px-3 py-2"
          >
            <div className="min-w-0 space-y-2">
              <Skeleton className="h-4 w-28 max-w-full" />
              <Skeleton className="h-3 w-20" />
            </div>
            <Skeleton className="h-6 w-10" />
          </div>
        ))}
      </section>
    </div>
  );
}
