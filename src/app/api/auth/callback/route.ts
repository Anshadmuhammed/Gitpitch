import { NextResponse } from 'next/server'
export const dynamic = 'force-dynamic'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function GET(request: Request) {
  try {
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get('code')
    let role = searchParams.get('role')
    
    // Defensive handling for missing or "undefined" string from URL
    if (!role || role === 'undefined') {
      role = 'recruiter'
    }

    console.log('Auth callback hit:', { code: code ? 'present' : 'missing', role })

    if (!code) {
      return NextResponse.redirect(`${origin}/login?error=no_code`)
    }

    const cookieStore = await cookies()

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options)
            })
          },
        },
      }
    )

    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    console.log('Exchange result:', error ? 'error: ' + error.message : 'success')

    if (!error) {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        // Check if user already exists in our users table
        const { data: existingUser } = await supabase
          .from('users')
          .select('id, role')
          .eq('id', user.id)
          .single()

        if (!existingUser) {
          // New user - create record with role
          await supabase.from('users').insert({
            id: user.id,
            email: user.email,
            name: user.user_metadata?.full_name || user.email,
            avatar_url: user.user_metadata?.avatar_url,
            role: role // from URL param
          })
        }

        // Get final role (existing or newly created)
        const finalRole = existingUser?.role || role

        // Redirect based on role
        if (finalRole === 'developer') {
          return NextResponse.redirect(new URL('/developer', origin))
        } else {
          return NextResponse.redirect(new URL('/dashboard', origin))
        }
      }
    }

  } catch (err) {
    console.error('Callback route crashed:', err)
    return NextResponse.redirect(
      new URL('/login?error=server_error', request.url)
    )
  }
}
