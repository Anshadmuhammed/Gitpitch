'use client'
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="min-h-screen bg-[#0a0a08] flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-xl text-white mb-2">Something went wrong</h2>
        <p className="text-white/40 text-sm mb-6">{error.message}</p>
        <button
          onClick={reset}
          className="bg-[#c8f060] text-black px-6 py-2 rounded-full text-sm font-medium"
        >
          Try again
        </button>
      </div>
    </div>
  )
}
