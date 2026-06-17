import { Skeleton } from "@/components/ui/skeleton";

function FixtureAdminRowSkeleton() {
  return (
    <li className="flex items-center justify-between gap-3 px-4 py-3">
      <span className="min-w-0 space-y-2">
        <Skeleton className="h-4 w-64 max-w-full" />
        <Skeleton className="h-3 w-48 max-w-full" />
      </span>
      <Skeleton className="h-4 w-12" />
    </li>
  );
}

export default function AdminFixturesLoading() {
  return (
    <div className="space-y-6" aria-hidden>
      <div className="flex justify-end">
        <Skeleton className="h-9 w-24" />
      </div>

      {Array.from({ length: 2 }, (_, sectionIndex) => (
        <section key={sectionIndex} className="space-y-2">
          <Skeleton className="h-4 w-28" />
          <ul className="divide-y rounded-lg border">
            {Array.from({ length: 3 }, (_, rowIndex) => (
              <FixtureAdminRowSkeleton key={rowIndex} />
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
