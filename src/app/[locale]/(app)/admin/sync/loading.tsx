import { Skeleton } from "@/components/ui/skeleton";

export default function AdminSyncLoading() {
  return (
    <div className="space-y-6" aria-hidden>
      <section className="space-y-4 rounded-xl bg-card p-4 ring-1 ring-foreground/10">
        <div className="space-y-2">
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-4 w-72 max-w-full" />
        </div>
        <div className="flex flex-wrap gap-3">
          <Skeleton className="h-10 w-28" />
          <Skeleton className="h-10 w-44" />
        </div>
        <Skeleton className="h-3 w-80 max-w-full" />
      </section>

      <section className="space-y-2">
        <Skeleton className="h-4 w-28" />
        <ul className="divide-y rounded-lg border">
          {Array.from({ length: 5 }, (_, index) => (
            <li
              key={index}
              className="flex items-center justify-between gap-3 px-4 py-3"
            >
              <span className="flex items-center gap-2">
                <Skeleton className="h-4 w-10" />
                <Skeleton className="h-4 w-16" />
              </span>
              <span className="space-y-2">
                <Skeleton className="h-3 w-28" />
                <Skeleton className="h-3 w-20" />
              </span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
