import { NextResponse } from 'next/server'
export const dynamic = 'force-dynamic'
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

    // Cache check BEFORE fetching from GitHub
    const { data: userProfiles } = await supabase
      .from('developer_profiles')
      .select('*') // need all data for early return
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false })
      .limit(1)

    const existingById = userProfiles?.[0]

    if (existingById?.last_synced_at) {
      const hoursAgo = (new Date().getTime() - new Date(existingById.last_synced_at).getTime()) / (1000 * 60 * 60)
      if (hoursAgo < 24) {
        return NextResponse.json({ success: true, profile: existingById, cached: true })
      }
    }

    // Fetch the raw profile data from GitHub if cache missed
    const profileData = await fetchGitHubProfile(username)

    // Robust manual sync logic that handles potential duplicates gracefully
    
    // 1. Check if ANY profile already exists for this user_id
    // Already retrieved above in existingById
    if (existingById) {
      // Update the most recent profile for this user
      const { data, error } = await supabase
        .from('developer_profiles')
        .update({
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
        })
        .eq('id', existingById.id)
        .select()
        .limit(1)
        .maybeSingle()

      if (error) throw error
      return NextResponse.json({ success: true, profile: data })
    }

    // 2. Check if a profile exists for this github_username (synced anonymously before)
    const { data: usernameProfiles } = await supabase
      .from('developer_profiles')
      .select('id')
      .eq('github_username', profileData.github_username)
      .order('created_at', { ascending: false })
      .limit(1)

    const existingByUsername = usernameProfiles?.[0]

    if (existingByUsername) {
      // Link the existing username profile to this Gitpitch user_id
      const { data, error } = await supabase
        .from('developer_profiles')
        .update({
          user_id: session.user.id,
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
        })
        .eq('id', existingByUsername.id)
        .select()
        .limit(1)
        .maybeSingle()

      if (error) throw error
      return NextResponse.json({ success: true, profile: data })
    }

    // 3. Create a brand new profile
    const { data, error } = await supabase
      .from('developer_profiles')
      .insert({
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
      })
      .select()
      .limit(1)
      .maybeSingle()

    if (error) throw error
    return NextResponse.json({ success: true, profile: data })

  } catch (error: any) {
    console.error('GITHUB_SYNC_CRASH:', error)
    return NextResponse.json({ 
      error: `Database sync failed: ${error.message}`,
      details: error.details,
      hint: 'If you see duplicates, try refreshing. We are working on cleaning up duplicate profile entries.'
    }, { status: 500 })
  }
}
