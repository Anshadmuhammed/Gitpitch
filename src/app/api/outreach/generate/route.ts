import { NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: Request) {
  try {
    const { developer, roleDescription, tone } = await request.json()

    if (!developer || !roleDescription) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const prompt = `
      You are a world-class tech recruiter. Write a highly personalized outreach email to a developer based on their GitHub profile.
      
      Developer Details:
      Name: ${developer.name}
      GitHub: @${developer.github_username}
      Bio: ${developer.bio}
      Top Languages: ${developer.top_languages?.join(', ')}
      Key Repos: ${developer.top_repos?.slice(0, 3).map((r: any) => r.name).join(', ')}
      
      Role Description:
      ${roleDescription}
      
      Email Tone: ${tone}
      
      Requirements:
      1. Mention their specific GitHub projects or languages.
      2. Keep it concise (under 200 words).
      3. Focus on why they are a great fit for the role.
      4. Suggest a low-friction next step (quick chat).
      
      Output format:
      Subject: [Compelling Subject Line]
      Body: [Email Body]
    `

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
    })

    const text = response.choices[0].message.content || ''
    const subjectMatch = text.match(/Subject: (.*)/)
    const bodyMatch = text.match(/Body: ([\s\S]*)/)

    return NextResponse.json({
      subject: subjectMatch ? subjectMatch[1].trim() : "Exciting opportunity at Gitpitch",
      body: bodyMatch ? bodyMatch[1].trim() : text,
    })
  } catch (err: any) {
    console.error('OpenAI error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
