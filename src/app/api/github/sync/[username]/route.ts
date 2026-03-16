import { NextResponse } from 'next/server'
import { createAdminClient } from '@/utils/supabase/admin'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const { username } = await params
    const token = process.env.GITHUB_TOKEN || '';
    
    const headers = {
      Authorization: `Bearer ${token.trim()}`,
      Accept: 'application/vnd.github+json',
      'User-Agent': 'Gitpitch-App'
    }

    const [userRes, reposRes] = await Promise.all([
      fetch(`https://api.github.com/users/${username}`, { headers }),
      fetch(`https://api.github.com/users/${username}/repos?sort=stars&per_page=10`, { headers })
    ])

    if (!userRes.ok) {
      return NextResponse.json({ error: 'GitHub user not found' }, { status: 404 })
    }

    const user = await userRes.json()
    const repos = await reposRes.json()

    const langCount: Record<string, number> = {}
    repos.forEach((r: any) => {
      if (r.language) langCount[r.language] = (langCount[r.language] || 0) + 1
    })
    const topLanguages = Object.entries(langCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([lang]) => lang)

    const cityMap: Record<string, string> = {
      'bangalore': 'Bengaluru', 'bengaluru': 'Bengaluru', 'bengalore': 'Bengaluru',
      'mumbai': 'Mumbai', 'bombay': 'Mumbai',
      'hyderabad': 'Hyderabad', 'pune': 'Pune',
      'chennai': 'Chennai', 'madras': 'Chennai',
      'delhi': 'Delhi NCR', 'new delhi': 'Delhi NCR', 'gurgaon': 'Delhi NCR',
      'noida': 'Delhi NCR', 'kolkata': 'Kolkata', 'india': 'India'
    }
    const locationLower = (user.location || '').toLowerCase()
    const city = Object.entries(cityMap).find(([key]) => 
      locationLower.includes(key)
    )?.[1] || user.location || null

    const profileData = {
      github_username: username,
      github_id: String(user.id),
      bio: user.bio || null,
      location: user.location || null,
      city,
      followers: user.followers || 0,
      total_stars: Array.isArray(repos) 
        ? repos.reduce((s: number, r: any) => s + (r.stargazers_count || 0), 0) 
        : 0,
      top_languages: topLanguages,
      top_repos: Array.isArray(repos) ? repos.slice(0, 5).map((r: any) => ({
        name: r.name,
        description: r.description,
        stars: r.stargazers_count,
        url: r.html_url,
        language: r.language
      })) : [],
      github_raw: { user, repos },
      last_synced_at: new Date().toISOString()
    }

    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('developer_profiles')
      .upsert(profileData, { onConflict: 'github_username' })
      .select()
      .single()

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, profile: data })
  } catch (err) {
    console.error('Sync error:', err)
    return NextResponse.json({ error: 'Failed to sync' }, { status: 500 })
  }
}
