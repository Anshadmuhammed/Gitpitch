import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const role = searchParams.get('role') || 'recruiter'

  if (!code) {
    return NextResponse.redirect(new URL('/login?error=no_code', origin))
  }

  try {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll() },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          },
        },
      }
    )

    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (error) {
      console.error('Auth error:', error)
      return NextResponse.redirect(new URL('/login?error=auth_failed', origin))
    }

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.redirect(new URL('/login?error=no_user', origin))
    }

    // Check if user already exists in our DB
    const { data: existingUser } = await supabase
      .from('users')
      .select('id, role')
      .eq('id', user.id)
      .single()

    if (!existingUser) {
      // Brand new user — save with role from URL param
      await supabase.from('users').insert({
        id: user.id,
        email: user.email!,
        name: user.user_metadata?.full_name || 
              user.user_metadata?.name || 
              user.email!.split('@')[0],
        avatar_url: user.user_metadata?.avatar_url,
        role: role,
      })

      // Create role-specific profile
      if (role === 'recruiter') {
        await supabase.from('recruiter_profiles').insert({
          user_id: user.id,
          plan: 'free',
          outreach_credits: 20,
        })
        return NextResponse.redirect(new URL('/dashboard', origin))
      } else {
        return NextResponse.redirect(new URL('/onboarding/developer', origin))
      }
    }

    // Existing user — use saved role
    const savedRole = existingUser.role
    if (savedRole === 'developer') {
      return NextResponse.redirect(new URL('/developer', origin))
    } else {
      return NextResponse.redirect(new URL('/dashboard', origin))
    }

  } catch (err) {
    console.error('Callback error:', err)
    return NextResponse.redirect(new URL('/login?error=server_error', origin))
  }
}
