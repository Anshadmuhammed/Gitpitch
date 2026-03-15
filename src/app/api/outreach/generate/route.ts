import { NextResponse } from 'next/server'
import OpenAI from 'openai'
import { fetchGitHubProfile } from '@/lib/github'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: Request) {
  try {
    const { githubUsername, tone, companyName } = await request.json()

    if (!githubUsername) {
      return NextResponse.json({ error: 'GitHub username required' }, { status: 400 })
    }

    // Attempt to fetch profile details to make it personalized
    let profileDetails = '';
    try {
       const profile = await fetchGitHubProfile(githubUsername);
       profileDetails = `Top languages: ${profile.top_languages.join(', ')}. Top repo: ${profile.top_repos[0]?.name} (${profile.top_repos[0]?.stars} stars). Bio: ${profile.bio}`;
    } catch (e) {
       console.log('Could not fetch github profile for generation', e);
    }

    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY.includes('your_')) {
      // Mock generation if no API key
      return NextResponse.json({
        subject: `Loved your work on GitHub, ${githubUsername}!`,
        body: `Hi ${githubUsername},\\n\\nI came across your GitHub profile and was really impressed. ${profileDetails}\\n\\nWe are hiring at ${companyName} and would love to chat!\\n\\nBest,\nRecruiting Team`
      })
    }

    const prompt = `
      Write a concise, ${tone || 'professional'} cold recruiting email to a software developer with the GitHub username '${githubUsername}'.
      The email is from an engineering manager at '${companyName}'.
      Use the following GitHub context to personalize it: ${profileDetails}.
      Keep it under 150 words. Do not use generic placeholders like [Your Name].
      Output as JSON with "subject" and "body" fields.
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" }
    })

    const result = JSON.parse(response.choices[0].message.content || '{}')

    return NextResponse.json(result)
  } catch (error: any) {
    console.error('OpenAI Generate Error:', error)
    return NextResponse.json({ error: 'Failed to generate outreach' }, { status: 500 })
  }
}
