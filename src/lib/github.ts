const GITHUB_TOKEN = process.env.GITHUB_TOKEN

export async function fetchGitHubProfile(username: string) {
  const headers = {
    Authorization: `Bearer ${GITHUB_TOKEN}`,
    Accept: 'application/vnd.github.v3+json',
    'User-Agent': 'Gitpitch-App'
  }

  const [userRes, reposRes] = await Promise.all([
    fetch(`https://api.github.com/users/${username}`, { headers }),
    fetch(`https://api.github.com/users/${username}/repos?sort=stars&per_page=10`, { headers })
  ])

  if (!userRes.ok) throw new Error(`GitHub user not found: ${username}`)

  const user = await userRes.json()
  const repos = await reposRes.json()

  const langCount: Record<string, number> = {}
  repos.forEach((r: any) => {
    if (r.language) langCount[r.language] = (langCount[r.language] || 0) + 1
  })

  const topLanguages = Object.entries(langCount)
    .sort((a, b) => b[1] - a[1]).slice(0, 5).map(([l]) => l)

  return {
    github_username: username,
    github_id: String(user.id),
    bio: user.bio || '',
    location: user.location || '',
    city: extractCity(user.location || ''),
    followers: user.followers,
    total_stars: repos.reduce((s: number, r: any) => s + r.stargazers_count, 0),
    top_languages: topLanguages,
    top_repos: repos.slice(0, 5).map((r: any) => ({
      name: r.name, description: r.description,
      stars: r.stargazers_count, url: r.html_url, language: r.language
    })),
    github_raw: { user, repos },
    last_synced_at: new Date().toISOString()
  }
}

function extractCity(location: string): string {
  const cities = ['Bengaluru','Bangalore','Mumbai','Hyderabad','Pune',
                  'Chennai','Delhi','Gurgaon','Noida','Kolkata']
  for (const city of cities) {
    if (location.toLowerCase().includes(city.toLowerCase())) return city
  }
  return location.split(',')[0].trim()
}
