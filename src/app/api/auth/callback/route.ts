import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function GET(request: Request) {
  try {
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get('code')

    console.log('Auth callback hit, code:', code ? 'present' : 'missing')

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

    console.log('User logged in:', data.user?.email)
    return NextResponse.redirect(`${origin}/dashboard`)

  } catch (err) {
    console.error('Callback route crashed:', err)
    return NextResponse.redirect(
      new URL('/login?error=server_error', request.url)
    )
  }
}
