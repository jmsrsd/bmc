import { SkeletonList } from '@/components/ui/skeleton'

export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-[#0B0B0C]">
      <SkeletonList count={3} />
    </div>
  )
}
