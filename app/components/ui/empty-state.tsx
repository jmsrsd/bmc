// Reusable empty/not-found state — extracted from 5 RSC pages

type EmptyStateProps = {
  message?: string
  className?: string
}

export function EmptyState({ message = 'Building not found', className = '' }: EmptyStateProps) {
  return (
    <div className={`flex items-center justify-center min-h-[40vh] ${className}`}>
      <p className="text-[#8E8E93] text-[14px]">{message}</p>
    </div>
  )
}

type SectionEmptyProps = {
  message: string
  className?: string
}

export function SectionEmpty({ message, className = '' }: SectionEmptyProps) {
  return (
    <p className={`text-[14px] text-[#8E8E93] mt-6 ${className}`}>{message}</p>
  )
}
