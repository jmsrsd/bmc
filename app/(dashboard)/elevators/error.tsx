'use client'

export default function ElevatorsError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="flex items-center justify-center min-h-[40vh] text-center">
      <div>
        <h1 className="text-[24px] font-semibold text-white mb-2">
          Failed to load elevator data
        </h1>
        <p className="text-[14px] text-[#AEAEB2] mb-6">
          {error.message || 'An unexpected error occurred'}
        </p>
        <button
          onClick={reset}
          className="rounded-lg bg-[#0A84FF] px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
        >
          Try again
        </button>
      </div>
    </div>
  )
}
