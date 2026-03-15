import { NextResponse } from 'next/server'
import { createServer } from '@/lib/supabase/server'
import { fetchGitHubProfile } from '@/lib/github'

export async function POST(request: Request) {
  try {
    const { username } = await request.json()
    if (!username) {
      return NextResponse.json({ error: 'Username is required' }, { status: 400 })
    }

    const supabase = await createServer()
    
    // Auth check - ensure user is a developer to sync their own profile
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
       return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch the raw profile data from GitHub
    const profileData = await fetchGitHubProfile(username)

    // Upsert into Supabase
    // We match the user_id and github_username to either update or create
    const { data, error } = await supabase.from('developer_profiles').upsert({
      user_id: session.user.id,
      github_username: profileData.github_username,
      github_id: profileData.github_id,
      bio: profileData.bio,
      location: profileData.location,
      city: profileData.city,
      followers: profileData.followers,
      total_stars: profileData.total_stars,
      top_languages: profileData.top_languages,
      top_repos: profileData.top_repos,
      github_raw: profileData.github_raw,
      last_synced_at: profileData.last_synced_at,
    }, { onConflict: 'github_username' }).select().single()

    if (error) {
      console.error('Database Sync Error:', error)
      return NextResponse.json({ error: 'Failed to sync to database' }, { status: 500 })
    }

    return NextResponse.json({ success: true, profile: data })
  } catch (error: any) {
    console.error('GitHub Sync Error:', error)
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
  }
}
