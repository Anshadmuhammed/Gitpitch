import { fetchGitHubProfile } from '../src/lib/github'
import dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'

dotenv.config({ path: '.env.local' })

const usernames = [
  'avinassh', 'sdslabs', 'MattIPv4', 'arpit-omprakash', 'sakshamsharma10',
  'vlad-kasatkin', 'devfolioo', 'rsaraf', 'thedevsaddam', 'pranaovs'
]

async function seed() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials in .env.local')
    process.exit(1)
  }

  const supabase = createClient(supabaseUrl, supabaseKey)

  for (const username of usernames) {
    try {
      console.log(`Fetching ${username}...`)
      const profileData = await fetchGitHubProfile(username)
      
      console.log(`Upserting ${username} to Supabase...`)
      
      const { error } = await supabase.from('developer_profiles').upsert({
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
        open_to_work: true,
      }, { onConflict: 'github_username' })

      if (error) {
        console.error(`Failed to upsert ${username}:`, error.message)
      } else {
        console.log(`Successfully seeded ${username}`)
      }
    } catch (e: any) {
      console.error(`Failed to process ${username}:`, e.message)
    }
  }
}

seed().catch(console.error)
