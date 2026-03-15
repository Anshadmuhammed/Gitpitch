// Update to include LogoutButton inline by making Navbar a server comp that embeds a client component
import Link from 'next/link'
import { createServer } from '@/lib/supabase/server'
import { LogoutButton } from './LogoutButton'

export default async function Navbar() {
  const supabase = await createServer()
  const { data: { session } } = await supabase.auth.getSession()

  return (
    <nav className="border-b border-[rgba(255,255,255,0.08)] bg-[#0a0a08]/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="font-serif text-2xl tracking-tighter flex items-center gap-1">
          git<span className="text-[#c8f060] italic">pitch</span>
        </Link>
        <div className="flex items-center gap-6 text-sm">
          {!session ? (
            <>
              <Link href="/login" className="text-white/70 hover:text-white transition-colors">
                Log in
              </Link>
              <Link href="/signup" className="btn-primary text-xs !py-2 !px-4">
                Start for free
              </Link>
            </>
          ) : (
            <>
              <Link href="/dashboard" className="text-white/70 hover:text-white transition-colors">
                Dashboard
              </Link>
              <LogoutButton />
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
