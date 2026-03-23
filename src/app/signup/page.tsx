'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/client'

export default function SignupPage() {
  const router = useRouter()
  const [role, setRole] = useState<'recruiter' | 'developer'>('recruiter')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const supabase = createClient()

  const handleGoogleSignup = async () => {
    setLoading(true)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/api/auth/callback?role=${role}`,
      }
    })
    if (error) {
      setError(error.message)
      setLoading(false)
    }
  }

  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name, role }
      }
    })

    if (signUpError) {
      const msgs: Record<string, string> = {
        'User already registered': 'Account already exists. Try logging in.',
        'Password should be at least 6 characters': 'Password must be at least 6 characters.',
      }
      setError(msgs[signUpError.message] || signUpError.message)
      setLoading(false)
      return
    }

    if (data.user) {
      await supabase.from('users').upsert({
        id: data.user.id,
        email: data.user.email!,
        name,
        role,
      })

      if (role === 'recruiter') {
        await supabase.from('recruiter_profiles').upsert({
          user_id: data.user.id,
          plan: 'free',
          outreach_credits: 20,
        })
      }

      router.push(role === 'developer' ? '/developer' : '/dashboard')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-[#0a0a08] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <Link href="/" className="block text-center mb-8">
          <span className="font-serif text-2xl text-white">
            git<span className="text-[#c8f060]">pitch</span>
          </span>
        </Link>

        <div className="bg-[#111110] border border-white/10 rounded-2xl p-8">
          <h1 className="text-2xl font-serif text-white text-center mb-2">
            Create an account
          </h1>
          <p className="text-white/50 text-center text-sm mb-6">
            Join Gitpitch and find your next opportunity.
          </p>

          {/* Role Toggle */}
          <div className="flex rounded-xl overflow-hidden border border-white/10 mb-6">
            <button
              onClick={() => setRole('recruiter')}
              className={`flex-1 py-3 text-sm font-medium transition-all ${
                role === 'recruiter'
                  ? 'bg-white/10 text-white'
                  : 'text-white/40 hover:text-white/60'
              }`}
            >
              I am hiring
            </button>
            <button
              onClick={() => setRole('developer')}
              className={`flex-1 py-3 text-sm font-medium transition-all ${
                role === 'developer'
                  ? 'bg-white/10 text-white'
                  : 'text-white/40 hover:text-white/60'
              }`}
            >
              I am a developer
            </button>
          </div>

          {/* Google Button */}
          <button
            onClick={handleGoogleSignup}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 py-3 rounded-xl border border-white/10 text-white text-sm hover:bg-white/5 transition mb-4 disabled:opacity-50"
          >
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Sign up with Google
          </button>

          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 h-px bg-white/10"/>
            <span className="text-white/30 text-xs">OR EMAIL</span>
            <div className="flex-1 h-px bg-white/10"/>
          </div>

          {/* Email Form */}
          <form onSubmit={handleEmailSignup} className="space-y-3">
            <input
              type="text"
              placeholder="Your name"
              value={name}
              onChange={e => setName(e.target.value)}
              required
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-white/30 focus:outline-none focus:border-[#c8f060]/50"
            />
            <input
              type="email"
              placeholder="Work email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-white/30 focus:outline-none focus:border-[#c8f060]/50"
            />
            <input
              type="password"
              placeholder="Password (min 6 characters)"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-white/30 focus:outline-none focus:border-[#c8f060]/50"
            />

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#c8f060] text-black font-medium py-3 rounded-xl hover:opacity-90 transition disabled:opacity-50"
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-white/40 text-sm mt-4">
            Already have an account?{' '}
            <Link href="/login" className="text-[#c8f060] hover:underline">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
