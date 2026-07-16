type SkeletonCardProps = {
  lines?: number
}

export function SkeletonCard({ lines = 3 }: SkeletonCardProps) {
  return (
    <div className="animate-pulse space-y-3 p-4">
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className="h-4 bg-hairline rounded" />
      ))}
    </div>
  )
}

type SkeletonListProps = {
  count?: number
}

export function SkeletonList({ count = 3 }: SkeletonListProps) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  )
}
