// Skeleton loading — extracted from loading.tsx

type SkeletonCardProps = {
  lines?: number
}

export function SkeletonCard({ lines = 3 }: SkeletonCardProps) {
  return (
    <div className="animate-pulse rounded-xl border border-[#242427] bg-[#121214]/50 p-5">
      <div className="h-3 w-24 rounded bg-[#242427] mb-3" />
      <div className="h-8 w-40 rounded bg-[#242427] mb-2" />
      <div className="h-3 w-32 rounded bg-[#242427]" />
    </div>
  )
}

export function SkeletonList({ count = 3 }: { count?: number }) {
  return (
    <div className="flex flex-col gap-4 w-full max-w-lg px-4">
      {Array.from({ length: count }, (_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  )
}
