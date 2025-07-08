import { Skeleton } from "@/components/ui/skeleton";

// Card skeleton for general content
export function CardSkeleton() {
  return (
    <div className="p-4 rounded-lg border border-gray-700">
      <Skeleton className="h-6 w-32 mb-2" />
      <Skeleton className="h-4 w-48 mb-4" />
      <Skeleton className="h-20 w-full" />
    </div>
  );
}

// Chart skeleton for analytics components
export function ChartSkeleton() {
  const legendKeys = ["legend-a", "legend-b", "legend-c", "legend-d"];
  return (
    <div className="w-full max-w-md mx-auto p-4 rounded-lg border border-gray-700">
      <Skeleton className="h-6 w-40 mb-2" />
      <Skeleton className="h-4 w-48 mb-4" />
      <Skeleton className="h-64 w-full rounded-md" />
      <div className="grid grid-cols-1 gap-4 mt-4">
        {legendKeys.map((key) => (
          <div key={key} className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Skeleton className="w-4 h-4 rounded-full" />
              <Skeleton className="h-4 w-20" />
            </div>
            <Skeleton className="h-4 w-8" />
          </div>
        ))}
      </div>
    </div>
  );
}

// Table skeleton for data tables
export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  const headerKeys = ["header-a", "header-b", "header-c", "header-d"];
  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-10 w-24" />
      </div>
      <div className="border border-gray-700 rounded-lg">
        <div className="p-4 border-b border-gray-700">
          <div className="grid grid-cols-4 gap-4">
            {headerKeys.map((key) => (
              <Skeleton key={key} className="h-4 w-20" />
            ))}
          </div>
        </div>
        {Array.from({ length: rows }).map((_, i) => {
          const rowKey = `row-${i}-${Date.now()}`;
          return (
            <div
              key={rowKey}
              className="p-4 border-b border-gray-700 last:border-b-0"
            >
              <div className="grid grid-cols-4 gap-4">
                {headerKeys.map((headerKey) => (
                  <Skeleton
                    key={`cell-${rowKey}-${headerKey}`}
                    className="h-4 w-full"
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Proposal card skeleton
export function ProposalCardSkeleton() {
  return (
    <div className="p-6 rounded-lg border border-gray-700 space-y-4">
      <div className="flex justify-between items-start">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-6 w-16" />
      </div>
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4" />
      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          <Skeleton className="h-6 w-16" />
          <Skeleton className="h-6 w-20" />
        </div>
        <Skeleton className="h-8 w-24" />
      </div>
    </div>
  );
}

// Member card skeleton
export function MemberCardSkeleton() {
  return (
    <div className="p-4 rounded-lg border border-gray-700 space-y-3">
      <div className="flex items-center gap-3">
        <Skeleton className="w-12 h-12 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-24" />
        </div>
      </div>
      <div className="flex justify-between items-center">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-6 w-16" />
      </div>
    </div>
  );
}

// Dashboard stats skeleton
export function StatsSkeleton() {
  const statKeys = ["stat-a", "stat-b", "stat-c", "stat-d"];
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {statKeys.map((key) => (
        <div key={key} className="p-4 rounded-lg border border-gray-700">
          <Skeleton className="h-4 w-24 mb-2" />
          <Skeleton className="h-8 w-16 mb-1" />
          <Skeleton className="h-3 w-20" />
        </div>
      ))}
    </div>
  );
}

// Modal skeleton
export function ModalSkeleton() {
  return (
    <div className="p-6 space-y-4">
      <Skeleton className="h-6 w-32" />
      <div className="space-y-3">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-10 w-full" />
      </div>
      <div className="flex justify-end gap-2">
        <Skeleton className="h-10 w-20" />
        <Skeleton className="h-10 w-20" />
      </div>
    </div>
  );
}
