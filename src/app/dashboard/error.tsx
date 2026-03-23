'use client'
export default function DashboardError({
  error,
  reset,
}: {
  error: Error
  reset: () => void
}) {
  return (
    <div className="flex items-center justify-center h-full p-8">
      <div className="text-center">
        <h2 className="text-xl text-white mb-2">Dashboard error</h2>
        <p className="text-white/40 text-sm mb-6">{error.message}</p>
        <button onClick={reset} className="bg-[#c8f060] text-black px-6 py-2 rounded-full text-sm">
          Try again
        </button>
      </div>
    </div>
  )
}
