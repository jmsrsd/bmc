'use client'

type EmptyStateProps = {
  message?: string
  className?: string
}

export function EmptyState({ message = 'Building not found', className = '' }: EmptyStateProps) {
  return (
    <div className={`flex items-center justify-center min-h-[40vh] ${className}`}>
      <p className="text-secondary text-[14px]">{message}</p>
    </div>
  )
}

type SectionEmptyProps = {
  message?: string
  className?: string
}

export function SectionEmpty({ message = 'No data', className = '' }: SectionEmptyProps) {
  return (
    <div className={`py-8 text-center ${className}`}>
      <p className="text-secondary text-[13px]">{message}</p>
    </div>
  )
}
