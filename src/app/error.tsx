'use client'
import { useEffect } from 'react'

export default function Error({ error, reset }: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[400px] gap-4">
      <h2 className="text-xl text-white font-serif">Something went wrong</h2>
      <p className="text-white/50 text-sm max-w-md text-center">{error.message}</p>
      <button onClick={reset} className="bg-[#c8f060] text-black hover:bg-[#b0d650] transition-colors px-6 py-2 rounded-full font-medium">
        Try again
      </button>
    </div>
  )
}
