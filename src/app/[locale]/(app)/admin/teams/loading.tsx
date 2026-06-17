import { Skeleton } from "@/components/ui/skeleton";

export default function AdminTeamsLoading() {
  return (
    <div className="space-y-6" aria-hidden>
      <section className="space-y-4 rounded-xl bg-card p-4 ring-1 ring-foreground/10">
        <Skeleton className="h-5 w-28" />
        <div className="grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 5 }, (_, index) => (
            <div key={index} className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-full" />
            </div>
          ))}
        </div>
        <Skeleton className="h-10 w-24" />
      </section>

      <section className="space-y-2">
        <Skeleton className="h-4 w-20" />
        <ul className="divide-y rounded-lg border">
          {Array.from({ length: 6 }, (_, index) => (
            <li
              key={index}
              className="flex items-center justify-between gap-3 px-4 py-3"
            >
              <span className="flex min-w-0 items-center gap-2">
                <Skeleton className="size-5 rounded-full" />
                <Skeleton className="h-4 w-32 max-w-full" />
                <Skeleton className="h-4 w-24 max-w-full" />
              </span>
              <Skeleton className="h-4 w-16" />
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
