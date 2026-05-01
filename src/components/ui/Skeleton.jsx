// Base skeleton block
export function Skeleton({ className = '' }) {
  return (
    <div className={`bg-gray-200 rounded animate-pulse ${className}`} />
  )
}

// Property card skeleton
export function PropertyCardSkeleton() {
  return (
    <div className="bg-white border border-[#e2e8f0] rounded-xl overflow-hidden">
      <Skeleton className="h-32 rounded-none" />
      <div className="p-3 space-y-2">
        <Skeleton className="h-2.5 w-1/3" />
        <Skeleton className="h-3.5 w-2/3" />
        <Skeleton className="h-2.5 w-1/2" />
        <div className="flex items-center justify-between pt-1">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-10 rounded-full" />
        </div>
      </div>
    </div>
  )
}

// Table row skeleton
export function TableRowSkeleton({ cols = 5 }) {
  return (
    <tr className="border-b border-[#f2f3ff]">
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-4 py-3.5">
          <Skeleton className={`h-3 ${i === 0 ? 'w-3/4' : 'w-1/2'}`} />
        </td>
      ))}
    </tr>
  )
}

// Booking card skeleton
export function BookingCardSkeleton() {
  return (
    <div className="bg-white border border-[#e2e8f0] rounded-xl p-4 flex gap-3">
      <Skeleton className="w-16 h-14 rounded-lg flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-3.5 w-3/4" />
        <Skeleton className="h-2.5 w-1/2" />
        <Skeleton className="h-5 w-20 rounded-full" />
      </div>
      <div className="space-y-2 flex-shrink-0">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-7 w-20 rounded-md" />
      </div>
    </div>
  )
}

// Stat card skeleton
export function StatCardSkeleton() {
  return (
    <div className="bg-white border border-[#e2e8f0] rounded-xl p-4">
      <Skeleton className="h-2.5 w-2/3 mb-2" />
      <Skeleton className="h-7 w-1/2" />
    </div>
  )
}

// Profile skeleton
export function ProfileSkeleton() {
  return (
    <div className="bg-white border border-[#e6e7f4] rounded-xl p-6 flex items-start gap-5 mb-4 animate-pulse">
      <Skeleton className="w-[72px] h-[72px] rounded-full flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-4 w-16 rounded-full" />
        <div className="flex gap-4">
          <Skeleton className="h-3 w-32" />
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-3 w-28" />
        </div>
      </div>
    </div>
  )
}

// Dashboard metrics skeleton
export function MetricsSkeleton({ count = 4 }) {
  return (
    <div className={`grid grid-cols-${count} gap-3 mb-5`}>
      {Array.from({ length: count }).map((_, i) => (
        <StatCardSkeleton key={i} />
      ))}
    </div>
  )
}