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

    if (error) {
      console.error('Supabase auth error:', error)
      return NextResponse.redirect(`${origin}/login?error=${error.message}`)
    }

    if (data.user) {
      // Check if user already exists in our table
      const { data: userData, error: userFetchError } = await supabase
        .from('users')
        .select('role, company_name')
        .eq('id', data.user.id)
        .maybeSingle()

      let finalRole = userData?.role || role
      let isOnboarded = !!userData?.company_name
      let isNewUser = false

      if (!userData && !userFetchError) {
        // New user or missing profile! Persist them.
        isNewUser = true
        console.log('OAuth user needs persistence, creating/syncing record with role:', role)
        const { error: upsertError } = await supabase.from('users').upsert({
          id: data.user.id,
          email: data.user.email,
          name: data.user.user_metadata.full_name || data.user.email?.split('@')[0],
          role: role
        })
        
        if (upsertError) {
          console.error('Error upserting user record:', upsertError)
        }
        finalRole = role
        isOnboarded = false
      }

      console.log('User status:', { finalRole, isOnboarded, isNewUser })

      // For developers, check if they have a profile synced
      if (finalRole === 'developer') {
        const { data: devProfile } = await supabase
          .from('developer_profiles')
          .select('id')
          .eq('user_id', data.user.id)
          .maybeSingle()
        
        isOnboarded = !!devProfile
      }

      // Final defensive check to prevent redirecting to "/onboarding/undefined"
      const safeRole = (finalRole === 'developer' || finalRole === 'recruiter') ? finalRole : 'recruiter'

      // If it's a new user or they haven't onboarded, send them to onboarding
      if (isNewUser || !isOnboarded) {
        console.log('Redirecting to onboarding for role:', safeRole)
        return NextResponse.redirect(`${origin}/onboarding/${safeRole}`)
      }

      // Existing user redirection
      if (safeRole === 'developer') {
        return NextResponse.redirect(`${origin}/developer`)
      }
    }

    return NextResponse.redirect(`${origin}/dashboard`)

  } catch (err) {
    console.error('Callback route crashed:', err)
    return NextResponse.redirect(
      new URL('/login?error=server_error', request.url)
    )
  }
}
