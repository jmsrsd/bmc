export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-[#0B0B0C]">
      <div className="flex flex-col gap-4 w-full max-w-lg px-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="animate-pulse rounded-xl border border-[#242427] bg-[#121214]/50 p-5"
          >
            <div className="h-3 w-24 rounded bg-[#242427] mb-3" />
            <div className="h-8 w-40 rounded bg-[#242427] mb-2" />
            <div className="h-3 w-32 rounded bg-[#242427]" />
          </div>
        ))}
      </div>
    </div>
  )
}
